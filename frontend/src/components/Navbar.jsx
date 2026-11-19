import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Activity,
  ClipboardCheck,
  FileText,
  Calendar,
  Droplets,
  BookOpen,
  User,
  LayoutDashboard,
  Users,
  ShieldCheck,
  BarChart3,
  History,
  Settings,
  Menu,
  X,
  LogOut,
  LogIn,
  UserPlus,
  Stethoscope,
  Globe,
  Bell,
  Building2,
} from 'lucide-react';
import { getDashboardPath } from '../utils/roles';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const ROLE_NAV_CONFIG = {
  patient: [
    { to: '/dashboard', key: 'navOverview', icon: LayoutDashboard, exact: true },
    { to: '/assessment', key: 'navAssessment', icon: Stethoscope, matchPrefix: ['/assessment', '/predict', '/bangladesh'] },
    { to: '/dashboard?section=records', key: 'navRecords', icon: FileText },
    { to: '/dashboard?section=appointments', key: 'navAppointments', icon: Calendar },
    { to: '/blood', key: 'navBlood', icon: Droplets },
    { to: '/hospitals', key: 'navHospitals', icon: Building2 },
    { to: '/doctors', key: 'navDoctors', icon: Users },
    { to: '/knowledge', key: 'navKnowledge', icon: BookOpen, matchPrefix: ['/knowledge', '/awareness', '/notices', '/evaluation', '/explain', '/fairness'] },
    { to: '/dashboard?section=profile', key: 'navProfile', icon: User },
  ],
  doctor: [
    { to: '/doctor/dashboard', key: 'navDoctorDash', icon: LayoutDashboard, exact: true },
    { to: '/doctor/dashboard?tab=reviews', key: 'navDoctorReviews', icon: ClipboardCheck },
    { to: '/doctor/dashboard?tab=appointments', key: 'navDoctorAppts', icon: Calendar },
    { to: '/doctor/dashboard?tab=cases', key: 'navDoctorHistory', icon: History },
    { to: '/doctor/dashboard?tab=articles', key: 'navDoctorNotes', icon: FileText },
    { to: '/doctor/dashboard?tab=profile', key: 'navDoctorProfile', icon: User },
    { to: '/hospitals', key: 'navHospitals', icon: Building2 },
    { to: '/knowledge', key: 'navKnowledge', icon: BookOpen },
  ],
  admin: [
    { to: '/admin/dashboard?tab=overview', key: 'navAdminOverview', icon: LayoutDashboard, defaultForPath: '/admin/dashboard' },
    { to: '/admin/dashboard?tab=patients', key: 'navAdminUsers', icon: Users },
    { to: '/admin/dashboard?tab=doctors', key: 'navAdminDoctors', icon: ShieldCheck },
    { to: '/blood', key: 'navBlood', icon: Droplets },
    { to: '/evaluation', key: 'navAdminModels', icon: BarChart3 },
    { to: '/knowledge', key: 'navKnowledge', icon: BookOpen },
    { to: '/hospitals', key: 'navHospitals', icon: Building2 },
    { to: '/admin/dashboard?tab=audits', key: 'navAdminAudits', icon: History },
    { to: '/admin/dashboard?tab=security', key: 'navAdminSecurity', icon: Settings },
    { to: '/admin/dashboard?tab=notices', key: 'navAdminSettings', icon: Settings },
  ],
  guest: [
    { to: '/assessment', key: 'assessment', icon: Stethoscope, matchPrefix: ['/assessment', '/predict'] },
    { to: '/bangladesh', key: 'bangladesh', icon: Globe },
    { to: '/blood', key: 'blood', icon: Droplets },
    { to: '/notices', key: 'notice', icon: Bell },
    { to: '/evaluation', key: 'evaluation', icon: BarChart3 },
    { to: '/awareness', key: 'awareness', icon: BookOpen },
    { to: '/knowledge', key: 'navKnowledge', icon: FileText },
    { to: '/hospitals', key: 'navHospitals', icon: Building2 },
    { to: '/presentation', key: 'navBriefing', icon: ClipboardCheck, matchPrefix: ['/presentation', '/architecture', '/security', '/data', '/governance', '/audit', '/pitchdeck', '/app', '/demo-user', '/demo-doctor', '/demo-admin'] },
  ],
};

