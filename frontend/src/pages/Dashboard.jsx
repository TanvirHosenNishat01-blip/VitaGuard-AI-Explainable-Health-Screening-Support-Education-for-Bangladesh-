import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Activity,
  HeartPulse,
  Stethoscope,
  Calendar,
  BookOpen,
  Trash2,
  Eye,
  PlusCircle,
  Droplets,
  Globe2,
  FileText,
} from 'lucide-react';
import API, { getApiError } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StoryModal from '../components/StoryModal';
import { useLanguage } from '../context/LanguageContext';
import Appointments from '../components/Appointments';
import PageContainer from '../components/ui/PageContainer';
import ClinicalCard from '../components/ui/ClinicalCard';
import StatusBadge from '../components/ui/StatusBadge';
import MedicalButton from '../components/ui/MedicalButton';
import AlertBanner from '../components/ui/AlertBanner';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';
import AccessibleModal from '../components/ui/AccessibleModal';
import NotificationCenter from '../components/NotificationCenter';
import JourneyTimeline from '../components/JourneyTimeline';

function Dashboard() {
  const [userData, setUserData] = useState(null);
  const [measurements, setMeasurements] = useState([]);
  const [doctorGuidelines, setDoctorGuidelines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [historyFilter, setHistoryFilter] = useState('ALL');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmUsername, setConfirmUsername] = useState('');
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteScope, setDeleteScope] = useState('screening');
  const [deleteReceipt, setDeleteReceipt] = useState(null);
  const [withdrawNote, setWithdrawNote] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();
  const { lang, t } = useLanguage();
  const isBn = lang === 'bn';

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const section = params.get('section');
    if (section) {
      const el = document.getElementById(`section-${section}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [location.search, loading]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await API.get('/api/patient/dashboard');
      if (res.data) {
        setUserData(res.data.user_profile || res.data.user || null);
        setMeasurements(res.data.measurements || []);
        setDoctorGuidelines(res.data.doctor_guidelines || []);
      }
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        logout();
        navigate('/login', { state: { sessionExpired: true } });
        return;
      }
      setError(getApiError(err, 'Could not load your health records.'));
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDeleteData = async () => {
    setDeleting(true);
    setError(null);
    try {
      const res = await API.post('/api/patient/deletion-request', {
        confirm_username: confirmUsername,
        password: deletePassword,
        scope: deleteScope,
      });
      setMeasurements([]);
      setDoctorGuidelines([]);
      setDeleteReceipt(res.data);
    } catch (err) {
      setError(getApiError(err, 'Could not delete records.'));
    } finally {
      setDeleting(false);
    }
  };

  const closeDeleteModal = () => {
    const cleared = Boolean(deleteReceipt?.account_cleared);
    setDeleteModalOpen(false);
    setDeleteReceipt(null);
    setWithdrawNote('');
    setConfirmUsername('');
    setDeletePassword('');
    if (cleared) {
      logout();
      navigate('/login');
    }
  };

  const handleOpenStory = (record) => {
    setSelectedRecord(record);
    setIsModalOpen(true);
  };

  const handleCloseStory = () => {
    setIsModalOpen(false);
    setSelectedRecord(null);
  };

  const displayName =
    userData?.full_name ||
    userData?.name ||
    user?.full_name ||
    user?.name ||
    userData?.username ||
    user?.username ||
    (isBn ? 'রোগী' : 'Patient');

  const userIdentifier = userData?.username || user?.username || 'user';

  const diabetesRecords = useMemo(
    () =>
      measurements.filter((m) =>
        String(m.type || '').toLowerCase().includes('diabetes')
      ),
    [measurements]
  );

  const cardioRecords = useMemo(
    () =>
      measurements.filter((m) =>
        String(m.type || '').toLowerCase().includes('cardio')
      ),
    [measurements]
  );

  const filteredMeasurements = useMemo(() => {
    if (historyFilter === 'DIABETES') return diabetesRecords;
    if (historyFilter === 'CARDIO') return cardioRecords;
    return measurements;
  }, [measurements, diabetesRecords, cardioRecords, historyFilter]);

  const latestOverall = measurements[0] || null;
  const latestDiabetes = diabetesRecords[0] || null;
  const latestCardio = cardioRecords[0] || null;

  return (
    <PageContainer className="space-y-8 py-6 sm:py-8">
      {/* 1. PERSONALIZED GREETING & PROFILE HEADER */}
      <div
        id="section-profile"
        className="scroll-mt-20 bg-white p-5 sm:p-6 rounded-2xl border border-[#E2E8F0] shadow-clinical-xs flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4"
      >
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#12304A] text-white flex items-center justify-center text-lg font-extrabold shrink-0">
            {String(displayName).charAt(0).toUpperCase()}
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#12304A]">
                {isBn ? `স্বাগতম, ${displayName}` : `Welcome, ${displayName}`}
              </h1>
              <StatusBadge
                tone="info"
                size="sm"
                label={isBn ? 'পেশেন্ট পোর্টাল' : 'Patient Portal'}
              />
            </div>
            <p className="text-xs text-[#64748B]">
              ID: <span className="font-mono font-semibold text-[#12304A]">{userIdentifier}</span>
              {(userData?.sex || userData?.age) && (
                <span>
                  {' · '}
                  {userData.sex === 'male'
                    ? t('genderMale')
                    : userData.sex === 'female'
                    ? t('genderFemale')
                    : userData.sex === 'other'
                    ? t('genderOthers')
                    : userData.sex}
                  {userData.age ? ` · ${userData.age} ${isBn ? 'বছর' : 'yrs'}` : ''}
                </span>
              )}
              {userData?.blood_group && (
                <span>
                  {' · '}
                  {isBn ? 'রক্তের গ্রুপ:' : 'Blood:'}{' '}
                  <strong className="text-[#DC2626]">{userData.blood_group}</strong>
                </span>
              )}
              {userData?.district && <span>{` · ${userData.district}`}</span>}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          <MedicalButton
            variant="primary"
            size="sm"
            onClick={() => navigate('/assessment')}
            leftIcon={<PlusCircle className="w-4 h-4" />}
          >
            {isBn ? 'নতুন স্বাস্থ্য পরীক্ষা' : 'Start Assessment'}
          </MedicalButton>
          <MedicalButton
            variant="outline"
            size="sm"
            onClick={() => navigate('/blood')}
            leftIcon={<Droplets className="w-4 h-4 text-[#DC2626]" />}
          >
            {t('blood')}
          </MedicalButton>
          <MedicalButton
            variant="outline"
            size="sm"
            onClick={() => navigate('/doctors')}
            leftIcon={<Stethoscope className="w-4 h-4" />}
          >
            {isBn ? 'ডাক্তার' : 'Doctors'}
          </MedicalButton>
          <MedicalButton variant="outline" size="sm" onClick={() => navigate('/messages')}>
            {isBn ? 'বার্তা' : 'Messages'}
          </MedicalButton>
          <MedicalButton
            variant="outline"
            size="sm"
            onClick={() => navigate('/knowledge')}
            leftIcon={<BookOpen className="w-4 h-4" />}
          >
            {isBn ? 'জ্ঞান হাব' : 'Knowledge'}
          </MedicalButton>
          <MedicalButton
            variant="ghost"
            size="sm"
            onClick={() => setDeleteModalOpen(true)}
            leftIcon={<Trash2 className="w-4 h-4 text-[#64748B]" />}
          >
            {t('deleteData')}
          </MedicalButton>
        </div>
      </div>

      {/* ADMINISTRATIVE WARNING BANNER */}
      {userData?.active_warning && (
        <AlertBanner
          tone="warning"
          title={isBn ? 'অ্যাডমিনিস্ট্রেটিভ নোটিশ' : 'Administrative Compliance Notice'}
        >
          <p>{userData.active_warning}</p>
        </AlertBanner>
      )}

      <NotificationCenter compact />
      <JourneyTimeline />

      {/* ERROR STATE */}
      {error && (
        <ErrorState
          title={isBn ? 'ড্যাশবোর্ডের তথ্য লোড করা যায়নি' : 'Could not load dashboard data'}
          message={error}
          onRetry={fetchDashboardData}
        />
      )}

      {/* LOADING STATE */}
      {loading ? (
        <div className="space-y-6">
          <LoadingSkeleton variant="cards" count={4} />
          <LoadingSkeleton variant="table" rows={3} />
        </div>
      ) : (
        <>
          {/* 2. LATEST ASSESSMENT SUMMARY & QUICK STATS */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Latest Assessment Status Card */}
            <div className="lg:col-span-7">
              {latestOverall ? (
                <ClinicalCard accent="navy" className="h-full flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E2E8F0] pb-3">
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-[#0D9488]">
                          {isBn ? 'সর্বশেষ স্ক্রিনিং সারাংশ' : 'Latest Screening Summary'}
                        </span>
                        <h2 className="text-lg font-bold text-[#12304A] mt-0.5">
                          {latestOverall.type}{' '}
                          {isBn ? 'মূল্যায়ন' : 'Assessment'}
                        </h2>
                      </div>
                      <StatusBadge
                        status={latestOverall.risk_level || latestOverall.risk_classification}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-3.5 rounded-xl bg-[#F6F9FC] border border-[#E2E8F0]">
                        <p className="text-xs font-semibold text-[#64748B]">
                          {isBn ? 'ডায়াবেটিস স্ক্রিনিং' : 'Latest Diabetes Screening'}
                        </p>
                        {latestDiabetes ? (
                          <div className="mt-1 space-y-1">
                            <p className="text-sm font-bold text-[#12304A]">
                              {latestDiabetes.risk_level} ({latestDiabetes.probability ?? '—'}%)
                            </p>
                            <p className="text-[11px] font-mono text-[#64748B]">
                              {latestDiabetes.created_at || latestDiabetes.date}
                            </p>
                          </div>
                        ) : (
                          <p className="text-xs text-[#64748B] mt-1">
                            {isBn ? 'এখনো কোনো ডায়াবেটিস রেকর্ড নেই' : 'No saved diabetes record yet'}
                          </p>
                        )}
                      </div>

                      <div className="p-3.5 rounded-xl bg-[#F6F9FC] border border-[#E2E8F0]">
                        <p className="text-xs font-semibold text-[#64748B]">
                          {isBn ? 'হৃদরোগ স্ক্রিনিং' : 'Latest Cardiovascular Screening'}
                        </p>
                        {latestCardio ? (
                          <div className="mt-1 space-y-1">
                            <p className="text-sm font-bold text-[#12304A]">
                              {latestCardio.risk_level} ({latestCardio.probability ?? '—'}%)
                            </p>
                            <p className="text-[11px] font-mono text-[#64748B]">
                              {latestCardio.created_at || latestCardio.date}
                            </p>
                          </div>
                        ) : (
                          <p className="text-xs text-[#64748B] mt-1">
                            {isBn ? 'এখনো কোনো হৃদরোগ রেকর্ড নেই' : 'No saved cardiac record yet'}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-4 mt-4 border-t border-[#E2E8F0]">
                    <span className="text-xs text-[#64748B]">
                      {isBn
                        ? `সর্বশেষ তারিখ: ${latestOverall.date || latestOverall.created_at}`
                        : `Recorded on ${latestOverall.date || latestOverall.created_at}`}
                    </span>
                    <MedicalButton
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenStory(latestOverall)}
                      leftIcon={<Eye className="w-4 h-4" />}
                    >
                      {isBn ? 'বিস্তারিত রিপোর্ট দেখুন' : 'Inspect Latest Report'}
                    </MedicalButton>
                  </div>
                </ClinicalCard>
              ) : (
                <ClinicalCard accent="teal" className="h-full flex flex-col justify-between">
                  <div className="space-y-3">
                    <StatusBadge
                      tone="info"
                      size="sm"
                      label={isBn ? 'প্রথমবার স্ক্রিনিং গাইড' : 'First-Time Patient Guide'}
                    />
                    <h2 className="text-xl font-bold text-[#12304A]">
                      {isBn
                        ? 'ভিটাগার্ড এআই-তে আপনাকে স্বাগতম!'
                        : 'Welcome to Your Personal Health Space'}
                    </h2>
                    <p className="text-sm text-[#475569] leading-relaxed">
                      {isBn
                        ? 'আপনার অ্যাকাউন্টে এখনো কোনো সেভ করা স্ক্রিনিং রেকর্ড নেই। আপনার কাছে থাকা ল্যাব রিপোর্ট অথবা রক্তচাপ ও বিএমআই দিয়ে প্রথম ৫-ধাপের গাইডেড মূল্যায়ন শুরু করুন।'
                        : 'You do not have any saved screening records yet. Complete a guided 5-step Diabetes or Cardiovascular assessment to build your longitudinal health record and unlock doctor review requests.'}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3 pt-5 mt-5 border-t border-[#E2E8F0]">
                    <MedicalButton
                      variant="primary"
                      size="sm"
                      onClick={() => navigate('/assessment')}
                    >
                      {isBn ? 'প্রথম স্বাস্থ্য পরীক্ষা শুরু করুন' : 'Start First Health Assessment'}
                    </MedicalButton>
                    <MedicalButton
                      variant="outline"
                      size="sm"
                      onClick={() => navigate('/bangladesh')}
                    >
                      {isBn ? 'বাংলাদেশ নন-ইনভেসিভ স্ক্রিনিং' : 'Bangladesh Non-Invasive Screen'}
                    </MedicalButton>
                  </div>
                </ClinicalCard>
              )}
            </div>

            {/* Real Backend Metrics & Recent Activity Summary */}
            <div className="lg:col-span-5 grid grid-cols-2 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-clinical-xs flex flex-col justify-between">
                <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
                  {isBn ? 'মোট মূল্যায়ন' : 'Total Screenings'}
                </p>
                <p className="text-3xl font-extrabold font-mono text-[#12304A] mt-2">
                  {measurements.length}
                </p>
                <p className="text-xs text-[#64748B] mt-1">
                  {isBn
                    ? `ডায়াবেটিস: ${diabetesRecords.length} · হৃদরোগ: ${cardioRecords.length}`
                    : `Diabetes: ${diabetesRecords.length} · Cardiac: ${cardioRecords.length}`}
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-clinical-xs flex flex-col justify-between">
                <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
                  {isBn ? 'ডাক্তারের পরামর্শ' : 'Doctor Guidelines'}
                </p>
                <p className="text-3xl font-extrabold font-mono text-[#0D9488] mt-2">
                  {doctorGuidelines.length}
                </p>
                <p className="text-xs text-[#0F766E] font-medium mt-1">
                  {doctorGuidelines.length > 0
                    ? isBn
                      ? 'যাচাইকৃত পরামর্শ পাওয়া গেছে'
                      : 'Verified advice attached'
                    : isBn
                    ? 'এখনো কোনো গাইডলাইন নেই'
                    : 'No guidelines attached yet'}
                </p>
              </div>

              <div className="col-span-2 bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-clinical-xs space-y-2">
                <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
                  {isBn ? 'সাম্প্রতিক কার্যক্রম' : 'Recent Activity & Review Status'}
                </p>
                {measurements.length === 0 && doctorGuidelines.length === 0 ? (
                  <p className="text-xs text-[#64748B]">
                    {isBn
                      ? 'স্ক্রিনিং সম্পন্ন করলে এখানে আপনার সাম্প্রতিক কার্যক্রমের সারাংশ দেখা যাবে।'
                      : 'Your most recent screening submissions and doctor review updates will appear here.'}
                  </p>
                ) : (
                  <ul className="space-y-1.5 text-xs text-[#334155]">
                    {latestOverall && (
                      <li className="flex items-center justify-between gap-2">
                        <span className="font-medium truncate">
                          • {latestOverall.type} ({latestOverall.risk_level})
                        </span>
                        <span className="font-mono text-[#64748B] shrink-0">
                          {latestOverall.created_at}
                        </span>
                      </li>
                    )}
                    {doctorGuidelines[0] && (
                      <li className="flex items-center justify-between gap-2 text-[#0F766E]">
                        <span className="font-semibold truncate">
                          • {isBn ? 'ডাক্তারের নোট:' : 'Doctor note:'}{' '}
                          {doctorGuidelines[0].doctor_name}
                        </span>
                        <span className="font-mono text-[#64748B] shrink-0">
                          {doctorGuidelines[0].date}
                        </span>
                      </li>
                    )}
                  </ul>
                )}
              </div>
            </div>
          </div>

          {/* 3. QUICK ASSESSMENT ACTIONS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <ClinicalCard accent="navy" className="flex flex-col justify-between">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-[#F0F5FA] text-[#12304A] flex items-center justify-center">
                    <Activity className="w-5 h-5 text-[#0D9488]" aria-hidden="true" />
                  </div>
                  <StatusBadge tone="info" size="sm" label={isBn ? '৮টি ইনপুট' : '8 Biomarkers'} />
                </div>
                <h3 className="text-base font-bold text-[#12304A]">
                  {isBn ? 'পিমা স্ক্রিনিং' : 'Pima screening'}
                </h3>
                <p className="text-xs text-[#475569] leading-relaxed">
                  {isBn
                    ? 'গ্লুকোজ, ইনসুলিনসহ আটটি পরিমাপ থাকলে বিদ্যমান মডেল সেগুলো পড়ে। DiaBD এই সংখ্যাগুলো নেয় না।'
                    : 'When glucose, insulin, and the other six measurements are already known, the existing model reads them. DiaBD does not use those numbers.'}
                </p>
                <p className="text-xs font-semibold text-[#92400E] leading-relaxed">
                  {isBn ? '২১–৮১ বছরের ৭৬৮ জন নারীর টেবিল। রোগ নির্ণয় নয়।' : 'A table of 768 women aged 21–81. Not a diagnosis.'}
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-[#E2E8F0]">
                <MedicalButton
                  variant="primary"
                  size="sm"
                  fullWidth
                  onClick={() => navigate('/predict/diabetes')}
                >
                  {isBn ? 'পিমা স্ক্রিনিং শুরু করুন' : 'Start Pima screening'}
                </MedicalButton>
              </div>
            </ClinicalCard>

            <ClinicalCard accent="teal" className="flex flex-col justify-between">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-[#F0FDFA] text-[#0D9488] flex items-center justify-center">
                    <HeartPulse className="w-5 h-5 text-[#0D9488]" aria-hidden="true" />
                  </div>
                  <StatusBadge tone="moderate" size="sm" label={isBn ? '১৩টি ইনপুট' : '13 Cardiac Inputs'} />
                </div>
                <h3 className="text-base font-bold text-[#12304A]">
                  {isBn ? 'হৃদরোগ ঝুঁকি মূল্যায়ন' : 'Cardiovascular Risk Assessment'}
                </h3>
                <p className="text-xs text-[#475569] leading-relaxed">
                  {isBn
                    ? 'রক্তচাপ, কোলেস্টেরল, ইসিজি এবং ব্যায়ামের হার্ট রেটসহ ৫ ধাপে হৃদরোগ স্ক্রিনিং।'
                    : 'Guided 5-step cardiac screening covering resting BP, cholesterol, ECG, and exercise stress findings.'}
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-[#E2E8F0]">
                <MedicalButton
                  variant="secondary"
                  size="sm"
                  fullWidth
                  onClick={() => navigate('/predict/cardio')}
                >
                  {isBn ? 'হৃদরোগ পরীক্ষা শুরু করুন →' : 'Start Cardiac Wizard →'}
                </MedicalButton>
              </div>
            </ClinicalCard>

            <ClinicalCard accent="teal" className="flex flex-col justify-between">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-[#F0FDFA] text-[#0D9488] flex items-center justify-center">
                    <Globe2 className="w-5 h-5 text-[#0D9488]" aria-hidden="true" />
                  </div>
                  <StatusBadge tone="low" size="sm" label={isBn ? 'নন-ল্যাব' : 'Non-Invasive'} />
                </div>
                <h3 className="text-base font-bold text-[#12304A]">
                  {isBn ? 'বাংলাদেশ নন-ইনভেসিভ স্ক্রিনিং' : 'Bangladesh DiaBD & WHO Chart'}
                </h3>
                <p className="text-xs text-[#475569] leading-relaxed">
                  {isBn
                    ? 'ল্যাবরেটরি রক্ত পরীক্ষা ছাড়াই রক্তচাপ ও বিএমআই দিয়ে ডায়াবেটিস ও ১০ বছরের হার্ট ঝুঁকি দেখুন।'
                    : 'Screen without laboratory blood draws using Bangladesh DiaBD (TreeSHAP) and the WHO South Asia chart.'}
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-[#E2E8F0]">
                <MedicalButton
                  variant="outline"
                  size="sm"
                  fullWidth
                  onClick={() => navigate('/bangladesh')}
                >
                  {isBn ? 'বাংলাদেশ স্ক্রিনিং খুলুন →' : 'Open Bangladesh Screen →'}
                </MedicalButton>
              </div>
            </ClinicalCard>
          </div>

          {/* 4. DOCTOR'S VERIFIED CLINICAL GUIDELINES */}
          <ClinicalCard accent="teal">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E2E8F0] pb-3">
                <div className="flex items-center gap-2.5">
                  <Stethoscope className="w-5 h-5 text-[#0D9488]" aria-hidden="true" />
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-[#12304A]">
                      {isBn
                        ? `ডাক্তারের যাচাইকৃত ক্লিনিক্যাল গাইডলাইন (${doctorGuidelines.length})`
                        : `Doctor's Verified Clinical Guidelines (${doctorGuidelines.length})`}
                    </h2>
                    <p className="text-xs text-[#64748B]">
                      {isBn
                        ? 'আপনার সেভ করা স্ক্রিনিংয়ের ওপর অনুমোদিত ডাক্তারদের লিখিত পরামর্শ।'
                        : 'Clinical recommendations attached to your saved screenings by admin-reviewed doctors.'}
                    </p>
                  </div>
                </div>
                <StatusBadge
                  tone={doctorGuidelines.length > 0 ? 'low' : 'neutral'}
                  size="sm"
                  label={
                    doctorGuidelines.length > 0
                      ? isBn
                        ? 'সক্রিয় ফলো-আপ'
                        : 'Active Follow-Up'
                      : isBn
                      ? 'কোনো নোট নেই'
                      : 'No Notes Yet'
                  }
                />
              </div>

              {doctorGuidelines.length === 0 ? (
                <p className="text-xs text-[#64748B] py-2 leading-relaxed">
                  {isBn
                    ? 'এখনো কোনো ডাক্তার গাইডলাইন যুক্ত করেননি। আপনি নিচের যেকোনো সেভ করা রেকর্ডের "বিস্তারিত দেখুন" বাটনে ক্লিক করে ডাক্তারের রিভিউ অনুরোধ পাঠাতে পারেন।'
                    : 'No doctor guidelines have been attached yet. You can open any saved screening record below and click "Ask an admin-reviewed doctor" to request a review.'}
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {doctorGuidelines.map((g) => (
                    <div
                      key={g.id}
                      className="bg-[#F0FDFA] p-4 rounded-xl border border-[#99F6E4] space-y-2"
                    >
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-[#0F766E]">{g.doctor_name}</span>
                        <span className="text-[#64748B] font-mono text-[11px]">{g.date}</span>
                      </div>
                      <p className="text-sm text-[#12304A] font-medium leading-relaxed">
                        “{g.guideline}”
                      </p>
                      <p className="text-[11px] font-bold text-[#12304A] uppercase tracking-wider">
                        {isBn ? 'সংশ্লিষ্ট মূল্যায়ন:' : 'Related to:'} {g.assessment_type}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ClinicalCard>

          {/* 5. UPCOMING APPOINTMENTS & DOCTOR BOOKING */}
          <div id="section-appointments" className="scroll-mt-20">
            <Appointments mode="patient" />
          </div>

          {/* 6. CHRONOLOGICAL HEALTH RECORDS (DIABETES & CARDIOVASCULAR) */}
          <div id="section-records" className="scroll-mt-20">
            <ClinicalCard accent="navy">
              <div className="space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-4">
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-[#12304A]">
                      {isBn
                        ? 'আপনার পূর্ববর্তী স্বাস্থ্য রেকর্ডসমূহ (Chronological History)'
                        : 'Saved Health Screening History'}
                    </h2>
                    <p className="text-xs text-[#64748B] mt-0.5">
                      {isBn
                        ? 'ডায়াবেটিস ও হৃদরোগ মূল্যায়নের কালানুক্রমিক তালিকা, ফলাফল এবং এআই ব্যাখ্যা।'
                        : 'Chronological history of your saved Diabetes and Cardiovascular assessments.'}
                    </p>
                  </div>

                  {/* Filter Pills */}
                  <div className="flex flex-wrap items-center gap-2">
                    {[
                      { id: 'ALL', label: isBn ? `সব (${measurements.length})` : `All (${measurements.length})` },
                      {
                        id: 'DIABETES',
                        label: isBn
                          ? `ডায়াবেটিস (${diabetesRecords.length})`
                          : `Diabetes (${diabetesRecords.length})`,
                      },
                      {
                        id: 'CARDIO',
                        label: isBn
                          ? `হৃদরোগ (${cardioRecords.length})`
                          : `Cardiovascular (${cardioRecords.length})`,
                      },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setHistoryFilter(tab.id)}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                          historyFilter === tab.id
                            ? 'bg-[#12304A] text-white'
                            : 'bg-[#F6F9FC] text-[#475569] hover:bg-[#E2E8F0]/60 border border-[#E2E8F0]'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                {filteredMeasurements.length === 0 ? (
                  <EmptyState
                    icon={FileText}
                    title={
                      isBn ? 'কোনো স্বাস্থ্য রেকর্ড পাওয়া যায়নি' : 'No Assessment Records Found'
                    }
                    description={
                      isBn
                        ? 'আপনার প্রথম ডায়াবেটিস বা হৃদরোগ মূল্যায়ন সম্পন্ন করলে তা এখানে সংরক্ষিত হবে।'
                        : 'Complete a Diabetes or Cardiovascular screening assessment to save records to your chronological history.'
                    }
                    actionLabel={isBn ? 'মূল্যায়ন শুরু করুন' : 'Start Assessment'}
                    onAction={() => navigate('/assessment')}
                  />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs sm:text-sm border-collapse">
                      <thead>
                        <tr className="border-b border-[#E2E8F0] text-[#64748B] font-bold text-[11px] uppercase bg-[#F6F9FC]">
                          <th className="py-3 px-3.5">{isBn ? 'আইডি' : 'ID'}</th>
                          <th className="py-3 px-3.5">{isBn ? 'ধরন' : 'Type'}</th>
                          <th className="py-3 px-3.5">{isBn ? 'তারিখ' : 'Date'}</th>
                          <th className="py-3 px-3.5">{isBn ? 'ঝুঁকির স্তর' : 'Risk Status'}</th>
                          <th className="py-3 px-3.5">{isBn ? 'মডেল স্কোর' : 'Model Score'}</th>
                          <th className="py-3 px-3.5 text-right">{isBn ? 'রিপোর্ট' : 'Report'}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E2E8F0]">
                        {filteredMeasurements.map((record, idx) => (
                          <tr key={`${record.type}-${record.id || idx}`} className="hover:bg-[#F6F9FC] transition">
                            <td className="py-3.5 px-3.5 font-mono text-xs text-[#64748B]">
                              #{record.id || idx + 1}
                            </td>
                            <td className="py-3.5 px-3.5 font-bold text-[#12304A]">
                              {record.type || 'Assessment'}
                            </td>
                            <td className="py-3.5 px-3.5 text-[#475569] font-mono text-xs whitespace-nowrap">
                              {record.date || record.created_at}
                            </td>
                            <td className="py-3.5 px-3.5">
                              <StatusBadge
                                status={record.risk_level || record.risk_classification || 'Low Risk'}
                                size="sm"
                              />
                            </td>
                            <td className="py-3.5 px-3.5 font-mono font-bold tabular-nums text-[#12304A]">
                              {record.probability !== undefined && record.probability !== null
                                ? `${record.probability}%`
                                : record.risk_probability_percentage !== undefined
                                ? `${record.risk_probability_percentage}%`
                                : '—'}
                            </td>
                            <td className="py-3.5 px-3.5 text-right whitespace-nowrap">
                              <MedicalButton
                                variant="ghost"
                                size="sm"
                                onClick={() => handleOpenStory(record)}
                                leftIcon={<Eye className="w-3.5 h-3.5" />}
                              >
                                {isBn ? 'রিপোর্ট দেখুন' : 'View Report'}
                              </MedicalButton>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </ClinicalCard>
          </div>

          {/* 7. HEALTH EDUCATION & PUBLIC DOCTOR NOTICES */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ClinicalCard accent="navy" className="flex flex-col justify-between">
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 text-[#0D9488] text-xs font-bold uppercase tracking-wider">
                  <BookOpen className="w-4 h-4" aria-hidden="true" />
                  <span>{isBn ? 'স্বাস্থ্য শিক্ষা ও প্রতিরোধ' : 'Health Education & Prevention'}</span>
                </div>
                <h3 className="text-base font-bold text-[#12304A]">
                  {isBn
                    ? 'ডায়াবেটিস, রক্তচাপ ও হৃদরোগ প্রতিরোধের গাইডলাইন'
                    : 'Bangladesh Health Education & Prevention Hub'}
                </h3>
                <p className="text-xs text-[#475569] leading-relaxed">
                  {isBn
                    ? 'সুষম খাদ্য, নিয়মিত হাঁটাচলা, রক্তচাপ নিয়ন্ত্রণ এবং কখন দ্রুত চিকিৎসকের কাছে যেতে হবে সে সম্পর্কে নির্ভরযোগ্য তথ্য জানুন।'
                    : 'Read practical guidance on blood sugar control, salt reduction, physical activity, and warning signs requiring medical care.'}
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-[#E2E8F0]">
                <Link
                  to="/awareness"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0D9488] hover:text-[#0F766E]"
                >
                  <span>{isBn ? 'স্বাস্থ্য শিক্ষা পাতায় যান →' : 'Explore Health Education →'}</span>
                </Link>
              </div>
            </ClinicalCard>

            <ClinicalCard accent="teal" className="flex flex-col justify-between">
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 text-[#0D9488] text-xs font-bold uppercase tracking-wider">
                  <Stethoscope className="w-4 h-4" aria-hidden="true" />
                  <span>{isBn ? 'ডাক্তারদের জনস্বাস্থ্য নোটিশ' : 'Doctor Public Health Notices'}</span>
                </div>
                <h3 className="text-base font-bold text-[#12304A]">
                  {isBn ? 'অনুমোদিত ডাক্তারদের স্বাস্থ্য বার্তা ও প্রশ্নোত্তর' : 'Verified Doctor Health Notices'}
                </h3>
                <p className="text-xs text-[#475569] leading-relaxed">{t('replyPublic')}</p>
              </div>
              <div className="pt-4 mt-4 border-t border-[#E2E8F0]">
                <Link
                  to="/notices"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0D9488] hover:text-[#0F766E]"
                >
                  <span>{isBn ? 'নোটিশ বোর্ড খুলুন →' : 'Open Doctor Notices →'}</span>
                </Link>
              </div>
            </ClinicalCard>
          </div>
        </>
      )}

      {/* STORY / REPORT MODAL */}
      {isModalOpen && selectedRecord && (
        <StoryModal
          isOpen={isModalOpen}
          record={selectedRecord}
          onClose={handleCloseStory}
        />
      )}

      {/* TWO-STEP DESTRUCTIVE DELETE CONFIRMATION MODAL */}
      <AccessibleModal
        isOpen={deleteModalOpen}
        onClose={closeDeleteModal}
        title={isBn ? 'ডেটা মুছে ফেলার অনুরোধ' : 'Deletion request'}
        subtitle={
          isBn
            ? 'নিজের ইউজারনেম লিখে নিশ্চিত করুন। কী মুছবে ও কী থাকবে, তা নিচে লেখা আছে।'
            : 'Type your username to confirm. The note below says what is deleted and what remains.'
        }
        size="md"
        footer={
          <>
            <MedicalButton variant="outline" size="sm" onClick={closeDeleteModal}>
              {deleteReceipt ? (isBn ? 'বন্ধ করুন' : 'Close') : (isBn ? 'বাতিল করুন' : 'Cancel')}
            </MedicalButton>
            {!deleteReceipt && (
              <MedicalButton variant="danger" size="sm" loading={deleting} onClick={handleConfirmDeleteData}>
                {isBn ? 'মুছে ফেলুন' : 'Delete'}
              </MedicalButton>
            )}
          </>
        }
      >
        {deleteReceipt ? (
          <div className="space-y-3 text-sm text-[#334155]">
            <p className="font-semibold text-[#12304A]">
              {isBn ? 'যা মুছেছে' : 'Deleted'}
            </p>
            <ul className="list-disc pl-5 space-y-1">
              {Object.entries(deleteReceipt.deleted || {}).map(([key, value]) => (
                <li key={key}>{key}: {value}</li>
              ))}
            </ul>
            <p className="font-semibold text-[#12304A]">{isBn ? 'যা থেকে গেছে' : 'Still kept'}</p>
            <ul className="list-disc pl-5 space-y-1">
              {(deleteReceipt.retained || []).map((item) => (
                <li key={item.code}>{isBn ? item.bn : item.en}</li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="space-y-3 text-sm text-[#334155]">
            <p>
              {isBn
                ? 'স্ক্রিনিং, অ্যাপয়েন্টমেন্ট, ডাক্তারের নোট, রক্তদাতা শেয়ার ও সম্মতির রেকর্ড মুছবে। নাম-ইমেইলসহ অডিট বিবরণ লাল করবে। কম্পিউটারের ব্যাকআপ ফাইল মুছবে না।'
                : 'This deletes screenings, appointments, doctor notes, donor sharing, and consent records. Audit text is redacted. File backups on the computer are not deleted.'}
            </p>
            <label className="block space-y-1">
              <span className="text-xs font-semibold">{isBn ? 'কতটুকু মুছবেন' : 'How much to delete'}</span>
              <select
                value={deleteScope}
                onChange={(e) => setDeleteScope(e.target.value)}
                className="w-full min-h-[44px] rounded-xl border border-[#E2E8F0] px-3"
              >
                <option value="screening">{isBn ? 'স্ক্রিনিং ডেটা, অ্যাকাউন্ট থাকবে' : 'Screening data, keep the account'}</option>
                <option value="account">{isBn ? 'অ্যাকাউন্টের নামও মুছুন' : 'Also clear the account name'}</option>
              </select>
            </label>
            <label className="block space-y-1">
              <span className="text-xs font-semibold">{isBn ? 'ইউজারনেম' : 'Username'}</span>
              <input
                value={confirmUsername}
                onChange={(e) => setConfirmUsername(e.target.value)}
                autoComplete="username"
                className="w-full min-h-[44px] rounded-xl border border-[#E2E8F0] px-3"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-xs font-semibold">{isBn ? 'পাসওয়ার্ড (Google অ্যাকাউন্টে খালি রাখুন)' : 'Password (leave blank for a Google account)'}</span>
              <input
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                autoComplete="current-password"
                className="w-full min-h-[44px] rounded-xl border border-[#E2E8F0] px-3"
              />
            </label>
            <MedicalButton
              variant="outline"
              size="sm"
              onClick={async () => {
                try {
                  await API.post('/api/patient/consent/withdraw');
                  setWithdrawNote(
                    isBn
                      ? 'সম্মতি প্রত্যাহার হয়েছে। নতুন স্ক্রিনিং চালাতে আবার সম্মতি দিতে হবে।'
                      : 'Consent is withdrawn. A new screening needs a new agreement.'
                  );
                } catch (err) {
                  setError(getApiError(err, 'Could not withdraw consent.'));
                }
              }}
            >
              {isBn ? 'শুধু সম্মতি প্রত্যাহার' : 'Withdraw consent only'}
            </MedicalButton>
            {withdrawNote && <p className="text-sm text-[#0F766E]">{withdrawNote}</p>}
          </div>
        )}
      </AccessibleModal>
    </PageContainer>
  );
}

export default Dashboard;
