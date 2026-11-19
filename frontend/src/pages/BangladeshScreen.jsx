import React, { useState } from 'react';

import { Printer, Activity, HeartPulse, AlertTriangle } from 'lucide-react';

import API, { getApiError } from '../services/api';

import ShapChart from '../components/ShapChart';

import { useLanguage } from '../context/LanguageContext';

import PageContainer from '../components/ui/PageContainer';

import SectionHeader from '../components/ui/SectionHeader';

import ClinicalCard from '../components/ui/ClinicalCard';

import ClinicalInput from '../components/ui/ClinicalInput';

import ClinicalSelect from '../components/ui/ClinicalSelect';

import StatusBadge from '../components/ui/StatusBadge';

import MedicalButton from '../components/ui/MedicalButton';

import AlertBanner from '../components/ui/AlertBanner';



const TONE = {

  high: {

    shell: 'bg-[#FEF2F2] border-[#FECACA]',

    title: 'text-[#991B1B]',

    bar: 'bg-[#DC2626]',

  },

  moderate: {

    shell: 'bg-[#FFFBEB] border-[#FDE68A]',

    title: 'text-[#92400E]',

    bar: 'bg-[#D97706]',

  },

  low: {

    shell: 'bg-[#F0FDF4] border-[#BBF7D0]',

    title: 'text-[#15803D]',

    bar: 'bg-[#15803D]',

  },

};



const FEATURE_KEY = {

  age: 'ageLabel',

  sex: 'bdSex',

  bmi: 'bdBmi',

  systolic_bp: 'bdSystolic',

  diastolic_bp: 'bdDiastolic',

  family_diabetes: 'bdFamily',

  pulse_pressure: 'bdGap',

  high_bp: 'bdHighBp',

};



function chartTone(band) {

  if (band === 'under_5' || band === '5_to_10') return 'low';

  if (band === '10_to_20') return 'moderate';

  return 'high';

}



function riskLabel(key, t) {

  if (key === 'high') return t('bdRiskHigh');

  if (key === 'moderate') return t('bdRiskModerate');

  return t('bdRiskLow');

}



