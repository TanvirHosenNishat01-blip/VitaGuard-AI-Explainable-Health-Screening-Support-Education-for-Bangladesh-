import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

function BloodNetwork() { 
  const [activeTab, setActiveTab] = useState('requests');
  const [requests, setRequests] = useState([]);
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(false);

  const [filterGroup, setFilterGroup] = useState('ALL');
  const [filterDistrict, setFilterDistrict] = useState('ALL');

  const [bloodGroup, setBloodGroup] = useState('O+');
  const [units, setUnits] = useState(1);
  const [hospital, setHospital] = useState('Synthetic Clinic A');
  const [locations, setLocations] = useState([
    { label: 'Synthetic Clinic A', district: 'Dhaka' },
    { label: 'Synthetic Clinic B', district: 'Chittagong' },
    { label: 'Synthetic Ward C', district: 'Sylhet' },
    { label: 'Synthetic Ward D', district: 'Rajshahi' },
  ]);
  const [district, setDistrict] = useState('Dhaka');
  const [urgency, setUrgency] = useState('routine');
  const [mine, setMine] = useState([]);
  const [formError, setFormError] = useState('');
  const [notice, setNotice] = useState('');
  const [donorGroup, setDonorGroup] = useState('O+');
  const [donorDistrict, setDonorDistrict] = useState('Dhaka');
  const [donorOptIn, setDonorOptIn] = useState(false);
  const [donorShare, setDonorShare] = useState(false);
  const [matches, setMatches] = useState({});
  const { t, lang } = useLanguage();
  const isBn = lang === 'bn';
  const { user } = useAuth();
  const staff = ['admin', 'doctor'].includes(String(user?.role || localStorage.getItem('userRole') || '').toLowerCase());
  const simulation = isBn
    ? 'এটি একটি সিমুলেশন। কোনো আসল রক্তদান বা হাসপাতাল সমন্বয় হয় না।'
    : 'This is a simulated demonstration. No real blood donation or hospital coordination takes place.';

  const bloodGroups = ['ALL', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const districts = ['ALL', 'Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi', 'Khulna', 'Barisal', 'Rangpur', 'Mymensingh'];
  const urgencyLabel = (value) => {
    const key = String(value || '').toLowerCase();
    const labels = isBn
      ? { routine: 'সাধারণ', priority: 'জরুরি', urgent: 'জরুরি', critical: 'অতি জরুরি' }
      : { routine: 'Routine', priority: 'Priority', urgent: 'Urgent', critical: 'Critical' };
    return labels[key] || value;
  };
  const statusLabel = (row) => {
    const key = String(row.status || '').toLowerCase();
    const labels = isBn
      ? { draft: 'খসড়া', submitted: 'জমা (সিমুলেশন)', under_review: 'পর্যালোচনায়', matched: 'মিল (সিমুলেশন)', closed: 'বন্ধ', cancelled: 'বাতিল' }
      : { draft: 'Draft', submitted: 'Submitted (simulated)', under_review: 'Under review', matched: 'Matched (simulated)', closed: 'Closed', cancelled: 'Cancelled' };
    return labels[key] || row.status_label || row.status;
  };

  useEffect(() => {
    fetchRequests();
    fetchDonors();
    API.get('/api/blood/locations').then((res) => {
      if (res.data.locations?.length) setLocations(res.data.locations);
    }).catch(() => {});
    if (localStorage.getItem('token') || localStorage.getItem('access_token')) {
      API.get('/api/blood/requests/mine').then((res) => setMine(res.data.requests || [])).catch(() => setMine([]));
      if (String(user?.role || localStorage.getItem('userRole') || '').toLowerCase() === 'patient') {
        API.get('/api/blood/donor-profile').then((res) => {
          setDonorOptIn(Boolean(res.data.opt_in));
          setDonorShare(Boolean(res.data.share_contact));
          if (res.data.blood_group) setDonorGroup(res.data.blood_group);
          if (res.data.district) setDonorDistrict(res.data.district);
        }).catch(() => {});
      }
    }
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await API.get('/api/blood/requests');
      setRequests(res.data.requests || []);
    } catch (e) {}
  };

  const fetchDonors = async () => {
    try {
      const res = await API.get('/api/blood/donors');
      setDonors(res.data.donors || []);
    } catch (e) {}
  };

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post('/api/blood/requests', {
        blood_group: bloodGroup,
        units_needed: parseInt(units, 10),
        location_label: hospital,
        urgency,
        synthetic_only: true,
      });
      setNotice(isBn ? 'সিমুলেটেড অনুরোধ সেভ হয়েছে।' : 'The simulated request was saved.');
      setFormError('');
      setActiveTab('requests');
      fetchRequests();
      if (localStorage.getItem('token') || localStorage.getItem('access_token')) {
        const mineRes = await API.get('/api/blood/requests/mine');
        setMine(mineRes.data.requests || []);
      }
    } catch (e) {
      setFormError(e.response?.data?.detail || (isBn ? 'অনুরোধটি যায়নি।' : 'The simulated request was not saved.'));
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = requests.filter(r => {
    if (filterGroup !== 'ALL' && r.blood_group !== filterGroup) return false;
    if (filterDistrict !== 'ALL' && r.district !== filterDistrict) return false;
    return true;
  });

  const filteredDonors = donors.filter(d => {
    if (filterGroup !== 'ALL' && d.blood_group !== filterGroup) return false;
    if (filterDistrict !== 'ALL' && d.district !== filterDistrict) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans pb-16">
      <main className="max-w-6xl mx-auto mt-8 px-4 space-y-6">
        <div className="bg-[#12304A] text-white p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <span className="px-2.5 py-0.5 bg-white/20 text-white text-[10px] font-bold rounded-md uppercase tracking-wider">
              {isBn ? 'সিমুলেশন' : 'Simulated demonstration'}
            </span>
            <h2 className="text-2xl font-black tracking-tight">{t('blood') || 'Blood network'}</h2>
            <p className="text-xs text-slate-200">{simulation}</p>
          </div>

          {String(user?.role || '').toLowerCase() === 'patient' && (
            <form
              className="bg-white text-slate-800 p-4 rounded-xl space-y-2 w-full sm:w-auto"
              onSubmit={async (event) => {
                event.preventDefault();
                try {
                  const response = await API.put('/api/blood/donor-profile', {
                    opt_in: donorOptIn,
                    blood_group: donorGroup,
                    district: donorDistrict,
                    share_contact: donorShare,
                  });
                  setNotice(isBn ? 'পছন্দ সেভ হয়েছে। এটি ব্লাড ব্যাংক নিবন্ধন নয়।' : 'Preference saved. This is not a blood-bank registration.');
                  setFormError('');
                } catch (err) {
                  setFormError(err.response?.data?.detail || 'Donor preference was not saved.');
                }
              }}
            >
              <p className="text-xs font-bold">{isBn ? 'সিমুলেটেড দাতা' : 'Simulated donor preference'}</p>
              <p className="text-[11px] text-slate-500">{isBn ? 'ফোন দেখানো হয় না। পাবলিক তালিকায় আসল অ্যাকাউন্ট আসে না।' : 'Phone numbers stay hidden. Real accounts are not added to the public donor list.'}</p>
              <label className="text-xs flex gap-2"><input type="checkbox" checked={donorOptIn} onChange={(e) => setDonorOptIn(e.target.checked)} />{isBn ? 'দাতা হতে চাই' : 'I want to be a donor'}</label>
              <label className="text-xs flex gap-2"><input type="checkbox" checked={donorShare} onChange={(e) => setDonorShare(e.target.checked)} />{isBn ? 'মিলের জন্য নাম দেখান, ফোন নয়' : 'Show my name for a match, not my phone'}</label>
              <div className="flex gap-2">
                <select value={donorGroup} onChange={(e) => setDonorGroup(e.target.value)} className="text-xs border rounded px-2 py-1">
                  {bloodGroups.filter((item) => item !== 'ALL').map((item) => <option key={item}>{item}</option>)}
                </select>
                <select value={donorDistrict} onChange={(e) => setDonorDistrict(e.target.value)} className="text-xs border rounded px-2 py-1">
                  {districts.filter((item) => item !== 'ALL').map((item) => <option key={item}>{item}</option>)}
                </select>
              </div>
              <button type="submit" className="text-xs font-bold text-rose-700">{isBn ? 'পছন্দ সেভ' : 'Save preference'}</button>
            </form>
          )}

          <button
            onClick={() => setActiveTab('create')}
            className="px-4 py-2 bg-white text-rose-600 text-xs font-extrabold rounded-xl shadow-md hover:bg-rose-50 transition shrink-0"
          >
            {isBn ? '+ সিমুলেটেড অনুরোধ' : '+ Simulated request'}
          </button>
        </div>

        <div className="flex bg-white p-1.5 rounded-xl border border-slate-200/80 shadow-xs max-w-md">
          <button
            onClick={() => setActiveTab('requests')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
              activeTab === 'requests' ? 'bg-rose-50 text-rose-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {isBn ? `অনুরোধ (${requests.length})` : `Requests (${requests.length})`}
          </button>
          <button
            onClick={() => setActiveTab('donors')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
              activeTab === 'donors' ? 'bg-rose-50 text-rose-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {isBn ? `সিন্থেটিক দাতা (${donors.filter((item) => item.availability !== 'unavailable').length})` : `Synthetic donors (${donors.filter((item) => item.availability !== 'unavailable').length})`}
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
              activeTab === 'create' ? 'bg-rose-50 text-rose-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {isBn ? 'অনুরোধ' : 'New request'}
          </button>
        </div>

        {activeTab !== 'create' && (
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center gap-4 text-xs">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-slate-400 uppercase tracking-wider text-[11px]">{isBn ? 'রক্তের গ্রুপ' : 'Blood group'}</span>
              <select
                value={filterGroup}
                onChange={(e) => setFilterGroup(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-700"
              >
                {bloodGroups.map(bg => <option key={bg} value={bg}>{bg === 'ALL' && isBn ? 'সব' : bg}</option>)}
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <span className="font-bold text-slate-400 uppercase tracking-wider text-[11px]">{isBn ? 'জেলা' : 'District'}</span>
              <select
                value={filterDistrict}
                onChange={(e) => setFilterDistrict(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-700"
              >
                {districts.map(d => <option key={d} value={d}>{d === 'ALL' && isBn ? 'সব' : d}</option>)}
              </select>
            </div>
          </div>
        )}

        {activeTab === 'requests' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredRequests.map(r => (
              <div key={r.id} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex justify-between items-start space-y-2">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-1 bg-rose-600 text-white text-xs font-black rounded-lg shadow-xs">
                      {r.blood_group}
                    </span>
                    <span className="px-2 py-0.5 bg-rose-50 text-rose-600 text-[10px] font-bold rounded-md uppercase">
                      {urgencyLabel(r.urgency)}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500">
                      {r.units_needed} {isBn ? 'ইউনিট' : 'unit(s)'}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 pt-1">{r.location_label || r.hospital_name}</h4>
                  <p className="text-xs text-slate-500">
                    {r.synthetic_request_id || `SIM-${r.id}`} · {r.district} · {statusLabel(r)}
                    {r.duplicate_of_id ? (isBn ? ` · #${r.duplicate_of_id} এর নকল` : ` · duplicate of #${r.duplicate_of_id}`) : ''}
                    {r.suspicious ? (isBn ? ' · অ্যাডমিন পর্যালোচনা দরকার' : ' · needs admin review') : ''}
                  </p>
                  <p className="text-xs text-slate-500">{r.requested_date || r.created_at}</p>
                </div>
                <div className="flex flex-col gap-2">
                  {staff && (
                    <select
                      aria-label="Simulated status"
                      defaultValue=""
                      onChange={async (event) => {
                        const status = event.target.value;
                        if (!status) return;
                        try {
                          await API.post(`/api/blood/requests/${r.id}/status`, { status, note: 'Simulated review' });
                          fetchRequests();
                        } catch (err) {
                          setFormError(err.response?.data?.detail || 'Status was not changed.');
                        }
                      }}
                      className="px-2 py-1 bg-slate-50 border border-slate-200 text-xs font-bold rounded-lg"
                    >
                      <option value="">Update</option>
                      <option value="under_review">Under Review</option>
                      <option value="matched">Matched (Simulated)</option>
                      <option value="closed">Closed</option>
                    </select>
                  )}
                  {mine.some((item) => item.id === r.id) && (
                    <button
                      type="button"
                      onClick={async () => {
                        const response = await API.get(`/api/blood/requests/${r.id}/matches`);
                        setMatches((current) => ({ ...current, [r.id]: response.data }));
                      }}
                      className="px-3 py-1.5 bg-white text-slate-700 text-xs font-bold rounded-lg border border-slate-200"
                    >
                      {isBn ? 'মিল' : 'Matches'}
                    </button>
                  )}
                  {matches[r.id] && (
                    <p className="text-[11px] text-slate-500 max-w-[12rem]">
                      {(matches[r.id].matches || []).length} {isBn ? 'জন। ফোন নেই।' : 'consented. No phone.'} {isBn ? matches[r.id].disclaimer_bn : matches[r.id].disclaimer_en}
                    </p>
                  )}
                  {String(user?.role || '').toLowerCase() === 'patient' && !mine.some((item) => item.id === r.id) && (
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          const response = await API.post(`/api/blood/requests/${r.id}/interest`);
                          setNotice(isBn ? 'আগ্রহ আগেই থাকলে আবার জানানো হয় না। স্ট্যাটাস বদলায় না।' : (response.data.reason_en || 'Interest recorded.'));
                        } catch (err) {
                          setFormError(err.response?.data?.detail || 'Interest was not recorded.');
                        }
                      }}
                      className="px-3 py-1.5 bg-white text-slate-700 text-xs font-bold rounded-lg border border-slate-200"
                    >
                      {isBn ? 'আগ্রহ' : 'Interest'}
                    </button>
                  )}
                  {mine.some((item) => item.id === r.id) && ['draft', 'submitted', 'under_review'].includes(r.status) && (
                    <button
                      type="button"
                      onClick={async () => {
                        await API.post(`/api/blood/requests/${r.id}/cancel`);
                        fetchRequests();
                        const mineRes = await API.get('/api/blood/requests/mine');
                        setMine(mineRes.data.requests || []);
                      }}
                      className="px-3 py-1.5 bg-white text-slate-700 text-xs font-bold rounded-lg border border-slate-200"
                    >
                      {isBn ? 'বাতিল' : 'Cancel'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'donors' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filteredDonors.filter((item) => item.availability !== 'unavailable').map(d => (
              <div key={d.id} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{d.name}</h4>
                    <p className="text-[11px] text-slate-400">{t('donorNote')}</p>
                  </div>
                  <span className="px-2.5 py-1 bg-red-50 text-red-600 border border-red-200 text-xs font-black rounded-lg">
                    {d.blood_group}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-100 text-[11px]">
                  <span className="text-slate-500">📍 {d.district}{d.location_label ? ` · ${d.location_label}` : ''}</span>
                  <span className="text-emerald-700 font-bold">{isBn ? 'সিন্থেটিক' : 'Synthetic'} · {d.availability || (isBn ? 'অজানা' : 'Unknown')}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'create' && (
          <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-xs max-w-xl mx-auto space-y-4">
            <h3 className="text-lg font-bold text-slate-900">{isBn ? 'সিমুলেটেড অনুরোধ' : 'Simulated blood request'}</h3>
            {formError && <p className="text-xs font-semibold text-rose-700">{formError}</p>}
            {notice && <p className="text-xs font-semibold text-emerald-700">{notice}</p>}

            <form onSubmit={handleCreateRequest} className="space-y-4 pt-2 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-600 mb-1" htmlFor="blood-group">{isBn ? 'রক্তের গ্রুপ' : 'Blood group'}</label>
                  <select id="blood-group" value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-800">
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-600 mb-1" htmlFor="blood-units">{isBn ? 'ইউনিট' : 'Units'}</label>
                  <input id="blood-units" type="number" min="1" max="10" value={units} onChange={(e) => setUnits(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-800" required />
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-600 mb-1" htmlFor="blood-location">{isBn ? 'সিন্থেটিক অবস্থান' : 'Synthetic location'}</label>
                <select
                  id="blood-location"
                  value={hospital}
                  onChange={(e) => {
                    const place = locations.find((item) => item.label === e.target.value);
                    setHospital(e.target.value);
                    if (place) setDistrict(place.district);
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                >
                  {locations.map((place) => (
                    <option key={place.label} value={place.label}>{place.label} · {place.district}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-600 mb-1" htmlFor="blood-priority">{isBn ? 'অগ্রাধিকার' : 'Priority'}</label>
                <select id="blood-priority" value={urgency} onChange={(e) => setUrgency(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-800">
                  <option value="routine">{urgencyLabel('routine')}</option>
                  <option value="priority">{urgencyLabel('priority')}</option>
                  <option value="critical">{urgencyLabel('critical')}</option>
                </select>
              </div>
              <button type="submit" disabled={loading} className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-xs transition">
                {loading ? (isBn ? 'সংরক্ষণ হচ্ছে...' : 'Saving...') : (isBn ? 'সিমুলেটেড অনুরোধ পাঠান' : 'Submit simulated request')}
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}

export default BloodNetwork;