const SECONDARY_PATIENT_LINKS = [
  { to: '/bangladesh', key: 'bangladesh' },
  { to: '/notices', key: 'notice' },
  { to: '/evaluation', key: 'evaluation' },
];

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user, token } = useAuth();
  const { lang, setLang, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const signedIn = Boolean(token || localStorage.getItem('token'));
  const rawRole = String(user?.role || localStorage.getItem('userRole') || '').toLowerCase();
  const activeRole = signedIn && ['patient', 'doctor', 'admin'].includes(rawRole) ? rawRole : 'guest';
  const homePath = signedIn ? getDashboardPath(rawRole) : '/';

  const navItems = ROLE_NAV_CONFIG[activeRole] || ROLE_NAV_CONFIG.guest;

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [mobileMenuOpen]);

  const handleLogout = () => {
    setMobileMenuOpen(false);
    logout();
    navigate('/login');
  };

  const isItemActive = (item) => {
    const currentFull = `${location.pathname}${location.search}`;
    if (item.to.includes('?')) {
      if (currentFull === item.to) return true;
      if (item.defaultForPath && location.pathname === item.defaultForPath && !location.search) {
        return true;
      }
      return false;
    }
    if (item.exact) {
      return location.pathname === item.to && !location.search;
    }
    if (item.matchPrefix) {
      return item.matchPrefix.some((prefix) => location.pathname === prefix || location.pathname.startsWith(`${prefix}/`));
    }
    return location.pathname === item.to;
  };

  const roleBadgeConfig =
    activeRole === 'doctor'
      ? { label: t('roleDoctor'), classes: 'bg-[#F0FDFA] text-[#0F766E] border-[#99F6E4]' }
      : activeRole === 'admin'
      ? { label: t('roleAdmin'), classes: 'bg-slate-100 text-[#12304A] border-[#E2E8F0]' }
      : activeRole === 'patient'
      ? { label: t('rolePatient'), classes: 'bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0]' }
      : null;

  const mobileBottomItems = navItems.slice(0, 5);

  return (
    <>
      {/* Accessible Skip Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:px-4 focus:py-2.5 focus:bg-[#12304A] focus:text-white focus:rounded-xl focus:text-xs focus:font-bold focus:shadow-lg"
      >
        {t('skipToContent')}
      </a>

      <header className="sticky top-0 z-40 bg-white border-b border-[#E2E8F0] shadow-clinical-xs">
        {/* Top Utility & Brand Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          {/* Brand Identity */}
          <Link
            to={homePath}
            className="flex items-center gap-3 shrink-0 rounded-xl p-1 -ml-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488]"
          >
            <div
              className="w-10 h-10 bg-[#12304A] rounded-xl flex items-center justify-center text-white shadow-clinical-xs shrink-0"
              aria-hidden="true"
            >
              <Activity className="w-5 h-5 text-[#2DD4BF]" />
            </div>
            <div className="min-w-0">
              <div className="text-base sm:text-lg font-extrabold text-[#12304A] leading-tight tracking-tight">
                VitaGuard AI
              </div>
              <div className="text-[11px] text-[#0D9488] font-semibold tracking-wide truncate max-w-[180px] sm:max-w-none">
                {t('brandSub')}
              </div>
            </div>
          </Link>

          {/* Right Controls: Role Badge, Language Switcher, Auth Action, Mobile Menu Trigger */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {signedIn && roleBadgeConfig && (
              <span
                className={`hidden md:inline-flex items-center px-3 py-1 rounded-full border text-xs font-bold ${roleBadgeConfig.classes}`}
              >
                {roleBadgeConfig.label}
              </span>
            )}

            {/* Bilingual Language Toggle */}
            <div
              role="group"
              aria-label="Language selection"
              className="inline-flex items-center text-xs border border-[#E2E8F0] rounded-xl bg-[#F6F9FC] p-1"
            >
              <button
                type="button"
                onClick={() => setLang('bn')}
                aria-pressed={lang === 'bn'}
                className={`min-h-[34px] px-2.5 sm:px-3 py-1 rounded-lg font-bengali transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488] ${
                  lang === 'bn'
                    ? 'bg-[#12304A] text-white font-bold shadow-clinical-xs'
                    : 'text-[#64748B] hover:text-[#12304A]'
                }`}
              >
                বাংলা
              </button>
              <button
                type="button"
                onClick={() => setLang('en')}
                aria-pressed={lang === 'en'}
                className={`min-h-[34px] px-2.5 sm:px-3 py-1 rounded-lg transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488] ${
                  lang === 'en'
                    ? 'bg-[#12304A] text-white font-bold shadow-clinical-xs'
                    : 'text-[#64748B] hover:text-[#12304A]'
                }`}
              >
                EN
              </button>
            </div>

            {/* Desktop Auth Action */}
            <div className="hidden sm:flex items-center gap-2">
              {signedIn ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1.5 min-h-[40px] px-3.5 py-2 bg-[#FEE2E2] hover:bg-red-100 text-[#B91C1C] text-xs font-bold rounded-xl border border-[#FECACA] transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#DC2626]"
                >
                  <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{t('signOut')}</span>
                </button>
              ) : location.pathname === '/login' ? (
                <Link
                  to="/register"
                  className="inline-flex items-center gap-1.5 min-h-[40px] px-4 py-2 bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-bold rounded-xl shadow-clinical-xs transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488]"
                >
                  <UserPlus className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{t('createAccount')}</span>
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 min-h-[40px] px-4 py-2 bg-[#12304A] hover:bg-[#1E4668] text-white text-xs font-bold rounded-xl shadow-clinical-xs transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488]"
                >
                  <LogIn className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{t('signIn')}</span>
                </Link>
              )}
            </div>

            {/* Mobile Hamburger Button (< 1024px) */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-expanded={mobileMenuOpen}
              aria-controls="vitaguard-mobile-drawer"
              aria-label={mobileMenuOpen ? t('closeMenu') : t('openMenu')}
              className="lg:hidden inline-flex items-center justify-center min-w-[44px] min-h-[44px] rounded-xl border border-[#E2E8F0] bg-[#F6F9FC] text-[#12304A] hover:bg-slate-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488]"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" aria-hidden="true" />
              ) : (
                <Menu className="w-5 h-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Desktop Primary Role Navigation Bar (>= 1024px) */}
        <div className="hidden lg:block bg-[#F6F9FC] border-t border-[#E2E8F0]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 py-2">
            <nav aria-label="Primary Navigation" className="flex items-center gap-1.5 flex-wrap">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isItemActive(item);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    aria-current={active ? 'page' : undefined}
                    className={`inline-flex items-center gap-2 min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488] ${
                      active
                        ? 'bg-[#12304A] text-white shadow-clinical-xs'
                        : 'text-[#12304A] hover:bg-white hover:text-[#0D9488]'
                    }`}
                  >
                    {Icon && (
                      <Icon
                        className={`w-4 h-4 shrink-0 ${
                          active ? 'text-[#2DD4BF]' : 'text-[#64748B]'
                        }`}
                        aria-hidden="true"
                      />
                    )}
                    <span>{t(item.key)}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Quick Secondary Links for Signed-In Patients */}
            {activeRole === 'patient' && (
              <div className="flex items-center gap-1 border-l border-[#E2E8F0] pl-3">
                {SECONDARY_PATIENT_LINKS.map((sub) => {
                  const subActive = location.pathname === sub.to;
                  return (
                    <Link
                      key={sub.to}
                      to={sub.to}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        subActive
                          ? 'bg-[#F0FDFA] text-[#0F766E] font-bold border border-[#99F6E4]'
                          : 'text-[#64748B] hover:text-[#12304A] hover:bg-white'
                      }`}
                    >
                      {t(sub.key)}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Mobile & Tablet Slide-Down Drawer (< 1024px) */}
        {mobileMenuOpen && (
          <div
            id="vitaguard-mobile-drawer"
            className="lg:hidden bg-white border-t border-[#E2E8F0] shadow-clinical-lg px-4 pt-3 pb-5 space-y-4"
          >
            {signedIn && roleBadgeConfig && (
              <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-[#F6F9FC] border border-[#E2E8F0]">
                <div className="text-xs font-semibold text-[#12304A] truncate">
                  {user?.full_name || user?.name || user?.username || 'VitaGuard User'}
                </div>
                <span
                  className={`px-2.5 py-0.5 rounded-full border text-[11px] font-bold ${roleBadgeConfig.classes}`}
                >
                  {roleBadgeConfig.label}
                </span>
              </div>
            )}

            <nav aria-label="Mobile Navigation" className="grid grid-cols-1 gap-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isItemActive(item);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    aria-current={active ? 'page' : undefined}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 min-h-[48px] px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                      active
                        ? 'bg-[#12304A] text-white'
                        : 'text-[#12304A] bg-[#F6F9FC] hover:bg-slate-100'
                    }`}
                  >
                    {Icon && (
                      <Icon
                        className={`w-4 h-4 shrink-0 ${
                          active ? 'text-[#2DD4BF]' : 'text-[#0D9488]'
                        }`}
                        aria-hidden="true"
                      />
                    )}
                    <span>{t(item.key)}</span>
                  </Link>
                );
              })}

              {activeRole === 'patient' && (
                <div className="pt-2 mt-1 border-t border-[#E2E8F0] grid grid-cols-3 gap-1.5">
                  {SECONDARY_PATIENT_LINKS.map((sub) => (
                    <Link
                      key={sub.to}
                      to={sub.to}
                      onClick={() => setMobileMenuOpen(false)}
                      className="min-h-[44px] px-2.5 py-2 rounded-xl bg-[#F6F9FC] border border-[#E2E8F0] text-center text-xs font-semibold text-[#12304A] flex items-center justify-center"
                    >
                      {t(sub.key)}
                    </Link>
                  ))}
                </div>
              )}
            </nav>

            <div className="pt-2 border-t border-[#E2E8F0] flex flex-col gap-2">
              {signedIn ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full min-h-[48px] px-4 py-2.5 bg-[#FEE2E2] text-[#B91C1C] text-sm font-bold rounded-xl border border-[#FECACA] flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" aria-hidden="true" />
                  <span>{t('signOut')}</span>
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="min-h-[48px] px-4 py-2.5 bg-[#12304A] text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2"
                  >
                    <LogIn className="w-4 h-4" aria-hidden="true" />
                    <span>{t('signIn')}</span>
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="min-h-[48px] px-4 py-2.5 bg-[#0D9488] text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2"
                  >
                    <UserPlus className="w-4 h-4" aria-hidden="true" />
                    <span>{t('createAccount')}</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Mobile Bottom Navigation Bar (< 768px) */}
      <nav
        aria-label="Mobile Quick Navigation"
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-[#E2E8F0] shadow-clinical-md px-1 py-1 grid grid-cols-5 gap-0.5"
      >
        {mobileBottomItems.map((item) => {
          const Icon = item.icon;
          const active = isItemActive(item);
          return (
            <Link
              key={item.to}
              to={item.to}
              aria-current={active ? 'page' : undefined}
              className={`min-h-[52px] px-1 py-1.5 rounded-xl flex flex-col items-center justify-center gap-1 text-[10px] font-semibold leading-tight text-center transition-colors ${
                active
                  ? 'text-[#0D9488] bg-[#F0FDFA] font-bold'
                  : 'text-[#64748B] hover:text-[#12304A]'
              }`}
            >
              {Icon && (
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    active ? 'text-[#0D9488]' : 'text-[#64748B]'
                  }`}
                  aria-hidden="true"
                />
              )}
              <span className="truncate w-full px-0.5">{t(item.key)}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}

export default Navbar;