function BangladeshScreen() {

  const { lang, t } = useLanguage();

  const isBn = lang === 'bn';

  const [diabetes, setDiabetes] = useState({

    age: '',

    sex: '',

    bmi: '',

    systolic_bp: '',

    diastolic_bp: '',

    family_diabetes: '',

    consent: false,

  });

  const [cvd, setCvd] = useState({

    age: '',

    sex: '',

    smoker: '',

    systolic_bp: '',

    bmi: '',

    prior_cvd: '',

    consent: false,

  });

  const [diabetesResult, setDiabetesResult] = useState(null);

  const [cvdResult, setCvdResult] = useState(null);

  const [diabetesError, setDiabetesError] = useState('');

  const [cvdError, setCvdError] = useState('');

  const [diabetesLoading, setDiabetesLoading] = useState(false);

  const [cvdLoading, setCvdLoading] = useState(false);



  const pressureClash =

    diabetes.systolic_bp !== '' &&

    diabetes.diastolic_bp !== '' &&

    Number(diabetes.diastolic_bp) >= Number(diabetes.systolic_bp);

  const priorStopsChart = cvd.prior_cvd === '1';



  const editDiabetes = (patch) => {

    setDiabetes((current) => ({ ...current, ...patch }));

    setDiabetesResult(null);

  };



  const editCvd = (patch) => {

    setCvd((current) => ({ ...current, ...patch }));

    setCvdResult(null);

  };



  const runDiabetes = async (event) => {

    event.preventDefault();

    setDiabetesError('');

    setDiabetesResult(null);

    if (pressureClash) {

      setDiabetesError(t('bdBpOrder'));

      return;

    }

    setDiabetesLoading(true);

    try {

      const response = await API.post('/api/bangladesh/diabetes', {

        age: Number(diabetes.age),

        sex: diabetes.sex,

        bmi: Number(diabetes.bmi),

        systolic_bp: Number(diabetes.systolic_bp),

        diastolic_bp: Number(diabetes.diastolic_bp),

        family_diabetes: Number(diabetes.family_diabetes),

        screening_consent: diabetes.consent,
        consent_language: lang,

      });

      setDiabetesResult(response.data);

    } catch (err) {

      setDiabetesError(getApiError(err, 'The screening did not run.'));

    } finally {

      setDiabetesLoading(false);

    }

  };



  const runCvd = async (event) => {

    event.preventDefault();

    setCvdError('');

    setCvdResult(null);

    if (priorStopsChart) {

      setCvdError(t('bdPriorStop'));

      return;

    }

    setCvdLoading(true);

    try {

      const response = await API.post('/api/bangladesh/cvd', {

        age: Number(cvd.age),

        sex: cvd.sex,

        smoker: Number(cvd.smoker),

        systolic_bp: Number(cvd.systolic_bp),

        bmi: Number(cvd.bmi),

        prior_cvd: Number(cvd.prior_cvd),

        screening_consent: cvd.consent,
        consent_language: lang,

      });

      setCvdResult(response.data);

    } catch (err) {

      setCvdError(getApiError(err, 'The chart did not run.'));

    } finally {

      setCvdLoading(false);

    }

  };



  const diabetesToneKey = diabetesResult?.risk_key || 'low';

  const diabetesTone = TONE[diabetesToneKey] || TONE.low;

  const heartToneKey = chartTone(cvdResult?.band);

  const heartTone = TONE[heartToneKey] || TONE.low;

  const shapFeatures = (diabetesResult?.shap || []).map((item) => ({

    ...item,

    feature: t(FEATURE_KEY[item.feature] || item.feature),

  }));



  return (

    <PageContainer className="space-y-6 py-8">

      <SectionHeader

        badge={isBn ? 'বাংলাদেশ নন-ইনভেসিভ স্ক্রিনিং' : 'Bangladesh Non-Invasive Screening'}

        title={t('bdTitle')}

        subtitle={t('bdLead')}

      />



      <AlertBanner tone="warning" title={t('bdOneLine')}>

        <p>{t('bdNotSaved')}</p>

      </AlertBanner>



      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

        {/* BANGLADESH DIABD DIABETES FORM */}

        <ClinicalCard accent="navy">

          <form onSubmit={runDiabetes} className="space-y-5">

            <div className="flex items-start justify-between gap-3 border-b border-[#E2E8F0] pb-4">

              <div className="space-y-1">

                <div className="flex items-center gap-2">

                  <Activity className="w-5 h-5 text-[#0D9488]" aria-hidden="true" />

                  <h2 className="text-lg font-bold text-[#12304A]">{t('bdDiabetesTitle')}</h2>

                </div>

                <p className="text-xs text-[#64748B] leading-relaxed">{t('bdDiabetesLimit')}</p>

              </div>

              <StatusBadge tone="info" size="sm" label="DiaBD · TreeSHAP" />

            </div>



            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <ClinicalInput

                id="bd-diab-age"

                label={t('ageLabel')}

                type="number"

                inputMode="numeric"

                required

                min="21"

                max="80"

                unit={t('bdUnitYear')}

                normalRange="21 – 80"

                placeholder="21–80"

                value={diabetes.age}

                onChange={(e) => editDiabetes({ age: e.target.value })}

                helperText={t('bdHintAge')}

              />



              <ClinicalSelect

                id="bd-diab-sex"

                label={t('bdSex')}

                required

                placeholder={t('genderSelect')}

                value={diabetes.sex}

                onChange={(e) => editDiabetes({ sex: e.target.value })}

                options={[

                  { value: 'female', label: t('genderFemale') },

                  { value: 'male', label: t('genderMale') },

                ]}

                helperText={t('bdHintSex')}

              />



              <ClinicalInput

                id="bd-diab-bmi"

                label={t('bdBmi')}

                type="number"

                inputMode="decimal"

                required

                min="14"

                max="45"

                step="0.1"

                unit="kg/m²"

                normalRange="18.5 – 24.9"

                placeholder="14–45"

                value={diabetes.bmi}

                onChange={(e) => editDiabetes({ bmi: e.target.value })}

                helperText={t('bdHintBmi')}

              />



              <ClinicalSelect

                id="bd-diab-family"

                label={t('bdFamily')}

                required

                placeholder={t('genderSelect')}

                value={diabetes.family_diabetes}

                onChange={(e) => editDiabetes({ family_diabetes: e.target.value })}

                options={[

                  { value: '0', label: t('bdNo') },

                  { value: '1', label: t('bdYes') },

                ]}

                helperText={t('bdHintFamily')}

              />



              <ClinicalInput

                id="bd-diab-sys"

                label={t('bdSystolic')}

                type="number"

                inputMode="numeric"

                required

                min="80"

                max="220"

                unit="mmHg"

                normalRange="80 – 220"

                placeholder="e.g. 120"

                value={diabetes.systolic_bp}

                onChange={(e) => editDiabetes({ systolic_bp: e.target.value })}

                helperText={t('bdHintSys')}

              />



              <ClinicalInput

                id="bd-diab-dia"

                label={t('bdDiastolic')}

                type="number"

                inputMode="numeric"

                required

                min="50"

                max="130"

                unit="mmHg"

                normalRange="50 – 130"

                placeholder="e.g. 80"

                value={diabetes.diastolic_bp}

                onChange={(e) => editDiabetes({ diastolic_bp: e.target.value })}

                helperText={t('bdHintDia')}

                error={pressureClash ? t('bdBpOrder') : ''}

              />

            </div>



            {(diabetes.systolic_bp || diabetes.bmi || diabetes.age) && (

              <div className="flex flex-wrap gap-2 text-xs">

                {diabetes.age && (

                  <span className="px-2.5 py-1 rounded-full bg-[#F0F5FA] text-[#12304A] font-medium">

                    {diabetes.age} {t('bdUnitYear')}

                  </span>

                )}

                {diabetes.bmi && (

                  <span className="px-2.5 py-1 rounded-full bg-[#F0F5FA] text-[#12304A] font-medium">

                    BMI {diabetes.bmi}

                  </span>

                )}

                {diabetes.systolic_bp && diabetes.diastolic_bp && (

                  <span className="px-2.5 py-1 rounded-full bg-[#F0F5FA] text-[#12304A] font-mono font-semibold">

                    BP {diabetes.systolic_bp}/{diabetes.diastolic_bp} mmHg

                  </span>

                )}

              </div>

            )}



            <label className="flex items-start gap-3 p-3.5 rounded-xl bg-[#F0FDFA] border border-[#99F6E4] text-sm text-[#12304A] cursor-pointer">

              <input

                type="checkbox"

                checked={diabetes.consent}

                onChange={(e) => setDiabetes({ ...diabetes, consent: e.target.checked })}

                className="mt-1 w-4 h-4 accent-[#0D9488]"

              />

              <span className="leading-relaxed">
                <span>{t('consentLabel')}</span>
                <span className="block mt-1 text-xs text-[#475569]">{t('consentNote')}</span>
              </span>

            </label>



            {diabetesError && (

              <AlertBanner tone="critical">

                <p>{diabetesError}</p>

              </AlertBanner>

            )}



            <MedicalButton

              type="submit"

              variant="primary"

              fullWidth

              loading={diabetesLoading}

              disabled={!diabetes.consent || diabetesLoading || pressureClash}

            >

              {diabetesLoading ? t('runningScreen') : t('bdRunDiabetes')}

            </MedicalButton>



            {diabetesResult && (

              <div

                role="region"

                aria-live="polite"

                className={`p-5 rounded-2xl border shadow-clinical-xs space-y-4 ${diabetesTone.shell}`}

              >

                <div className="flex flex-wrap items-center justify-between gap-3">

                  <div>

                    <p className="text-xs font-bold uppercase tracking-wider text-[#64748B]">

                      {t('bdScoreIndex')}

                    </p>

                    <p className={`text-3xl font-extrabold font-mono tabular-nums ${diabetesTone.title}`}>

                      {diabetesResult.screening_score_index ?? diabetesResult.probability_percent}%

                    </p>

                  </div>

                  <div className="text-right">

                    <p className="text-xs font-bold uppercase tracking-wider text-[#64748B] mb-1">

                      {t('bdScoreCategory')}

                    </p>

                    <StatusBadge

                      tone={diabetesToneKey}

                      label={riskLabel(diabetesResult.screening_risk_tier || diabetesResult.risk_key, t)}

                    />

                  </div>

                </div>



                <div className="h-2.5 bg-white rounded-full overflow-hidden border border-[#E2E8F0]">

                  <div

                    className={`h-full ${diabetesTone.bar}`}

                    style={{ width: `${Math.min(diabetesResult.screening_score_index ?? diabetesResult.probability_percent, 100)}%` }}

                  />

                </div>



                {/* Dedicated Clinical Calibration Notice */}

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-900 space-y-1.5">

                  <div className="flex items-center gap-1.5 font-bold text-amber-950">

                    <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" aria-hidden="true" />

                    <span>{isBn ? 'ক্লিনিক্যাল ক্যালিব্রেশন ও সংবেদনশীলতা সংক্রান্ত সতর্কতা' : 'Clinical Screening Calibration Notice'}</span>

                  </div>

                  <p className="leading-relaxed">

                    {t('bdCalibWarning')}

                  </p>

                  <p className="text-[11px] text-amber-800 leading-normal border-t border-amber-200/60 pt-1">

                    {isBn

                      ? 'মডেলটির সিদ্ধান্ত সীমা ৫০% (০.৫০ কাটঅফ) সংবেদনশীলতা সর্বোচ্চ রাখার উদ্দেশ্যে নির্ধারিত। উচ্চ স্কোর কোনো রোগনির্ণয় নয়, বরং রেজিস্টার্ড চিকিৎসকের মাধ্যমে FPG বা HbA1c পরীক্ষার সুপারিশ।'

                      : 'Threshold set at 50% (0.50 cutoff) to optimize sensitivity for population screening. Elevated scores indicate a recommendation for formal diagnostic lab evaluation, not an absolute disease probability.'}

                  </p>

                </div>



                <p className="text-xs font-semibold text-[#12304A]">

                  {(diabetesResult.flagged ? t('bdFlagYes') : t('bdFlagNo')).replace(

                    '{cutoff}',

                    diabetesResult.threshold_percent

                  )}

                </p>



                <p className="text-xs text-[#475569] leading-relaxed">

                  {diabetesResult.flagged ? t('bdExplainFlag') : t('bdExplainClear')}

                </p>



                <div className="bg-white border border-[#E2E8F0] rounded-xl p-4">

                  <ShapChart shapPayload={shapFeatures} title={t('bdShapTitle')} />

                  <p className="text-[11px] text-[#64748B] mt-2">

                    {isBn

                      ? 'ট্রি-SHAP বৈশিষ্ট্য অবদান: এই মানগুলো স্ক্রিনিং স্কোরে প্রতিটি পরিমাপের আপেক্ষিক অবদান নির্দেশ করে, যা সরাসরি রোগের চিকিৎসা কারণ নয়।'

                      : 'TreeSHAP attribution: Values reflect relative feature contributions to the screening score compared to baseline, not causal clinical etiologies.'}

                  </p>

                </div>



                <div className="flex justify-end">

                  <MedicalButton

                    type="button"

                    variant="outline"

                    size="sm"

                    onClick={() => window.print()}

                    leftIcon={<Printer className="w-3.5 h-3.5" />}

                  >

                    {isBn ? 'প্রিন্ট রিপোর্ট' : 'Print Summary'}

                  </MedicalButton>

                </div>

              </div>

            )}

          </form>

        </ClinicalCard>



        {/* WHO SOUTH ASIA NON-LABORATORY CVD CHART */}

        <ClinicalCard accent="teal">

          <form onSubmit={runCvd} className="space-y-5">

            <div className="flex items-start justify-between gap-3 border-b border-[#E2E8F0] pb-4">

              <div className="space-y-1">

                <div className="flex items-center gap-2">

                  <HeartPulse className="w-5 h-5 text-[#0D9488]" aria-hidden="true" />

                  <h2 className="text-lg font-bold text-[#12304A]">{t('bdCvdTitle')}</h2>

                </div>

                <p className="text-xs text-[#64748B] leading-relaxed">{t('bdCvdLimit')}</p>

              </div>

              <StatusBadge tone="moderate" size="sm" label="WHO South Asia" />

            </div>



            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <ClinicalInput

                id="bd-cvd-age"

                label={t('ageLabel')}

                type="number"

                inputMode="numeric"

                required

                min="40"

                max="74"

                unit={t('bdUnitYear')}

                normalRange="40 – 74"

                placeholder="40–74"

                value={cvd.age}

                onChange={(e) => editCvd({ age: e.target.value })}

                helperText={t('bdHintAgeChart')}

              />



              <ClinicalSelect

                id="bd-cvd-sex"

                label={t('heartSex')}

                required

                placeholder={t('genderSelect')}

                value={cvd.sex}

                onChange={(e) => editCvd({ sex: e.target.value })}

                options={[

                  { value: 'female', label: t('genderFemale') },

                  { value: 'male', label: t('genderMale') },

                ]}

                helperText={t('bdHintSexChart')}

              />



              <ClinicalSelect

                id="bd-cvd-smoke"

                label={t('bdSmoke')}

                required

                placeholder={t('genderSelect')}

                value={cvd.smoker}

                onChange={(e) => editCvd({ smoker: e.target.value })}

                options={[

                  { value: '0', label: t('bdNo') },

                  { value: '1', label: t('bdYes') },

                ]}

                helperText={t('bdHintSmoke')}

              />



              <ClinicalSelect

                id="bd-cvd-prior"

                label={t('bdPrior')}

                required

                placeholder={t('genderSelect')}

                value={cvd.prior_cvd}

                onChange={(e) => editCvd({ prior_cvd: e.target.value })}

                options={[

                  { value: '0', label: t('bdNo') },

                  { value: '1', label: t('bdYes') },

                ]}

                helperText={t('bdHintPrior')}

                error={priorStopsChart ? t('bdPriorStop') : ''}

              />



              <ClinicalInput

                id="bd-cvd-sys"

                label={t('bdSystolic')}

                type="number"

                inputMode="numeric"

                required

                min="70"

                max="250"

                unit="mmHg"

                normalRange="70 – 250"

                placeholder="70–250"

                value={cvd.systolic_bp}

                onChange={(e) => editCvd({ systolic_bp: e.target.value })}

                helperText={t('bdHintSysChart')}

              />



              <ClinicalInput

                id="bd-cvd-bmi"

                label={t('bdBmi')}

                type="number"

                inputMode="decimal"

                required

                min="14"

                max="60"

                step="0.1"

                unit="kg/m²"

                normalRange="18.5 – 24.9"

                placeholder="14–60"

                value={cvd.bmi}

                onChange={(e) => editCvd({ bmi: e.target.value })}

                helperText={t('bdHintBmiChart')}

              />

            </div>



            <label className="flex items-start gap-3 p-3.5 rounded-xl bg-[#F0FDFA] border border-[#99F6E4] text-sm text-[#12304A] cursor-pointer">

              <input

                type="checkbox"

                checked={cvd.consent}

                onChange={(e) => setCvd({ ...cvd, consent: e.target.checked })}

                className="mt-1 w-4 h-4 accent-[#0D9488]"

              />

              <span className="leading-relaxed">
                <span>{t('consentLabel')}</span>
                <span className="block mt-1 text-xs text-[#475569]">{t('consentNote')}</span>
              </span>

            </label>



            {cvdError && (

              <AlertBanner tone="critical">

                <p>{cvdError}</p>

              </AlertBanner>

            )}



            <MedicalButton

              type="submit"

              variant="secondary"

              fullWidth

              loading={cvdLoading}

              disabled={!cvd.consent || cvdLoading || priorStopsChart}

            >

              {cvdLoading ? t('runningScreen') : t('bdRunCvd')}

            </MedicalButton>



            {cvdResult && (

              <div

                role="region"

                aria-live="polite"

                className={`p-5 rounded-2xl border shadow-clinical-xs space-y-4 ${heartTone.shell}`}

              >

                <div className="flex flex-wrap items-center justify-between gap-3">

                  <div>

                    <p className="text-xs font-bold uppercase tracking-wider text-[#64748B]">

                      {t('bdChartCell')}

                    </p>

                    <p className={`text-3xl font-extrabold font-mono tabular-nums ${heartTone.title}`}>

                      {cvdResult.chart_percent}%

                    </p>

                  </div>

                  <StatusBadge

                    tone={heartToneKey}

                    label={riskLabel(heartToneKey, t)}

                  />

                </div>



                <div className="grid grid-cols-5 gap-1.5">

                  {['under_5', '5_to_10', '10_to_20', '20_to_30', '30_or_more'].map((band) => (

                    <div

                      key={band}

                      className={`h-2.5 rounded-full ${

                        cvdResult.band === band

                          ? TONE[chartTone(band)].bar

                          : 'bg-white border border-[#E2E8F0]'

                      }`}

                    />

                  ))}

                </div>



                <p className="text-xs text-[#12304A] leading-relaxed">{t('bdExplainChart')}</p>

                <p className="text-[11px] text-[#64748B]">{t('bdChartPlain')}</p>

              </div>

            )}

          </form>

        </ClinicalCard>

      </div>

    </PageContainer>

  );

}



export default BangladeshScreen;

