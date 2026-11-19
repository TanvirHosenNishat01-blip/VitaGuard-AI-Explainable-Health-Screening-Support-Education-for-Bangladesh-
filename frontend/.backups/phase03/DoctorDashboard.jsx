import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import Appointments from '../components/Appointments';

function DoctorDashboard() {
  const { logout, user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('cases');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [loading, setLoading] = useState(false);
  const [doctorName, setDoctorName] = useState('Doctor');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);
  const [doctorAdvice, setDoctorAdvice] = useState('');

  // Article form state
  const [articleTitle, setArticleTitle] = useState('');
  const [articleCategory, setArticleCategory] = useState('Cardiovascular Health');
  const [articleContent, setArticleContent] = useState('');
  const [articles, setArticles] = useState([]);
  const [patientCases, setPatientCases] = useState([]);
  const [verificationStatus, setVerificationStatus] = useState(user?.verification_status || '');
  const [noticeMessage, setNoticeMessage] = useState('');
  const [myId, setMyId] = useState(null);
  const [replyDrafts, setReplyDrafts] = useState({});
  const [reviewRequests, setReviewRequests] = useState([]);

  useEffect(() => {
    // Priority: full_name -> name -> clean username
    let displayName = 'Doctor';
    if (user?.full_name && user.full_name.trim() !== '') {
      displayName = user.full_name;
    } else if (user?.name && user.name.trim() !== '') {
      displayName = user.name;
    } else if (user?.username) {
      displayName = user.username.replace(/[0-9_]/g, ' ');
    }

    if (!displayName.toLowerCase().startsWith('dr.')) {
      displayName = `Dr. ${displayName.charAt(0).toUpperCase() + displayName.slice(1)}`;
    }
    setDoctorName(displayName);

    fetchDashboardRecords();
    API.get('/api/auth/me').then((res) => {
      setVerificationStatus(res.data.verification_status || 'pending');
      setMyId(res.data.id);
    }).catch(() => {});
    loadNotices();
  }, [user]);

  const mapNotices = (rows) => (rows || []).map((item) => ({
    id: item.id,
    doctorId: item.doctor_id,
    badge: item.category,
    title: item.title,
    content: item.content,
    date: item.date,
    author: item.doctor_name,
    replies: item.replies || [],
    canReply: item.can_reply,
  }));

  const loadNotices = () => {
    API.get('/api/notices').then((res) => {
      setArticles(mapNotices(res.data.notices));
    }).catch(() => {});
  };

  const fetchDashboardRecords = async () => {
    setLoading(true);
    try {
      const response = await API.get('/api/doctor/records');
      setPatientCases(response.data.patients || []);
      if (response.data.verification_status) setVerificationStatus(response.data.verification_status);
      if ((response.data.verification_status || verificationStatus) === 'approved') {
        try {
          const reviews = await API.get('/api/doctor/reviews');
          setReviewRequests(reviews.data.reviews || []);
        } catch {
          setReviewRequests([]);
        }
      }
    } catch {
      setPatientCases([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePublishArticle = async (e) => {
    e.preventDefault();
    setNoticeMessage('');
    if (verificationStatus !== 'approved') {
      setNoticeMessage('This account is still waiting for admin review, so the notice cannot be published.');
      return;
    }
    if (articleTitle.trim().length < 8 || articleContent.trim().length < 30) {
      setNoticeMessage('Use a title of at least 8 characters and a notice of at least 30 characters. Do not include a drug dose.');
      return;
    }
    try {
      await API.post('/api/notices', {
        title: articleTitle.trim(),
        category: articleCategory,
        content: articleContent.trim(),
      });
      setArticleTitle('');
      setArticleContent('');
      setNoticeMessage('Published. Patients can reply on the Health Notice page.');
      loadNotices();
    } catch (err) {
      setNoticeMessage(err.response?.data?.detail || 'Notice was not published.');
    }
  };

  const handleNoticeReply = async (noticeId) => {
    const content = (replyDrafts[noticeId] || '').trim();
    if (content.length < 8) {
      setNoticeMessage('A doctor reply needs at least 8 characters and must not include a drug dose.');
      return;
    }
    try {
      await API.post(`/api/notices/${noticeId}/replies`, { content });
      setReplyDrafts((current) => ({ ...current, [noticeId]: '' }));
      setNoticeMessage('Reply published under your notice.');
      loadNotices();
    } catch (err) {
      setNoticeMessage(err.response?.data?.detail || 'Reply was not published.');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const openModal = (patient, assessment) => {
    setSelectedCase({ patient, assessment });
    setIsModalOpen(true);
    setDoctorAdvice('');
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCase(null);
  };

  const handleSaveAdvice = async () => {
    if (selectedCase && doctorAdvice.trim() !== '') {
      try {
        await API.post('/api/doctor/assign-guideline', {
          patient_id: selectedCase.patient.id,
          assessment_type: selectedCase.assessment.type,
          assessment_id: selectedCase.assessment.id,
          guideline: doctorAdvice.trim()
        });
        alert(`Clinical guideline attached and sent to ${selectedCase.patient.name}'s dashboard!`);
        fetchDashboardRecords();
      } catch (err) {
        alert('Failed to send guideline to patient.');
      }
    }
    closeModal();
  };

  const filteredCases = patientCases.filter((p) => {
    if (severityFilter === 'ALL') return true;
    return p.riskLevel.toLowerCase() === severityFilter.toLowerCase();
  });

  return (
    <div className="min-h-screen bg-[#f8fafc] flex relative">
      {/* Left Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between p-6 shrink-0 h-screen sticky top-0">
        <div className="space-y-6">
          <div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">Doctor Portal</h1>
            <p className="text-xs font-semibold text-blue-600 mt-0.5">Clinical Decision Support</p>
          </div>

          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab('cases')}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                activeTab === 'cases'
                  ? 'bg-blue-50 text-blue-600 font-bold'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              Patient Cases & Reviews
            </button>
            <button
              onClick={() => setActiveTab('articles')}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                activeTab === 'articles'
                  ? 'bg-blue-50 text-blue-600 font-bold'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              Health Articles & Hub
            </button>
          </nav>
        </div>

        <button
          onClick={handleLogout}
          className="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold rounded-xl border border-rose-200 transition cursor-pointer"
        >
          Sign out
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header Banner */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex justify-between items-start">
            <div className="space-y-1">
              <span className={`inline-block px-2.5 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wider ${verificationStatus === 'approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-700'}`}>
                {verificationStatus === 'approved' ? 'Admin reviewed' : 'Waiting for admin review'}
              </span>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Welcome, {doctorName}!
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {verificationStatus === 'approved'
                  ? 'Review saved screening records and publish a public health notice. Advice is a clinical opinion, not an automatic diagnosis.'
                  : 'Clinical advice and public notices stay locked until an admin reviews your BMDC details.'}
              </p>
            </div>
            <button
              onClick={fetchDashboardRecords}
              disabled={loading}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 transition cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Refreshing...' : 'Refresh Records'}
            </button>
          </div>

          {activeTab === 'cases' ? (
            <>
              {verificationStatus === 'approved' && (
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                  <h3 className="text-sm font-bold text-slate-900">{t('reviewQueue')}</h3>
                  <p className="text-xs text-slate-500">{t('reviewNote')}</p>
                  {reviewRequests.length === 0 && <p className="text-xs text-slate-500">{t('reviewEmpty')}</p>}
                  {reviewRequests.map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-3 border border-slate-100 rounded-xl p-3">
                      <div>
                        <p className="text-sm font-bold text-slate-800">{item.patient_name} · {item.kind}</p>
                        <p className="text-xs text-slate-500">{item.risk_level} · {item.probability}% · {item.status} · {item.created_at}</p>
                      </div>
                      {item.status !== 'seen' && (
                        <button
                          type="button"
                          onClick={async () => {
                            await API.post(`/api/doctor/reviews/${item.id}/seen`);
                            fetchDashboardRecords();
                          }}
                          className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg"
                        >
                          {t('markSeen')}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {verificationStatus === 'approved' && <Appointments mode="doctor" />}
              {/* Metric Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">TOTAL PATIENTS</p>
                  <p className="text-3xl font-extrabold text-slate-900">{patientCases.length}</p>
                  <p className="text-xs text-blue-600 font-medium">Assigned to clinic</p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">CRITICAL RISK ALERTS</p>
                  <p className="text-3xl font-extrabold text-rose-600">
                    {patientCases.filter(p => p.riskLevel === 'Critical').length}
                  </p>
                  <p className="text-xs text-rose-600 font-medium">Urgent review recommended</p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">REVIEWED CASES</p>
                  <p className="text-3xl font-extrabold text-emerald-600">
                    {patientCases.reduce((total, p) => total + p.assessments.filter(a => a.status === 'Reviewed').length, 0)}
                  </p>
                  <p className="text-xs text-emerald-600 font-medium">Doctor advice attached</p>
                </div>
              </div>

              {/* Severity Filter Tabs */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center space-x-3 text-xs">
                <span className="font-bold text-slate-400 uppercase tracking-wider text-[11px]">FILTER SEVERITY:</span>
                {['ALL', 'Critical', 'Moderate', 'Stable'].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setSeverityFilter(filter)}
                    className={`px-3 py-1 rounded-md font-semibold transition cursor-pointer ${
                      severityFilter === filter
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>

              {/* Patient Cases */}
              <div className="space-y-4 pb-10">
                {filteredCases.map((patient) => (
                  <div
                    key={patient.id}
                    className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{patient.name}</h4>
                        <p className="text-xs font-mono text-slate-400">{patient.email}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            patient.riskLevel === 'Critical'
                              ? 'bg-rose-50 text-rose-600 border border-rose-200'
                              : patient.riskLevel === 'Moderate'
                              ? 'bg-amber-50 text-amber-600 border border-amber-200'
                              : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                          }`}
                        >
                          {patient.riskBadge}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-medium border border-slate-200">
                          {patient.totalRecords} records
                        </span>
                      </div>
                    </div>

                    {/* Assessments */}
                    {patient.assessments && patient.assessments.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        {patient.assessments.map((item) => (
                          <div
                            key={item.id}
                            className="bg-slate-50/70 border border-slate-200 rounded-xl p-4 space-y-3 flex flex-col justify-between"
                          >
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-bold text-slate-800 text-[11px]">{item.type}</span>
                              <span className="text-slate-400 font-mono text-[10px]">{item.date}</span>
                            </div>

                            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 text-center my-2">
                              {item.metrics.map((metric, idx) => (
                                <div key={idx} className="bg-white p-2 rounded-lg border border-slate-100 shadow-2xs">
                                  <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-tighter truncate">{metric.label}</p>
                                  <p className="text-xs font-extrabold text-slate-800 mt-0.5">{metric.value}</p>
                                </div>
                              ))}
                            </div>

                            <div className="flex justify-between items-center pt-2 border-t border-slate-100 mt-auto">
                              <span className={`font-semibold text-[11px] ${item.status === 'Pending Review' ? 'text-amber-500' : 'text-emerald-500'}`}>
                                {item.status}
                              </span>
                              <button
                                onClick={() => openModal(patient, item)}
                                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-[11px] font-bold shadow-xs transition cursor-pointer"
                              >
                                Inspect & Advise
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              {/* Publish Article */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Publish Health Insight</h3>
                  <p className="text-xs text-slate-500 mt-1">This publishes a public health notice. It is not a private note to one patient, and it is not a prescription.</p>
                </div>

                <form onSubmit={handlePublishArticle} className="space-y-3.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Title</label>
                    <input
                      type="text"
                      value={articleTitle}
                      onChange={(e) => setArticleTitle(e.target.value)}
                      placeholder="e.g. Managing Hypertension at Home"
                      required
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Category</label>
                    <select
                      value={articleCategory}
                      onChange={(e) => setArticleCategory(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                    >
                      <option value="Cardiovascular Health">Cardiovascular Health</option>
                      <option value="Diabetes Management">Diabetes Management</option>
                      <option value="Nutrition & Diet">Nutrition & Diet</option>
                      <option value="Mental Wellness">Mental Wellness</option>
                      <option value="General Health">General Health</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Content</label>
                    <textarea
                      rows={4}
                      value={articleContent}
                      onChange={(e) => setArticleContent(e.target.value)}
                      placeholder="Enter evidence-based guidelines..."
                      required
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  {noticeMessage && (
                    <p className="text-xs font-semibold text-slate-700">{noticeMessage}</p>
                  )}
                  <button
                    type="submit"
                    disabled={verificationStatus !== 'approved'}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm transition cursor-pointer disabled:opacity-50"
                  >
                    {verificationStatus === 'approved' ? 'Publish health notice' : 'Waiting for admin review'}
                  </button>
                </form>
              </div>

              {/* Published Articles List */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-slate-900">Your health notices ({articles.filter((item) => item.doctorId === myId).length})</h3>
                <p className="text-[11px] text-slate-500">Patient replies show here. Answer on the same notice. This is public, so do not discuss one person's report.</p>

                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                  {articles.filter((item) => item.doctorId === myId).map((item) => (
                    <div key={item.id} className="border border-slate-100 rounded-xl p-4 bg-slate-50/50 space-y-2">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 font-bold uppercase tracking-wider">
                          {item.badge}
                        </span>
                        <span className="text-slate-400 font-mono">{item.date}</span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900">{item.title}</h4>
                      <p className="text-xs text-slate-600 leading-relaxed">{item.content}</p>
                      {(item.replies || []).map((reply) => (
                        <div key={reply.id} className="bg-white border border-slate-100 rounded-lg p-2">
                          <p className="text-[10px] font-bold text-slate-500">{reply.author_name} · {reply.author_role}</p>
                          <p className="text-xs text-slate-700">{reply.content}</p>
                        </div>
                      ))}
                      {item.canReply && (
                        <div className="space-y-2">
                          <textarea
                            rows={2}
                            value={replyDrafts[item.id] || ''}
                            onChange={(e) => setReplyDrafts((current) => ({ ...current, [item.id]: e.target.value }))}
                            placeholder="Reply to patients on this notice"
                            className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded-lg"
                          />
                          <button type="button" onClick={() => handleNoticeReply(item.id)} className="px-3 py-1.5 bg-blue-600 text-white text-[11px] font-bold rounded-lg">
                            Publish reply
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* SHAP Modal */}
      {isModalOpen && selectedCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={closeModal}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl p-6 m-4 flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-slate-900">Case Review: {selectedCase.patient.name}</h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 cursor-pointer">✕</button>
            </div>

            <div className="overflow-y-auto pr-2 flex-1 space-y-6">
              <div className="flex justify-between text-xs bg-slate-50 p-3 rounded-lg border border-slate-100">
                <div><span className="font-semibold text-slate-500">Type:</span> <span className="font-bold text-slate-700">{selectedCase.assessment.type}</span></div>
                <div><span className="font-semibold text-slate-500">Date:</span> <span className="font-mono text-slate-700">{selectedCase.assessment.date}</span></div>
                <div>
                  <span className="font-semibold text-slate-500">Risk:</span>{' '}
                  <span className={`font-bold ${selectedCase.patient.riskLevel === 'Critical' ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {selectedCase.patient.riskBadge}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Explainable AI (SHAP) Biomarker Attribution</h3>
                <div className="space-y-2.5">
                  {selectedCase.assessment.shapData && selectedCase.assessment.shapData.length > 0 ? (
                    selectedCase.assessment.shapData.map((data, idx) => (
                      <div key={idx} className="flex items-center text-xs">
                        <div className="w-2/5 truncate text-slate-600 font-medium">{data.feature || data.label}</div>
                        <div className="w-3/5 flex items-center">
                          <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden mr-3">
                            <div
                              className={`h-full ${data.value > 0 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                              style={{ width: `${Math.min(Math.abs(data.value) * 180, 100)}%`, marginLeft: data.value < 0 ? 'auto' : '0' }}
                            ></div>
                          </div>
                          <span className={`w-14 text-right font-mono font-bold ${data.value > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                            {data.value > 0 ? '+' : ''}{data.value.toFixed(3)}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500 italic">Detailed SHAP analysis not available for this record.</p>
                  )}
                </div>
              </div>

              <hr className="border-slate-100" />

              <div>
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Doctor's Verified Clinical Advice & Prescription Note</h3>
                <textarea
                  className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50 text-slate-800"
                  rows={4}
                  placeholder="e.g. Decrease ambulatory blood pressure monitoring. Reduce daily sodium intake and follow up in 2 weeks."
                  value={doctorAdvice}
                  onChange={(e) => setDoctorAdvice(e.target.value)}
                ></textarea>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end space-x-3">
              <button onClick={closeModal} className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 transition cursor-pointer">
                Close
              </button>
              <button onClick={handleSaveAdvice} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 shadow-md transition cursor-pointer">
                Save & Attach Recommendation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DoctorDashboard;
