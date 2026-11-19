import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getDashboardPath } from '../utils/roles';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const LINKS = [
  { to: '/assessment', key: 'assessment' },
  { to: '/blood', key: 'blood' },
  { to: '/notices', key: 'notice' },
  { to: '/evaluation', key: 'evaluation' },
  { to: '/awareness', key: 'awareness' },
  { to: '/bangladesh', key: 'bangladesh' },
];

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user, token } = useAuth();
  const { lang, setLang, t } = useLanguage();
  const signedIn = Boolean(token || localStorage.getItem('token'));
  const role = String(user?.role || localStorage.getItem('userRole') || '').toLowerCase();
  const homePath = signedIn ? getDashboardPath(role) : '/assessment';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    if (path === '/assessment') {
      return location.pathname === '/assessment' || location.pathname.startsWith('/predict');
    }
    if (path === homePath) return location.pathname === homePath;
    return location.pathname === path;
  };

  const roleStyle = role === 'doctor'
    ? 'bg-indigo-50 text-indigo-700 border-indigo-100'
    : role === 'admin'
      ? 'bg-slate-100 text-slate-700 border-slate-200'
      : 'bg-blue-50 text-blue-700 border-blue-100';
  const roleLabel = role === 'doctor' ? t('roleDoctor') : role === 'admin' ? t('roleAdmin') : role === 'patient' ? t('rolePatient') : '';

  const itemClass = (active) => (
    active
      ? 'bg-blue-600 text-white shadow-sm'
      : 'text-slate-700 hover:bg-white hover:text-blue-700'
  );

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        <Link to={homePath} className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white text-base font-bold">
            ❤️
          </div>
          <div>
            <div className="text-base font-extrabold text-slate-900 leading-none">VitaGuard AI</div>
            <div className="text-[10px] text-blue-600 font-semibold tracking-wide">PredictRx</div>
          </div>
        </Link>
        <div className="flex items-center gap-2 shrink-0">
          {signedIn && roleLabel && (
            <span className={`hidden sm:inline-flex px-2.5 py-1 rounded-full border text-[11px] font-bold ${roleStyle}`}>
              {roleLabel}
            </span>
          )}
          <div className="flex items-center text-xs border border-slate-200 rounded-full bg-slate-50 p-0.5">
            <button type="button" onClick={() => setLang('bn')} className={`px-2 py-1 rounded-full ${lang === 'bn' ? 'bg-white text-blue-700 font-bold shadow-sm' : 'text-slate-500'}`}>বাংলা</button>
            <button type="button" onClick={() => setLang('en')} className={`px-2 py-1 rounded-full ${lang === 'en' ? 'bg-white text-blue-700 font-bold shadow-sm' : 'text-slate-500'}`}>English</button>
          </div>
          {signedIn ? (
            <button onClick={handleLogout} className="px-3.5 py-1.5 bg-rose-50 text-rose-600 text-xs font-semibold rounded-lg border border-rose-200">
              {t('signOut')}
            </button>
          ) : location.pathname === '/login' ? (
            <Link to="/register" className="px-3.5 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg">
              {t('createAccount')}
            </Link>
          ) : (
            <Link to="/login" className="px-3.5 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg">
              {t('signIn')}
            </Link>
          )}
        </div>
      </div>
      <div className="bg-slate-50 border-t border-slate-200">
        <nav className="max-w-6xl mx-auto px-3 py-2 flex items-center gap-1 overflow-x-auto">
          {LINKS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${itemClass(isActive(item.to))}`}
            >
              {t(item.key)}
            </Link>
          ))}
          {signedIn && (
            <Link
              to={homePath}
              className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${itemClass(isActive(homePath))}`}
            >
              {t('dashboard')}
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
