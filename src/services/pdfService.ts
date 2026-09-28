import { jsPDF } from 'jspdf';
import { Quote, BusinessProfile, UserPlan } from '../types';

export function formatFCFA(amount: number): string {
  const rounded = Math.round(amount || 0);
  const formatted = new Intl.NumberFormat('fr-FR').format(rounded);
  return `${formatted} FCFA`;
}

export function sanitizeFilename(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents
    .replace(/[^a-zA-Z0-9_-]/g, '_') // replace invalid chars with _
    .replace(/_+/g, '_')
    .slice(0, 50);
}

export function getQuoteFilename(quote: Quote): string {
  const safeNum = sanitizeFilename(quote.quoteNumber || 'Devis');
  const safeClient = sanitizeFilename(quote.clientName || 'Client');
  return `Devis-${safeNum}-${safeClient}.pdf`;
}

export async function generateQuotePDF(
  quote: Quote,
  profile: BusinessProfile | null,
  plan: UserPlan = 'free'
): Promise<{ doc: jsPDF; blob: Blob; dataUrl: string; filename: string }> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 18;
  const contentWidth = pageWidth - margin * 2; // 174mm

  let currentY = margin;

  // Primary colors
  const primaryColor = [26, 54, 93]; // Deep Navy (#1A365D)
  const secondaryColor = [71, 85, 105]; // Slate (#475569)
  const accentColor = [234, 88, 12]; // Orange Accent (#EA580C)
  const tableHeaderBg = [241, 245, 249]; // Light Gray (#F1F5F9)

  // 1. TOP BAR ACCENT
  doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.rect(margin, currentY, contentWidth, 2, 'F');
  currentY += 8;

  // 2. HEADER: BUSINESS INFO (LEFT) & DEVIS BADGE/META (RIGHT)
  const headerStartY = currentY;

  // Handle Logo if present
  let hasLogo = false;
  if (profile?.logo && profile.logo.startsWith('data:image/')) {
    try {
      // Determine format (PNG/JPEG)
      const format = profile.logo.includes('image/png') ? 'PNG' : 'JPEG';
      doc.addImage(profile.logo, format, margin, currentY, 32, 18, undefined, 'FAST');
      currentY += 21;
      hasLogo = true;
    } catch {
      // If logo fails to render, continue gracefully without breaking
    }
  }

  // Business Name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  const businessName = profile?.name || 'Mon Entreprise';
  doc.text(businessName, margin, currentY + 3);
  currentY += 8;

  // Business Details
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);

  if (profile?.ownerName) {
    doc.text(`Responsable : ${profile.ownerName}`, margin, currentY);
    currentY += 4.5;
  }
  if (profile?.phone || profile?.whatsapp) {
    const phoneTxt = profile.phone ? `Tél : ${profile.phone}` : '';
    const waTxt = profile.whatsapp ? `WhatsApp : ${profile.whatsapp}` : '';
    const contactLine = [phoneTxt, waTxt].filter(Boolean).join(' | ');
    doc.text(contactLine, margin, currentY);
    currentY += 4.5;
  }
  if (profile?.email) {
    doc.text(`Email : ${profile.email}`, margin, currentY);
    currentY += 4.5;
  }
  if (profile?.address) {
    const addressLines = doc.splitTextToSize(`Adresse : ${profile.address}`, 85);
    doc.text(addressLines, margin, currentY);
    currentY += addressLines.length * 4.2;
  }

  const businessBlockEndY = currentY;

  // RIGHT SIDE: DEVIS BADGE & META
  const rightX = pageWidth - margin;
  let metaY = headerStartY;

  // Devis Title Badge
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('DEVIS', rightX, metaY + 6, { align: 'right' });
  metaY += 12;

  // Meta Box (Light background)
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(rightX - 70, metaY, 70, 24, 2, 2, 'FD');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.text('Numéro :', rightX - 66, metaY + 6);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(quote.quoteNumber || 'DV-2026-001', rightX - 5, metaY + 6, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.text('Date d’émission :', rightX - 66, metaY + 12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59);
  const formattedDate = formatDateDisplay(quote.date);
  doc.text(formattedDate, rightX - 5, metaY + 12, { align: 'right' });

  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.text('Valable jusqu’au :', rightX - 66, metaY + 18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
  const formattedValid = formatDateDisplay(quote.validUntil);
  doc.text(formattedValid, rightX - 5, metaY + 18, { align: 'right' });

  currentY = Math.max(businessBlockEndY, metaY + 28) + 6;

  // 3. DIVIDER
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, currentY, margin + contentWidth, currentY);
  currentY += 8;

  // 4. CLIENT SECTION (BOX)
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, currentY, contentWidth, 24, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, currentY, contentWidth, 24, 2, 2, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.text('DESTINATAIRE DU DEVIS (CLIENT)', margin + 6, currentY + 6);

  doc.setFontSize(11);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(quote.clientName || 'Client', margin + 6, currentY + 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);

  const clientContactItems = [];
  if (quote.clientPhone) clientContactItems.push(`Tél: ${quote.clientPhone}`);
  if (quote.clientWhatsapp) clientContactItems.push(`WhatsApp: ${quote.clientWhatsapp}`);
  if (quote.clientEmail) clientContactItems.push(`Email: ${quote.clientEmail}`);
  if (quote.clientAddress) clientContactItems.push(`Adresse: ${quote.clientAddress}`);

  const clientLine = clientContactItems.join('  •  ');
  const clientLines = doc.splitTextToSize(clientLine, contentWidth - 12);
  doc.text(clientLines, margin + 6, currentY + 18);

  currentY += 30;

  // 5. PRESTATIONS TABLE
  // Columns:
  // Designation: width 95mm (x: margin)
  // Quantité: width 22mm (x: margin + 95)
  // Prix unitaire: width 28mm (x: margin + 117)
  // Total: width 29mm (x: margin + 145)
  const colDesignationX = margin + 4;
  const colQteX = margin + 105;
  const colPuX = margin + 135;
  const colTotalX = margin + contentWidth - 4;

  // Helper to draw table header
  const renderTableHeader = (y: number) => {
    doc.setFillColor(tableHeaderBg[0], tableHeaderBg[1], tableHeaderBg[2]);
    doc.roundedRect(margin, y, contentWidth, 8, 1, 1, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('DÉSIGNATION DE LA PRESTATION', colDesignationX, y + 5.5);
    doc.text('QTÉ', colQteX, y + 5.5, { align: 'center' });
    doc.text('PRIX UNITAIRE', colPuX, y + 5.5, { align: 'right' });
    doc.text('TOTAL', colTotalX, y + 5.5, { align: 'right' });
  };

  renderTableHeader(currentY);
  currentY += 10;

  // Table Rows
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);

  quote.items.forEach((item, index) => {
    const descLines = doc.splitTextToSize(item.description || 'Prestation', 88);
    const rowHeight = Math.max(8, descLines.length * 4.5 + 4);

    // Check if new page is needed before rendering this row
    if (currentY + rowHeight > pageHeight - 40) {
      doc.addPage();
      currentY = margin;

      // Continuation Header
      doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.rect(margin, currentY, contentWidth, 1.5, 'F');
      currentY += 5;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text(`DEVIS ${quote.quoteNumber || ''} (suite)`, margin, currentY);
      currentY += 5;

      renderTableHeader(currentY);
      currentY += 10;
    }

    // Alternate row zebra tint
    if (index % 2 === 1) {
      doc.setFillColor(252, 253, 254);
      doc.rect(margin, currentY - 2, contentWidth, rowHeight, 'F');
    }

    // Row text
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(descLines, colDesignationX, currentY + 3);

    doc.text(String(item.quantity || 1), colQteX, currentY + 3, { align: 'center' });
    doc.text(formatFCFA(item.unitPrice), colPuX, currentY + 3, { align: 'right' });
    doc.setFont('helvetica', 'bold');
    doc.text(formatFCFA(item.total), colTotalX, currentY + 3, { align: 'right' });

    // Light line underneath row
    doc.setDrawColor(241, 245, 249);
    doc.line(margin, currentY + rowHeight - 2, margin + contentWidth, currentY + rowHeight - 2);

    currentY += rowHeight;
  });

  currentY += 4;

  // 6. TOTALS BREAKDOWN (RIGHT ALIGNED BOX)
  if (currentY > pageHeight - 50) {
    doc.addPage();
    currentY = margin + 10;
  }

  const totalBoxWidth = 80;
  const totalBoxX = margin + contentWidth - totalBoxWidth;

  // Subtotal
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.text('Sous-total :', totalBoxX, currentY);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(formatFCFA(quote.subtotal), margin + contentWidth - 4, currentY, { align: 'right' });
  currentY += 6;

  // Discount (if any)
  if (quote.discountAmount > 0) {
    const discountLabel =
      quote.discountType === 'percentage'
        ? `Réduction (${quote.discountValue}%) :`
        : 'Réduction :';
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.text(discountLabel, totalBoxX, currentY);
    doc.setFont('helvetica', 'bold');
    doc.text(`- ${formatFCFA(quote.discountAmount)}`, margin + contentWidth - 4, currentY, {
      align: 'right',
    });
    currentY += 6;
  }

  // Net Total Box
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.roundedRect(totalBoxX - 4, currentY, totalBoxWidth + 4, 11, 1.5, 1.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(255, 255, 255);
  doc.text('TOTAL NET :', totalBoxX, currentY + 7.5);
  doc.text(formatFCFA(quote.total), margin + contentWidth - 2, currentY + 7.5, { align: 'right' });

  currentY += 18;

  // 7. NOTES & CONDITIONS
  if (quote.notes || quote.terms) {
    const notesLines = quote.notes ? doc.splitTextToSize(quote.notes, contentWidth - 8) : [];
    const termsLines = quote.terms ? doc.splitTextToSize(quote.terms, contentWidth - 8) : [];

    let calculatedHeight = 10;
    if (notesLines.length > 0) calculatedHeight += 5 + notesLines.length * 3.8 + 3;
    if (termsLines.length > 0) calculatedHeight += 5 + termsLines.length * 3.8 + 2;

    if (currentY + calculatedHeight > pageHeight - 45) {
      doc.addPage();
      currentY = margin + 10;
    }

    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    const notesBoxY = currentY;

    doc.roundedRect(margin, notesBoxY, contentWidth, calculatedHeight, 2, 2, 'FD');

    let innerY = notesBoxY + 5;

    if (notesLines.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.text('NOTES :', margin + 4, innerY);
      innerY += 4;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      doc.text(notesLines, margin + 4, innerY);
      innerY += notesLines.length * 3.8 + 3;
    }

    if (termsLines.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text('CONDITIONS & MODALITÉS :', margin + 4, innerY);
      innerY += 4;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      doc.text(termsLines, margin + 4, innerY);
    }

    currentY = notesBoxY + calculatedHeight + 6;
  }

  // 8. SIGNATURE BOX / BON POUR ACCORD
  if (currentY > pageHeight - 35) {
    doc.addPage();
    currentY = margin + 10;
  }

  const signBoxY = Math.min(currentY + 2, pageHeight - 36);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.text('Bon pour accord (Date, signature & cachet précédés de la mention manuscrite "Bon pour accord") :', margin, signBoxY);

  doc.setDrawColor(203, 213, 225);
  doc.setLineDashPattern([1.5, 1.5], 0);
  doc.rect(margin, signBoxY + 3, 80, 14);
  doc.setLineDashPattern([], 0);

  // 9. MULTI-PAGE NUMBERING & FREEMIUM BRANDING ON ALL PAGES
  const totalPages = doc.getNumberOfPages();
  const footerY = pageHeight - 8;

  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    doc.setPage(pageNum);

    // Page numbers on right
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184); // Slate 400
    doc.text(`Page ${pageNum} / ${totalPages}`, pageWidth - margin, footerY, { align: 'right' });

    // Center branding: visible on FREE plan, removed completely on PRO / BUSINESS
    if (plan === 'free') {
      doc.text(
        'Créé avec DevisGo CI  •  Créez vos devis professionnels en moins d’une minute',
        pageWidth / 2,
        footerY,
        { align: 'center' }
      );
    }
  }

  const filename = getQuoteFilename(quote);
  const blob = doc.output('blob');
  const dataUrl = doc.output('datauristring');

  return { doc, blob, dataUrl, filename };
}

export async function downloadQuotePDF(
  quote: Quote,
  profile: BusinessProfile | null,
  plan: UserPlan = 'free'
): Promise<string> {
  const { doc, filename } = await generateQuotePDF(quote, profile, plan);
  doc.save(filename);
  return filename;
}

function formatDateDisplay(dateStr?: string): string {
  if (!dateStr) return '';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      // YYYY-MM-DD -> DD/MM/YYYY
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return `${day}/${month}/${d.getFullYear()}`;
  } catch {
    return dateStr;
  }
}
