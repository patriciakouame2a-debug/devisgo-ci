import React, { useState, useRef } from 'react';
import { 
  Building2, 
  Sliders, 
  Database, 
  Download, 
  Upload, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles,
  ShieldCheck,
  Save,
  HelpCircle,
  FileJson
} from 'lucide-react';
import { AppSettings, BusinessProfile, UserPlan } from '../types';

interface SettingsPageProps {
  settings: AppSettings;
  profile: BusinessProfile | null;
  onSaveSettings: (settings: AppSettings) => Promise<void>;
  onExportData: () => Promise<void>;
  onImportData: (file: File) => Promise<{ success: boolean; count: number; error?: string }>;
  onDeleteAllData: () => Promise<void>;
  onGoToProfile: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  settings,
  profile,
  onSaveSettings,
  onExportData,
  onImportData,
  onDeleteAllData,
  onGoToProfile,
}) => {
  const [formData, setFormData] = useState<AppSettings>(settings);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Import state
  const [importing, setImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Delete all modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSaveSettings(formData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setImportStatus(null);
    try {
      const res = await onImportData(file);
      if (res.success) {
        setImportStatus(`Importation réussie : ${res.count} devis et paramètres restaurés.`);
      } else {
        setImportStatus(res.error || 'Erreur lors de l’importation.');
      }
    } catch {
      setImportStatus('Le fichier sélectionné n’est pas valide.');
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleExecuteDeleteAll = async () => {
    if (deleteConfirmText.trim().toUpperCase() !== 'SUPPRIMER') {
      alert('Veuillez taper SUPPRIMER pour confirmer.');
      return;
    }
    await onDeleteAllData();
    setShowDeleteModal(false);
    setDeleteConfirmText('');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Paramètres</h1>
        <p className="text-sm text-slate-500">
          Gérez vos préférences de devis, vos données et le fonctionnement de DevisGo CI.
        </p>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>Préférences enregistrées avec succès !</span>
        </div>
      )}

      {/* 1. MON ENTREPRISE CARD */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-900" />
            <h2 className="text-base font-bold text-slate-900">Mon entreprise</h2>
          </div>
          <p className="text-xs text-slate-500">
            {profile?.name ? (
              <span>Configurée : <strong>{profile.name}</strong> ({profile.ownerName || 'Sans gérant'})</span>
            ) : (
              <span>Aucune entreprise configurée pour le moment.</span>
            )}
          </p>
        </div>

        <button
          onClick={onGoToProfile}
          className="px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-900 text-xs font-bold transition-colors cursor-pointer self-start sm:self-auto"
        >
          {profile?.name ? 'Modifier les informations' : 'Configurer mon entreprise'}
        </button>
      </div>

      {/* 2. PRÉFÉRENCES PAR DÉFAUT */}
      <form onSubmit={handleSave} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Sliders className="w-5 h-5 text-amber-500" />
          <h2 className="text-base font-bold text-slate-900">Préférences par défaut</h2>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Durée de validité des devis (en jours)
              </label>
              <input
                type="number"
                min="1"
                max="365"
                value={formData.defaultValidityDays}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    defaultValidityDays: Math.max(1, parseInt(e.target.value, 10) || 15),
                  }))
                }
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 outline-none text-sm font-semibold"
              />
              <span className="text-[11px] text-slate-400">Exemple : 15 jours</span>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Devise utilisée
              </label>
              <div className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-sm font-bold flex items-center justify-between">
                <span>FCFA (Franc CFA BCEAO)</span>
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  Par défaut
                </span>
              </div>
              <span className="text-[11px] text-slate-400">Adapté à la Côte d'Ivoire & UEMOA</span>
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Conditions générales par défaut (modalités de paiement)
            </label>
            <textarea
              rows={3}
              value={formData.defaultTerms}
              onChange={(e) => setFormData((prev) => ({ ...prev, defaultTerms: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 outline-none text-sm"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Notes de remerciement par défaut
            </label>
            <textarea
              rows={2}
              value={formData.defaultNotes}
              onChange={(e) => setFormData((prev) => ({ ...prev, defaultNotes: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 outline-none text-sm"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-100">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Enregistrement...' : 'Enregistrer les préférences'}</span>
          </button>
        </div>
      </form>

      {/* 3. MODÈLE FREEMIUM & ARCHITECTURE */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-900">Modèle DevisGo CI (Freemium)</h2>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
            Version V1 Gratuite Active
          </span>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          DevisGo CI V1 est mis à votre disposition gratuitement sans aucun abonnement, sans carte bancaire et sans frais cachés.
          L'architecture prévoit l'arrivée future de fonctionnalités PRO optionnelles (sauvegarde cloud, synchronisation multi-appareils, modèles personnalisés).
        </p>

        {/* Freemium Architecture Demonstration Switch (For testing PDF without branding) */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-900 block">
                Contrôle du branding PDF (Architecture Freemium)
              </span>
              <span className="text-[11px] text-slate-500">
                Permet de tester le comportement du générateur de PDF (avec ou sans mention "Créé avec DevisGo CI").
              </span>
            </div>
            <div className="flex rounded-lg border border-slate-300 overflow-hidden bg-white">
              <button
                type="button"
                onClick={async () => {
                  const updated = { ...formData, plan: 'free' as const };
                  setFormData(updated);
                  await onSaveSettings(updated);
                }}
                className={`px-3 py-1 text-xs font-bold transition-colors cursor-pointer ${
                  formData.plan === 'free' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Plan FREE
              </button>
              <button
                type="button"
                onClick={async () => {
                  const updated = { ...formData, plan: 'pro' as const };
                  setFormData(updated);
                  await onSaveSettings(updated);
                }}
                className={`px-3 py-1 text-xs font-bold transition-colors cursor-pointer ${
                  formData.plan === 'pro' ? 'bg-blue-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Plan PRO
              </button>
            </div>
          </div>
          <p className="text-[11px] text-slate-400">
            {formData.plan === 'free'
              ? 'Mode actuel : La mention discrète "Créé avec DevisGo CI" apparaît au bas du PDF.'
              : 'Mode PRO : La mention de branding DevisGo CI est totalement supprimée du PDF.'}
          </p>
        </div>
      </div>

      {/* 4. GESTION DES DONNÉES (EXPORT / IMPORT / SUPPRESSION) */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Database className="w-5 h-5 text-blue-900" />
          <h2 className="text-base font-bold text-slate-900">Sauvegarde & Données locales</h2>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          Toutes vos données (profil d’entreprise, devis, réglages) sont stockées directement dans la mémoire de votre navigateur (IndexedDB).
          Vous restez maître de vos données à 100%.
        </p>

        {importStatus && (
          <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs font-semibold">
            {importStatus}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Export */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Exporter mes données
            </h3>
            <p className="text-xs text-slate-500">
              Téléchargez un fichier de sauvegarde (.json) contenant l’ensemble de vos devis et de votre configuration.
            </p>
            <button
              type="button"
              onClick={onExportData}
              className="mt-2 px-4 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
            >
              <Download className="w-4 h-4 text-blue-900" />
              <span>Télécharger la sauvegarde (.json)</span>
            </button>
          </div>

          {/* Import */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Importer mes données
            </h3>
            <p className="text-xs text-slate-500">
              Restaurez vos devis depuis une sauvegarde précédente. Vos données actuelles seront complétées.
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
              id="import-backup-file"
            />
            <label
              htmlFor="import-backup-file"
              className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 text-xs font-bold cursor-pointer shadow-xs transition-colors"
            >
              <Upload className="w-4 h-4 text-emerald-600" />
              <span>{importing ? 'Importation...' : 'Sélectionner un fichier .json'}</span>
            </label>
          </div>
        </div>

        {/* Delete All Danger Zone */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-xs font-bold text-rose-600 uppercase tracking-wider">
              Zone dangereuse
            </h4>
            <p className="text-xs text-slate-500">
              Supprime définitivement tous vos devis et informations stockés sur cet appareil.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
          >
            <Trash2 className="w-4 h-4" />
            <span>Supprimer toutes mes données</span>
          </button>
        </div>
      </div>

      {/* DELETE ALL CONFIRMATION MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">
                Supprimer toutes les données locales ?
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Attention : cette action supprimera toutes vos données locales (profil entreprise, devis, historique).
                <strong className="text-rose-600 block mt-1">Cette action est irréversible.</strong>
              </p>
            </div>

            <div className="space-y-1.5 pt-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Tapez <strong className="text-rose-600">SUPPRIMER</strong> pour confirmer :
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="SUPPRIMER"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmText('');
                }}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleExecuteDeleteAll}
                disabled={deleteConfirmText.trim().toUpperCase() !== 'SUPPRIMER'}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Confirmer la suppression
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
