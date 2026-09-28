import React from 'react';
import { 
  X, 
  Download, 
  Share2, 
  Printer, 
  Edit3, 
  FileText, 
  Building2, 
  Check, 
  Sparkles 
} from 'lucide-react';
import { Quote, BusinessProfile, UserPlan } from '../types';
import { formatFCFA } from '../services/pdfService';

interface QuotePreviewModalProps {
  quote: Quote;
  profile: BusinessProfile | null;
  plan: UserPlan;
  onClose: () => void;
  onEdit: () => void;
  onDownloadPdf: () => void;
  onShareWhatsApp: () => void;
}

export const QuotePreviewModal: React.FC<QuotePreviewModalProps> = ({
  quote,
  profile,
  plan,
  onClose,
  onEdit,
  onDownloadPdf,
  onShareWhatsApp,
}) => {
  const formatDateDisplay = (dateStr?: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* MODAL TOP BAR (CONTROLS) */}
        <div className="no-print bg-slate-900 text-white px-3 sm:px-5 py-3 flex flex-wrap items-center justify-between gap-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="font-bold text-xs sm:text-sm tracking-wide">Aperçu</span>
            <span className="text-xs font-mono bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded border border-blue-400/20">
              {quote.quoteNumber}
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={onEdit}
              className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              title="Modifier le devis"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Modifier</span>
            </button>

            <button
              onClick={() => window.print()}
              className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              title="Imprimer le document"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Imprimer</span>
            </button>

            <button
              onClick={onDownloadPdf}
              className="px-3 sm:px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span><span className="hidden sm:inline">Télécharger </span>PDF</span>
            </button>

            <button
              onClick={onShareWhatsApp}
              className="px-3 sm:px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors ml-1 cursor-pointer"
              title="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PREVIEW CONTAINER - A4 PROPORTIONS */}
        <div className="overflow-y-auto p-2 sm:p-8 bg-slate-100 flex justify-center">
          <div className="w-full max-w-[210mm] min-h-[297mm] bg-white p-4 sm:p-12 rounded-xl shadow-lg border border-slate-200 text-slate-900 flex flex-col justify-between text-xs sm:text-sm">
            
            {/* Top Accent Strip */}
            <div className="space-y-5 sm:space-y-6">
              <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 to-amber-600 rounded-full" />

              {/* 1. HEADER: BUSINESS & DEVIS META */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 sm:gap-6 border-b border-slate-200 pb-5 sm:pb-6">
                {/* Business Info */}
                <div className="space-y-1.5 max-w-sm">
                  {profile?.logo && (
                    <div className="h-12 sm:h-14 max-w-[180px] mb-2 flex items-center">
                      <img
                        src={profile.logo}
                        alt="Logo"
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                  )}
                  <h2 className="text-lg sm:text-2xl font-black text-blue-950 tracking-tight">
                    {profile?.name || 'Mon Entreprise'}
                  </h2>
                  <div className="text-xs text-slate-600 space-y-0.5">
                    {profile?.ownerName && <p>Responsable : {profile.ownerName}</p>}
                    {(profile?.phone || profile?.whatsapp) && (
                      <p>
                        {profile.phone && `Tél : ${profile.phone}`}
                        {profile.phone && profile.whatsapp && ' • '}
                        {profile.whatsapp && `WhatsApp : ${profile.whatsapp}`}
                      </p>
                    )}
                    {profile?.email && <p>Email : {profile.email}</p>}
                    {profile?.address && <p>Adresse : {profile.address}</p>}
                  </div>
                </div>

                {/* Devis Meta Block */}
                <div className="w-full sm:w-auto text-left sm:text-right space-y-1.5">
                  <h1 className="text-2xl sm:text-3xl font-black text-blue-950 tracking-tight">DEVIS</h1>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 sm:text-right space-y-1">
                    <p className="text-xs text-slate-500">
                      Numéro : <strong className="font-mono text-blue-900 font-bold">{quote.quoteNumber}</strong>
                    </p>
                    <p className="text-xs text-slate-500">
                      Date : <strong className="text-slate-800">{formatDateDisplay(quote.date)}</strong>
                    </p>
                    <p className="text-xs text-amber-700">
                      Valable jusqu'au : <strong className="font-bold">{formatDateDisplay(quote.validUntil)}</strong>
                    </p>
                  </div>
                </div>
              </div>

              {/* 2. CLIENT SECTION */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 sm:p-5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 block mb-1">
                  Destinataire du devis (Client)
                </span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  {quote.clientName || 'Client'}
                </h3>
                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
                  {quote.clientPhone && <span>Tél : {quote.clientPhone}</span>}
                  {quote.clientWhatsapp && <span>WhatsApp : {quote.clientWhatsapp}</span>}
                  {quote.clientEmail && <span>Email : {quote.clientEmail}</span>}
                  {quote.clientAddress && <span>Adresse : {quote.clientAddress}</span>}
                </div>
              </div>

              {/* 3. TABLE DES PRESTATIONS */}
              <div className="overflow-x-auto -mx-2 sm:mx-0 px-2 sm:px-0">
                <table className="w-full border-collapse min-w-[340px]">
                  <thead>
                    <tr className="bg-slate-100/90 text-slate-800 text-[11px] font-bold uppercase tracking-wider border-b border-slate-200">
                      <th className="py-2.5 px-3 text-left">Désignation</th>
                      <th className="py-2.5 px-3 text-center w-16">Qté</th>
                      <th className="py-2.5 px-3 text-right w-28">Prix unitaire</th>
                      <th className="py-2.5 px-3 text-right w-28">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                    {quote.items.map((item, idx) => (
                      <tr key={item.id} className={idx % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'}>
                        <td className="py-3 px-3 font-medium text-slate-900">
                          {item.description || 'Prestation'}
                        </td>
                        <td className="py-3 px-3 text-center text-slate-700">
                          {item.quantity}
                        </td>
                        <td className="py-3 px-3 text-right font-medium text-slate-700">
                          {formatFCFA(item.unitPrice)}
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-slate-900">
                          {formatFCFA(item.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 4. TOTALS */}
              <div className="flex justify-end pt-2">
                <div className="w-full sm:w-72 space-y-2">
                  <div className="flex justify-between text-xs text-slate-600 px-2">
                    <span>Sous-total :</span>
                    <span className="font-bold text-slate-800">{formatFCFA(quote.subtotal)}</span>
                  </div>

                  {quote.discountAmount > 0 && (
                    <div className="flex justify-between text-xs text-amber-600 px-2 font-medium">
                      <span>
                        Réduction {quote.discountType === 'percentage' ? `(${quote.discountValue}%)` : ''} :
                      </span>
                      <span className="font-bold">-{formatFCFA(quote.discountAmount)}</span>
                    </div>
                  )}

                  <div className="bg-blue-950 text-white rounded-xl p-3.5 flex justify-between items-center shadow-xs">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider block">Total Net</span>
                      <span className="text-[10px] text-blue-200">En FCFA</span>
                    </div>
                    <span className="text-lg sm:text-xl font-black">
                      {formatFCFA(quote.total)}
                    </span>
                  </div>
                </div>
              </div>

              {/* 5. NOTES & CONDITIONS */}
              {(quote.notes || quote.terms) && (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 text-xs text-slate-600">
                  {quote.notes && (
                    <div>
                      <strong className="text-amber-700 font-bold block mb-0.5">Notes :</strong>
                      <p className="whitespace-pre-line">{quote.notes}</p>
                    </div>
                  )}
                  {quote.terms && (
                    <div>
                      <strong className="text-blue-950 font-bold block mb-0.5">
                        Conditions & Modalités :
                      </strong>
                      <p className="whitespace-pre-line">{quote.terms}</p>
                    </div>
                  )}
                </div>
              )}

              {/* 6. SIGNATURE BLOCK */}
              <div className="pt-4 border-t border-slate-200 flex justify-between items-end text-xs text-slate-500">
                <div className="max-w-xs">
                  <p className="font-semibold text-slate-700 mb-1">
                    Bon pour accord & Acceptation du devis :
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Mention manuscrite "Bon pour accord", date et signature
                  </p>
                  <div className="h-16 w-56 border border-dashed border-slate-300 rounded-lg mt-2 bg-slate-50/50" />
                </div>
              </div>
            </div>

            {/* 7. FREEMIUM BRANDING FOOTER */}
            <div className="pt-8 text-center text-[11px] text-slate-400 border-t border-slate-100 mt-6">
              {plan === 'free' ? (
                <span>
                  Créé avec <strong>DevisGo CI</strong> • Créez vos devis professionnels gratuitement
                </span>
              ) : (
                <span>Document contractuel édité par {profile?.name || 'l’entreprise'}.</span>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
