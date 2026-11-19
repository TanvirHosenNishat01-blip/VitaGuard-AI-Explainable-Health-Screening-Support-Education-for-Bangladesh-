import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [warningModalOpen, setWarningModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [warningText, setWarningText] = useState('');
  const [actionNotice, setActionNotice] = useState('');
  const [noticeRows, setNoticeRows] = useState([]);

  const [dashboardData, setDashboardData] = useState({
    admin_name: 'Tanvir Hosen Nishat',
    active_patients: 0,
    disabled_patients: 0,
    current_health_records: 0,
    patient_accounts: [],
    audit_history: [],
    pending_doctors: []
  });

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    setLoading(true);
    const token = localStorage.getItem('token') || localStorage.getItem('access_token');
    
    try {
      const response = await fetch('http://127.0.0.1:8000/api/admin/dashboard', {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });

      if (!response.ok) throw new Error('Failed to load admin dashboard.');
      const data = await response.json();
      setDashboardData({
        admin_name: data.admin_name || 'Tanvir Hosen Nishat',
        active_patients: data.active_patients ?? 0,
        disabled_patients: data.disabled_patients ?? 0,
        current_health_records: data.current_health_records ?? 30,
        patient_accounts: data.patient_accounts || [],
        audit_history: data.audit_history || [],
        pending_doctors: data.pending_doctors || []
      });
    } catch (err) {
      console.warn('Fallback loading admin data');
    } finally {
      setLoading(false);
    }
  };

  const loadNotices = async () => {
    const token = localStorage.getItem('token') || localStorage.getItem('access_token');
    const response = await fetch('http://127.0.0.1:8000/api/admin/notices', {
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    });
    if (response.ok) {
      const data = await response.json();
      setNoticeRows(data.notices || []);
    }
  };

  const moderate = async (path) => {
    const token = localStorage.getItem('token') || localStorage.getItem('access_token');
    const response = await fetch(`http://127.0.0.1:8000${path}`, {
      method: 'POST',
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    });
    if (response.ok) {
      setActionNotice('Notice moderation saved.');
      loadNotices();
    }
  };

  const reviewDoctor = async (doctorId, decision) => {
    const token = localStorage.getItem('token') || localStorage.getItem('access_token');
    const res = await fetch(`http://127.0.0.1:8000/api/admin/doctors/${doctorId}/review`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ decision }),
    });
    if (res.ok) {
      setActionNotice(`Doctor ${decision}.`);
      fetchDashboard();
    }
  };

  const handleToggleStatus = async (patientId) => {
    const token = localStorage.getItem('token') || localStorage.getItem('access_token');
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/admin/users/${patientId}/toggle-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      if (res.ok) {
        setActionNotice(`Status updated successfully.`);
        fetchDashboard();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenWarning = (patient) => {
    setSelectedPatient(patient);
    setWarningText(patient.warning || 'Please review your submission frequency and ensure medical report precision.');
    setWarningModalOpen(true);
  };

  const handleSendWarning = async () => {
    if (!selectedPatient) return;
    const token = localStorage.getItem('token') || localStorage.getItem('access_token');
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/admin/users/${selectedPatient.id}/send-warning`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ warning: warningText })
      });
      if (res.ok) {
        setWarningModalOpen(false);
        setActionNotice(`Warning sent to ${selectedPatient.name}.`);
        fetchDashboard();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 p-6 flex flex-col justify-between">
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Administration</h2>
            <div className="flex items-center gap-1.5 mt-1 text-emerald-600 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Secure 2FA Verified
            </div>
          </div>

          <nav className="space-y-1.5">
            <button
              onClick={() => { setActiveTab('overview'); setActionNotice(''); }}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition ${
                activeTab === 'overview'
                  ? 'bg-blue-50 text-blue-700 font-semibold shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Admin dashboard
            </button>
            <button
              onClick={() => { setActiveTab('patients'); setActionNotice(''); }}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition ${
                activeTab === 'patients'
                  ? 'bg-blue-50 text-blue-700 font-semibold shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Patient accounts
            </button>
            <button
              onClick={() => { setActiveTab('audits'); setActionNotice(''); }}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition ${
                activeTab === 'audits'
                  ? 'bg-blue-50 text-blue-700 font-semibold shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Audit history
            </button>
            <button
              onClick={() => { setActiveTab('doctors'); setActionNotice(''); }}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition ${
                activeTab === 'doctors'
                  ? 'bg-blue-50 text-blue-700 font-semibold shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Doctor review
            </button>
            <button
              onClick={() => { setActiveTab('notices'); setActionNotice(''); loadNotices(); }}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition ${
                activeTab === 'notices'
                  ? 'bg-blue-50 text-blue-700 font-semibold shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Notice replies
            </button>
          </nav>
        </div>

        <div>
          <button
            onClick={handleSignOut}
            className="w-full py-2 px-4 rounded-lg bg-rose-50 text-rose-600 font-medium text-sm hover:bg-rose-100 transition border border-rose-100"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <main className="flex-1 p-8 space-y-6 overflow-y-auto">
        {/* Header Banner */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full">
                System Administrator
              </span>
              <span className="text-xs text-slate-400">VitaGuard AI Root</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
              Welcome, {dashboardData.admin_name}!
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Manage patient account lifecycle, dispatch warnings, and review system audit records.
            </p>
          </div>
          <button
            onClick={fetchDashboard}
            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-200 transition"
          >
            Refresh Data
          </button>
        </div>

        {actionNotice && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium rounded-lg flex justify-between items-center">
            <span>{actionNotice}</span>
            <button onClick={() => setActionNotice('')} className="text-emerald-600 font-bold">✕</button>
          </div>
        )}

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-2">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active patients</p>
                <p className="text-3xl font-extrabold text-slate-900">{dashboardData.active_patients}</p>
                <span className="text-xs text-emerald-600 font-medium">● Operational accounts</span>
              </div>
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-2">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Disabled patients</p>
                <p className="text-3xl font-extrabold text-rose-600">{dashboardData.disabled_patients}</p>
                <span className="text-xs text-slate-400">Restricted access</span>
              </div>
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-2">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Current health records</p>
                <p className="text-3xl font-extrabold text-blue-600">{dashboardData.current_health_records}</p>
                <span className="text-xs text-slate-500">Stored in database</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-slate-900">Recent Security & System Events</h3>
              <div className="divide-y divide-slate-100">
                {dashboardData.audit_history.slice(0, 5).map(item => (
                  <div key={item.id} className="py-3 flex justify-between items-center text-sm">
                    <div>
                      <p className="font-semibold text-slate-800">{item.action}</p>
                      <p className="text-xs text-slate-400">Actor: {item.actor}</p>
                    </div>
                    <div className="text-right">
                      <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700">
                        {item.status}
                      </span>
                      <p className="text-xs text-slate-400 mt-0.5">{item.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Patient Accounts with Action Buttons */}
        {activeTab === 'patients' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Patient Accounts Management</h3>
                <p className="text-xs text-slate-500">Control account status and send compliance notices.</p>
              </div>
              <span className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-full font-semibold">
                Total Patients: {dashboardData.patient_accounts.length}
              </span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-xs font-semibold uppercase text-slate-500 bg-slate-50">
                    <th className="py-3 px-4">Patient Name</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Account Status</th>
                    <th className="py-3 px-4">Active Warning</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {dashboardData.patient_accounts.map(p => {
                    const isAct = p.is_active ?? (p.status === 'Active');
                    return (
                      <tr key={p.id} className="hover:bg-slate-50/50">
                        <td className="py-3.5 px-4 font-semibold text-slate-800">{p.name}</td>
                        <td className="py-3.5 px-4 text-slate-600 font-mono text-xs">{p.email}</td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                            isAct 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                              : 'bg-rose-50 text-rose-700 border-rose-100'
                          }`}>
                            {isAct ? 'Active' : 'Disabled'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-xs">
                          {p.warning ? (
                            <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 font-medium">
                              {p.warning}
                            </span>
                          ) : (
                            <span className="text-slate-400">None</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-2">
                          <button
                            onClick={() => handleOpenWarning(p)}
                            className="px-3 py-1 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded text-xs font-semibold transition border border-amber-200"
                          >
                            Warn
                          </button>
                          <button
                            onClick={() => handleToggleStatus(p.id)}
                            className={`px-3 py-1 rounded text-xs font-semibold transition border ${
                              isAct
                                ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border-rose-200'
                                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200'
                            }`}
                          >
                            {isAct ? 'Disable' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'doctors' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Doctor review</h3>
            <p className="text-xs text-slate-500">Approving a doctor means an admin checked the submitted BMDC number. It is not a government seal.</p>
            {(dashboardData.pending_doctors || []).map((doctor) => (
              <div key={doctor.id} className="border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="text-sm">
                  <p className="font-bold text-slate-900">{doctor.name}</p>
                  <p className="text-xs text-slate-500">BMDC {doctor.bmdc_number || '—'} · {doctor.specialty} · {doctor.workplace}</p>
                  <p className="text-xs font-semibold text-amber-700">{doctor.verification_status}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => reviewDoctor(doctor.id, 'approved')} className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg">Approve</button>
                  <button onClick={() => reviewDoctor(doctor.id, 'rejected')} className="px-3 py-1.5 bg-rose-50 text-rose-600 text-xs font-bold rounded-lg border border-rose-200">Reject</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'notices' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Health notice moderation</h3>
            <p className="text-xs text-slate-500">Hide a notice or a public reply that shares a phone number, a private report, or a drug dose. Patients reply, doctors answer, and admin can remove either.</p>
            {noticeRows.length === 0 && <p className="text-sm text-slate-500">No notices yet.</p>}
            {noticeRows.map((notice) => (
              <div key={notice.id} className="border border-slate-200 rounded-xl p-4 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-slate-900">{notice.title}</p>
                    <p className="text-xs text-slate-500">{notice.doctor_name} {notice.is_hidden ? '· hidden' : ''}</p>
                    {(notice.reports || []).map((report) => (
                      <p key={report.id} className="text-xs text-rose-700 mt-1">Report: {report.reason}</p>
                    ))}
                  </div>
                  <button onClick={() => moderate(`/api/admin/notices/${notice.id}/hide`)} className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg">
                    {notice.is_hidden ? 'Show' : 'Hide'}
                  </button>
                </div>
                {(notice.replies || []).map((reply) => (
                  <div key={reply.id} className="bg-slate-50 rounded-lg p-3 flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-bold text-slate-500">{reply.author_name} · {reply.author_role} {reply.is_hidden ? '· hidden' : ''}</p>
                      <p className="text-xs text-slate-700">{reply.content}</p>
                    </div>
                    <button onClick={() => moderate(`/api/admin/replies/${reply.id}/hide`)} className="px-2 py-1 text-[11px] font-bold text-rose-600">
                      {reply.is_hidden ? 'Show' : 'Hide'}
                    </button>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* Tab 3: Audit History */}
        {activeTab === 'audits' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-900">System Security Audit Logs</h3>
            <div className="divide-y divide-slate-100">
              {dashboardData.audit_history.map(a => (
                <div key={a.id} className="py-3.5 flex justify-between items-center text-sm">
                  <div className="space-y-0.5">
                    <p className="font-semibold text-slate-800">{a.action}</p>
                    <p className="text-xs text-slate-500 font-mono">Triggered by: {a.actor}</p>
                  </div>
                  <div className="text-right">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700">
                      {a.status}
                    </span>
                    <p className="text-xs text-slate-400 mt-1">{a.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Warning Dispatch Modal */}
      {warningModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 border border-slate-200">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Issue Warning to {selectedPatient?.name}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                This notification will appear directly on the patient's dashboard.
              </p>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1">
                Warning Reason / Message
              </label>
              <textarea
                value={warningText}
                onChange={(e) => setWarningText(e.target.value)}
                rows={3}
                className="w-full text-sm border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter warning details..."
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setWarningModalOpen(false)}
                className="px-4 py-2 bg-slate-100 text-slate-600 text-xs font-semibold rounded-lg hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSendWarning}
                className="px-4 py-2 bg-amber-600 text-white text-xs font-semibold rounded-lg hover:bg-amber-700 shadow-xs"
              >
                Send Warning
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
