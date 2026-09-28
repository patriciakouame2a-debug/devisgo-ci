import React, { useState } from 'react';
import { 
  X, 
  Share2, 
  Download, 
  Copy, 
  Check, 
  ExternalLink, 
  Smartphone, 
  MessageSquare, 
  FileCheck 
} from 'lucide-react';
import { Quote, BusinessProfile } from '../types';
import { buildWhatsAppMessage, getWhatsAppUrl, shareQuoteViaWebShare } from '../services/whatsappService';
import { generateQuotePDF } from '../services/pdfService';

interface WhatsAppModalProps {
  quote: Quote;
  profile: BusinessProfile | null;
  onClose: () => void;
  onDownloadPdf: () => void;
}

export const WhatsAppModal: React.FC<WhatsAppModalProps> = ({
  quote,
  profile,
  onClose,
  onDownloadPdf,
}) => {
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [nativeShareLoading, setNativeShareLoading] = useState(false);

  const messageText = buildWhatsAppMessage(quote, profile);
  const whatsappUrl = getWhatsAppUrl(quote, profile);

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(messageText);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      // Fallback
    }
  };

  const handleDownloadStep = () => {
    onDownloadPdf();
    setDownloaded(true);
  };

  const handleNativeShare = async () => {
    setNativeShareLoading(true);
    try {
      const { blob, filename } = await generateQuotePDF(quote, profile, 'free');
      await shareQuoteViaWebShare(quote, profile, blob, filename);
    } finally {
      setNativeShareLoading(false);
    }
  };

  const canWebShare = typeof navigator !== 'undefined' && !!navigator.share;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">
                Partager sur WhatsApp
              </h3>
              <p className="text-xs text-slate-500">
                Devis {quote.quoteNumber} pour {quote.clientName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* GUIDED STEPS */}
        <div className="space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            WhatsApp ne permet pas aux sites web d'injecter automatiquement un fichier sans action manuelle. 
            Suivez ces 2 étapes simples :
          </p>

          <div className="space-y-3">
            {/* Step 1 */}
            <div className={`p-4 rounded-2xl border transition-all ${
              downloaded 
                ? 'bg-emerald-50/60 border-emerald-200' 
                : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                    downloaded ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-700'
                  }`}>
                    {downloaded ? <Check className="w-3.5 h-3.5" /> : '1'}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">
                      Télécharger le devis en PDF
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Le document A4 est généré et stocké dans vos téléchargements.
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleDownloadStep}
                  className="px-3 py-1.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                >
                  <Download className="w-3.5 h-3.5 text-amber-300" />
                  <span>{downloaded ? 'Re-télécharger' : 'Télécharger'}</span>
                </button>
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-full bg-slate-300 text-slate-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    Ouvrir WhatsApp et joindre le PDF
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Le message officiel ci-dessous est prérempli. Il ne vous restera qu’à joindre le PDF téléchargé.
                  </p>
                </div>
              </div>

              {/* Message Preview */}
              <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-700 font-sans whitespace-pre-line relative">
                {messageText}
                <button
                  onClick={handleCopyText}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                  title="Copier le texte"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copié' : 'Copier'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex flex-col gap-2 pt-2">
          {canWebShare && (
            <button
              onClick={handleNativeShare}
              disabled={nativeShareLoading}
              className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <Smartphone className="w-4 h-4 text-amber-400" />
              <span>{nativeShareLoading ? 'Partage en cours...' : 'Partager directement le fichier (Mobile)'}</span>
            </button>
          )}

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              if (!downloaded) {
                onDownloadPdf();
              }
            }}
            className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 cursor-pointer transition-all"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Ouvrir dans WhatsApp</span>
            <ExternalLink className="w-4 h-4 ml-1 opacity-70" />
          </a>
        </div>
      </div>
    </div>
  );
};
