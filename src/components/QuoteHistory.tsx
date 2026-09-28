import React, { useState } from 'react';
import { 
  Search, 
  Eye, 
  Edit3, 
  Copy, 
  Trash2, 
  Download, 
  Share2, 
  PlusCircle, 
  Calendar,
  FileText,
  User,
  CheckCircle2,
  Clock,
  Filter
} from 'lucide-react';
import { Quote } from '../types';
import { formatFCFA } from '../services/pdfService';

interface QuoteHistoryProps {
  quotes: Quote[];
  onNewQuote: () => void;
  onViewQuote: (quote: Quote) => void;
  onEditQuote: (quote: Quote) => void;
  onDuplicateQuote: (quote: Quote) => void;
  onDeleteQuote: (quote: Quote) => void;
  onDownloadPdf: (quote: Quote) => void;
  onShareWhatsApp: (quote: Quote) => void;
}

export const QuoteHistory: React.FC<QuoteHistoryProps> = ({
  quotes,
  onNewQuote,
  onViewQuote,
  onEditQuote,
  onDuplicateQuote,
  onDeleteQuote,
  onDownloadPdf,
  onShareWhatsApp,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredQuotes = quotes.filter((q) => {
    const term = searchTerm.toLowerCase();
    const num = (q.quoteNumber || '').toLowerCase();
    const client = (q.clientName || '').toLowerCase();
    return num.includes(term) || client.includes(term);
  });

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Mes devis
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Retrouvez tous vos devis enregistrés sur votre appareil ({quotes.length} au total)
          </p>
        </div>

        <button
          onClick={onNewQuote}
          className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Nouveau devis</span>
        </button>
      </div>

      {/* SEARCH BAR */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
        <Search className="w-5 h-5 text-slate-400 shrink-0" />
        <input
          type="text"
          placeholder="Rechercher par numéro (ex: DV-2026-001) ou par client..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full text-sm outline-none text-slate-800 placeholder:text-slate-400"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="text-xs font-semibold text-slate-400 hover:text-slate-600"
          >
            Effacer
          </button>
        )}
      </div>

      {/* QUOTES LIST OR EMPTY STATE */}
      {filteredQuotes.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <FileText className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {searchTerm ? 'Aucun devis ne correspond à votre recherche' : 'Vous n’avez encore aucun devis enregistré.'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {searchTerm ? 'Essayez avec un autre mot-clé ou effacez la recherche.' : 'Créez votre premier devis professionnel dès maintenant.'}
            </p>
          </div>
          {!searchTerm && (
            <button
              onClick={onNewQuote}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm transition-colors cursor-pointer"
            >
              Créer mon premier devis
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  <th className="py-3 px-5">Numéro</th>
                  <th className="py-3 px-5">Client</th>
                  <th className="py-3 px-5">Date</th>
                  <th className="py-3 px-5">Validité</th>
                  <th className="py-3 px-5 text-right">Montant</th>
                  <th className="py-3 px-5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredQuotes.map((quote) => (
                  <tr key={quote.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-5">
                      <span className="font-mono font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded text-xs">
                        {quote.quoteNumber}
                      </span>
                    </td>
                    <td className="py-4 px-5">
                      <span className="font-bold text-slate-900 block">{quote.clientName}</span>
                      {quote.clientPhone && (
                        <span className="text-xs text-slate-400">{quote.clientPhone}</span>
                      )}
                    </td>
                    <td className="py-4 px-5 text-slate-600 text-xs">
                      {quote.date}
                    </td>
                    <td className="py-4 px-5 text-slate-600 text-xs">
                      {quote.validUntil}
                    </td>
                    <td className="py-4 px-5 text-right">
                      <span className="font-extrabold text-slate-900">
                        {formatFCFA(quote.total)}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => onViewQuote(quote)}
                          title="Aperçu A4"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-900 hover:bg-blue-50 transition-colors cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => onDownloadPdf(quote)}
                          title="Télécharger PDF"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-900 hover:bg-blue-50 transition-colors cursor-pointer"
                        >
                          <Download className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => onShareWhatsApp(quote)}
                          title="Partager sur WhatsApp"
                          className="p-1.5 rounded-lg text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => onEditQuote(quote)}
                          title="Modifier"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => onDuplicateQuote(quote)}
                          title="Dupliquer"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          <Copy className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => onDeleteQuote(quote)}
                          title="Supprimer"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden divide-y divide-slate-100">
            {filteredQuotes.map((quote) => (
              <div key={quote.id} className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-blue-900 bg-blue-50 px-2 py-0.5 rounded">
                    {quote.quoteNumber}
                  </span>
                  <span className="text-xs text-slate-400">{quote.date}</span>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 text-base">{quote.clientName}</h4>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-slate-500">
                      {quote.items.length} prestation{quote.items.length > 1 ? 's' : ''}
                    </span>
                    <span className="text-base font-black text-slate-900">
                      {formatFCFA(quote.total)}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onViewQuote(quote)}
                      className="px-3 py-2 min-h-[36px] rounded-lg bg-blue-50 text-blue-900 text-xs font-semibold flex items-center gap-1.5 active:bg-blue-100 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Aperçu</span>
                    </button>
                    <button
                      onClick={() => onDownloadPdf(quote)}
                      className="p-2 min-h-[36px] min-w-[36px] rounded-lg text-slate-600 hover:bg-slate-100 active:bg-slate-200 flex items-center justify-center cursor-pointer"
                      title="Télécharger PDF"
                      aria-label="Télécharger PDF"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onShareWhatsApp(quote)}
                      className="p-2 min-h-[36px] min-w-[36px] rounded-lg text-emerald-600 hover:bg-emerald-50 active:bg-emerald-100 flex items-center justify-center cursor-pointer"
                      title="Partager sur WhatsApp"
                      aria-label="Partager sur WhatsApp"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEditQuote(quote)}
                      className="p-2 min-h-[36px] min-w-[36px] rounded-lg text-slate-600 hover:bg-slate-100 active:bg-slate-200 flex items-center justify-center cursor-pointer"
                      title="Modifier"
                      aria-label="Modifier"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDuplicateQuote(quote)}
                      className="p-2 min-h-[36px] min-w-[36px] rounded-lg text-slate-600 hover:bg-slate-100 active:bg-slate-200 flex items-center justify-center cursor-pointer"
                      title="Dupliquer"
                      aria-label="Dupliquer"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteQuote(quote)}
                      className="p-2 min-h-[36px] min-w-[36px] rounded-lg text-rose-500 hover:bg-rose-50 active:bg-rose-100 flex items-center justify-center cursor-pointer"
                      title="Supprimer"
                      aria-label="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
