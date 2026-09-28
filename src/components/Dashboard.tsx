import React from 'react';
import { 
  PlusCircle, 
  FileText, 
  Coins, 
  ArrowUpRight, 
  Share2, 
  Download, 
  Copy, 
  Trash2, 
  Edit3, 
  Eye, 
  Building2, 
  CheckCircle,
  Calendar,
  Sparkles
} from 'lucide-react';
import { Quote, BusinessProfile, UserPlan } from '../types';
import { formatFCFA } from '../services/pdfService';

interface DashboardProps {
  quotes: Quote[];
  profile: BusinessProfile | null;
  onNewQuote: () => void;
  onViewQuote: (quote: Quote) => void;
  onEditQuote: (quote: Quote) => void;
  onDuplicateQuote: (quote: Quote) => void;
  onDeleteQuote: (quote: Quote) => void;
  onDownloadPdf: (quote: Quote) => void;
  onShareWhatsApp: (quote: Quote) => void;
  onGoToProfile: () => void;
  onLoadDemo: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  quotes,
  profile,
  onNewQuote,
  onViewQuote,
  onEditQuote,
  onDuplicateQuote,
  onDeleteQuote,
  onDownloadPdf,
  onShareWhatsApp,
  onGoToProfile,
  onLoadDemo,
}) => {
  const totalAmount = quotes.reduce((acc, q) => acc + (q.total || 0), 0);
  const recentQuotes = quotes.slice(0, 5);

  return (
    <div className="space-y-8">
      {/* GREETING & HERO BANNER */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-900 text-xs font-semibold">
            <span>👋 Bonjour</span>
            {profile?.ownerName && <span className="font-bold">{profile.ownerName}</span>}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Prêt à créer votre prochain devis ?
          </h1>
          <p className="text-sm text-slate-600 max-w-xl">
            {profile?.name ? (
              <span>
                Connecté pour l’entreprise <strong className="text-slate-900">{profile.name}</strong>.
              </span>
            ) : (
              <span>
                Astuce : renseignez les coordonnées de votre entreprise pour qu’elles apparaissent sur vos devis.
              </span>
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {!profile?.name && (
            <button
              onClick={onGoToProfile}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm font-semibold flex items-center gap-2 cursor-pointer transition-colors"
            >
              <Building2 className="w-4 h-4 text-slate-500" />
              <span>Configurer mon entreprise</span>
            </button>
          )}

          <button
            onClick={onNewQuote}
            className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 hover:text-white font-bold text-sm shadow-md shadow-amber-500/20 flex items-center gap-2 cursor-pointer transition-all"
          >
            <PlusCircle className="w-5 h-5" />
            <span>Nouveau devis</span>
          </button>
        </div>
      </div>

      {/* KPI METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Devis créés
            </p>
            <p className="text-3xl font-black text-slate-900 mt-1">{quotes.length}</p>
            <span className="text-[11px] text-slate-400 mt-0.5 block">Total enregistrés</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-900 flex items-center justify-center">
            <FileText className="w-6 h-6 text-blue-700" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between sm:col-span-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Montant total devisé
            </p>
            <p className="text-3xl font-black text-slate-900 mt-1">
              {formatFCFA(totalAmount)}
            </p>
            <span className="text-[11px] text-slate-400 mt-0.5 block">
              Cumul de l'ensemble de vos devis émis
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
            <Coins className="w-6 h-6 text-amber-600" />
          </div>
        </div>
      </div>

      {/* RECENT QUOTES LIST OR EMPTY STATE */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Derniers devis</h2>
            <p className="text-xs text-slate-500">Vos devis les plus récents enregistrés localement</p>
          </div>
          {quotes.length > 0 && (
            <button
              onClick={onNewQuote}
              className="text-xs font-bold text-blue-900 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
            >
              <span>+ Créer</span>
            </button>
          )}
        </div>

        {quotes.length === 0 ? (
          <div className="p-12 text-center max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <FileText className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Vous n'avez encore créé aucun devis.
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                Commencez en quelques secondes en ajoutant votre client et vos prestations.
              </p>
            </div>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={onNewQuote}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 hover:text-white font-bold text-sm transition-colors cursor-pointer"
              >
                Créer mon premier devis
              </button>
              <button
                onClick={onLoadDemo}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm font-semibold transition-colors cursor-pointer"
              >
                Charger l’exemple Yoro Créative
              </button>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentQuotes.map((quote) => (
              <div
                key={quote.id}
                className="p-5 sm:p-6 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-blue-900 bg-blue-50 px-2 py-0.5 rounded">
                      {quote.quoteNumber}
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {quote.date}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-base">
                    {quote.clientName}
                  </h4>
                  <p className="text-xs text-slate-500">
                    {quote.items.length} prestation{quote.items.length > 1 ? 's' : ''} • Validité : {quote.validUntil}
                  </p>
                </div>

                <div className="flex flex-wrap sm:flex-nowrap items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <div className="sm:text-right pr-2">
                    <span className="text-base font-extrabold text-slate-900 block">
                      {formatFCFA(quote.total)}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">Net à payer</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onViewQuote(quote)}
                      title="Aperçu du devis"
                      className="p-2 rounded-lg text-slate-600 hover:text-blue-900 hover:bg-blue-50 transition-colors cursor-pointer"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onDownloadPdf(quote)}
                      title="Télécharger le PDF"
                      className="p-2 rounded-lg text-slate-600 hover:text-blue-900 hover:bg-blue-50 transition-colors cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onShareWhatsApp(quote)}
                      title="Partager sur WhatsApp"
                      className="p-2 rounded-lg text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onEditQuote(quote)}
                      title="Modifier le devis"
                      className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onDuplicateQuote(quote)}
                      title="Dupliquer (nouveau numéro)"
                      className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      <Copy className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onDeleteQuote(quote)}
                      title="Supprimer"
                      className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
