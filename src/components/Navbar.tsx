import React, { useState } from 'react';
import { 
  FileText, 
  PlusCircle, 
  Building2, 
  History, 
  Settings as SettingsIcon, 
  LayoutDashboard, 
  Sparkles,
  Menu,
  X
} from 'lucide-react';
import { UserPlan } from '../types';

interface NavbarProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  quoteCount: number;
  plan: UserPlan;
  onOpenPlanInfo: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onNavigate,
  quoteCount,
  plan,
  onOpenPlanInfo,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
    { id: 'new-quote', label: 'Nouveau devis', icon: PlusCircle, isPrimary: true },
    { id: 'history', label: 'Mes devis', icon: History, count: quoteCount },
    { id: 'business', label: 'Mon entreprise', icon: Building2 },
    { id: 'settings', label: 'Paramètres', icon: SettingsIcon },
  ];

  const handleNavClick = (tabId: string) => {
    onNavigate(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <button
              onClick={() => handleNavClick('landing')}
              className="flex items-center gap-2.5 text-left group focus:outline-none"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center text-white shadow-md shadow-blue-950/15 group-hover:scale-105 transition-transform">
                <FileText className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-xl tracking-tight text-slate-900">
                    DEVISGO
                  </span>
                  <span className="bg-amber-500 text-slate-950 text-xs font-black px-1.5 py-0.5 rounded shadow-xs">
                    CI
                  </span>
                </div>
                <span className="text-[10px] font-medium text-slate-500 block leading-none">
                  Devis faciles & professionnels
                </span>
              </div>
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;

                if (item.isPrimary) {
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-xs ${
                        isActive
                          ? 'bg-amber-600 text-white shadow-amber-600/20'
                          : 'bg-amber-500 hover:bg-amber-600 text-slate-950 hover:text-white'
                      }`}
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                }

                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-900 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-blue-700' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                    {typeof item.count === 'number' && item.count > 0 && (
                      <span className="ml-1 px-1.5 py-0.2 text-[11px] font-bold bg-slate-200 text-slate-700 rounded-full">
                        {item.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Right: Plan Badge & Mobile hamburger */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={onOpenPlanInfo}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-colors shadow-xs"
                title="Consulter les détails du modèle DevisGo CI"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden sm:inline">Modèle :</span>
                <span className="capitalize">{plan === 'free' ? 'Gratuit' : plan.toUpperCase()}</span>
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
                aria-label="Menu principal"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-1.5 shadow-lg">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-base font-medium ${
                    item.isPrimary
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : isActive
                      ? 'bg-blue-50 text-blue-900 font-semibold'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-slate-500" />
                    <span>{item.label}</span>
                  </div>
                  {typeof item.count === 'number' && item.count > 0 && (
                    <span className="px-2 py-0.5 text-xs font-bold bg-slate-200 text-slate-800 rounded-full">
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </header>

      {/* Mobile Sticky Bottom Bar for ultra-fast navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 flex items-center justify-around shadow-lg">
        <button
          onClick={() => handleNavClick('dashboard')}
          className={`flex flex-col items-center py-1 px-2 text-[11px] font-medium transition-colors ${
            currentTab === 'dashboard' ? 'text-blue-900 font-bold' : 'text-slate-500'
          }`}
        >
          <LayoutDashboard className="w-5 h-5 mb-0.5" />
          <span>Accueil</span>
        </button>

        <button
          onClick={() => handleNavClick('new-quote')}
          className="flex flex-col items-center -mt-4 bg-amber-500 text-slate-950 rounded-full p-2.5 shadow-md shadow-amber-500/30 hover:bg-amber-600 transition-colors"
          title="Nouveau devis"
        >
          <PlusCircle className="w-6 h-6" />
        </button>

        <button
          onClick={() => handleNavClick('history')}
          className={`flex flex-col items-center py-1 px-2 text-[11px] font-medium transition-colors ${
            currentTab === 'history' ? 'text-blue-900 font-bold' : 'text-slate-500'
          }`}
        >
          <History className="w-5 h-5 mb-0.5" />
          <span>Devis ({quoteCount})</span>
        </button>

        <button
          onClick={() => handleNavClick('business')}
          className={`flex flex-col items-center py-1 px-2 text-[11px] font-medium transition-colors ${
            currentTab === 'business' ? 'text-blue-900 font-bold' : 'text-slate-500'
          }`}
        >
          <Building2 className="w-5 h-5 mb-0.5" />
          <span>Entreprise</span>
        </button>
      </nav>
    </>
  );
};
