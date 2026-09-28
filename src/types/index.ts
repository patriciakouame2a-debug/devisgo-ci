export type UserPlan = 'free' | 'pro' | 'business';

export interface PlanFeatureConfig {
  name: string;
  description: string;
  createQuote: boolean;
  generatePdf: boolean;
  whatsapp: boolean;
  localHistory: boolean;
  importExport: boolean;
  // Future PRO / BUSINESS features
  cloudSync: boolean;
  advancedTemplates: boolean;
  unlimitedHistory: boolean;
  removeBranding: boolean;
  clientManagement: boolean;
  invoices: boolean;
  reminders: boolean;
  statistics: boolean;
  multiUser: boolean;
}

export const PLAN_CONFIGS: Record<UserPlan, PlanFeatureConfig> = {
  free: {
    name: 'DevisGo Gratuit',
    description: 'Toutes les fonctionnalités essentielles pour démarrer immédiatement sans frais.',
    createQuote: true,
    generatePdf: true,
    whatsapp: true,
    localHistory: true,
    importExport: true,
    cloudSync: false,
    advancedTemplates: false,
    unlimitedHistory: true, // V1 has no artificial limit
    removeBranding: false,
    clientManagement: false,
    invoices: false,
    reminders: false,
    statistics: false,
    multiUser: false,
  },
  pro: {
    name: 'DevisGo PRO',
    description: 'Pour les entrepreneurs en pleine croissance (Bientôt disponible).',
    createQuote: true,
    generatePdf: true,
    whatsapp: true,
    localHistory: true,
    importExport: true,
    cloudSync: true,
    advancedTemplates: true,
    unlimitedHistory: true,
    removeBranding: true,
    clientManagement: true,
    invoices: true,
    reminders: true,
    statistics: true,
    multiUser: false,
  },
  business: {
    name: 'DevisGo BUSINESS',
    description: 'Pour les équipes et agences établies (Bientôt disponible).',
    createQuote: true,
    generatePdf: true,
    whatsapp: true,
    localHistory: true,
    importExport: true,
    cloudSync: true,
    advancedTemplates: true,
    unlimitedHistory: true,
    removeBranding: true,
    clientManagement: true,
    invoices: true,
    reminders: true,
    statistics: true,
    multiUser: true,
  },
};

export interface BusinessProfile {
  name: string;
  ownerName: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  logo: string; // Data URL (Base64)
  currency: string; // Default: 'FCFA'
}

export interface QuoteItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';

export interface Quote {
  id: string;
  quoteNumber: string; // e.g. DV-2026-001
  date: string; // YYYY-MM-DD
  validUntil: string; // YYYY-MM-DD
  clientName: string;
  clientPhone?: string;
  clientWhatsapp?: string;
  clientEmail?: string;
  clientAddress?: string;
  items: QuoteItem[];
  subtotal: number;
  discountType: 'fixed' | 'percentage';
  discountValue: number;
  discountAmount: number;
  total: number;
  notes: string;
  terms: string;
  createdAt: string;
  updatedAt: string;
  status: QuoteStatus;
  planUsed?: UserPlan;
}

export interface AppSettings {
  defaultValidityDays: number;
  defaultTerms: string;
  defaultNotes: string;
  plan: UserPlan;
  currency: string;
  nextQuoteSeq: number;
}

export interface ExportData {
  version: number;
  app: string;
  exportDate: string;
  businessProfile: BusinessProfile | null;
  settings: AppSettings;
  quotes: Quote[];
}
