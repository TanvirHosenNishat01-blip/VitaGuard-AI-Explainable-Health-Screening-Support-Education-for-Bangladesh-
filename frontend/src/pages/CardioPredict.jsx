import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2, RotateCcw } from 'lucide-react';
import API, { getApiError } from '../services/api';
import ResultCard from '../components/ResultCard';
import { getDashboardPath } from '../utils/roles';
import { useLanguage } from '../context/LanguageContext';
import PageContainer from '../components/ui/PageContainer';
import SectionHeader from '../components/ui/SectionHeader';
import ClinicalCard from '../components/ui/ClinicalCard';
import ClinicalInput from '../components/ui/ClinicalInput';
import ClinicalSelect from '../components/ui/ClinicalSelect';
import MedicalButton from '../components/ui/MedicalButton';
import StepProgress from '../components/ui/StepProgress';
import AlertBanner from '../components/ui/AlertBanner';

const STEPS = {
  en: [
    { id: 1, label: 'Basic Info', description: 'Age & recorded biological sex' },
    { id: 2, label: 'Medical History', description: 'Chest pain, fasting sugar & exercise angina' },
    { id: 3, label: 'Clinical Vitals', description: 'Resting BP, cholesterol, ECG & peak heart rate' },
    { id: 4, label: 'Risk Factors', description: 'ST depression, ST slope, vessels & thalassemia' },
    { id: 5, label: 'Review & Consent', description: 'Verify 13 cardiac inputs & run screening' },
  ],
  bn: [
    { id: 1, label: 'সাধারণ তথ্য', description: 'বয়স এবং লিপিবদ্ধ লিঙ্গ' },
    { id: 2, label: 'স্বাস্থ্য ইতিহাস', description: 'বুকের ব্যথা, ফাস্টিং সুগার ও অ্যাঞ্জাইনা' },
    { id: 3, label: 'ক্লিনিক্যাল পরিমাপ', description: 'রক্তচাপ, কোলেস্টেরল, ইসিজি ও হার্ট রেট' },
    { id: 4, label: 'ঝুঁকির সূচক', description: 'এসটি ডিপ্রেশন, ঢাল, নালী ও থ্যালাসেমিয়া কোড' },
    { id: 5, label: 'পর্যালোচনা ও সম্মতি', description: '১৩টি তথ্য যাচাই ও স্ক্রিনিং রান' },
  ],
};

