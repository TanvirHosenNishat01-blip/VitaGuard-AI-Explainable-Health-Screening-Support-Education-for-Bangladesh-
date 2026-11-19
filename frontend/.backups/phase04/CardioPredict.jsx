import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API, { getApiError } from '../services/api';
import ResultCard from '../components/ResultCard';
import { getDashboardPath } from '../utils/roles';
import { useLanguage } from '../context/LanguageContext';

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
  const [result, setResult] = useState(null);
  const [shapPayload, setShapPayload] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [consent, setConsent] = useState(false);
  const { t } = useLanguage();
  const navigate = useNavigate();
  const isLoggedIn = Boolean(localStorage.getItem('token'));

  useEffect(() => {
    API.get('/api/shap-importance', { params: { model: 'cardio' } })
      .then((response) => setShapPayload(response.data))
      .catch(() => setShapPayload(null));
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('heartTitle')}</h1>
            <p className="text-sm text-gray-500 mt-1">{t('heartLead')}</p>
          </div>
          <button
            onClick={() => navigate(isLoggedIn ? getDashboardPath() : '/assessment')}
            className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition"
          >
            {t('backDash')}
          </button>
        </div>

        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 text-sm text-amber-900">
          {t('heartCohort')}
        </div>

        {!isLoggedIn && (
          <div className="bg-amber-50 border-l-4 border-amber-400 p-4 text-sm text-amber-800">
            {t('guestSave')}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('ageLabel')}</label>
              <input type="number" name="age" required min="29" max="77" value={formData.age} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="29 to 77" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('heartSex')}</label>
              <select name="sex" required value={formData.sex} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white">
                <option value="">{t('choose')}</option>
                <option value="0">{t('sexFemaleCode')}</option>
                <option value="1">{t('sexMaleCode')}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('heartPain')}</label>
              <select name="cp" required value={formData.cp} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white">
                <option value="">{t('choose')}</option>
                <option value="0">{t('cp0')}</option>
                <option value="1">{t('cp1')}</option>
                <option value="2">{t('cp2')}</option>
                <option value="3">{t('cp3')}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('heartBp')}</label>
              <input type="number" name="trestbps" required min="94" max="200" value={formData.trestbps} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="94 to 200" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('heartChol')}</label>
              <input type="number" name="chol" required min="126" max="564" value={formData.chol} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="126 to 564" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('heartFbs')}</label>
              <select name="fbs" required value={formData.fbs} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white">
                <option value="">{t('choose')}</option>
                <option value="0">{t('fbsNo')}</option>
                <option value="1">{t('fbsYes')}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('heartEcg')}</label>
              <select name="restecg" required value={formData.restecg} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white">
                <option value="">{t('choose')}</option>
                <option value="0">{t('ecg0')}</option>
                <option value="1">{t('ecg1')}</option>
                <option value="2">{t('ecg2')}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('heartRate')}</label>
              <input type="number" name="thalach" required min="71" max="202" value={formData.thalach} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="71 to 202" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('heartAngina')}</label>
              <select name="exang" required value={formData.exang} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white">
                <option value="">{t('choose')}</option>
                <option value="0">{t('answerNo')}</option>
                <option value="1">{t('answerYes')}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('heartSt')}</label>
              <input type="number" step="any" name="oldpeak" required min="0" max="6.2" value={formData.oldpeak} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="0 to 6.2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('heartSlope')}</label>
              <select name="slope" required value={formData.slope} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white">
                <option value="">{t('choose')}</option>
                <option value="0">{t('slope0')}</option>
                <option value="1">{t('slope1')}</option>
                <option value="2">{t('slope2')}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('heartVessels')}</label>
              <select name="ca" required value={formData.ca} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white">
                <option value="">{t('choose')}</option>
                {[0, 1, 2, 3].map((count) => <option key={count} value={count}>{count} {t('vessels')}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('heartThal')}</label>
              <select name="thal" required value={formData.thal} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white">
                <option value="">{t('choose')}</option>
                <option value="0">{t('thal0')}</option>
                <option value="1">{t('thal1')}</option>
                <option value="2">{t('thal2')}</option>
              </select>
            </div>
          </div>

          <label className="flex items-start gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1" />
            <span>{t('consentLabel')}</span>
          </label>
          <button
            type="submit"
            disabled={loading || !consent}
            className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:opacity-50 text-sm"
          >
            {loading ? t('runningScreen') : t('runHeart')}
          </button>
        </form>

        {result && <ResultCard predictionResult={result} shapPayload={shapPayload} recordKind="heart" />}
      </div>
    </div>
  );
}

export default CardioPredict;
