import React, { useState } from 'react';
import API, { getApiError } from '../services/api';
import ShapChart from '../components/ShapChart';
import { useLanguage } from '../context/LanguageContext';

const TONE = {
  high: { shell: 'bg-red-50/50 border-red-200', title: 'text-red-900', badge: 'bg-red-100 text-red-700', bar: 'bg-red-500' },
  moderate: { shell: 'bg-amber-50/60 border-amber-200', title: 'text-amber-900', badge: 'bg-amber-100 text-amber-800', bar: 'bg-amber-500' },
  low: { shell: 'bg-green-50/50 border-green-200', title: 'text-green-900', badge: 'bg-green-100 text-green-700', bar: 'bg-green-500' },
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

const fieldClass = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

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
  const { t } = useLanguage();
  const [diabetes, setDiabetes] = useState({
    age: '', sex: '', bmi: '', systolic_bp: '', diastolic_bp: '', family_diabetes: '', consent: false,
  });
  const [cvd, setCvd] = useState({
    age: '', sex: '', smoker: '', systolic_bp: '', bmi: '', prior_cvd: '', consent: false,
  });
  const [diabetesResult, setDiabetesResult] = useState(null);
  const [cvdResult, setCvdResult] = useState(null);
  const [diabetesError, setDiabetesError] = useState('');
  const [cvdError, setCvdError] = useState('');
  const [diabetesLoading, setDiabetesLoading] = useState(false);
  const [cvdLoading, setCvdLoading] = useState(false);

  const pressureClash = diabetes.systolic_bp !== '' && diabetes.diastolic_bp !== ''
    && Number(diabetes.diastolic_bp) >= Number(diabetes.systolic_bp);
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
      });
      setCvdResult(response.data);
    } catch (err) {
      setCvdError(getApiError(err, 'The chart did not run.'));
    } finally {
      setCvdLoading(false);
    }
  };

  const diabetesTone = TONE[diabetesResult?.risk_key] || TONE.low;
  const heartTone = TONE[chartTone(cvdResult?.band)] || TONE.low;
  const shapFeatures = (diabetesResult?.shap || []).map((item) => ({
    ...item,
    feature: t(FEATURE_KEY[item.feature] || item.feature),
  }));

  return (
    <div className="bg-gray-50 px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h1 className="text-2xl font-bold text-gray-900">{t('bdTitle')}</h1>
        </div>
        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 text-sm text-amber-900">{t('bdOneLine')}</div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <form onSubmit={runDiabetes} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
            <h2 className="text-lg font-bold text-gray-900">{t('bdDiabetesTitle')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="block text-sm font-medium text-gray-700">{t('ageLabel')}
                <input required type="number" min="21" max="80" placeholder="21–80" value={diabetes.age} onChange={(e) => editDiabetes({ age: e.target.value })} className={fieldClass} />
              </label>
              <label className="block text-sm font-medium text-gray-700">{t('bdSex')}
                <select required value={diabetes.sex} onChange={(e) => editDiabetes({ sex: e.target.value })} className={fieldClass}>
                  <option value="">{t('genderSelect')}</option>
                  <option value="female">{t('genderFemale')}</option>
                  <option value="male">{t('genderMale')}</option>
                </select>
              </label>
              <label className="block text-sm font-medium text-gray-700">{t('bdBmi')}
                <input required type="number" min="14" max="45" step="0.1" placeholder="14–45" value={diabetes.bmi} onChange={(e) => editDiabetes({ bmi: e.target.value })} className={fieldClass} />
              </label>
              <label className="block text-sm font-medium text-gray-700">{t('bdFamily')}
                <select required value={diabetes.family_diabetes} onChange={(e) => editDiabetes({ family_diabetes: e.target.value })} className={fieldClass}>
                  <option value="">{t('genderSelect')}</option>
                  <option value="0">{t('bdNo')}</option>
                  <option value="1">{t('bdYes')}</option>
                </select>
              </label>
              <label className="block text-sm font-medium text-gray-700">{t('bdSystolic')}
                <input required type="number" min="80" max="220" placeholder="80–220" value={diabetes.systolic_bp} onChange={(e) => editDiabetes({ systolic_bp: e.target.value })} className={fieldClass} />
              </label>
              <label className="block text-sm font-medium text-gray-700">{t('bdDiastolic')}
                <input required type="number" min="50" max="130" placeholder="50–130" value={diabetes.diastolic_bp} onChange={(e) => editDiabetes({ diastolic_bp: e.target.value })} className={fieldClass} />
              </label>
            </div>
            {(diabetes.systolic_bp || diabetes.bmi) && (
              <div className="flex flex-wrap gap-2 text-xs">
                {diabetes.age && <span className="px-2 py-1 rounded-full bg-blue-50 text-blue-700">{diabetes.age} {t('bdUnitYear')}</span>}
                {diabetes.bmi && <span className="px-2 py-1 rounded-full bg-blue-50 text-blue-700">BMI {diabetes.bmi}</span>}
                {diabetes.systolic_bp && diabetes.diastolic_bp && (
                  <span className="px-2 py-1 rounded-full bg-blue-50 text-blue-700">{diabetes.systolic_bp}/{diabetes.diastolic_bp}</span>
                )}
              </div>
            )}
            {pressureClash && <p className="text-sm text-red-700">{t('bdBpOrder')}</p>}
            <label className="flex items-start gap-2 text-sm text-slate-700">
              <input type="checkbox" checked={diabetes.consent} onChange={(e) => setDiabetes({ ...diabetes, consent: e.target.checked })} className="mt-1" />
              <span>{t('consentLabel')}</span>
            </label>
            {diabetesError && <div className="bg-red-50 border-l-4 border-red-400 p-3 text-sm text-red-700">{diabetesError}</div>}
            <button type="submit" disabled={!diabetes.consent || diabetesLoading || pressureClash} className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm">
              {diabetesLoading ? t('runningScreen') : t('bdRunDiabetes')}
            </button>
            {diabetesResult && (
              <div className={`p-5 rounded-xl border shadow-sm space-y-3 ${diabetesTone.shell}`}>
                <div className="flex items-center justify-between gap-3">
                  <p className={`text-3xl font-bold ${diabetesTone.title}`}>{diabetesResult.probability_percent}%</p>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${diabetesTone.badge}`}>{riskLabel(diabetesResult.risk_key, t)}</span>
                </div>
                <div className="h-2 bg-white rounded-full overflow-hidden border border-white">
                  <div className={`h-full ${diabetesTone.bar}`} style={{ width: `${Math.min(diabetesResult.probability_percent, 100)}%` }} />
                </div>
                <p className="text-xs text-gray-600">{(diabetesResult.flagged ? t('bdFlagYes') : t('bdFlagNo')).replace('{cutoff}', diabetesResult.threshold_percent)}</p>
                <div className="bg-white/80 border border-gray-200 rounded-lg p-3">
                  <ShapChart shapPayload={shapFeatures} title={t('bdShapTitle')} />
                  <p className="text-[11px] text-gray-500 mt-2">{t('bdShapNote')}</p>
                </div>
              </div>
            )}
          </form>

          <form onSubmit={runCvd} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
            <h2 className="text-lg font-bold text-gray-900">{t('bdCvdTitle')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="block text-sm font-medium text-gray-700">{t('ageLabel')}
                <input required type="number" min="40" max="74" placeholder="40–74" value={cvd.age} onChange={(e) => editCvd({ age: e.target.value })} className={fieldClass} />
              </label>
              <label className="block text-sm font-medium text-gray-700">{t('heartSex')}
                <select required value={cvd.sex} onChange={(e) => editCvd({ sex: e.target.value })} className={fieldClass}>
                  <option value="">{t('genderSelect')}</option>
                  <option value="female">{t('genderFemale')}</option>
                  <option value="male">{t('genderMale')}</option>
                </select>
              </label>
              <label className="block text-sm font-medium text-gray-700">{t('bdSmoke')}
                <select required value={cvd.smoker} onChange={(e) => editCvd({ smoker: e.target.value })} className={fieldClass}>
                  <option value="">{t('genderSelect')}</option>
                  <option value="0">{t('bdNo')}</option>
                  <option value="1">{t('bdYes')}</option>
                </select>
              </label>
              <label className="block text-sm font-medium text-gray-700">{t('bdPrior')}
                <select required value={cvd.prior_cvd} onChange={(e) => editCvd({ prior_cvd: e.target.value })} className={fieldClass}>
                  <option value="">{t('genderSelect')}</option>
                  <option value="0">{t('bdNo')}</option>
                  <option value="1">{t('bdYes')}</option>
                </select>
              </label>
              <label className="block text-sm font-medium text-gray-700">{t('bdSystolic')}
                <input required type="number" min="70" max="250" placeholder="70–250" value={cvd.systolic_bp} onChange={(e) => editCvd({ systolic_bp: e.target.value })} className={fieldClass} />
              </label>
              <label className="block text-sm font-medium text-gray-700">{t('bdBmi')}
                <input required type="number" min="14" max="60" step="0.1" placeholder="14–60" value={cvd.bmi} onChange={(e) => editCvd({ bmi: e.target.value })} className={fieldClass} />
              </label>
            </div>
            {priorStopsChart && <p className="text-sm text-red-700">{t('bdPriorStop')}</p>}
            <label className="flex items-start gap-2 text-sm text-slate-700">
              <input type="checkbox" checked={cvd.consent} onChange={(e) => setCvd({ ...cvd, consent: e.target.checked })} className="mt-1" />
              <span>{t('consentLabel')}</span>
            </label>
            {cvdError && <div className="bg-red-50 border-l-4 border-red-400 p-3 text-sm text-red-700">{cvdError}</div>}
            <button type="submit" disabled={!cvd.consent || cvdLoading || priorStopsChart} className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm">
              {cvdLoading ? t('runningScreen') : t('bdRunCvd')}
            </button>
            {cvdResult && (
              <div className={`p-5 rounded-xl border shadow-sm space-y-3 ${heartTone.shell}`}>
                <div className="flex items-center justify-between gap-3">
                  <p className={`text-3xl font-bold ${heartTone.title}`}>{cvdResult.chart_percent}%</p>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${heartTone.badge}`}>{riskLabel(chartTone(cvdResult.band), t)}</span>
                </div>
                <div className="grid grid-cols-5 gap-1">
                  {['under_5', '5_to_10', '10_to_20', '20_to_30', '30_or_more'].map((band) => (
                    <div key={band} className={`h-2 rounded-full ${cvdResult.band === band ? TONE[chartTone(band)].bar : 'bg-white'}`} />
                  ))}
                </div>
                <p className="text-xs text-gray-600">{t('bdChartPlain')}</p>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

export default BangladeshScreen;
