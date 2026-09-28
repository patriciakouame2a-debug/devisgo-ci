import { Quote, BusinessProfile } from '../types';
import { formatFCFA } from './pdfService';

export function normalizeWhatsAppNumber(rawNumber?: string): string {
  if (!rawNumber) return '';
  // Strip non-digits except initial '+'
  let cleaned = rawNumber.replace(/[^\d+]/g, '');

  if (cleaned.startsWith('+')) {
    cleaned = cleaned.substring(1);
  }

  // Côte d'Ivoire handling: 10 digits starting with 0 (e.g. 07, 05, 01, 21, 25, 27)
  if (cleaned.length === 10 && cleaned.startsWith('0')) {
    cleaned = '225' + cleaned;
  }

  return cleaned;
}

export function buildWhatsAppMessage(quote: Quote, profile: BusinessProfile | null): string {
  const clientName = quote.clientName?.trim() || 'cher client';
  const quoteNumber = quote.quoteNumber || 'N° non spécifié';
  const totalAmount = formatFCFA(quote.total);
  const companyName = profile?.name?.trim() || 'Notre équipe';

  return `Bonjour ${clientName},

Veuillez trouver votre devis ${quoteNumber} d'un montant total de ${totalAmount}.

Merci pour votre confiance.

${companyName}`;
}

export function getWhatsAppUrl(quote: Quote, profile: BusinessProfile | null): string {
  const targetPhone = normalizeWhatsAppNumber(quote.clientWhatsapp || quote.clientPhone);
  const message = buildWhatsAppMessage(quote, profile);
  const encodedMsg = encodeURIComponent(message);

  if (targetPhone) {
    return `https://wa.me/${targetPhone}?text=${encodedMsg}`;
  }
  return `https://api.whatsapp.com/send?text=${encodedMsg}`;
}

export async function shareQuoteViaWebShare(
  quote: Quote,
  profile: BusinessProfile | null,
  pdfBlob?: Blob,
  filename?: string
): Promise<boolean> {
  const message = buildWhatsAppMessage(quote, profile);

  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      if (pdfBlob && filename && navigator.canShare) {
        const file = new File([pdfBlob], filename, { type: 'application/pdf' });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: `Devis ${quote.quoteNumber}`,
            text: message,
            files: [file],
          });
          return true;
        }
      }

      // Fallback: share text & URL
      await navigator.share({
        title: `Devis ${quote.quoteNumber}`,
        text: message,
      });
      return true;
    } catch (err: unknown) {
      // AbortError is triggered if user simply dismissed the native dialog
      if (err instanceof Error && err.name === 'AbortError') {
        return false;
      }
    }
  }

  return false;
}
