import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import API from '../services/api';
import HeartGraphic from '../components/HeartGraphic';
import GoogleAuthButton from '../components/GoogleAuthButton';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authenticatorCode, setAuthenticatorCode] = useState('');
  
  // Role State: 'patient' | 'doctor' | 'admin'
  const [role, setRole] = useState('patient'); 
  const { lang, setLang } = useLanguage();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.sessionExpired) {
      setError(
        lang === 'bn'
          ? 'আপনার সেশনের মেয়াদ শেষ হয়েছে। অনুগ্রহ করে আবার লগ ইন করুন।'
          : 'Your session has expired. Please log in again.'
      );
    } else if (location.state?.message) {
      setError(location.state.message);
    }
  }, [location.state, lang]);

  const t = {
    en: {
      appName: 'VitaGuard AI',
      subTitle: 'TriNexus',
      assessment: 'Assessment',
      awareness: 'Awareness Hub',
      dashboard: 'Dashboard',
      loginBtn: 'Log in',
      adminTitle: 'Administrator sign in',
      adminDesc: 'Use your individual administrator account and authenticator code.',
      patientHeaderTitle: 'A little care today. A better tomorrow.',
      patientHeaderDesc: 'Your assessments, useful knowledge, and a personal dashboard — all together in a secure health space.',
      patientCardTitle: 'Good to see you again.',
      patientCardDesc: 'Log in to your personal VitaGuard space.',
      doctorHeaderTitle: 'Empowering Clinical Decisions.',
      doctorHeaderDesc: 'Access patient risk assessments, explainable AI insights, and your clinical dashboard securely.',
      doctorCardTitle: 'Welcome, Doctor.',
      doctorCardDesc: 'Log in to your clinical workspace.',
      username: 'Email or username',
      password: 'Password',
      authCode: 'Authenticator code',
      authCodeDesc: 'Enter the current 6-digit code from your authenticator app.',
      signInSec: 'Sign in securely',
      logInAction: 'Log in →',
      switchToUser: 'Patient / Doctor sign in',
      switchToAdmin: 'Administrator log in',
      createAccount: 'Create an account',
      footerCopy: '© 2026 TriNexus · VitaGuard AI. A little awareness. A better tomorrow.',
      understandLink: 'Understand saved assessments',
      rolePatient: 'Patient',
      roleDoctor: 'Doctor'
    },
    bn: {
      appName: 'ভিটাগার্ড এআই',
      subTitle: 'ট্রাইনেক্সাস',
      assessment: 'স্বাস্থ্য মূল্যায়ন',
      awareness: 'সচেতনতা কেন্দ্র',
      dashboard: 'ড্যাশবোর্ড',
      loginBtn: 'লগ ইন',
      adminTitle: 'অ্যাডমিনিস্ট্রেটর সাইন ইন',
      adminDesc: 'আপনার অ্যাডমিন অ্যাকাউন্ট ও প্রমাণীকরণ কোড ব্যবহার করুন।',
      patientHeaderTitle: 'আজকের যত্ন। আগামীর সুরক্ষা।',
      patientHeaderDesc: 'আপনার স্বাস্থ্য মূল্যায়ন, সচেতনতা নির্দেশিকা এবং পার্সোনাল ড্যাশবোর্ড — এক সাথে।',
      patientCardTitle: 'স্বাগতম।',
      patientCardDesc: 'আপনার ব্যক্তিগত ভিটাগার্ড স্পেসে লগ ইন করুন।',
      doctorHeaderTitle: 'সঠিক চিকিৎসায় এআই এর সহায়তা।',
      doctorHeaderDesc: 'রোগীর স্বাস্থ্য ঝুঁকি মূল্যায়ন, এআই রিপোর্ট এবং আপনার ক্লিনিক্যাল ড্যাশবোর্ডে নিরাপদে প্রবেশ করুন।',
      doctorCardTitle: 'স্বাগতম, ডাক্তার।',
      doctorCardDesc: 'আপনার ক্লিনিক্যাল ওয়ার্কস্পেসে লগ ইন করুন।',
      username: 'ইমেইল বা ইউজারনেম',
      password: 'পাসওয়ার্ড',
      authCode: 'অথেনটিকেটর কোড',
      authCodeDesc: 'আপনার অথেনটিকেটর অ্যাপ থেকে ৬ সংখ্যার কোডটি দিন।',
      signInSec: 'নিরাপদে প্রবেশ করুন',
      logInAction: 'লগ ইন →',
      switchToUser: 'পেশেন্ট / ডক্টর সাইন ইন',
      switchToAdmin: 'অ্যাডমিনিস্ট্রেটর লগ ইন',
      createAccount: 'নতুন অ্যাকাউন্ট তৈরি করুন',
      footerCopy: '© ২০২৬ ট্রাইনেক্সাস · ভিটাগার্ড এআই। সচেতন থাকুন, সুস্থ থাকুন।',
      understandLink: 'মূল্যায়ন সম্পর্কিত তথ্য জানুন',
      rolePatient: 'পেশেন্ট',
      roleDoctor: 'ডাক্তার'
    }
  }[lang];

  const routeFromAuth = (data) => {
    const { token, role: rawRole, user, full_name, verification_status } = data;
    const userRole = String(rawRole || 'patient').toLowerCase().trim();
    login(user || username, token, userRole, full_name, verification_status);
    if (userRole === 'admin') navigate('/admin/dashboard');
    else if (userRole === 'doctor') navigate('/doctor/dashboard');
    else navigate('/dashboard');
  };

  const handleGoogle = async (credential) => {
    setError('');
    setLoading(true);
    try {
      const response = await API.post('/api/auth/google', { credential, declaration_accepted: false });
      routeFromAuth(response.data);
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (detail && typeof detail === 'object' && detail.code === 'profile_required') {
        navigate('/register', { state: { googleCredential: credential, email: detail.email, name: detail.name } });
        return;
      }
      setError(typeof detail === 'string' ? detail : (lang === 'bn' ? 'Google সাইন-ইন হয়নি।' : 'Google sign-in failed.'));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await API.post('/api/auth/login', {
        username,
        password,
        role: role !== 'admin' ? role : undefined,
        authenticator_code: role === 'admin' ? authenticatorCode : undefined,
        totp_code: role === 'admin' ? authenticatorCode : undefined,
      });

      routeFromAuth(response.data);
    } catch (err) {
      setError(
        err.response?.data?.detail || 
        (lang === 'bn' ? 'ভুল ইউজারনেম, পাসওয়ার্ড অথবা প্রমাণীকরণ কোড।' : 'Invalid credentials or authenticator code.')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f6f9] flex flex-col justify-between font-sans">
      {/* Top Navbar Header */}
      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        {role === 'admin' ? (
          <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-gray-100 max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 overflow-hidden">
            <div className="p-8 sm:p-12 flex flex-col justify-center">
              <div className="flex items-center space-x-1.5 text-blue-600 text-[11px] font-bold tracking-widest uppercase mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                <span>VITAGUARD AI</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                {t.adminTitle}
              </h2>
              <p className="text-xs text-gray-500 mt-1.5 mb-6 leading-relaxed">
                {t.adminDesc}
              </p>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-xs text-red-700 rounded">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                    {t.username}
                  </label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={lang === 'bn' ? 'ইমেইল বা ইউজারনেম' : 'Email or username'}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-xs font-medium text-gray-800 transition"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                    {t.password}
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-xs font-medium text-gray-800 transition"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                    {t.authCode}
                  </label>
                  <input
                    type="text"
                    required
                    value={authenticatorCode}
                    onChange={(e) => setAuthenticatorCode(e.target.value)}
                    placeholder={lang === 'bn' ? '৬ সংখ্যার কোড' : 'Enter 6-digit code'}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-xs font-mono tracking-widest text-gray-800 transition"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">{t.authCodeDesc}</p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition text-xs disabled:opacity-50 mt-2 cursor-pointer"
                >
                  {loading ? (lang === 'bn' ? 'যাচাই করা হচ্ছে...' : 'Authenticating...') : t.signInSec}
                </button>
              </form>

              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100 text-xs">
                <button
                  type="button"
                  onClick={() => setRole('patient')}
                  className="text-blue-600 hover:underline font-medium cursor-pointer"
                >
                  {t.switchToUser}
                </button>
                <Link to="/register" className="text-gray-500 hover:text-blue-600 font-medium">
                  {t.createAccount}
                </Link>
              </div>
            </div>

            <div className="hidden md:flex bg-gradient-to-br from-blue-50/50 via-gray-50 to-rose-50/30 items-center justify-center p-8 border-l border-gray-100">
              <HeartGraphic className="w-full max-w-[280px]" />
            </div>
          </div>
        ) : (
          <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            {/* Left Hero */}
            <div className="space-y-6">
              <div className={`inline-block px-3 py-1 text-[11px] font-bold rounded-full uppercase tracking-wider ${role === 'doctor' ? 'bg-indigo-50 text-indigo-600' : 'bg-blue-50 text-blue-600'}`}>
                VitaGuard AI · {role === 'doctor' ? 'Clinical Portal' : 'Patient Portal'}
              </div>
              <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight">
                {role === 'doctor' ? t.doctorHeaderTitle : t.patientHeaderTitle}
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed max-w-md">
                {role === 'doctor' ? t.doctorHeaderDesc : t.patientHeaderDesc}
              </p>

              <div className="flex items-center space-x-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-xs max-w-sm">
                <div className="text-3xl">{role === 'doctor' ? '🩺' : '🫀'}</div>
                <div>
                  <h4 className="text-xs font-bold text-gray-800">
                    {role === 'doctor'
                      ? (lang === 'bn' ? 'স্ক্রিনিং রিভিউ' : 'Screening review')
                      : (lang === 'bn' ? 'স্ক্রিনিং সহায়তা' : 'Screening support')}
                  </h4>
                  <p className="text-[11px] text-gray-400">
                    {role === 'doctor'
                      ? (lang === 'bn' ? 'নিশ্চিত অ্যাপয়েন্টমেন্ট বা নিজের গাইডলাইনের পর' : 'After a confirmed visit or your own guideline')
                      : (lang === 'bn' ? 'স্কোর একটি রোগ নির্ণয় নয়। ডায়াবিডিতে TreeSHAP আছে।' : 'A score is not a diagnosis. DiaBD includes TreeSHAP.')}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Form Card */}
            <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-xl shadow-slate-200/60 border border-gray-100 max-w-md w-full mx-auto">
              <h3 className="text-2xl font-bold text-gray-900">
                {role === 'doctor' ? t.doctorCardTitle : t.patientCardTitle}
              </h3>
              <p className="text-xs text-gray-500 mt-1 mb-5">
                {role === 'doctor' ? t.doctorCardDesc : t.patientCardDesc}
              </p>

              {/* Role Toggle Switcher */}
              <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
                <button
                  type="button"
                  onClick={() => setRole('patient')}
                  className={`flex-1 text-[11px] uppercase tracking-wider py-2.5 rounded-lg font-bold transition-all ${
                    role === 'patient' 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {t.rolePatient}
                </button>
                <button
                  type="button"
                  onClick={() => setRole('doctor')}
                  className={`flex-1 text-[11px] uppercase tracking-wider py-2.5 rounded-lg font-bold transition-all ${
                    role === 'doctor' 
                      ? 'bg-white text-indigo-600 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {t.roleDoctor}
                </button>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-xs text-red-700 rounded">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                    {t.username}
                  </label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={lang === 'bn' ? 'ইমেইল বা ইউজারনেম' : 'Email or username'}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-xs font-medium text-gray-800 transition"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                    {t.password}
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-xs font-medium text-gray-800 transition"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-2.5 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition text-xs disabled:opacity-50 mt-2 cursor-pointer ${role === 'doctor' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                >
                  {loading ? (lang === 'bn' ? 'লগইন হচ্ছে...' : 'Signing in...') : t.logInAction}
                </button>
              </form>
              <div className="my-4 flex items-center gap-3 text-[11px] text-slate-400">
                <span className="flex-1 h-px bg-slate-200" />
                or
                <span className="flex-1 h-px bg-slate-200" />
              </div>
              <GoogleAuthButton
                label="signin"
                onCredential={handleGoogle}
                onUnavailable={() => setError(lang === 'bn'
                  ? 'এই কপিতে Google এখনো চালু নেই। ইমেইল দিয়ে সাইন ইন করুন।'
                  : 'Google sign-in is not turned on for this copy yet. Use your email or username.')}
              />
              <p className="mt-3 text-[11px] leading-relaxed text-slate-500">
                {lang === 'bn'
                  ? 'যেকোনো ইমেইল দিয়ে অ্যাকাউন্ট তৈরি করা যায়। Google সাইন-ইন শুধু Google Cloud-এ যোগ করা অ্যাকাউন্টে কাজ করে।'
                  : 'Anyone can create an account with an email. Google sign-in works only for the accounts added in Google Cloud.'}
              </p>

              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100 text-xs">
                <button
                  type="button"
                  onClick={() => setRole('admin')}
                  className="text-blue-600 hover:underline font-medium cursor-pointer"
                >
                  {t.switchToAdmin}
                </button>
                <Link to="/register" className="text-gray-500 hover:text-blue-600 font-medium">
                  {t.createAccount}
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Footer */}
      <footer className="w-full bg-white border-t border-gray-200 py-3.5 px-8 text-center text-[11px] text-gray-400 flex flex-col sm:flex-row justify-between items-center gap-2">
        <p>{t.footerCopy}</p>
        <Link to="/awareness" className="text-blue-600 hover:underline">{t.understandLink}</Link>
      </footer>
    </div>
  );
}

export default Login;
