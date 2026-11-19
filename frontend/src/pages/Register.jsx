import React, { useEffect, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import API from '../services/api';
import HeartGraphic from '../components/HeartGraphic';
import GoogleAuthButton from '../components/GoogleAuthButton';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { getPasswordChecks, getUsernameChecks, isPasswordReady, isUsernameReady } from '../utils/validationSchemas';

function ageFromDob(value) {
  if (!value) return null;
  const dob = new Date(`${value}T00:00:00`);
  if (Number.isNaN(dob.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const month = today.getMonth() - dob.getMonth();
  if (month < 0 || (month === 0 && today.getDate() < dob.getDate())) age -= 1;
  return age;
}

function Register() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [sex, setSex] = useState('');
  const [googleCredential, setGoogleCredential] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Role State: 'patient' | 'doctor'
  const [role, setRole] = useState('patient');
  const { lang, setLang, t } = useLanguage();
  const [district, setDistrict] = useState('Dhaka');
  const [bloodGroup, setBloodGroup] = useState('');
  const [isDonor, setIsDonor] = useState(false);
  const [bmdcNumber, setBmdcNumber] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [workplace, setWorkplace] = useState('');
  const [declaration, setDeclaration] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  useEffect(() => {
    const incoming = location.state?.googleCredential;
    if (!incoming) return;
    setRole('patient');
    setGoogleCredential(incoming);
    setEmail(location.state.email || '');
    setFullName(location.state.name || '');
  }, [location.state]);

  const usernameChecks = getUsernameChecks(username);
  const passwordChecks = getPasswordChecks(password, username, email);
  const usernameReady = isUsernameReady(username);
  const passwordReady = isPasswordReady(password, username, email);
  const passwordsMatch = password && confirmPassword && password === confirmPassword;
  const emailReady = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const age = ageFromDob(dateOfBirth);
  const genderReady = sex === 'male' || sex === 'female' || sex === 'other';
  const patientProfileReady = genderReady && age !== null && age >= 13 && age <= 120;
  const today = new Date();
  const maxDob = new Date(today.getFullYear() - 13, today.getMonth(), today.getDate()).toISOString().slice(0, 10);
  const minDob = new Date(today.getFullYear() - 120, today.getMonth(), today.getDate()).toISOString().slice(0, 10);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!emailReady) {
      setError('Enter a valid email address.');
      return;
    }
    if (role === 'patient' && !patientProfileReady) {
      setError('Add a date of birth that makes the age 13 to 120, and select female, male, or others.');
      return;
    }
    if (googleCredential) {
      setLoading(true);
      try {
        const response = await API.post('/api/auth/google', {
          credential: googleCredential,
          full_name: fullName,
          date_of_birth: dateOfBirth,
          sex,
          district,
          blood_group: bloodGroup || undefined,
          declaration_accepted: declaration,
        });
        const { token, role: userRole, user, full_name, verification_status } = response.data;
        login(user || email, token, userRole, full_name, verification_status);
        navigate('/dashboard');
      } catch (err) {
        const detail = err.response?.data?.detail;
        setError(typeof detail === 'string' ? detail : 'Google sign-up was not completed.');
      } finally {
        setLoading(false);
      }
      return;
    }
    if (!usernameReady) {
      setError('Please meet all username requirements.');
      return;
    }
    if (!passwordReady) {
      setError('Please meet all password requirements.');
      return;
    }
    if (!passwordsMatch) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await API.post('/api/auth/register', {
        email: email.trim(),
        username,
        password,
        full_name: fullName,
        role: role,
        date_of_birth: role === 'patient' ? dateOfBirth : undefined,
        sex: role === 'patient' ? sex : undefined,
        district,
        blood_group: role === 'patient' ? bloodGroup : undefined,
        is_donor: role === 'patient' ? isDonor : false,
        bmdc_number: role === 'doctor' ? bmdcNumber : undefined,
        specialty: role === 'doctor' ? specialty : undefined,
        workplace: role === 'doctor' ? workplace : undefined,
        declaration_accepted: declaration,
      });
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Please choose another username.');
    } finally {
      setLoading(false);
    }
  };

  const startGoogle = async (credential) => {
    setError('');
    setLoading(true);
    try {
      const response = await API.post('/api/auth/google', { credential, declaration_accepted: false });
      const { token, role: userRole, user, full_name, verification_status } = response.data;
      login(user || email, token, userRole, full_name, verification_status);
      navigate(userRole === 'doctor' ? '/doctor/dashboard' : '/dashboard');
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (detail && typeof detail === 'object' && detail.code === 'profile_required') {
        setGoogleCredential(credential);
        setEmail(detail.email || '');
        setFullName(detail.name || fullName);
        setRole('patient');
        setError('Google confirmed the email. Add date of birth and gender, accept the declaration, then finish sign-up.');
        return;
      }
      setError(typeof detail === 'string' ? detail : 'Google sign-up was not completed.');
    } finally {
      setLoading(false);
    }
  };

  // Reusable Checklist Item Component
  const CheckItem = ({ isValid, text }) => (
    <div className={`flex items-center space-x-2 text-[10px] ${isValid ? 'text-blue-600 font-medium' : 'text-slate-400'}`}>
      <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-colors ${isValid ? 'border-blue-500 bg-blue-50' : 'border-slate-300'}`}>
        {isValid && <span className="text-blue-600 text-[8px] font-bold">✓</span>}
      </div>
      <span>{text}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f4f7fa] flex flex-col justify-between font-sans text-slate-800">
      {/* Top Navbar */}
      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 overflow-hidden">
          
          {/* Left Side: Graphic & Branding (Changes slightly based on role) */}
          <div className={`hidden lg:flex flex-col items-center justify-center p-10 border-r border-slate-100 relative transition-colors duration-500 ${role === 'doctor' ? 'bg-gradient-to-br from-indigo-50/50 via-white to-blue-50/30' : 'bg-gradient-to-br from-blue-50/50 via-white to-rose-50/30'}`}>
            <HeartGraphic className="w-full max-w-[280px] mb-8" />
            
            <div className="w-full max-w-xs space-y-4">
              <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm p-3 rounded-xl shadow-sm border border-slate-100">
                <span className={`w-2 h-2 rounded-full ${role === 'doctor' ? 'bg-indigo-500' : 'bg-rose-500'}`}></span>
                <span className="text-xs font-bold text-slate-700">
                  {role === 'doctor' ? 'Clinical Insights & Reports' : 'Heart Health & Awareness'}
                </span>
              </div>
              <div className="flex items-center justify-center bg-white/80 backdrop-blur-sm p-3 rounded-xl shadow-sm border border-slate-100 text-center">
                <span className="text-xs font-medium text-slate-600">
                  {role === 'doctor' ? 'Empowering your clinical decisions.' : 'Build awareness, one step at a time.'}
                </span>
              </div>
              <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm p-3 rounded-xl shadow-sm border border-slate-100">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                <span className="text-xs font-bold text-slate-700">English & বাংলা</span>
              </div>
            </div>
          </div>

          {/* Right Side: Registration Form */}
          <div className="p-8 sm:p-12 flex flex-col justify-center bg-white">
            <div className="mb-6">
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {role === 'doctor' ? 'Doctor Registration' : 'Patient Registration'}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {role === 'doctor' 
                  ? 'Join VitaGuard AI to manage clinical assessments.' 
                  : 'Join VitaGuard AI to manage your personal health space.'}
              </p>
            </div>

            {/* Role Toggle Switcher */}
            <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
              <button
                type="button"
                onClick={() => { setRole('patient'); }}
                className={`flex-1 text-[11px] uppercase tracking-wider py-2.5 rounded-lg font-bold transition-all ${
                  role === 'patient' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Patient
              </button>
              <button
                type="button"
                onClick={() => { setRole('doctor'); setGoogleCredential(''); }}
                className={`flex-1 text-[11px] uppercase tracking-wider py-2.5 rounded-lg font-bold transition-all ${
                  role === 'doctor' 
                    ? 'bg-white text-indigo-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Doctor
              </button>
            </div>

            {role === 'patient' ? (
              <div className="space-y-3 mb-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1.5">Date of birth</label>
                    <input type="date" required value={dateOfBirth} min={minDob} max={maxDob} onChange={(e) => setDateOfBirth(e.target.value)} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1.5">{t('gender')}</label>
                    <select required value={sex} onChange={(e) => setSex(e.target.value)} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm bg-white">
                      <option value="">{t('genderSelect')}</option>
                      <option value="female">{t('genderFemale')}</option>
                      <option value="male">{t('genderMale')}</option>
                      <option value="other">{t('genderOthers')}</option>
                    </select>
                  </div>
                </div>
                <p className={`text-[11px] font-semibold ${patientProfileReady ? 'text-blue-700' : 'text-slate-500'}`}>
                  {age === null ? 'Age is calculated from the date of birth.' : `Age ${age}`}
                </p>
                <p className="text-[11px] text-slate-500">{t('genderHint')}</p>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1.5">District</label>
                  <input value={district} onChange={(e) => setDistrict(e.target.value)} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1.5">Blood group</label>
                  <select value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm bg-white">
                    <option value="">Not set</option>
                    {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map((group) => <option key={group}>{group}</option>)}
                  </select>
                </div>
                <label className="flex items-start gap-2 text-xs text-slate-600">
                  <input type="checkbox" checked={isDonor} onChange={(e) => setIsDonor(e.target.checked)} className="mt-0.5" />
                  <span>{t('donorOptIn')}</span>
                </label>
              </div>
            ) : (
              <div className="space-y-3 mb-5">
                <input value={bmdcNumber} onChange={(e) => setBmdcNumber(e.target.value)} placeholder="BMDC registration number" className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm" />
                <input value={specialty} onChange={(e) => setSpecialty(e.target.value)} placeholder="Specialty" className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm" />
                <input value={workplace} onChange={(e) => setWorkplace(e.target.value)} placeholder="Hospital or chamber" className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm" />
                <p className="text-[11px] text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-lg p-2">Account stays locked until an admin reviews the BMDC number. The badge will say admin review, not a government seal.</p>
              </div>
            )}

            <label className="flex items-start gap-2 text-xs text-slate-600 mb-4">
              <input type="checkbox" checked={declaration} onChange={(e) => setDeclaration(e.target.checked)} className="mt-0.5" />
              <span>{t('declaration')}</span>
            </label>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-xs text-red-700 rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1.5">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  readOnly={Boolean(googleCredential)}
                  placeholder="name@email.com"
                  className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium text-slate-800"
                />
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                  {role === 'doctor' ? 'Doctor Full Name' : 'Full Name'}
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={role === 'doctor' ? 'e.g. Dr. Farhan Tanvir' : 'Enter your full name'}
                  className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium text-slate-800 transition-shadow placeholder:text-slate-400"
                />
              </div>

              {!googleCredential && (<>
              {/* Username */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1.5">Username</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Choose a unique username"
                  className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium text-slate-800 transition-shadow placeholder:text-slate-400"
                />
                <div className="grid grid-cols-2 gap-2 mt-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <CheckItem isValid={usernameChecks.length} text="5–32 characters" />
                  <CheckItem isValid={usernameChecks.startsWithLetter} text="Starts with a letter" />
                  <CheckItem isValid={usernameChecks.charset} text="Lowercase, numbers, underscore" />
                  <CheckItem isValid={usernameChecks.hasNumber} text="At least one number" />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium text-slate-800 transition-shadow placeholder:text-slate-400 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? '👁️‍🗨️' : '👁️'}
                  </button>
                </div>
                
                {/* Password Checklist Grid */}
                <div className="grid grid-cols-2 gap-2 mt-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <CheckItem isValid={passwordChecks.length} text="12–128 characters" />
                  <CheckItem isValid={passwordChecks.upper} text="One uppercase letter" />
                  <CheckItem isValid={passwordChecks.lower} text="One lowercase letter" />
                  <CheckItem isValid={passwordChecks.number} text="One number" />
                  <CheckItem isValid={passwordChecks.special} text="One special character" />
                  <CheckItem isValid={passwordChecks.notUsername} text="Does not contain username or email name" />
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1.5">Confirm password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm password"
                    className={`w-full px-4 py-2.5 bg-white border rounded-lg focus:outline-none focus:ring-2 transition-shadow placeholder:text-slate-400 pr-10 text-sm font-medium text-slate-800 ${
                      confirmPassword && !passwordsMatch 
                        ? 'border-red-400 focus:ring-red-500 focus:border-red-500' 
                        : 'border-slate-300 focus:ring-blue-500 focus:border-blue-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showConfirmPassword ? '👁️‍🗨️' : '👁️'}
                  </button>
                </div>
                <div className="mt-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <CheckItem isValid={Boolean(passwordsMatch)} text="Passwords match" />
                </div>
              </div>
              </>)}

              {!googleCredential && (
              <button
                type="submit"
                disabled={loading || !emailReady || !usernameReady || !passwordReady || !passwordsMatch || !declaration || (role === 'patient' && !patientProfileReady) || (role === 'doctor' && (!bmdcNumber || !specialty || !workplace))}
                className={`w-full py-3 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed mt-4 cursor-pointer ${
                  role === 'doctor' ? 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-500/30' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-blue-500/30'
                }`}
              >
                {loading ? 'Processing...' : 'Create account with email →'}
              </button>
              )}
              {googleCredential && (
                <button
                  type="submit"
                  disabled={loading || !declaration || !patientProfileReady || !fullName.trim()}
                  className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl text-sm disabled:opacity-50 mt-4"
                >
                  {loading ? 'Processing...' : 'Finish Google sign-up →'}
                </button>
              )}
            </form>
            {role === 'patient' && !googleCredential && (
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-3 text-[11px] text-slate-400">
                  <span className="flex-1 h-px bg-slate-200" />
                  or
                  <span className="flex-1 h-px bg-slate-200" />
                </div>
                <GoogleAuthButton
                  label="signup"
                  onCredential={startGoogle}
                  onUnavailable={() => setError(lang === 'bn'
                    ? 'এই কপিতে Google এখনো চালু নেই। ইমেইল দিয়ে অ্যাকাউন্ট তৈরি করুন।'
                    : 'Google sign-up is not turned on for this copy yet. Create the account with email.')}
                />
                <p className="text-[11px] text-slate-500">Email registration keeps a password on this server. Google sign-up never replaces an existing password account, and it can only create a patient.</p>
              </div>
            )}

            <div className="flex flex-col items-center justify-center mt-6 space-y-3 text-xs font-semibold">
              <div className="text-slate-500">
                Already have an account? <Link to="/login" className="text-blue-600 hover:underline">Log in</Link>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-white border-t border-slate-200/80 py-4 text-center text-[11px] text-slate-400 font-medium">
        &copy; 2026 TriNexus · VitaGuard AI. A little awareness. A better tomorrow.
      </footer>
    </div>
  );
}

export default Register;