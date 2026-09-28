import React, { useState, useEffect, useCallback } from 'react';
import { 
  storageService 
} from './services/storageService';
import { 
  Quote, 
  BusinessProfile, 
  AppSettings, 
  UserPlan 
} from './types';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { QuoteForm } from './components/QuoteForm';
import { BusinessProfileForm } from './components/BusinessProfileForm';
import { QuoteHistory } from './components/QuoteHistory';
import { SettingsPage } from './components/SettingsPage';
import { QuotePreviewModal } from './components/QuotePreviewModal';
import { WhatsAppModal } from './components/WhatsAppModal';
import { PlanInfoModal } from './components/PlanInfoModal';
import { downloadQuotePDF } from './services/pdfService';
import { AlertCircle, Trash2 } from 'lucide-react';

export function App() {
  const [currentTab, setCurrentTab] = useState<string>('landing');
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [settings, setSettings] = useState<AppSettings>({
    defaultValidityDays: 15,
    defaultTerms: 'Ce devis est valable 15 jours à compter de sa date d’émission. Acompte de 50% à la commande, solde à la livraison.',
    defaultNotes: 'Merci pour votre confiance ! Nous restons à votre entière disposition pour tout renseignement complémentaire.',
    plan: 'free',
    currency: 'FCFA',
    nextQuoteSeq: 1,
  });
  const [nextQuoteNumber, setNextQuoteNumber] = useState<string>('DV-2026-001');

  // Modals & Active Quote States
  const [activeEditingQuote, setActiveEditingQuote] = useState<Quote | null>(null);
  const [activePreviewQuote, setActivePreviewQuote] = useState<Quote | null>(null);
  const [activeWhatsAppQuote, setActiveWhatsAppQuote] = useState<Quote | null>(null);
  const [quoteToDelete, setQuoteToDelete] = useState<Quote | null>(null);
  const [showPlanInfo, setShowPlanInfo] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Reload everything from IndexedDB
  const refreshAllData = useCallback(async () => {
    try {
      const [fetchedProfile, fetchedSettings, fetchedQuotes] = await Promise.all([
        storageService.getBusinessProfile(),
        storageService.getSettings(),
        storageService.getQuotes(),
      ]);

      setProfile(fetchedProfile);
      setSettings(fetchedSettings);
      setQuotes(fetchedQuotes);

      // Determine next quote number preview
      const nextNum = await storageService.getNextQuoteNumber();
      setNextQuoteNumber(nextNum);

      // If user already has quotes or profile, default tab can stay or switch
      if (fetchedQuotes.length > 0 && currentTab === 'landing') {
        // Let them stay on landing first turn, or explore
      }
    } catch (err) {
      console.error('Erreur chargement données:', err);
    }
  }, [currentTab]);

  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);

  // Handlers for Navigation
  const handleStartNewQuote = async () => {
    setActiveEditingQuote(null);
    // Fetch fresh next quote number
    const num = await storageService.getNextQuoteNumber();
    setNextQuoteNumber(num);
    setCurrentTab('new-quote');
  };

  const handleEditQuote = (quote: Quote) => {
    setActiveEditingQuote(quote);
    setCurrentTab('new-quote');
  };

  const handleViewQuote = (quote: Quote) => {
    setActivePreviewQuote(quote);
  };

  const handleSaveBusinessProfile = async (newProfile: BusinessProfile) => {
    await storageService.saveBusinessProfile(newProfile);
    setProfile(newProfile);
    showToast('Informations de l’entreprise enregistrées avec succès !');
  };

  const handleSaveQuote = async (quote: Quote) => {
    try {
      await storageService.saveQuote(quote);
      showToast(`Devis ${quote.quoteNumber} enregistré avec succès !`);
      await refreshAllData();
      setActiveEditingQuote(null);
      setCurrentTab('history');
    } catch (err) {
      showToast("Impossible d'enregistrer le devis.", 'error');
    }
  };

  const handleDuplicateQuote = async (originalQuote: Quote) => {
    const today = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const todayStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;

    const validUntilDate = new Date();
    validUntilDate.setDate(today.getDate() + (settings.defaultValidityDays || 15));
    const validUntilStr = `${validUntilDate.getFullYear()}-${pad(validUntilDate.getMonth() + 1)}-${pad(validUntilDate.getDate())}`;

    const newQuoteNum = await storageService.getNextQuoteNumber();

    const duplicated: Quote = {
      ...originalQuote,
      id: 'quote-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6),
      quoteNumber: newQuoteNum,
      date: todayStr,
      validUntil: validUntilStr,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'sent',
    };

    setActiveEditingQuote(duplicated);
    setNextQuoteNumber(newQuoteNum);
    setCurrentTab('new-quote');
    showToast(`Devis dupliqué avec le nouveau numéro ${newQuoteNum}`);
  };

  const handleDeleteQuoteConfirm = async () => {
    if (!quoteToDelete) return;
    try {
      await storageService.deleteQuote(quoteToDelete.id);
      showToast(`Le devis ${quoteToDelete.quoteNumber} a été supprimé.`);
      setQuoteToDelete(null);
      await refreshAllData();
    } catch {
      showToast('Impossible de supprimer ce devis.', 'error');
    }
  };

  const handleDownloadPdf = async (quote: Quote) => {
    try {
      const filename = await downloadQuotePDF(quote, profile, settings.plan);
      showToast(`PDF téléchargé : ${filename}`);
    } catch (err) {
      console.error(err);
      showToast('Le PDF n’a pas pu être généré.', 'error');
    }
  };

  const handleOpenWhatsApp = (quote: Quote) => {
    setActiveWhatsAppQuote(quote);
  };

  const handleLoadDemo = async () => {
    try {
      const demoQuote = await storageService.loadDemoData();
      await refreshAllData();
      showToast('Exemple "Yoro Créative" chargé (40 000 FCFA) !');
      setActivePreviewQuote(demoQuote);
    } catch {
      showToast('Erreur lors du chargement de l’exemple.', 'error');
    }
  };

  const handleSaveSettings = async (newSettings: AppSettings) => {
    await storageService.saveSettings(newSettings);
    setSettings(newSettings);
    showToast('Paramètres mis à jour !');
  };

  const handleExportData = async () => {
    try {
      const jsonStr = await storageService.exportData();
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const dateStr = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `devisgo-ci-backup-${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Sauvegarde exportée avec succès !');
    } catch {
      showToast("Impossible d'exporter les données.", 'error');
    }
  };

  const handleImportData = async (file: File) => {
    return new Promise<{ success: boolean; count: number; error?: string }>((resolve) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const text = e.target?.result as string;
        const res = await storageService.importData(text);
        if (res.success) {
          await refreshAllData();
          showToast(`Importation terminée : ${res.count} devis restaurés.`);
        }
        resolve(res);
      };
      reader.onerror = () => {
        resolve({ success: false, count: 0, error: 'Erreur de lecture du fichier.' });
      };
      reader.readAsText(file);
    });
  };

  const handleDeleteAllData = async () => {
    try {
      await storageService.deleteAllData();
      await refreshAllData();
      showToast('Toutes vos données locales ont été supprimées.', 'info');
      setCurrentTab('landing');
    } catch {
      showToast('Erreur lors de la suppression des données.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 pb-16 md:pb-0">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 animate-bounce">
          <div className={`px-4 py-3 rounded-2xl shadow-xl border text-xs sm:text-sm font-bold flex items-center gap-2 ${
            notification.type === 'error'
              ? 'bg-rose-900 text-white border-rose-800'
              : notification.type === 'info'
              ? 'bg-blue-900 text-white border-blue-800'
              : 'bg-emerald-900 text-white border-emerald-800'
          }`}>
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Main Navbar */}
      <Navbar
        currentTab={currentTab}
        onNavigate={(tab) => {
          if (tab === 'new-quote') {
            handleStartNewQuote();
          } else {
            setCurrentTab(tab);
          }
        }}
        quoteCount={quotes.length}
        plan={settings.plan}
        onOpenPlanInfo={() => setShowPlanInfo(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {currentTab === 'landing' && (
          <LandingPage
            onStartNewQuote={handleStartNewQuote}
            onLoadDemo={handleLoadDemo}
            onGoToDashboard={() => setCurrentTab('dashboard')}
            hasQuotes={quotes.length > 0}
          />
        )}

        {currentTab === 'dashboard' && (
          <Dashboard
            quotes={quotes}
            profile={profile}
            onNewQuote={handleStartNewQuote}
            onViewQuote={handleViewQuote}
            onEditQuote={handleEditQuote}
            onDuplicateQuote={handleDuplicateQuote}
            onDeleteQuote={(q) => setQuoteToDelete(q)}
            onDownloadPdf={handleDownloadPdf}
            onShareWhatsApp={handleOpenWhatsApp}
            onGoToProfile={() => setCurrentTab('business')}
            onLoadDemo={handleLoadDemo}
          />
        )}

        {currentTab === 'new-quote' && (
          <QuoteForm
            key={activeEditingQuote?.id || `new-quote-${nextQuoteNumber}`}
            initialQuote={activeEditingQuote}
            profile={profile}
            settings={settings}
            nextQuoteNumber={nextQuoteNumber}
            onSave={handleSaveQuote}
            onPreview={handleViewQuote}
            onDownloadPdf={handleDownloadPdf}
            onShareWhatsApp={handleOpenWhatsApp}
            onCancel={() => setCurrentTab(quotes.length > 0 ? 'dashboard' : 'landing')}
          />
        )}

        {currentTab === 'history' && (
          <QuoteHistory
            quotes={quotes}
            onNewQuote={handleStartNewQuote}
            onViewQuote={handleViewQuote}
            onEditQuote={handleEditQuote}
            onDuplicateQuote={handleDuplicateQuote}
            onDeleteQuote={(q) => setQuoteToDelete(q)}
            onDownloadPdf={handleDownloadPdf}
            onShareWhatsApp={handleOpenWhatsApp}
          />
        )}

        {currentTab === 'business' && (
          <BusinessProfileForm
            initialProfile={profile}
            onSave={handleSaveBusinessProfile}
            onBack={() => setCurrentTab(quotes.length > 0 ? 'dashboard' : 'landing')}
          />
        )}

        {currentTab === 'settings' && (
          <SettingsPage
            settings={settings}
            profile={profile}
            onSaveSettings={handleSaveSettings}
            onExportData={handleExportData}
            onImportData={handleImportData}
            onDeleteAllData={handleDeleteAllData}
            onGoToProfile={() => setCurrentTab('business')}
          />
        )}
      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500 space-y-1">
        <p className="font-semibold text-slate-700">
          DevisGo CI — L’outil simple de devis pour les entrepreneurs de Côte d’Ivoire.
        </p>
        <p className="text-[11px] text-slate-400">
          Fonctionne 100% en local sur votre appareil • Aucune carte bancaire requise • Monnaie : FCFA
        </p>
      </footer>

      {/* PREVIEW MODAL */}
      {activePreviewQuote && (
        <QuotePreviewModal
          quote={activePreviewQuote}
          profile={profile}
          plan={settings.plan}
          onClose={() => setActivePreviewQuote(null)}
          onEdit={() => {
            const q = activePreviewQuote;
            setActivePreviewQuote(null);
            handleEditQuote(q);
          }}
          onDownloadPdf={() => handleDownloadPdf(activePreviewQuote)}
          onShareWhatsApp={() => {
            const q = activePreviewQuote;
            setActivePreviewQuote(null);
            handleOpenWhatsApp(q);
          }}
        />
      )}

      {/* WHATSAPP SHARING MODAL */}
      {activeWhatsAppQuote && (
        <WhatsAppModal
          quote={activeWhatsAppQuote}
          profile={profile}
          onClose={() => setActiveWhatsAppQuote(null)}
          onDownloadPdf={() => handleDownloadPdf(activeWhatsAppQuote)}
        />
      )}

      {/* PLAN INFO MODAL */}
      {showPlanInfo && (
        <PlanInfoModal
          currentPlan={settings.plan}
          onClose={() => setShowPlanInfo(false)}
        />
      )}

      {/* SINGLE QUOTE DELETE CONFIRMATION MODAL */}
      {quoteToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Supprimer le devis ?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Êtes-vous sûr de vouloir supprimer le devis{' '}
                <strong className="text-slate-800">{quoteToDelete.quoteNumber}</strong> adressé à{' '}
                <strong className="text-slate-800">{quoteToDelete.clientName}</strong> ? Cette action est irréversible.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setQuoteToDelete(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteQuoteConfirm}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
