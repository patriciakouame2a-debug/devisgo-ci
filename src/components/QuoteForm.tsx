import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  ArrowLeft, 
  Eye, 
  Save, 
  Download, 
  Share2, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  Calendar,
  DollarSign,
  Percent
} from 'lucide-react';
import { Quote, QuoteItem, BusinessProfile, AppSettings } from '../types';
import { formatFCFA } from '../services/pdfService';

interface QuoteFormProps {
  initialQuote?: Quote | null;
  profile: BusinessProfile | null;
  settings: AppSettings;
  nextQuoteNumber: string;
  onSave: (quote: Quote) => Promise<void>;
  onPreview: (quote: Quote) => void;
  onDownloadPdf: (quote: Quote) => void;
  onShareWhatsApp: (quote: Quote) => void;
  onCancel: () => void;
}

export const QuoteForm: React.FC<QuoteFormProps> = ({
  initialQuote,
  profile,
  settings,
  nextQuoteNumber,
  onSave,
  onPreview,
  onDownloadPdf,
  onShareWhatsApp,
  onCancel,
}) => {
  // Format dates YYYY-MM-DD
  const getTodayStr = () => {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };

  const getValidUntilStr = (baseDateStr: string, days: number) => {
    try {
      const d = new Date(baseDateStr);
      d.setDate(d.getDate() + (days || 15));
      const pad = (n: number) => String(n).padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    } catch {
      return baseDateStr;
    }
  };

  // State
  const [quoteNumber, setQuoteNumber] = useState(
    initialQuote?.quoteNumber || nextQuoteNumber
  );
  const [date, setDate] = useState(initialQuote?.date || getTodayStr());
  const [validUntil, setValidUntil] = useState(
    initialQuote?.validUntil || getValidUntilStr(getTodayStr(), settings.defaultValidityDays || 15)
  );

  const [clientName, setClientName] = useState(initialQuote?.clientName || '');
  const [clientPhone, setClientPhone] = useState(initialQuote?.clientPhone || '');
  const [clientWhatsapp, setClientWhatsapp] = useState(initialQuote?.clientWhatsapp || '');
  const [clientEmail, setClientEmail] = useState(initialQuote?.clientEmail || '');
  const [clientAddress, setClientAddress] = useState(initialQuote?.clientAddress || '');

  const [items, setItems] = useState<QuoteItem[]>(
    initialQuote?.items || [
      {
        id: 'item-' + Date.now(),
        description: '',
        quantity: 1,
        unitPrice: 0,
        total: 0,
      },
    ]
  );

  const [discountType, setDiscountType] = useState<'fixed' | 'percentage'>(
    initialQuote?.discountType || 'fixed'
  );
  const [discountValue, setDiscountValue] = useState<number>(
    initialQuote?.discountValue || 0
  );

  const [notes, setNotes] = useState(initialQuote?.notes ?? settings.defaultNotes);
  const [terms, setTerms] = useState(initialQuote?.terms ?? settings.defaultTerms);

  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Synchronize next quote number if prop changes and it's a new quote
  useEffect(() => {
    if (!initialQuote && nextQuoteNumber) {
      setQuoteNumber(nextQuoteNumber);
    }
  }, [nextQuoteNumber, initialQuote]);

  // Recalculate Subtotal, Discount & Total
  const subtotal = items.reduce((sum, item) => sum + (item.total || 0), 0);

  let discountAmount = 0;
  if (discountType === 'percentage') {
    discountAmount = Math.round((subtotal * Math.min(100, Math.max(0, discountValue))) / 100);
  } else {
    discountAmount = Math.min(subtotal, Math.max(0, discountValue));
  }

  const netTotal = Math.max(0, subtotal - discountAmount);

  // Item Handlers
  const handleItemChange = (
    id: string,
    field: keyof Omit<QuoteItem, 'id' | 'total'>,
    val: string | number
  ) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;

        const updated = { ...item, [field]: val };
        const q = typeof updated.quantity === 'number' ? updated.quantity : parseFloat(String(updated.quantity)) || 0;
        const p = typeof updated.unitPrice === 'number' ? updated.unitPrice : parseFloat(String(updated.unitPrice)) || 0;
        updated.total = Math.round(q * p);
        return updated;
      })
    );
    setValidationError(null);
  };

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: 'item-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
        description: '',
        quantity: 1,
        unitPrice: 0,
        total: 0,
      },
    ]);
    setValidationError(null);
  };

  const handleRemoveItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    setValidationError(null);
  };

  // Validation function matching user brief requirements
  const validateForm = (): boolean => {
    if (!clientName.trim()) {
      setValidationError('Veuillez renseigner le nom du client.');
      return false;
    }

    if (items.length === 0) {
      setValidationError('Ajoutez au moins une prestation.');
      return false;
    }

    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      if (!it.description.trim()) {
        setValidationError('Veuillez renseigner la désignation de la prestation.');
        return false;
      }
      if (it.quantity <= 0) {
        setValidationError('La quantité doit être supérieure à zéro.');
        return false;
      }
      if (it.unitPrice < 0) {
        setValidationError('Le prix unitaire ne peut pas être négatif.');
        return false;
      }
    }

    setValidationError(null);
    return true;
  };

  const buildCurrentQuoteObject = (): Quote => {
    return {
      id: initialQuote?.id || 'quote-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6),
      quoteNumber,
      date,
      validUntil,
      clientName: clientName.trim(),
      clientPhone: clientPhone.trim(),
      clientWhatsapp: clientWhatsapp.trim(),
      clientEmail: clientEmail.trim(),
      clientAddress: clientAddress.trim(),
      items,
      subtotal,
      discountType,
      discountValue: Math.max(0, discountValue),
      discountAmount,
      total: netTotal,
      notes,
      terms,
      createdAt: initialQuote?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: initialQuote?.status || 'sent',
      planUsed: settings.plan,
    };
  };

  const handleSaveOnly = async () => {
    if (!validateForm()) return;
    setIsSaving(true);
    try {
      const quoteObj = buildCurrentQuoteObject();
      await onSave(quoteObj);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreviewClick = () => {
    if (!validateForm()) return;
    const quoteObj = buildCurrentQuoteObject();
    onPreview(quoteObj);
  };

  const handleDownloadClick = async () => {
    if (!validateForm()) return;
    const quoteObj = buildCurrentQuoteObject();
    // Auto-save when downloading
    await onSave(quoteObj);
    onDownloadPdf(quoteObj);
  };

  const handleWhatsAppClick = async () => {
    if (!validateForm()) return;
    const quoteObj = buildCurrentQuoteObject();
    // Auto-save when sharing
    await onSave(quoteObj);
    onShareWhatsApp(quoteObj);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* TOP HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
            title="Retour"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {initialQuote ? 'Modifier le devis' : 'Nouveau devis'}
            </h1>
            <p className="text-xs text-slate-500">
              Renseignez les détails pour générer votre devis professionnel en FCFA
            </p>
          </div>
        </div>

        {/* Action buttons header */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handlePreviewClick}
            className="px-3.5 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Eye className="w-4 h-4 text-blue-700" />
            <span>Aperçu</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadClick}
            className="px-3.5 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Download className="w-4 h-4 text-amber-300" />
            <span>Télécharger PDF</span>
          </button>

          <button
            type="button"
            onClick={handleWhatsAppClick}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Share2 className="w-4 h-4" />
            <span>WhatsApp</span>
          </button>

          <button
            type="button"
            onClick={handleSaveOnly}
            disabled={isSaving}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Enregistrement...' : 'Enregistrer'}</span>
          </button>
        </div>
      </div>

      {/* VALIDATION ERROR BANNER */}
      {validationError && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-semibold flex items-center gap-3 animate-shake">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* SECTION 1: INFORMATIONS DU DEVIS */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
          <span>1. Informations du devis</span>
          <span className="font-mono text-xs font-extrabold text-blue-900 bg-blue-50 px-2 py-0.5 rounded">
            {quoteNumber}
          </span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
              Numéro de devis
            </label>
            <input
              type="text"
              value={quoteNumber}
              onChange={(e) => setQuoteNumber(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-mono font-bold text-sm text-slate-800 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none"
            />
            <span className="text-[10px] text-slate-400">Généré automatiquement (DV-YYYY-XXX)</span>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
              Date d'émission
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                setValidUntil(getValidUntilStr(e.target.value, settings.defaultValidityDays || 15));
              }}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm text-slate-800 focus:ring-2 focus:ring-blue-600 outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
              Valable jusqu'au
            </label>
            <input
              type="date"
              value={validUntil}
              onChange={(e) => setValidUntil(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm text-slate-800 focus:ring-2 focus:ring-blue-600 outline-none"
            />
            <span className="text-[10px] text-slate-400">Par défaut +15 jours (modifiable)</span>
          </div>
        </div>
      </div>

      {/* SECTION 2: DESTINATAIRE (CLIENT) */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-3">
          2. Client destinataire
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1 sm:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Nom du client ou entreprise <span className="text-amber-600">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Ex : Restaurant Le Baobab, M. Kouassi Marc..."
              value={clientName}
              onChange={(e) => {
                setClientName(e.target.value);
                setValidationError(null);
              }}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 outline-none text-sm font-semibold"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Téléphone du client
            </label>
            <input
              type="tel"
              placeholder="Ex : 07 08 09 10 11"
              value={clientPhone}
              onChange={(e) => setClientPhone(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 outline-none text-sm"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Numéro WhatsApp (pour le partage)
            </label>
            <input
              type="tel"
              placeholder="Ex : 07 08 09 10 11 ou +225..."
              value={clientWhatsapp}
              onChange={(e) => setClientWhatsapp(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 outline-none text-sm"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Email du client
            </label>
            <input
              type="email"
              placeholder="Ex : client@domaine.ci"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 outline-none text-sm"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Adresse / Localisation du client
            </label>
            <input
              type="text"
              placeholder="Ex : Plateau, Abidjan"
              value={clientAddress}
              onChange={(e) => setClientAddress(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 outline-none text-sm"
            />
          </div>
        </div>
      </div>

      {/* SECTION 3: PRESTATIONS & SERVICES */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
            3. Prestations & Services
          </h2>
          <span className="text-xs text-slate-500 font-semibold">
            {items.length} ligne{items.length > 1 ? 's' : ''}
          </span>
        </div>

        {/* Items List */}
        <div className="space-y-3">
          {items.map((item, index) => (
            <div
              key={item.id}
              className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 hover:border-slate-300 transition-colors space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase">
                  Ligne #{index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveItem(item.id)}
                  className="text-slate-400 hover:text-rose-600 p-1 rounded-lg transition-colors cursor-pointer"
                  title="Supprimer cette ligne"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                {/* Designation */}
                <div className="sm:col-span-6 space-y-1">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                    Désignation de la prestation <span className="text-amber-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex : Création affiche publicitaire, Pose de carrelage..."
                    value={item.description}
                    onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 bg-white text-sm outline-none font-medium"
                  />
                </div>

                {/* Quantité */}
                <div className="sm:col-span-2 space-y-1">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                    Quantité
                  </label>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => {
                      const raw = e.target.value;
                      handleItemChange(item.id, 'quantity', raw === '' ? 0 : Number(raw));
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 bg-white text-sm text-center font-bold outline-none"
                  />
                </div>

                {/* Prix Unitaire FCFA */}
                <div className="sm:col-span-2 space-y-1">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                    Prix Unit. (FCFA)
                  </label>
                  <input
                    type="number"
                    value={item.unitPrice}
                    onChange={(e) => {
                      const raw = e.target.value;
                      handleItemChange(item.id, 'unitPrice', raw === '' ? 0 : Number(raw));
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 bg-white text-sm text-right font-bold outline-none"
                  />
                </div>

                {/* Total Ligne */}
                <div className="sm:col-span-2 space-y-1">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 text-right">
                    Total
                  </label>
                  <div className="h-9 px-3 rounded-xl bg-slate-200/80 flex items-center justify-end font-extrabold text-sm text-slate-900">
                    {formatFCFA(item.total)}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {items.length === 0 && (
            <div className="p-8 rounded-2xl border-2 border-dashed border-slate-200 text-center space-y-2">
              <p className="text-sm font-semibold text-slate-600">
                Aucune prestation ajoutée.
              </p>
              <p className="text-xs text-slate-400">
                Cliquez sur le bouton ci-dessous pour ajouter votre première prestation.
              </p>
            </div>
          )}
        </div>

        {/* Add item button */}
        <button
          type="button"
          onClick={handleAddItem}
          className="w-full py-3 rounded-xl border-2 border-dashed border-slate-300 hover:border-blue-500 text-blue-900 hover:bg-blue-50/50 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 text-blue-700" />
          <span>+ Ajouter une prestation</span>
        </button>
      </div>

      {/* SECTION 4: CALCULS AUTOMATIQUES & RÉDUCTION */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-3">
          4. Récapitulatif & Réduction
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {/* Réduction options */}
          <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Appliquer une réduction
              </label>
              <div className="flex rounded-lg border border-slate-300 overflow-hidden bg-white">
                <button
                  type="button"
                  onClick={() => setDiscountType('fixed')}
                  className={`px-3 py-1 text-xs font-bold flex items-center gap-1 ${
                    discountType === 'fixed'
                      ? 'bg-blue-900 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span>FCFA</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDiscountType('percentage')}
                  className={`px-3 py-1 text-xs font-bold flex items-center gap-1 ${
                    discountType === 'percentage'
                      ? 'bg-blue-900 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Percent className="w-3 h-3" />
                  <span>%</span>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="number"
                min="0"
                max={discountType === 'percentage' ? 100 : subtotal}
                value={discountValue}
                onChange={(e) => setDiscountValue(Math.max(0, parseInt(e.target.value, 10) || 0))}
                placeholder={discountType === 'percentage' ? 'Ex: 10' : 'Ex: 5000'}
                className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 bg-white text-sm font-bold outline-none"
              />
              <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">
                {discountType === 'percentage' ? '%' : 'FCFA'}
              </span>
            </div>
            {discountAmount > 0 && (
              <p className="text-xs text-amber-600 font-semibold">
                Montant de la remise déduit : -{formatFCFA(discountAmount)}
              </p>
            )}
          </div>

          {/* Totals Breakdown */}
          <div className="space-y-3 bg-slate-50 p-5 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between text-sm text-slate-600">
              <span>Sous-total :</span>
              <span className="font-bold text-slate-900">{formatFCFA(subtotal)}</span>
            </div>

            {discountAmount > 0 && (
              <div className="flex items-center justify-between text-sm text-amber-600 font-medium">
                <span>
                  Réduction {discountType === 'percentage' ? `(${discountValue}%)` : ''} :
                </span>
                <span className="font-bold">-{formatFCFA(discountAmount)}</span>
              </div>
            )}

            <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-base font-extrabold text-slate-900 block">TOTAL NET :</span>
                <span className="text-[10px] text-slate-500 uppercase font-semibold">
                  Toutes taxes comprises
                </span>
              </div>
              <span className="text-2xl font-black text-blue-900">
                {formatFCFA(netTotal)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 5: NOTES & CONDITIONS */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-3">
          5. Notes & Conditions de validité
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Notes de remerciement (facultatif)
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Merci pour votre confiance. Nous restons à votre écoute."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 text-sm outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Conditions de paiement & Validité
            </label>
            <textarea
              rows={3}
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
              placeholder="Ex: Devis valable 15 jours. Acompte de 50% à la commande..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 text-sm outline-none"
            />
          </div>
        </div>
      </div>

      {/* BOTTOM ACTION BAR */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <button
          type="button"
          onClick={onCancel}
          className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
        >
          Annuler et fermer
        </button>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={handlePreviewClick}
            className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <Eye className="w-4 h-4 text-blue-700" />
            <span>Aperçu A4</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadClick}
            className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-xs"
          >
            <Download className="w-4 h-4 text-amber-300" />
            <span>Télécharger PDF</span>
          </button>

          <button
            type="button"
            onClick={handleWhatsAppClick}
            className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-xs"
          >
            <Share2 className="w-4 h-4" />
            <span>Partager WhatsApp</span>
          </button>

          <button
            type="button"
            onClick={handleSaveOnly}
            disabled={isSaving}
            className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-xs"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Enregistrement...' : 'Enregistrer'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
