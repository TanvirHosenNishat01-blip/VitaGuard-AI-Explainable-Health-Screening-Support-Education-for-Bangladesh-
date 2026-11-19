import React, { useEffect, useState } from 'react';
import API, { getApiError } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

function CoordinationPanel() {
  const { lang } = useLanguage();
  const isBn = lang === 'bn';
  const [overview, setOverview] = useState(null);
  const [health, setHealth] = useState(null);
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState('');
  const [donorName, setDonorName] = useState('Synthetic Donor E');

  const load = async () => {
    try {
      const [appointments, messages, blood] = await Promise.all([
        API.get('/api/admin/appointments/overview'),
        API.get('/api/admin/messages/health'),
        API.get('/api/blood/requests'),
      ]);
      setOverview(appointments.data);
      setHealth(messages.data);
      setRequests((blood.data.requests || []).filter((item) => item.suspicious || item.duplicate_of_id));
      setError('');
    } catch (err) {
      setError(getApiError(err, 'Coordination data could not be loaded.'));
    }
  };

  useEffect(() => { load(); }, []);

  const addDonor = async () => {
    setError('');
    try {
      await API.post('/api/admin/blood/donors', {
        display_name: donorName,
        blood_group: 'O+',
        district: 'Dhaka',
        location_label: 'Synthetic Clinic A',
        availability: 'available',
      });
      setDonorName('Synthetic Donor E');
    } catch (err) {
      setError(getApiError(err, 'The synthetic donor was not saved.'));
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
      <h3 className="text-lg font-bold text-slate-900">{isBn ? 'সমন্বয়' : 'Coordination'}</h3>
      <p className="text-xs text-slate-500">This is a simulated demonstration. No real blood donation or hospital coordination takes place.</p>
      {error && <p className="text-xs font-semibold text-rose-700">{error}</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
        <div className="rounded-lg border border-slate-200 p-3">
          <p className="font-bold">Appointments</p>
          <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(overview?.counts || {}, null, 2)}</pre>
          <p className="text-xs text-slate-500">Unusual pending accounts: {(overview?.unusual_pending || []).length}</p>
        </div>
        <div className="rounded-lg border border-slate-200 p-3">
          <p className="font-bold">Messages</p>
          <p className="text-xs">Threads {health?.threads ?? 0} · messages {health?.messages ?? 0}</p>
          <p className="text-xs text-slate-500">Message bodies are not shown here.</p>
        </div>
      </div>
      <div>
        <p className="text-sm font-bold">Duplicate blood requests</p>
        {requests.length === 0 ? <p className="text-xs text-slate-500">{isBn ? 'কোনো ডুপ্লিকেট নেই' : 'No flagged duplicates.'}</p> : requests.map((item) => (
          <p key={item.id} className="text-xs text-slate-700">{item.synthetic_request_id} · {item.blood_group} · {item.status_label} · duplicate of #{item.duplicate_of_id}</p>
        ))}
      </div>
      <form onSubmit={(event) => { event.preventDefault(); addDonor(); }} className="flex flex-wrap gap-2 items-end">
        <label className="text-xs font-semibold" htmlFor="syn-donor">{isBn ? 'সিন্থেটিক দাতা' : 'Synthetic donor'}</label>
        <input id="syn-donor" value={donorName} onChange={(e) => setDonorName(e.target.value)} className="rounded-lg border border-slate-200 px-2 py-1 text-sm" />
        <button type="submit" className="px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-lg">Save</button>
      </form>
    </div>
  );
}

export default CoordinationPanel;
