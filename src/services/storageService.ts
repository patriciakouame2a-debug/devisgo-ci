import { BusinessProfile, Quote, AppSettings, ExportData } from '../types';

const DB_NAME = 'DevisGoCI_DB';
const DB_VERSION = 1;
const STORE_QUOTES = 'quotes';
const STORE_METADATA = 'metadata';

const DEFAULT_SETTINGS: AppSettings = {
  defaultValidityDays: 15,
  defaultTerms: 'Ce devis est valable 15 jours à compter de sa date d’émission. Acompte de 50% à la commande, solde à la livraison.',
  defaultNotes: 'Merci pour votre confiance ! Nous restons à votre entière disposition pour tout renseignement complémentaire.',
  plan: 'free',
  currency: 'FCFA',
  nextQuoteSeq: 1,
};

class StorageService {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private getDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        reject(new Error('IndexedDB n’est pas supporté par ce navigateur.'));
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_QUOTES)) {
          const quotesStore = db.createObjectStore(STORE_QUOTES, { keyPath: 'id' });
          quotesStore.createIndex('quoteNumber', 'quoteNumber', { unique: true });
          quotesStore.createIndex('date', 'date', { unique: false });
          quotesStore.createIndex('createdAt', 'createdAt', { unique: false });
        }
        if (!db.objectStoreNames.contains(STORE_METADATA)) {
          db.createObjectStore(STORE_METADATA, { keyPath: 'key' });
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error || new Error('Erreur lors de l’ouverture d’IndexedDB'));
      };
    });

    return this.dbPromise;
  }

  // --- BUSINESS PROFILE ---

  async saveBusinessProfile(profile: BusinessProfile): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_METADATA], 'readwrite');
      const store = tx.objectStore(STORE_METADATA);
      const req = store.put({ key: 'business_profile', data: profile });
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async getBusinessProfile(): Promise<BusinessProfile | null> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_METADATA], 'readonly');
      const store = tx.objectStore(STORE_METADATA);
      const req = store.get('business_profile');
      req.onsuccess = () => {
        resolve(req.result ? (req.result.data as BusinessProfile) : null);
      };
      req.onerror = () => reject(req.error);
    });
  }

  // --- QUOTES ---

  async saveQuote(quote: Quote): Promise<void> {
    const db = await this.getDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction([STORE_QUOTES], 'readwrite');
      const store = tx.objectStore(STORE_QUOTES);
      const req = store.put(quote);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });

    // Automatically synchronize settings.nextQuoteSeq to never reuse numbers
    try {
      const currentYear = new Date().getFullYear();
      const prefix = `DV-${currentYear}-`;
      if (quote.quoteNumber && quote.quoteNumber.startsWith(prefix)) {
        const seqPart = parseInt(quote.quoteNumber.replace(prefix, ''), 10);
        if (!isNaN(seqPart)) {
          const settings = await this.getSettings();
          if ((settings.nextQuoteSeq || 1) <= seqPart) {
            settings.nextQuoteSeq = seqPart + 1;
            await this.saveSettings(settings);
          }
        }
      }
    } catch {
      // Non-blocking
    }
  }

  async updateQuote(quote: Quote): Promise<void> {
    return this.saveQuote({
      ...quote,
      updatedAt: new Date().toISOString(),
    });
  }

  async getQuote(id: string): Promise<Quote | null> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_QUOTES], 'readonly');
      const store = tx.objectStore(STORE_QUOTES);
      const req = store.get(id);
      req.onsuccess = () => {
        resolve(req.result ? (req.result as Quote) : null);
      };
      req.onerror = () => reject(req.error);
    });
  }

  async getQuotes(): Promise<Quote[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_QUOTES], 'readonly');
      const store = tx.objectStore(STORE_QUOTES);
      const req = store.getAll();
      req.onsuccess = () => {
        const quotes: Quote[] = req.result || [];
        // Sort newest first
        quotes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        resolve(quotes);
      };
      req.onerror = () => reject(req.error);
    });
  }

  async deleteQuote(id: string): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_QUOTES], 'readwrite');
      const store = tx.objectStore(STORE_QUOTES);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  // --- NUMBERING SERVICE (DV-YYYY-XXX) ---

  async peekNextQuoteNumber(): Promise<string> {
    const currentYear = new Date().getFullYear();
    const settings = await this.getSettings();
    const quotes = await this.getQuotes();

    let maxSeq = settings.nextQuoteSeq || 1;
    const yearPrefix = `DV-${currentYear}-`;

    quotes.forEach((q) => {
      if (q.quoteNumber && q.quoteNumber.startsWith(yearPrefix)) {
        const part = q.quoteNumber.replace(yearPrefix, '');
        const num = parseInt(part, 10);
        if (!isNaN(num) && num >= maxSeq) {
          maxSeq = num + 1;
        }
      }
    });

    const formattedSeq = String(maxSeq).padStart(3, '0');
    return `DV-${currentYear}-${formattedSeq}`;
  }

  // Kept for backward compatibility, behaves safely
  async getNextQuoteNumber(): Promise<string> {
    return this.peekNextQuoteNumber();
  }

  // --- SETTINGS ---

  async saveSettings(settings: AppSettings): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_METADATA], 'readwrite');
      const store = tx.objectStore(STORE_METADATA);
      const req = store.put({ key: 'settings', data: settings });
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async getSettings(): Promise<AppSettings> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_METADATA], 'readonly');
      const store = tx.objectStore(STORE_METADATA);
      const req = store.get('settings');
      req.onsuccess = () => {
        if (req.result && req.result.data) {
          resolve({ ...DEFAULT_SETTINGS, ...req.result.data });
        } else {
          resolve(DEFAULT_SETTINGS);
        }
      };
      req.onerror = () => reject(req.error);
    });
  }

  // --- EXPORT & IMPORT ---

  async exportData(): Promise<string> {
    const [businessProfile, settings, quotes] = await Promise.all([
      this.getBusinessProfile(),
      this.getSettings(),
      this.getQuotes(),
    ]);

    const data: ExportData = {
      version: 1,
      app: 'DevisGo CI',
      exportDate: new Date().toISOString(),
      businessProfile,
      settings,
      quotes,
    };

    return JSON.stringify(data, null, 2);
  }

  async importData(jsonData: string): Promise<{ success: boolean; count: number; error?: string }> {
    try {
      const parsed = JSON.parse(jsonData) as Partial<ExportData>;
      if (!parsed || typeof parsed !== 'object') {
        return { success: false, count: 0, error: 'Format de fichier JSON invalide.' };
      }

      if (parsed.businessProfile) {
        await this.saveBusinessProfile(parsed.businessProfile);
      }

      if (parsed.settings) {
        await this.saveSettings({ ...DEFAULT_SETTINGS, ...parsed.settings });
      }

      let count = 0;
      if (Array.isArray(parsed.quotes)) {
        for (const quote of parsed.quotes) {
          if (quote.id && quote.quoteNumber && quote.clientName) {
            await this.saveQuote(quote);
            count++;
          }
        }
      }

      return { success: true, count };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      return { success: false, count: 0, error: `Erreur d'importation : ${message}` };
    }
  }

  async deleteAllData(): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_QUOTES, STORE_METADATA], 'readwrite');
      const qStore = tx.objectStore(STORE_QUOTES);
      const mStore = tx.objectStore(STORE_METADATA);

      qStore.clear();
      mStore.clear();

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  // --- SAMPLE DEMO DATA (Yoro Créative) ---

  async loadDemoData(): Promise<Quote> {
    // 1. Business Profile
    const demoProfile: BusinessProfile = {
      name: 'Yoro Créative',
      ownerName: 'Yoro Koné',
      phone: '+225 07 08 09 10 11',
      whatsapp: '+225 07 08 09 10 11',
      email: 'contact@yorocreative.ci',
      address: 'Cocody Deux-Plateaux Vallon, Abidjan, Côte d’Ivoire',
      logo: '', // Clean SVG or embedded
      currency: 'FCFA',
    };
    await this.saveBusinessProfile(demoProfile);

    // 2. Demo Quote
    const today = new Date();
    const validUntilDate = new Date();
    validUntilDate.setDate(today.getDate() + 15);

    const pad = (n: number) => String(n).padStart(2, '0');
    const todayStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
    const validUntilStr = `${validUntilDate.getFullYear()}-${pad(validUntilDate.getMonth() + 1)}-${pad(validUntilDate.getDate())}`;

    const quoteNumber = `DV-${today.getFullYear()}-001`;

    const demoQuote: Quote = {
      id: 'demo-quote-yoro-001',
      quoteNumber,
      date: todayStr,
      validUntil: validUntilStr,
      clientName: 'Restaurant Exemple',
      clientPhone: '+225 05 12 34 56 78',
      clientWhatsapp: '+225 05 12 34 56 78',
      clientEmail: 'contact@restaurant-exemple.ci',
      clientAddress: 'Plateau Rue du Commerce, Abidjan',
      items: [
        {
          id: 'item-1',
          description: 'Création affiche publicitaire (Menu & Campagne Réseaux)',
          quantity: 1,
          unitPrice: 10000,
          total: 10000,
        },
        {
          id: 'item-2',
          description: 'Montage vidéo promotionnel (Format Réels & TikTok 45s)',
          quantity: 2,
          unitPrice: 15000,
          total: 30000,
        },
      ],
      subtotal: 40000,
      discountType: 'fixed',
      discountValue: 0,
      discountAmount: 0,
      total: 40000,
      notes: 'Merci pour votre confiance. Prêt pour booster votre visibilité sur Abidjan !',
      terms: 'Le présent devis est valable 15 jours. Acompte de 50% au lancement, 50% à la livraison finale des fichiers.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'sent',
      planUsed: 'free',
    };

    await this.saveQuote(demoQuote);

    // Update settings sequence to 2
    const settings = await this.getSettings();
    settings.nextQuoteSeq = Math.max(settings.nextQuoteSeq, 2);
    await this.saveSettings(settings);

    return demoQuote;
  }
}

export const storageService = new StorageService();
