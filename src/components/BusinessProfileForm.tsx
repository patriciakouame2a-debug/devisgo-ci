import React, { useState, useRef, useEffect } from 'react';
import { Building2, Upload, Trash2, CheckCircle2, Image as ImageIcon, ArrowLeft } from 'lucide-react';
import { BusinessProfile } from '../types';

interface BusinessProfileFormProps {
  initialProfile: BusinessProfile | null;
  onSave: (profile: BusinessProfile) => Promise<void>;
  onBack?: () => void;
}

export const BusinessProfileForm: React.FC<BusinessProfileFormProps> = ({
  initialProfile,
  onSave,
  onBack,
}) => {
  const [profile, setProfile] = useState<BusinessProfile>({
    name: '',
    ownerName: '',
    phone: '',
    whatsapp: '',
    email: '',
    address: '',
    logo: '',
    currency: 'FCFA',
  });

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialProfile) {
      setProfile(initialProfile);
    }
  }, [initialProfile]);

  const handleInputChange = (field: keyof BusinessProfile, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
    setSavedSuccess(false);
  };

  // Image Upload with Client-Side Resize/Compression to keep IndexedDB lean
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert('Veuillez sélectionner une image au format PNG, JPG, JPEG ou WEBP.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Resize canvas to max 400x400 maintaining ratio
        const maxDim = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL(file.type === 'image/png' ? 'image/png' : 'image/jpeg', 0.85);
          setProfile((prev) => ({ ...prev, logo: compressedDataUrl }));
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setProfile((prev) => ({ ...prev, logo: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile.name.trim()) {
      alert('Veuillez renseigner le nom de votre entreprise.');
      return;
    }

    setSaving(true);
    try {
      await onSave(profile);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch {
      alert("Impossible d'enregistrer les données de l'entreprise.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
              title="Retour"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Mon entreprise
            </h1>
            <p className="text-sm text-slate-500">
              Ces informations apparaîtront automatiquement sur tous vos devis générés.
            </p>
          </div>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>Informations de l'entreprise enregistrées avec succès !</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
        {/* LOGO SECTION */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            Logo de l’entreprise
          </label>
          <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-slate-50 border border-dashed border-slate-300">
            {profile.logo ? (
              <div className="relative group">
                <div className="w-24 h-24 rounded-2xl bg-white border border-slate-200 p-2 flex items-center justify-center overflow-hidden shadow-xs">
                  <img
                    src={profile.logo}
                    alt="Logo entreprise"
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleRemoveLogo}
                  className="absolute -top-2 -right-2 p-1.5 rounded-full bg-rose-600 text-white shadow-md hover:bg-rose-700 transition-colors"
                  title="Supprimer le logo"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-slate-200 text-slate-400 flex flex-col items-center justify-center">
                <ImageIcon className="w-8 h-8" />
                <span className="text-[10px] font-semibold mt-1">Aucun logo</span>
              </div>
            )}

            <div className="space-y-2 text-center sm:text-left">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/jpg, image/webp"
                onChange={handleLogoUpload}
                className="hidden"
                id="logo-upload"
              />
              <label
                htmlFor="logo-upload"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-xs cursor-pointer transition-colors"
              >
                <Upload className="w-4 h-4 text-slate-500" />
                <span>{profile.logo ? 'Remplacer le logo' : 'Ajouter un logo'}</span>
              </label>
              <p className="text-[11px] text-slate-500">
                Formats acceptés : PNG, JPG, JPEG, WEBP. Redimensionné automatiquement.
              </p>
            </div>
          </div>
        </div>

        {/* BASIC INFO */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Nom de l’entreprise / Raison sociale <span className="text-amber-600">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Ex : Yoro Créative, Menuiserie Moderne, etc."
              value={profile.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none text-sm transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Nom du responsable / Fondateur
            </label>
            <input
              type="text"
              placeholder="Ex : Yoro Koné"
              value={profile.ownerName}
              onChange={(e) => handleInputChange('ownerName', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none text-sm transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Téléphone d'appel
            </label>
            <input
              type="tel"
              placeholder="Ex : +225 07 08 09 10 11"
              value={profile.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none text-sm transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Numéro WhatsApp
            </label>
            <input
              type="tel"
              placeholder="Ex : +225 07 08 09 10 11"
              value={profile.whatsapp}
              onChange={(e) => handleInputChange('whatsapp', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none text-sm transition-all"
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Email professionnel
            </label>
            <input
              type="email"
              placeholder="Ex : contact@monentreprise.ci"
              value={profile.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none text-sm transition-all"
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Adresse géographique & Ville
            </label>
            <textarea
              rows={2}
              placeholder="Ex : Cocody Deux-Plateaux Vallon, Abidjan, Côte d’Ivoire"
              value={profile.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none text-sm transition-all"
            />
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
          <button
            type="submit"
            disabled={saving}
            className="px-7 py-3 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-sm shadow-md transition-colors cursor-pointer disabled:opacity-50"
          >
            {saving ? 'Enregistrement...' : 'Enregistrer mon entreprise'}
          </button>
        </div>
      </form>
    </div>
  );
};
