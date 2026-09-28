import React from 'react';
import { X, Sparkles, Check, Clock, ShieldCheck, HeartHandshake } from 'lucide-react';
import { UserPlan } from '../types';

interface PlanInfoModalProps {
  currentPlan: UserPlan;
  onClose: () => void;
  onTestPlanToggle?: (plan: UserPlan) => void;
}

export const PlanInfoModal: React.FC<PlanInfoModalProps> = ({
  currentPlan,
  onClose,
  onTestPlanToggle,
}) => {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">
                Modèle DevisGo CI
              </h3>
              <p className="text-xs text-slate-500">
                La transparence au service des entrepreneurs ivoiriens
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

        {/* Free Plan Info */}
        <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-700" />
              <h4 className="font-bold text-slate-900 text-sm">
                DevisGo Gratuit (Actif pour vous)
              </h4>
            </div>
            <span className="text-xs font-black text-emerald-800 bg-emerald-200/80 px-2.5 py-0.5 rounded-full">
              0 FCFA
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Vous bénéficiez de toutes les fonctionnalités indispensables pour votre activité sans limitation de durée :
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600 shrink-0 font-bold" /> Création illimitée de devis
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600 shrink-0 font-bold" /> Génération de PDF A4 professionnels
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600 shrink-0 font-bold" /> Partage WhatsApp prérempli
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600 shrink-0 font-bold" /> Calculs automatiques & remises
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600 shrink-0 font-bold" /> Stockage local sécurisé
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600 shrink-0 font-bold" /> Export et import JSON de vos données
            </span>
          </div>
        </div>

        {/* Future PRO Info */}
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-700" />
              <h4 className="font-bold text-slate-900 text-sm">
                Bientôt : DevisGo PRO & Équipes
              </h4>
            </div>
            <span className="text-xs font-semibold text-blue-900 bg-blue-100 px-2.5 py-0.5 rounded-full">
              En développement
            </span>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            Une version PRO sera proposée plus tard pour les entrepreneurs souhaitant aller plus loin :
          </p>

          <ul className="text-xs text-slate-500 space-y-1.5 list-disc list-inside">
            <li>Sauvegarde automatique et synchronisation Cloud entre votre téléphone et votre ordinateur</li>
            <li>Suppression du filigrane DevisGo CI sur le document PDF</li>
            <li>Gestion du répertoire clients et conversion des devis en factures</li>
            <li>Tableau de bord statistique avancé de vos devis acceptés</li>
          </ul>

          <div className="text-[11px] text-slate-400 bg-slate-100 p-2.5 rounded-xl text-center">
            Cette V1 ne demande aucune carte bancaire ni paiement Mobile Money. Profitez-en librement !
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer transition-colors"
          >
            Fermer et continuer
          </button>
        </div>
      </div>
    </div>
  );
};
