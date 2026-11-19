import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2, Calculator, RotateCcw } from 'lucide-react';
import API, { getApiError } from '../services/api';
import ResultCard from '../components/ResultCard';
import { getDashboardPath } from '../utils/roles';
import { useLanguage } from '../context/LanguageContext';
import PageContainer from '../components/ui/PageContainer';
import SectionHeader from '../components/ui/SectionHeader';
import ClinicalCard from '../components/ui/ClinicalCard';
import ClinicalInput from '../components/ui/ClinicalInput';
import MedicalButton from '../components/ui/MedicalButton';
import StepProgress from '../components/ui/StepProgress';
import AlertBanner from '../components/ui/AlertBanner';

const STEPS = {
  en: [
    { id: 1, label: 'Basic Info', description: 'Age and Body Mass Index (BMI)' },
    { id: 2, label: 'Medical History', description: 'Pregnancy count & family pedigree score' },
    { id: 3, label: 'Clinical Vitals', description: 'Plasma glucose & diastolic blood pressure' },
    { id: 4, label: 'Risk Factors', description: 'Serum insulin & triceps skinfold thickness' },
    { id: 5, label: 'Review & Consent', description: 'Verify measurements & run screening' },
  ],
  bn: [
    { id: 1, label: 'সাধারণ তথ্য', description: 'বয়স এবং বিএমআই (BMI)' },
    { id: 2, label: 'স্বাস্থ্য ইতিহাস', description: 'গর্ভধারণের সংখ্যা ও পেডিগ্রি স্কোর' },
    { id: 3, label: 'ক্লিনিক্যাল পরিমাপ', description: 'রক্তের গ্লুকোজ ও ডায়াস্টোলিক রক্তচাপ' },
    { id: 4, label: 'ঝুঁকির সূচক', description: 'সিরাম ইনসুলিন ও স্কিন থিকনেস' },
    { id: 5, label: 'পর্যালোচনা ও সম্মতি', description: 'তথ্য যাচাই ও স্ক্রিনিং রান' },
  ],
};

