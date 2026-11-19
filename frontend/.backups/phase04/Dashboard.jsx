import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import API, { getApiError } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StoryModal from '../components/StoryModal';
import { useLanguage } from '../context/LanguageContext';
import Appointments from '../components/Appointments';

function Dashboard() {
  const [userData, setUserData] = useState(null);
  const [measurements, setMeasurements] = useState([]);
  const [doctorGuidelines, setDoctorGuidelines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();
  const { t } = useLanguage();

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
      const res = await API.get('/api/patient/dashboard');
      if (res.data) {
        setUserData(res.data.user_profile || res.data.user || null);
        setMeasurements(res.data.measurements || []);
        setDoctorGuidelines(res.data.doctor_guidelines || []);
      }
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        logout();
        navigate('/login');
        return;
      }
      setError(getApiError(err, 'Could not load your health records.'));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleDeleteData = async () => {
    if (!window.confirm('Delete your saved screening records?')) return;
    try {
      await API.delete('/api/patient/my-data');
      setMeasurements([]);
      setDoctorGuidelines([]);
    } catch (err) {
      setError(getApiError(err, 'Could not delete records.'));
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

  // Determine display name
  const displayName = 
    userData?.full_name || 
    userData?.name || 
    user?.full_name || 
    user?.name || 
    userData?.username || 
    user?.username || 
    'Patient';

  const userIdentifier = userData?.username || user?.username || 'user';

  return (
    <div className="min-h-screen bg-clinical-bg text-slate-800 font-sans pb-24 md:pb-16">
      {/* Main Container */}
      <div className="max-w-6xl mx-auto pt-6 sm:pt-8 px-4 space-y-6">
        {/* Welcome Profile Card */}
        <div id="section-profile" className="scroll-mt-20 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-clinical-navy-50 text-clinical-navy rounded-xl flex items-center justify-center text-xl font-bold shrink-0">
              👤
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">
                Welcome, {displayName}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                UserID: <span className="font-mono text-clinical-navy font-semibold">{userIdentifier}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              onClick={() => navigate('/blood')}
              className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold rounded-xl border border-rose-200 transition flex items-center space-x-1.5 cursor-pointer"
            >
              <span>🩸</span> <span>Blood Network</span>
            </button>
            <button
              onClick={() => navigate('/assessment')}
              className="px-4 py-2 bg-clinical-navy hover:bg-clinical-navy-light text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center space-x-1.5 cursor-pointer"
            >
              <span>⊕</span> <span>Add measurements</span>
            </button>
            <button
              onClick={handleDeleteData}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition cursor-pointer"
            >
              {t('deleteData')}
            </button>
          </div>
        </div>

        {/* Administrative Warning Banner */}
        {userData?.active_warning && (
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-xl shadow-xs space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-amber-700 font-black text-sm">⚠️ Administrative Notice:</span>
              <span className="px-2 py-0.5 bg-amber-200/60 text-amber-900 text-[10px] font-bold rounded uppercase">Compliance</span>
            </div>
            <p className="text-xs text-amber-800 font-medium">{userData.active_warning}</p>
          </div>
        )}

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Doctor health notices</h3>
            <p className="text-xs text-slate-500 mt-1">{t('replyPublic')}</p>
            {(userData?.sex || userData?.age) && (
              <p className="text-xs text-slate-600 mt-2">
                Profile: {userData.sex === 'male' ? t('genderMale') : userData.sex === 'female' ? t('genderFemale') : userData.sex === 'other' ? t('genderOthers') : userData.sex}
                {userData.age ? ` · ${userData.age} years` : ''}
              </p>
            )}
          </div>
          <Link to="/notices" className="px-4 py-2 bg-clinical-navy-50 text-clinical-navy text-xs font-bold rounded-xl border border-clinical-navy/15 self-start sm:self-auto">
            Open notices
          </Link>
        </div>

        <div id="section-appointments" className="scroll-mt-20">
          <Appointments mode="patient" />
        </div>

        {/* Doctor's Verified Clinical Advice */}
        {doctorGuidelines && doctorGuidelines.length > 0 && (
          <div className="bg-emerald-50/70 border border-emerald-200 p-5 rounded-2xl shadow-xs space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <span className="text-base">🩺</span>
                <h3 className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                  Doctor's Verified Guidelines & Recommendations ({doctorGuidelines.length})
                </h3>
              </div>
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full">
                Active Clinical Follow-up
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              {doctorGuidelines.map((g) => (
                <div key={g.id} className="bg-white p-4 rounded-xl border border-emerald-100 shadow-2xs space-y-1.5">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="font-bold text-emerald-700">{g.doctor_name}</span>
                    <span className="text-slate-400 font-mono">{g.date}</span>
                  </div>
                  <p className="text-xs text-slate-700 font-medium italic">"{g.guideline}"</p>
                  <p className="text-[10px] font-bold text-clinical-navy uppercase tracking-tighter">
                    Related to: {g.assessment_type}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">TOTAL ASSESSMENTS</p>
            <p className="text-2xl font-extrabold text-slate-900">{measurements.length}</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">LAST ASSESSED</p>
            <p className="text-sm font-bold text-slate-800 mt-1">
              {measurements.length > 0 ? (measurements[0].date || measurements[0].created_at || 'Recent') : 'Never yet'}
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">EXPLAINABLE AI</p>
            <p className="text-xs font-bold text-emerald-600 mt-1 flex items-center space-x-1">
              <span>🛡️</span> <span>SHAP Active</span>
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">RISK LOGIC</p>
            <p className="text-xs font-bold text-clinical-navy mt-1 flex items-center space-x-1">
              <span>•</span> <span>3-Tier Standard</span>
            </p>
          </div>
        </div>

        {/* Action Assessment Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Diabetes Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-clinical-navy-50 text-clinical-navy rounded-xl flex items-center justify-center text-lg shrink-0">
                  📈
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">Diabetes Assessment</h3>
                    <span className="px-2 py-0.5 bg-clinical-navy-50 text-clinical-navy text-[10px] font-bold rounded">BIOMARKERS</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Evaluate fasting glucose, insulin levels, and biological metrics using explainable AI.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-slate-400 font-medium">8 CLINICAL INPUTS</span>
              <button
                onClick={() => navigate('/predict/diabetes')}
                className="px-4 py-2 bg-clinical-navy hover:bg-clinical-navy-light text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center space-x-1 cursor-pointer"
              >
                <span>Start Assessment</span> <span>→</span>
              </button>
            </div>
          </div>

          {/* Cardio Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-clinical-teal-50 text-clinical-teal rounded-xl flex items-center justify-center text-lg shrink-0">
                  🫀
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">Cardiovascular Risk</h3>
                    <span className="px-2 py-0.5 bg-clinical-teal-50 text-clinical-teal-dark text-[10px] font-bold rounded">HEART HEALTH</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Analyze arterial pressure, fluoroscopy vessels, and ECG patterns with 3-tier risk logic.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-slate-400 font-medium">13 CLINICAL INPUTS</span>
              <button
                onClick={() => navigate('/predict/cardio')}
                className="px-4 py-2 bg-clinical-teal hover:bg-clinical-teal-dark text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center space-x-1 cursor-pointer"
              >
                <span>Start Assessment</span> <span>→</span>
              </button>
            </div>
          </div>
        </div>

        {/* Measurement History Table */}
        <div id="section-records" className="scroll-mt-20 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Measurement History</h3>

          {loading ? (
            <p className="text-xs text-slate-400 py-6 text-center">Loading measurement history...</p>
          ) : measurements.length === 0 ? (
            <div className="text-center py-8 space-y-2">
              <p className="text-xs font-bold text-slate-700">No Assessment Records Found</p>
              <p className="text-xs text-slate-400">Run your first Diabetes or Cardiovascular evaluation to build an AI-powered diagnostic storyline.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-semibold text-[11px]">
                    <th className="py-2.5 px-3">RECORD ID</th>
                    <th className="py-2.5 px-3">TYPE</th>
                    <th className="py-2.5 px-3">DATE</th>
                    <th className="py-2.5 px-3">RISK CLASSIFICATION</th>
                    <th className="py-2.5 px-3">PROBABILITY</th>
                    <th className="py-2.5 px-3">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {measurements.map((record, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/60 transition">
                      <td className="py-3 px-3 font-mono text-slate-500">{record.id || idx + 1}</td>
                      <td className="py-3 px-3 font-semibold text-slate-800">{record.type || 'Assessment'}</td>
                      <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">{record.date || record.created_at}</td>
                      <td className="py-3 px-3">
                        <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          (record.risk_level || record.risk_classification || '').toLowerCase().includes('high') || 
                          (record.risk_level || record.risk_classification || '').toLowerCase().includes('critical')
                            ? 'bg-rose-50 text-rose-600 border border-rose-200'
                            : (record.risk_level || record.risk_classification || '').toLowerCase().includes('moderate')
                            ? 'bg-amber-50 text-amber-600 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                        }`}>
                          <span>•</span> <span>{record.risk_level || record.risk_classification || 'Standard'}</span>
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-slate-700">
                        {record.probability || record.risk_probability_percentage ? `${record.probability || record.risk_probability_percentage}%` : '—'}
                      </td>
                      <td className="py-3 px-3">
                        <button
                          onClick={() => handleOpenStory(record)}
                          className="text-clinical-navy hover:text-clinical-teal font-bold text-[11px] hover:underline cursor-pointer"
                        >
                          View Story
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Story Modal */}
      {isModalOpen && selectedRecord && (
        <StoryModal
          isOpen={isModalOpen}
          record={selectedRecord}
          onClose={handleCloseStory}
        />
      )}
    </div>
  );
}

export default Dashboard;
