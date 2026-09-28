import React from 'react';
import { 
  Zap, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Share2, 
  FileDown, 
  Building2, 
  Clock, 
  Smartphone,
  Eye,
  Check
} from 'lucide-react';

interface LandingPageProps {
  onStartNewQuote: () => void;
  onLoadDemo: () => void;
  onGoToDashboard: () => void;
  hasQuotes: boolean;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartNewQuote,
  onLoadDemo,
  onGoToDashboard,
  hasQuotes,
}) => {
  return (
    <div className="space-y-16 pb-20">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-8 sm:pt-14 pb-12 rounded-3xl bg-gradient-to-b from-blue-950 via-blue-900 to-slate-900 text-white shadow-xl px-4 sm:px-10">
        {/* Subtle decorative circles */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

        <div className="max-w-3xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-amber-300 text-xs sm:text-sm font-medium">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            L’outil n°1 pensé pour les entrepreneurs & indépendants de Côte d’Ivoire
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight text-white">
            Créez vos devis professionnels en moins d’une minute.
          </h1>

          <p className="text-base sm:text-xl text-blue-100/90 max-w-2xl mx-auto font-normal leading-relaxed">
            Créez, téléchargez et partagez facilement vos devis avec vos clients en FCFA. 
            Prêt à envoyer sur WhatsApp sans inscription ni carte bancaire.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <button
              onClick={onStartNewQuote}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-base shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>Créer un devis</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={onLoadDemo}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-base border border-white/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Eye className="w-5 h-5 text-amber-300" />
              <span>Voir un exemple (40 000 FCFA)</span>
            </button>

            {hasQuotes && (
              <button
                onClick={onGoToDashboard}
                className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-blue-800/80 hover:bg-blue-700 text-white font-medium text-sm transition-all"
              >
                Mon tableau de bord
              </button>
            )}
          </div>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm text-blue-200/80">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 100% Gratuit pour commencer
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Sans carte bancaire
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Monnaie FCFA par défaut
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Sauvegarde locale sécurisée
            </span>
          </div>
        </div>
      </section>

      {/* POURQUOI DEVISGO CI */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Pourquoi DevisGo CI ?
          </h2>
          <p className="mt-2 text-slate-600">
            Un outil pensé pour les réalités du terrain : rapide, sans jargon technique et adapté à votre activité.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-blue-200 transition-all">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-900 flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-amber-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Rapide</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Créez un devis complet en quelques secondes. Vos calculs et totaux se font automatiquement.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-blue-200 transition-all">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-900 flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6 text-blue-700" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Professionnel</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Présentez une image sérieuse et rassurante à vos clients avec un document PDF A4 soigné.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-blue-200 transition-all">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-900 flex items-center justify-center mb-4">
              <Smartphone className="w-6 h-6 text-amber-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Simple</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Aucune formation nécessaire. Tout est intuitif et pensé pour être utilisé directement depuis votre smartphone.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-blue-200 transition-all">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-900 flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-emerald-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Gratuit pour commencer</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Commencez immédiatement sans payer, sans créer de mot de passe et sans carte bancaire.
            </p>
          </div>
        </div>
      </section>

      {/* 4 ÉTAPES ULTRA SIMPLES */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="bg-slate-100/80 rounded-3xl p-6 sm:p-10 border border-slate-200">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
              Comment ça marche ?
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              4 étapes pour votre devis
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs relative">
              <div className="w-8 h-8 rounded-lg bg-blue-900 text-white font-bold text-sm flex items-center justify-center mb-3">
                1
              </div>
              <h4 className="font-bold text-slate-900 mb-1">Renseignez votre activité</h4>
              <p className="text-xs text-slate-600">
                Ajoutez votre nom commercial, téléphone, adresse et votre logo d’entreprise.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs relative">
              <div className="w-8 h-8 rounded-lg bg-blue-900 text-white font-bold text-sm flex items-center justify-center mb-3">
                2
              </div>
              <h4 className="font-bold text-slate-900 mb-1">Ajoutez votre client</h4>
              <p className="text-xs text-slate-600">
                Indiquez le nom ou l’enseigne du client ainsi que ses coordonnées de contact.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs relative">
              <div className="w-8 h-8 rounded-lg bg-blue-900 text-white font-bold text-sm flex items-center justify-center mb-3">
                3
              </div>
              <h4 className="font-bold text-slate-900 mb-1">Ajoutez vos prestations</h4>
              <p className="text-xs text-slate-600">
                Indiquez les services, quantités et prix en FCFA avec calcul automatique instantané.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs relative">
              <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 font-bold text-sm flex items-center justify-center mb-3">
                4
              </div>
              <h4 className="font-bold text-slate-900 mb-1">Générez votre devis</h4>
              <p className="text-xs text-slate-600">
                Obtenez immédiatement un document PDF professionnel prêt à partager sur WhatsApp.
              </p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={onStartNewQuote}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-sm shadow-md transition-colors cursor-pointer"
            >
              <span>Créer mon premier devis</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* POSITIONNEMENT FREEMIUM (TRANSPARENT & HONNÊTE) */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="text-center max-w-xl mx-auto mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
            Offre transparente
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Commencez gratuitement
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Aucun paiement caché, aucune carte bancaire requise. Utilisez DevisGo CI librement.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* FREE PLAN CARD */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border-2 border-emerald-500/40 shadow-sm relative">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                  Actif maintenant
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-2">DevisGo Gratuit</h3>
              </div>
              <span className="text-2xl font-black text-slate-900">0 FCFA</span>
            </div>

            <p className="text-sm text-slate-600 mb-6">
              Idéal pour créer et envoyer vos devis au quotidien sans complication.
            </p>

            <ul className="space-y-3 text-sm text-slate-700 mb-8">
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 font-bold" />
                <span>Création de devis illimitée</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 font-bold" />
                <span>Génération de PDF professionnels A4</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 font-bold" />
                <span>Partage WhatsApp prérempli</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 font-bold" />
                <span>Calcul automatique & réductions en FCFA</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 font-bold" />
                <span>Historique local sécurisé (sur votre appareil)</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 font-bold" />
                <span>Export & import de vos données en 1 clic</span>
              </li>
            </ul>

            <button
              onClick={onStartNewQuote}
              className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-sm transition-colors text-center"
            >
              Utiliser gratuitement
            </button>
          </div>

          {/* FUTURE PRO PREVIEW */}
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-50 border border-slate-200 relative">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-900">
                  Bientôt disponible
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-2">DevisGo PRO</h3>
              </div>
              <span className="text-xs font-semibold text-slate-500 bg-slate-200 px-2.5 py-1 rounded-md">
                En préparation
              </span>
            </div>

            <p className="text-sm text-slate-500 mb-6">
              Des fonctionnalités avancées pour booster la gestion de votre activité.
            </p>

            <ul className="space-y-3 text-sm text-slate-500 mb-8">
              <li className="flex items-center gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                <span>Sauvegarde et synchronisation Cloud</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                <span>Plusieurs modèles de devis premium</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                <span>Suppression de la mention DevisGo CI sur le PDF</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                <span>Gestion avancée du répertoire clients</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                <span>Transformation d’un devis en facture</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                <span>Statistiques de vente & suivi des paiements</span>
              </li>
            </ul>

            <div className="p-3 rounded-xl bg-slate-200/70 text-slate-600 text-xs text-center font-medium">
              Aucun paiement requis pour la V1. Tout est 100% fonctionnel gratuitement.
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