function DiabetesPredict() {
  const [formData, setFormData] = useState({
    pregnancies: '',
    glucose: '',
    blood_pressure: '',
    skin_thickness: '',
    insulin: '',
    bmi: '',
    diabetes_pedigree: '',
    age: '',
  });
  const [step, setStep] = useState(1);
  const [fieldErrors, setFieldErrors] = useState({});
  const [showBmiCalc, setShowBmiCalc] = useState(false);
  const [calcHeightCm, setCalcHeightCm] = useState('');
  const [calcWeightKg, setCalcWeightKg] = useState('');

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
    API.get('/api/shap-importance', { params: { model: 'diabetes' } })
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

  const applyCalculatedBmi = () => {
    const h = Number(calcHeightCm);
    const w = Number(calcWeightKg);
    if (h > 50 && h < 260 && w > 20 && w < 300) {
      const computed = (w / ((h / 100) * (h / 100))).toFixed(1);
      setFormData((prev) => ({ ...prev, bmi: String(computed) }));
      setFieldErrors((prev) => ({ ...prev, bmi: '' }));
      setShowBmiCalc(false);
    }
  };

  const validateStep = (targetStep) => {
    const errs = {};
    if (targetStep === 1) {
      const ageVal = Number(formData.age);
      if (formData.age === '' || Number.isNaN(ageVal) || !Number.isInteger(ageVal) || ageVal < 21 || ageVal > 81) {
        errs.age = isBn
          ? 'বয়স ২১ থেকে ৮১ বছরের মধ্যে পূর্ণসংখ্যা হতে হবে।'
          : 'Enter a whole number age between 21 and 81 years.';
      }
      const bmiVal = Number(formData.bmi);
      if (formData.bmi === '' || Number.isNaN(bmiVal) || bmiVal < 18.2 || bmiVal > 67.1) {
        errs.bmi = isBn
          ? 'বিএমআই (BMI) ১৮.২ থেকে ৬৭.১ kg/m² এর মধ্যে হতে হবে।'
          : 'Enter a BMI value between 18.2 and 67.1 kg/m².';
      }
    } else if (targetStep === 2) {
      const pregVal = Number(formData.pregnancies);
      if (
        formData.pregnancies === '' ||
        Number.isNaN(pregVal) ||
        !Number.isInteger(pregVal) ||
        pregVal < 0 ||
        pregVal > 17
      ) {
        errs.pregnancies = isBn
          ? 'গর্ভধারণের সংখ্যা ০ থেকে ১৭ এর মধ্যে পূর্ণসংখ্যা দিন।'
          : 'Enter a whole number between 0 and 17.';
      }
      const pedVal = Number(formData.diabetes_pedigree);
      if (
        formData.diabetes_pedigree === '' ||
        Number.isNaN(pedVal) ||
        pedVal < 0.078 ||
        pedVal > 2.42
      ) {
        errs.diabetes_pedigree = isBn
          ? 'ডায়াবেটিস পেডিগ্রি স্কোর ০.০৭৮ থেকে ২.৪২ এর মধ্যে হতে হবে।'
          : 'Enter a diabetes pedigree score between 0.078 and 2.42.';
      }
    } else if (targetStep === 3) {
      const glucVal = Number(formData.glucose);
      if (formData.glucose === '' || Number.isNaN(glucVal) || glucVal < 44 || glucVal > 199) {
        errs.glucose = isBn
          ? 'গ্লুকোজের মাত্রা ৪৪ থেকে ১৯৯ mg/dL এর মধ্যে হতে হবে।'
          : 'Enter a plasma glucose value between 44 and 199 mg/dL.';
      }
      const bpVal = Number(formData.blood_pressure);
      if (formData.blood_pressure === '' || Number.isNaN(bpVal) || bpVal < 24 || bpVal > 122) {
        errs.blood_pressure = isBn
          ? 'ডায়াস্টোলিক রক্তচাপ ২৪ থেকে ১২২ mmHg এর মধ্যে হতে হবে।'
          : 'Enter a diastolic blood pressure between 24 and 122 mmHg.';
      }
    } else if (targetStep === 4) {
      const insVal = Number(formData.insulin);
      if (formData.insulin === '' || Number.isNaN(insVal) || insVal < 14 || insVal > 846) {
        errs.insulin = isBn
          ? 'ইনসুলিনের মাত্রা ১৪ থেকে ৮৪৬ mu U/mL এর মধ্যে হতে হবে।'
          : 'Enter a 2-hour serum insulin value between 14 and 846 mu U/mL.';
      }
      const skinVal = Number(formData.skin_thickness);
      if (formData.skin_thickness === '' || Number.isNaN(skinVal) || skinVal < 7 || skinVal > 99) {
        errs.skin_thickness = isBn
          ? 'স্কিন থিকনেস ৭ থেকে ৯৯ মিমি (mm) এর মধ্যে হতে হবে।'
          : 'Enter a triceps skinfold thickness between 7 and 99 mm.';
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

    // Backend PatientInputSchema expects PascalCase feature names
    const formattedData = {
      Pregnancies: Number(formData.pregnancies),
      Glucose: Number(formData.glucose),
      BloodPressure: Number(formData.blood_pressure),
      SkinThickness: Number(formData.skin_thickness),
      Insulin: Number(formData.insulin),
      BMI: Number(formData.bmi),
      DiabetesPedigreeFunction: Number(formData.diabetes_pedigree),
      Age: Number(formData.age),
      screening_consent: consent,
      consent_language: lang,
    };

    try {
      const response = await API.post('/api/predict', formattedData);
      setResult(response.data);
    } catch (err) {
      setError(getApiError(err, 'Failed to generate diabetes assessment. Please check your inputs.'));
    } finally {
      setLoading(false);
    }
  };

  const stepsList = STEPS[lang] || STEPS.en;

  return (
    <PageContainer className="max-w-4xl space-y-6 py-8">
      <SectionHeader
        badge={isBn ? 'পিমা গবেষণা টেবিল' : 'Pima research table'}
        title={t('diabetesTitle')}
        subtitle={t('diabetesLead')}
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

      <AlertBanner tone="info" title={isBn ? 'কেন এই স্ক্রিনিং রাখা হয়েছে' : 'Why this screening is kept'}>
        <p>
          {isBn
            ? 'DiaBD গ্লুকোজ, ইনসুলিন, স্কিন থিকনেস, গর্ভধারণের সংখ্যা বা পেডিগ্রি স্কোর নেয় না। এই আটটি সংখ্যা রিপোর্টে থাকলে এই পথ সেগুলো বিদ্যমান মডেলে পড়ে। সাইন ইন করলে ফল অ্যাকাউন্টে সেভ হতে পারে, পরে আলোচনার জন্য।'
            : 'DiaBD does not use glucose, insulin, skin thickness, pregnancy count, or the pedigree score. When a report already has these eight numbers, this pathway reads them with the existing model. A signed-in result can be saved on the account for a later conversation.'}
        </p>
      </AlertBanner>
      <AlertBanner tone="warning" title={t('screeningTitle')}>
        <p>{t('screeningBody')}</p>
        <p className="mt-2">{t('diabetesCohort')}</p>
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
        <ClinicalCard accent="navy">
          {/* STEP 1: BASIC INFORMATION */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="border-b border-[#E2E8F0] pb-3">
                <h2 className="text-lg font-bold text-[#12304A]">
                  {isBn ? 'ধাপ ১: সাধারণ শারীরিক তথ্য' : 'Step 1: Basic Information'}
                </h2>
                <p className="text-xs text-[#64748B] mt-0.5">
                  {isBn
                    ? 'আপনার সঠিক বয়স এবং শারীরিক ভর সূচক (BMI) লিখুন।'
                    : 'Enter your age and Body Mass Index (BMI) from your health record.'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ClinicalInput
                  id="diabetes-age"
                  name="age"
                  type="number"
                  inputMode="numeric"
                  required
                  min="21"
                  max="81"
                  label={t('ageLabel')}
                  unit={isBn ? 'বছর' : 'years'}
                  normalRange="21 – 81"
                  placeholder="e.g. 35"
                  value={formData.age}
                  onChange={handleChange}
                  helperText={
                    isBn
                      ? 'গবেষণা টেবিলের বয়সসীমা ২১ থেকে ৮১ বছর।'
                      : 'Research cohort range: 21 to 81 years (whole number).'
                  }
                  error={fieldErrors.age}
                />

                <div className="space-y-2">
                  <ClinicalInput
                    id="diabetes-bmi"
                    name="bmi"
                    type="number"
                    step="any"
                    inputMode="decimal"
                    required
                    min="18.2"
                    max="67.1"
                    label={t('bmiLabel')}
                    unit="kg/m²"
                    normalRange="18.5 – 24.9"
                    placeholder="e.g. 24.8"
                    value={formData.bmi}
                    onChange={handleChange}
                    helperText={
                      isBn
                        ? 'গ্রহণযোগ্য সীমা: ১৮.২ থেকে ৬৭.১ kg/m²।'
                        : 'Allowed table range: 18.2 to 67.1 kg/m².'
                    }
                    error={fieldErrors.bmi}
                  />
                  <button
                    type="button"
                    onClick={() => setShowBmiCalc((v) => !v)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0D9488] hover:text-[#0F766E] cursor-pointer"
                  >
                    <Calculator className="w-3.5 h-3.5" />
                    <span>
                      {isBn
                        ? 'বিএমআই জানা নেই? উচ্চতা ও ওজন দিয়ে হিসাব করুন'
                        : 'Do not know your BMI? Calculate from height & weight'}
                    </span>
                  </button>
                </div>
              </div>

              {showBmiCalc && (
                <div className="p-4 rounded-xl bg-[#F0FDFA] border border-[#99F6E4] space-y-3">
                  <p className="text-xs font-bold text-[#0F766E]">
                    {isBn ? 'বিএমআই (BMI) ক্যালকুলেটর' : 'Quick BMI Helper'}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                    <ClinicalInput
                      label={isBn ? 'উচ্চতা (সেমি)' : 'Height (cm)'}
                      type="number"
                      inputMode="decimal"
                      placeholder="165"
                      value={calcHeightCm}
                      onChange={(e) => setCalcHeightCm(e.target.value)}
                    />
                    <ClinicalInput
                      label={isBn ? 'ওজন (কেজি)' : 'Weight (kg)'}
                      type="number"
                      inputMode="decimal"
                      placeholder="68"
                      value={calcWeightKg}
                      onChange={(e) => setCalcWeightKg(e.target.value)}
                    />
                    <MedicalButton
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={applyCalculatedBmi}
                    >
                      {isBn ? 'বিএমআই বসান' : 'Apply BMI'}
                    </MedicalButton>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: MEDICAL HISTORY */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="border-b border-[#E2E8F0] pb-3">
                <h2 className="text-lg font-bold text-[#12304A]">
                  {isBn ? 'ধাপ ২: পারিবারিক ও মাতৃত্বকালীন ইতিহাস' : 'Step 2: Medical & Family History'}
                </h2>
                <p className="text-xs text-[#64748B] mt-0.5">
                  {isBn
                    ? 'পিমা গবেষণা টেবিল অনুযায়ী গর্ভধারণের সংখ্যা এবং ডায়াবেটিস পেডিগ্রি স্কোর দিন।'
                    : 'Enter pregnancy count and the diabetes family pedigree function score from your record.'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ClinicalInput
                  id="diabetes-pregnancies"
                  name="pregnancies"
                  type="number"
                  inputMode="numeric"
                  required
                  min="0"
                  max="17"
                  label={t('pregLabel')}
                  normalRange="0 – 17"
                  placeholder="e.g. 2"
                  value={formData.pregnancies}
                  onChange={handleChange}
                  helperText={
                    isBn
                      ? 'প্রযোজ্য না হলে ০ দিন (সীমা: ০ থেকে ১৭)।'
                      : 'Enter 0 if not applicable (allowed table range: 0 to 17).'
                  }
                  error={fieldErrors.pregnancies}
                />

                <ClinicalInput
                  id="diabetes-pedigree"
                  name="diabetes_pedigree"
                  type="number"
                  step="any"
                  inputMode="decimal"
                  required
                  min="0.078"
                  max="2.42"
                  label={t('pedigreeLabel')}
                  normalRange="0.078 – 2.42"
                  placeholder="e.g. 0.47"
                  value={formData.diabetes_pedigree}
                  onChange={handleChange}
                  helperText={
                    isBn
                      ? 'গবেষণা পেডিগ্রি স্কোর (০.০৭৮ থেকে ২.৪২)। এই স্কোর না থাকলে বাংলাদেশ নন-ইনভেসিভ পাতা ব্যবহার করুন।'
                      : 'Research pedigree score (0.078 to 2.42). If unavailable, use the Bangladesh Non-Invasive page.'
                  }
                  error={fieldErrors.diabetes_pedigree}
                />
              </div>
            </div>
          )}

          {/* STEP 3: CLINICAL MEASUREMENTS */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="border-b border-[#E2E8F0] pb-3">
                <h2 className="text-lg font-bold text-[#12304A]">
                  {isBn ? 'ধাপ ৩: রক্তের গ্লুকোজ ও রক্তচাপ পরিমাপ' : 'Step 3: Clinical Measurements'}
                </h2>
                <p className="text-xs text-[#64748B] mt-0.5">
                  {isBn
                    ? 'আপনার ল্যাবরেটরি রিপোর্ট বা প্রেশার মেশিন থেকে গ্লুকোজ এবং নিচের (ডায়াস্টোলিক) রক্তচাপ লিখুন।'
                    : 'Enter plasma glucose concentration and diastolic blood pressure.'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ClinicalInput
                  id="diabetes-glucose"
                  name="glucose"
                  type="number"
                  inputMode="numeric"
                  required
                  min="44"
                  max="199"
                  label={t('glucoseLabel')}
                  unit="mg/dL"
                  normalRange="70 – 99 mg/dL"
                  placeholder="e.g. 118"
                  value={formData.glucose}
                  onChange={handleChange}
                  helperText={
                    isBn
                      ? 'ওরাল গ্লুকোজ টলারেন্স টেস্টের ২ ঘণ্টার প্লাজমা গ্লুকোজ (৪৪ থেকে ১৯৯ mg/dL)।'
                      : '2-hour plasma glucose concentration in an OGTT (allowed: 44 to 199 mg/dL).'
                  }
                  error={fieldErrors.glucose}
                />

                <ClinicalInput
                  id="diabetes-bp"
                  name="blood_pressure"
                  type="number"
                  inputMode="numeric"
                  required
                  min="24"
                  max="122"
                  label={t('bpLabel')}
                  unit="mmHg"
                  normalRange="60 – 80 mmHg"
                  placeholder="e.g. 76"
                  value={formData.blood_pressure}
                  onChange={handleChange}
                  helperText={
                    isBn
                      ? 'রক্তচাপের নিচের মাত্রা / ডায়াস্টোলিক প্রেশার (২৪ থেকে ১২২ mmHg)।'
                      : 'Diastolic blood pressure — the lower blood pressure reading (24 to 122 mmHg).'
                  }
                  error={fieldErrors.blood_pressure}
                />
              </div>
            </div>
          )}

          {/* STEP 4: RELEVANT RISK FACTORS */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="border-b border-[#E2E8F0] pb-3">
                <h2 className="text-lg font-bold text-[#12304A]">
                  {isBn ? 'ধাপ ৪: ইনসুলিন ও স্কিন থিকনেস সূচক' : 'Step 4: Metabolic Risk Factors'}
                </h2>
                <p className="text-xs text-[#64748B] mt-0.5">
                  {isBn
                    ? 'ল্যাব রিপোর্ট থেকে সিরাম ইনসুলিন এবং ট্রাইসেপস স্কিনফোল্ড থিকনেস লিখুন।'
                    : 'Enter 2-hour serum insulin and triceps skinfold thickness measurements.'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ClinicalInput
                  id="diabetes-insulin"
                  name="insulin"
                  type="number"
                  inputMode="numeric"
                  required
                  min="14"
                  max="846"
                  label={t('insulinLabel')}
                  unit="mu U/mL"
                  normalRange="14 – 846"
                  placeholder="e.g. 95"
                  value={formData.insulin}
                  onChange={handleChange}
                  helperText={
                    isBn
                      ? '২-ঘণ্টার সিরাম ইনসুলিন (১৪ থেকে ৮৪৬ mu U/mL)।'
                      : '2-hour serum insulin level (allowed table range: 14 to 846 mu U/mL).'
                  }
                  error={fieldErrors.insulin}
                />

                <ClinicalInput
                  id="diabetes-skin"
                  name="skin_thickness"
                  type="number"
                  inputMode="numeric"
                  required
                  min="7"
                  max="99"
                  label={t('skinLabel')}
                  unit="mm"
                  normalRange="7 – 99 mm"
                  placeholder="e.g. 23"
                  value={formData.skin_thickness}
                  onChange={handleChange}
                  helperText={
                    isBn
                      ? 'ট্রাইসেপস স্কিনফোল্ড থিকনেস (৭ থেকে ৯৯ মিমি)।'
                      : 'Triceps skinfold thickness (allowed table range: 7 to 99 mm).'
                  }
                  error={fieldErrors.skin_thickness}
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
                    {isBn ? 'ধাপ ৫: তথ্য যাচাই, সম্মতি ও সাবমিশন' : 'Step 5: Review, Consent & Submission'}
                  </h2>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    {isBn
                      ? 'আপনার প্রদানকৃত ৮টি ক্লিনিক্যাল পরিমাপ যাচাই করুন এবং সম্মতি দিয়ে ফলাফল দেখুন।'
                      : 'Review your 8 entered measurements below, confirm screening consent, and run the assessment.'}
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

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: t('ageLabel'), val: `${formData.age} yrs`, s: 1 },
                  { label: t('bmiLabel'), val: `${formData.bmi} kg/m²`, s: 1 },
                  { label: t('pregLabel'), val: formData.pregnancies, s: 2 },
                  { label: t('pedigreeLabel'), val: formData.diabetes_pedigree, s: 2 },
                  { label: t('glucoseLabel'), val: `${formData.glucose} mg/dL`, s: 3 },
                  { label: t('bpLabel'), val: `${formData.blood_pressure} mmHg`, s: 3 },
                  { label: t('insulinLabel'), val: `${formData.insulin} mu U/mL`, s: 4 },
                  { label: t('skinLabel'), val: `${formData.skin_thickness} mm`, s: 4 },
                ].map((item, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setStep(item.s)}
                    className="text-left p-3.5 rounded-xl bg-[#F6F9FC] hover:bg-[#F0F5FA] border border-[#E2E8F0] transition cursor-pointer"
                  >
                    <p className="text-[11px] font-semibold text-[#64748B] truncate">{item.label}</p>
                    <p className="text-sm font-bold font-mono text-[#12304A] mt-1">{item.val}</p>
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
                {loading ? t('runningScreen') : t('runDiabetes')}
              </MedicalButton>
            )}
          </div>
        </ClinicalCard>
      </form>

      {result && (
        <ResultCard
          predictionResult={result}
          shapPayload={shapPayload}
          recordKind="diabetes"
        />
      )}
    </PageContainer>
  );
}

export default DiabetesPredict;