function CardioPredict() {
  const [formData, setFormData] = useState({
    age: '',
    sex: '',
    cp: '',
    trestbps: '',
    chol: '',
    fbs: '',
    restecg: '',
    thalach: '',
    exang: '',
    oldpeak: '',
    slope: '',
    ca: '',
    thal: '',
  });
  const [step, setStep] = useState(1);
  const [fieldErrors, setFieldErrors] = useState({});
  const [result, setResult] = useState(null);
  const [shapPayload, setShapPayload] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [consent, setConsent] = useState(false);

  const { lang, t } = useLanguage();
  const isBn = lang === 'bn';
  const navigate = useNavigate();
  const isLoggedIn = Boolean(localStorage.getItem('token'));

  useEffect(() => {
    API.get('/api/shap-importance', { params: { model: 'cardio' } })
      .then((response) => setShapPayload(response.data))
      .catch(() => setShapPayload(null));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateStep = (targetStep) => {
    const errs = {};
    if (targetStep === 1) {
      const ageVal = Number(formData.age);
      if (formData.age === '' || Number.isNaN(ageVal) || !Number.isInteger(ageVal) || ageVal < 29 || ageVal > 77) {
        errs.age = isBn
          ? 'বয়স ২৯ থেকে ৭৭ বছরের মধ্যে পূর্ণসংখ্যা হতে হবে।'
          : 'Enter a whole number age between 29 and 77 years.';
      }
      if (formData.sex === '') {
        errs.sex = isBn ? 'অনুগ্রহ করে লিঙ্গ নির্বাচন করুন।' : 'Please select sex recorded in the table.';
      }
    } else if (targetStep === 2) {
      if (formData.cp === '') {
        errs.cp = isBn ? 'বুকের ব্যথার ধরন নির্বাচন করুন।' : 'Select chest pain type.';
      }
      if (formData.fbs === '') {
        errs.fbs = isBn ? 'খালি পেটে সুগারের তথ্য নির্বাচন করুন।' : 'Select fasting blood sugar status.';
      }
      if (formData.exang === '') {
        errs.exang = isBn ? 'ব্যায়ামে অ্যাঞ্জাইনার তথ্য নির্বাচন করুন।' : 'Select exercise-induced angina status.';
      }
    } else if (targetStep === 3) {
      const bpVal = Number(formData.trestbps);
      if (formData.trestbps === '' || Number.isNaN(bpVal) || bpVal < 94 || bpVal > 200) {
        errs.trestbps = isBn
          ? 'বিশ্রামের রক্তচাপ ৯৪ থেকে ২০০ mmHg এর মধ্যে হতে হবে।'
          : 'Resting blood pressure must be between 94 and 200 mmHg.';
      }
      const cholVal = Number(formData.chol);
      if (formData.chol === '' || Number.isNaN(cholVal) || cholVal < 126 || cholVal > 564) {
        errs.chol = isBn
          ? 'সিরাম কোলেস্টেরল ১২৬ থেকে ৫৬৪ mg/dL এর মধ্যে হতে হবে।'
          : 'Serum cholesterol must be between 126 and 564 mg/dL.';
      }
      const hrVal = Number(formData.thalach);
      if (formData.thalach === '' || Number.isNaN(hrVal) || hrVal < 71 || hrVal > 202) {
        errs.thalach = isBn
          ? 'সর্বোচ্চ হার্ট রেট ৭১ থেকে ২০২ bpm এর মধ্যে হতে হবে।'
          : 'Maximum heart rate must be between 71 and 202 bpm.';
      }
      if (formData.restecg === '') {
        errs.restecg = isBn ? 'বিশ্রামের ইসিজি ফলাফল নির্বাচন করুন।' : 'Select resting ECG result.';
      }
    } else if (targetStep === 4) {
      const stVal = Number(formData.oldpeak);
      if (formData.oldpeak === '' || Number.isNaN(stVal) || stVal < 0 || stVal > 6.2) {
        errs.oldpeak = isBn
          ? 'এসটি ডিপ্রেশন ০ থেকে ৬.২ এর মধ্যে হতে হবে।'
          : 'ST depression (oldpeak) must be between 0 and 6.2.';
      }
      if (formData.slope === '') {
        errs.slope = isBn ? 'এসটি সেগমেন্টের ঢাল নির্বাচন করুন।' : 'Select peak exercise ST slope.';
      }
      if (formData.ca === '') {
        errs.ca = isBn ? 'প্রধান নালীর সংখ্যা নির্বাচন করুন।' : 'Select number of major vessels (0–3).';
      }
      if (formData.thal === '') {
        errs.thal = isBn ? 'থ্যালাসেমিয়া কোড নির্বাচন করুন।' : 'Select thalassemia code.';
      }
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((prev) => Math.min(prev + 1, 5));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    setFieldErrors({});
    setStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    for (let s = 1; s <= 4; s += 1) {
      if (!validateStep(s)) {
        setStep(s);
        return;
      }
    }
    setError('');
    setLoading(true);

    const formattedData = {
      age: Number(formData.age),
      sex: Number(formData.sex),
      cp: Number(formData.cp),
      trestbps: Number(formData.trestbps),
      chol: Number(formData.chol),
      fbs: Number(formData.fbs),
      restecg: Number(formData.restecg),
      thalach: Number(formData.thalach),
      exang: Number(formData.exang),
      oldpeak: Number(formData.oldpeak),
      slope: Number(formData.slope),
      ca: Number(formData.ca),
      thal: Number(formData.thal),
      screening_consent: consent,
      consent_language: lang,
    };

    try {
      const response = await API.post('/api/predict/cardio', formattedData);
      setResult(response.data);
    } catch (err) {
      setError(getApiError(err, 'Failed to generate cardiovascular assessment. Please check your inputs.'));
    } finally {
      setLoading(false);
    }
  };

  const stepsList = STEPS[lang] || STEPS.en;

  return (
    <PageContainer className="max-w-4xl space-y-6 py-8">
      <SectionHeader
        badge={isBn ? 'হৃদরোগ ক্লিনিক্যাল উইজার্ড' : 'Cardiovascular Clinical Wizard'}
        title={t('heartTitle')}
        subtitle={t('heartLead')}
        actions={
          <MedicalButton
            variant="outline"
            size="sm"
            onClick={() => navigate(isLoggedIn ? getDashboardPath() : '/assessment')}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            {t('backDash')}
          </MedicalButton>
        }
      />

      <AlertBanner
        tone="warning"
        title={isBn ? 'ক্লিভল্যান্ড ক্লিনিক গবেষণা ডেটাসেট তথ্য' : 'Cleveland Clinic Cohort Disclosure'}
      >
        <p>{t('heartCohort')}</p>
      </AlertBanner>

      {!isLoggedIn && (
        <AlertBanner tone="info">
          <p>{t('guestSave')}</p>
        </AlertBanner>
      )}

      {error && (
        <AlertBanner
          tone="critical"
          title={isBn ? 'স্ক্রিনিং সম্পন্ন করা যায়নি' : 'Screening Error'}
        >
          <p>{error}</p>
        </AlertBanner>
      )}

      <StepProgress
        steps={stepsList}
        currentStep={step}
        label={isBn ? 'মূল্যায়ন অগ্রগতি' : 'Assessment Progress'}
      />

      <form onSubmit={handleSubmit} noValidate>
        <ClinicalCard accent="teal">
          {/* STEP 1: BASIC INFORMATION */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="border-b border-[#E2E8F0] pb-3">
                <h2 className="text-lg font-bold text-[#12304A]">
                  {isBn ? 'ধাপ ১: সাধারণ তথ্য (বয়স ও লিঙ্গ)' : 'Step 1: Basic Information'}
                </h2>
                <p className="text-xs text-[#64748B] mt-0.5">
                  {isBn
                    ? 'ক্লিভল্যান্ড ক্লিনিক গবেষণা টেবিল অনুযায়ী বয়স (২৯–৭৭) এবং লিঙ্গ নির্বাচন করুন।'
                    : 'Enter age (29–77 years) and biological sex recorded in the cardiac dataset.'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ClinicalInput
                  id="cardio-age"
                  name="age"
                  type="number"
                  inputMode="numeric"
                  required
                  min="29"
                  max="77"
                  label={t('ageLabel')}
                  unit={isBn ? 'বছর' : 'years'}
                  normalRange="29 – 77"
                  placeholder="e.g. 52"
                  value={formData.age}
                  onChange={handleChange}
                  helperText={
                    isBn
                      ? 'গবেষণা টেবিলের বয়সসীমা ২৯ থেকে ৭৭ বছর।'
                      : 'Allowed cohort age range: 29 to 77 years.'
                  }
                  error={fieldErrors.age}
                />

                <ClinicalSelect
                  id="cardio-sex"
                  name="sex"
                  required
                  label={t('heartSex')}
                  placeholder={t('choose')}
                  value={formData.sex}
                  onChange={handleChange}
                  options={[
                    { value: '0', label: t('sexFemaleCode') },
                    { value: '1', label: t('sexMaleCode') },
                  ]}
                  helperText={
                    isBn
                      ? 'গবেষণা টেবিলে নারী (0) বা পুরুষ (1) লিপিবদ্ধ রয়েছে।'
                      : 'Recorded biological sex code in the research table.'
                  }
                  error={fieldErrors.sex}
                />
              </div>
            </div>
          )}

          {/* STEP 2: MEDICAL HISTORY */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="border-b border-[#E2E8F0] pb-3">
                <h2 className="text-lg font-bold text-[#12304A]">
                  {isBn ? 'ধাপ ২: উপসর্গ ও স্বাস্থ্য ইতিহাস' : 'Step 2: Medical History & Symptoms'}
                </h2>
                <p className="text-xs text-[#64748B] mt-0.5">
                  {isBn
                    ? 'বুকের ব্যথার ধরন, খালি পেটে রক্তের চিনি এবং ব্যায়ামজনিত অ্যাঞ্জাইনার তথ্য দিন।'
                    : 'Select chest pain classification, fasting blood sugar status, and exercise-induced angina.'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ClinicalSelect
                  id="cardio-cp"
                  name="cp"
                  required
                  label={t('heartPain')}
                  placeholder={t('choose')}
                  value={formData.cp}
                  onChange={handleChange}
                  options={[
                    { value: '0', label: t('cp0') },
                    { value: '1', label: t('cp1') },
                    { value: '2', label: t('cp2') },
                    { value: '3', label: t('cp3') },
                  ]}
                  helperText={
                    isBn
                      ? 'কার্ডিয়াক রিপোর্ট অনুযায়ী বুকের ব্যথার শ্রেণি নির্বাচন করুন।'
                      : 'Select the chest pain category recorded on the clinical evaluation.'
                  }
                  error={fieldErrors.cp}
                />

                <ClinicalSelect
                  id="cardio-fbs"
                  name="fbs"
                  required
                  label={t('heartFbs')}
                  placeholder={t('choose')}
                  value={formData.fbs}
                  onChange={handleChange}
                  options={[
                    { value: '0', label: t('fbsNo') },
                    { value: '1', label: t('fbsYes') },
                  ]}
                  helperText={
                    isBn
                      ? 'খালি পেটে রক্তের গ্লুকোজ ১২০ mg/dL-এর বেশি কি না।'
                      : 'Whether fasting blood sugar exceeds 120 mg/dL.'
                  }
                  error={fieldErrors.fbs}
                />

                <ClinicalSelect
                  id="cardio-exang"
                  name="exang"
                  required
                  label={t('heartAngina')}
                  placeholder={t('choose')}
                  value={formData.exang}
                  onChange={handleChange}
                  options={[
                    { value: '0', label: t('answerNo') },
                    { value: '1', label: t('answerYes') },
                  ]}
                  helperText={
                    isBn
                      ? 'ব্যায়াম বা হাঁটাচলার সময় বুকে ব্যথা (অ্যাঞ্জাইনা) হয় কি না।'
                      : 'Whether physical exertion triggers angina chest pain.'
                  }
                  error={fieldErrors.exang}
                />
              </div>
            </div>
          )}

          {/* STEP 3: CLINICAL MEASUREMENTS */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="border-b border-[#E2E8F0] pb-3">
                <h2 className="text-lg font-bold text-[#12304A]">
                  {isBn ? 'ধাপ ৩: রক্তচাপ, কোলেস্টেরল, ইসিজি ও হার্ট রেট' : 'Step 3: Clinical Measurements'}
                </h2>
                <p className="text-xs text-[#64748B] mt-0.5">
                  {isBn
                    ? 'বিশ্রামের রক্তচাপ, সিরাম কোলেস্টেরল, সর্বোচ্চ হার্ট রেট এবং বিশ্রামের ইসিজি ফলাফল দিন।'
                    : 'Enter resting blood pressure, serum cholesterol, maximum heart rate achieved, and resting ECG.'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ClinicalInput
                  id="cardio-trestbps"
                  name="trestbps"
                  type="number"
                  inputMode="numeric"
                  required
                  min="94"
                  max="200"
                  label={t('heartBp')}
                  unit="mmHg"
                  normalRange="94 – 200 mmHg"
                  placeholder="e.g. 130"
                  value={formData.trestbps}
                  onChange={handleChange}
                  helperText={
                    isBn
                      ? 'বিশ্রামের সময় রক্তচাপ (সীমা: ৯৪ থেকে ২০০ mmHg)।'
                      : 'Resting systolic blood pressure on admission (94 to 200 mmHg).'
                  }
                  error={fieldErrors.trestbps}
                />

                <ClinicalInput
                  id="cardio-chol"
                  name="chol"
                  type="number"
                  inputMode="numeric"
                  required
                  min="126"
                  max="564"
                  label={t('heartChol')}
                  unit="mg/dL"
                  normalRange="126 – 564 mg/dL"
                  placeholder="e.g. 210"
                  value={formData.chol}
                  onChange={handleChange}
                  helperText={
                    isBn
                      ? 'সিরাম কোলেস্টেরল মাত্রা (সীমা: ১২৬ থেকে ৫৬৪ mg/dL)।'
                      : 'Serum total cholesterol in mg/dL (126 to 564 mg/dL).'
                  }
                  error={fieldErrors.chol}
                />

                <ClinicalInput
                  id="cardio-thalach"
                  name="thalach"
                  type="number"
                  inputMode="numeric"
                  required
                  min="71"
                  max="202"
                  label={t('heartRate')}
                  unit="bpm"
                  normalRange="71 – 202 bpm"
                  placeholder="e.g. 152"
                  value={formData.thalach}
                  onChange={handleChange}
                  helperText={
                    isBn
                      ? 'ব্যায়াম পরীক্ষায় অর্জিত সর্বোচ্চ হার্ট রেট (৭১ থেকে ২০২ bpm)।'
                      : 'Maximum heart rate achieved during exercise testing (71 to 202 bpm).'
                  }
                  error={fieldErrors.thalach}
                />

                <ClinicalSelect
                  id="cardio-restecg"
                  name="restecg"
                  required
                  label={t('heartEcg')}
                  placeholder={t('choose')}
                  value={formData.restecg}
                  onChange={handleChange}
                  options={[
                    { value: '0', label: t('ecg0') },
                    { value: '1', label: t('ecg1') },
                    { value: '2', label: t('ecg2') },
                  ]}
                  helperText={
                    isBn
                      ? 'বিশ্রামের ইসিজি রিপোর্টের ফলাফল নির্বাচন করুন।'
                      : 'Resting electrocardiographic findings.'
                  }
                  error={fieldErrors.restecg}
                />
              </div>
            </div>
          )}

          {/* STEP 4: RELEVANT RISK FACTORS */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="border-b border-[#E2E8F0] pb-3">
                <h2 className="text-lg font-bold text-[#12304A]">
                  {isBn ? 'ধাপ ৪: ইটিটি (ETT) ও ফ্লুরোস্কপি সূচক' : 'Step 4: Stress Test & Cardiac Risk Factors'}
                </h2>
                <p className="text-xs text-[#64748B] mt-0.5">
                  {isBn
                    ? 'হার্ট রিপোর্ট থেকে এসটি ডিপ্রেশন (Oldpeak), এসটি ঢাল, প্রধান নালী ও থ্যালাসেমিয়া কোড দিন।'
                    : 'Copy exercise ST depression, ST segment slope, fluoroscopy vessel count, and thalassemia code from your cardiac report.'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ClinicalInput
                  id="cardio-oldpeak"
                  name="oldpeak"
                  type="number"
                  step="any"
                  inputMode="decimal"
                  required
                  min="0"
                  max="6.2"
                  label={t('heartSt')}
                  normalRange="0 – 6.2"
                  placeholder="e.g. 1.2"
                  value={formData.oldpeak}
                  onChange={handleChange}
                  helperText={
                    isBn
                      ? 'বিশ্রামের তুলনায় ব্যায়ামজনিত এসটি ডিপ্রেশন (০ থেকে ৬.২)।'
                      : 'ST depression induced by exercise relative to rest (0 to 6.2).'
                  }
                  error={fieldErrors.oldpeak}
                />

                <ClinicalSelect
                  id="cardio-slope"
                  name="slope"
                  required
                  label={t('heartSlope')}
                  placeholder={t('choose')}
                  value={formData.slope}
                  onChange={handleChange}
                  options={[
                    { value: '0', label: t('slope0') },
                    { value: '1', label: t('slope1') },
                    { value: '2', label: t('slope2') },
                  ]}
                  helperText={
                    isBn
                      ? 'পিক এক্সারসাইজ এসটি সেগমেন্টের ঢাল।'
                      : 'Slope of the peak exercise ST segment.'
                  }
                  error={fieldErrors.slope}
                />

                <ClinicalSelect
                  id="cardio-ca"
                  name="ca"
                  required
                  label={t('heartVessels')}
                  placeholder={t('choose')}
                  value={formData.ca}
                  onChange={handleChange}
                  options={[0, 1, 2, 3].map((count) => ({
                    value: String(count),
                    label: `${count} ${t('vessels')}`,
                  }))}
                  helperText={
                    isBn
                      ? 'ফ্লুরোস্কপিতে দৃশ্যমান প্রধান রক্তনালীর সংখ্যা (০–৩)।'
                      : 'Number of major vessels (0–3) colored by fluoroscopy.'
                  }
                  error={fieldErrors.ca}
                />

                <ClinicalSelect
                  id="cardio-thal"
                  name="thal"
                  required
                  label={t('heartThal')}
                  placeholder={t('choose')}
                  value={formData.thal}
                  onChange={handleChange}
                  options={[
                    { value: '0', label: t('thal0') },
                    { value: '1', label: t('thal1') },
                    { value: '2', label: t('thal2') },
                  ]}
                  helperText={
                    isBn
                      ? 'টেবিল অনুযায়ী থ্যালাসেমিয়া/পারফিউশন কোড।'
                      : 'Thalassemia / myocardial perfusion defect code.'
                  }
                  error={fieldErrors.thal}
                />
              </div>
            </div>
          )}

          {/* STEP 5: REVIEW, CONSENT AND SUBMISSION */}
          {step === 5 && (
            <div className="space-y-6">
              <div className="border-b border-[#E2E8F0] pb-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-lg font-bold text-[#12304A]">
                    {isBn ? 'ধাপ ৫: ১৩টি কার্ডিয়াক তথ্য যাচাই ও সম্মতি' : 'Step 5: Review, Consent & Submission'}
                  </h2>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    {isBn
                      ? 'আপনার প্রদানকৃত ১৩টি কার্ডিয়াক সূচক যাচাই করুন এবং সম্মতি দিয়ে ফলাফল দেখুন।'
                      : 'Verify your 13 entered cardiac measurements below, confirm screening consent, and run the assessment.'}
                  </p>
                </div>
                <MedicalButton
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setStep(1)}
                  leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                >
                  {isBn ? 'শুরু থেকে সম্পাদনা' : 'Edit from Step 1'}
                </MedicalButton>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {[
                  { label: t('ageLabel'), val: `${formData.age} yrs`, s: 1 },
                  { label: t('heartSex'), val: formData.sex === '1' ? t('sexMaleCode') : t('sexFemaleCode'), s: 1 },
                  { label: t('heartPain'), val: `Code ${formData.cp}`, s: 2 },
                  { label: t('heartFbs'), val: formData.fbs === '1' ? t('answerYes') : t('answerNo'), s: 2 },
                  { label: t('heartAngina'), val: formData.exang === '1' ? t('answerYes') : t('answerNo'), s: 2 },
                  { label: t('heartBp'), val: `${formData.trestbps} mmHg`, s: 3 },
                  { label: t('heartChol'), val: `${formData.chol} mg/dL`, s: 3 },
                  { label: t('heartRate'), val: `${formData.thalach} bpm`, s: 3 },
                  { label: t('heartEcg'), val: `Code ${formData.restecg}`, s: 3 },
                  { label: t('heartSt'), val: formData.oldpeak, s: 4 },
                  { label: t('heartSlope'), val: `Code ${formData.slope}`, s: 4 },
                  { label: t('heartVessels'), val: `${formData.ca} ${t('vessels')}`, s: 4 },
                  { label: t('heartThal'), val: `Code ${formData.thal}`, s: 4 },
                ].map((item, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setStep(item.s)}
                    className="text-left p-3 rounded-xl bg-[#F6F9FC] hover:bg-[#F0FDFA] border border-[#E2E8F0] transition cursor-pointer"
                  >
                    <p className="text-[11px] font-semibold text-[#64748B] truncate">{item.label}</p>
                    <p className="text-sm font-bold font-mono text-[#12304A] mt-0.5">{item.val}</p>
                  </button>
                ))}
              </div>

              <label className="flex items-start gap-3 p-4 rounded-xl bg-[#F0FDFA] border border-[#99F6E4] text-sm text-[#12304A] cursor-pointer">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-1 w-4 h-4 accent-[#0D9488]"
                />
                <span className="leading-relaxed">
                  <span className="font-medium">{t('consentLabel')}</span>
                  <span className="block mt-1 text-xs text-[#475569]">{t('consentNote')}</span>
                </span>
              </label>
            </div>
          )}

          {/* WIZARD FOOTER NAVIGATION */}
          <div className="mt-8 pt-5 border-t border-[#E2E8F0] flex flex-wrap items-center justify-between gap-3">
            {step > 1 ? (
              <MedicalButton
                type="button"
                variant="outline"
                size="md"
                onClick={handlePrev}
                leftIcon={<ArrowLeft className="w-4 h-4" />}
              >
                {isBn ? 'পূর্ববর্তী ধাপ' : 'Previous Step'}
              </MedicalButton>
            ) : (
              <div />
            )}

            {step < 5 ? (
              <MedicalButton
                type="button"
                variant="primary"
                size="md"
                onClick={handleNext}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                {isBn ? 'পরবর্তী ধাপ' : 'Next Step'}
              </MedicalButton>
            ) : (
              <MedicalButton
                type="submit"
                variant="secondary"
                size="md"
                loading={loading}
                disabled={loading || !consent}
                leftIcon={<CheckCircle2 className="w-4 h-4" />}
              >
                {loading ? t('runningScreen') : t('runHeart')}
              </MedicalButton>
            )}
          </div>
        </ClinicalCard>
      </form>

      {result && (
        <ResultCard
          predictionResult={result}
          shapPayload={shapPayload}
          recordKind="heart"
        />
      )}
    </PageContainer>
  );
}

export default CardioPredict;
