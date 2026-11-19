import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API, { getApiError } from '../services/api';
import ResultCard from '../components/ResultCard';
import { getDashboardPath } from '../utils/roles';
import { useLanguage } from '../context/LanguageContext';

// Diabetes Prediction Form Component handling patient health inputs and model evaluation
function DiabetesPredict() {
  const [formData, setFormData] = useState({
    pregnancies: '',
    glucose: '',
    blood_pressure: '',
    skin_thickness: '',
    insulin: '',
    bmi: '',
    diabetes_pedigree: '',
    age: ''
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
    API.get('/api/shap-importance', { params: { model: 'diabetes' } })
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

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('diabetesTitle')}</h1>
            <p className="text-sm text-gray-500 mt-1">{t('diabetesLead')}</p>
          </div>
          <button
            onClick={() => navigate(isLoggedIn ? getDashboardPath() : '/assessment')}
            className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition"
          >
            {t('backDash')}
          </button>
        </div>

        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 text-sm text-amber-900">
          {t('diabetesCohort')}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('pregLabel')}</label>
              <input
                type="number"
                name="pregnancies"
                required
                min="0"
                max="17"
                value={formData.pregnancies}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="0 to 17"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('glucoseLabel')}</label>
              <input
                type="number"
                name="glucose"
                required
                min="44"
                max="199"
                value={formData.glucose}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="44 to 199"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('bpLabel')}</label>
              <input
                type="number"
                name="blood_pressure"
                required
                min="24"
                max="122"
                value={formData.blood_pressure}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="24 to 122"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('skinLabel')}</label>
              <input
                type="number"
                name="skin_thickness"
                required
                min="7"
                max="99"
                value={formData.skin_thickness}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="7 to 99"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('insulinLabel')}</label>
              <input
                type="number"
                name="insulin"
                required
                min="14"
                max="846"
                value={formData.insulin}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="14 to 846"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('bmiLabel')}</label>
              <input
                type="number"
                step="any"
                name="bmi"
                required
                value={formData.bmi}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                min="18.2"
                max="67.1"
                placeholder="18.2 to 67.1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('pedigreeLabel')}</label>
              <input
                type="number"
                step="any"
                name="diabetes_pedigree"
                required
                min="0.078"
                max="2.42"
                value={formData.diabetes_pedigree}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="0.078 to 2.42"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('ageLabel')}</label>
              <input
                type="number"
                name="age"
                required
                min="21"
                max="81"
                value={formData.age}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="21 to 81"
              />
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
            {loading ? t('runningScreen') : t('runDiabetes')}
          </button>
        </form>

        {result && <ResultCard predictionResult={result} shapPayload={shapPayload} recordKind="diabetes" />}
      </div>
    </div>
  );
}

export default DiabetesPredict;