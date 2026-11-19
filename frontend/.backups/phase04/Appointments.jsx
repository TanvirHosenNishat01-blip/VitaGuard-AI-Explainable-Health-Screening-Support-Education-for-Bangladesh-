import React, { useEffect, useState } from 'react';
import API, { getApiError } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

const STATUS_KEY = {
  pending: 'apptPending',
  confirmed: 'apptConfirmed',
  declined: 'apptDeclined',
  cancelled: 'apptCancelled',
};

function Appointments({ mode = 'patient' }) {
  const { t } = useLanguage();
  const [doctors, setDoctors] = useState([]);
  const [mine, setMine] = useState([]);
  const [queue, setQueue] = useState([]);
  const [slots, setSlots] = useState([]);
  const [bounds, setBounds] = useState({ min_date: '', max_date: '' });
  const [form, setForm] = useState({ kind: 'diabetes', doctor_id: '', date: '', time: '', note: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadPatient = () => {
    API.get('/api/appointments/doctors').then((res) => setDoctors(res.data.doctors || [])).catch(() => setDoctors([]));
    API.get('/api/appointments/mine').then((res) => setMine(res.data.appointments || [])).catch(() => setMine([]));
    API.get('/api/appointments/meta').then((res) => setBounds(res.data || {})).catch(() => {});
  };

  const loadDoctor = () => {
    API.get('/api/doctor/appointments').then((res) => setQueue(res.data.appointments || [])).catch(() => setQueue([]));
  };

  useEffect(() => {
    if (mode === 'doctor') loadDoctor();
    else loadPatient();
  }, [mode]);

  useEffect(() => {
    if (mode !== 'patient' || !form.doctor_id || !form.date) {
      setSlots([]);
      return;
    }
    API.get('/api/appointments/slots', { params: { doctor_id: form.doctor_id, date: form.date } })
      .then((res) => setSlots(res.data.slots || []))
      .catch(() => setSlots([]));
  }, [mode, form.doctor_id, form.date]);

  const book = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    try {
      await API.post('/api/appointments', {
        doctor_id: Number(form.doctor_id),
        kind: form.kind,
        date: form.date,
        time: form.time,
        note: form.note,
      });
      setMessage(t('apptSent'));
      setForm((current) => ({ ...current, time: '', note: '' }));
      loadPatient();
    } catch (err) {
      setError(getApiError(err, 'The time was not held.'));
    }
  };

  const cancel = async (id) => {
    setError('');
    try {
      await API.post(`/api/appointments/${id}/cancel`);
      loadPatient();
    } catch (err) {
      setError(getApiError(err, 'The time was not cancelled.'));
    }
  };

  const decide = async (id, action) => {
    setError('');
    try {
      await API.post(`/api/doctor/appointments/${id}/${action}`);
      loadDoctor();
    } catch (err) {
      setError(getApiError(err, 'The request was not updated.'));
    }
  };

  if (mode === 'doctor') {
    return (
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-slate-900">{t('apptQueue')}</h3>
        <p className="text-xs text-slate-500">{t('apptDoctorNote')}</p>
        {error && <p className="text-xs font-semibold text-rose-700">{error}</p>}
        {queue.length === 0 && <p className="text-xs text-slate-500">{t('apptQueueEmpty')}</p>}
        {queue.map((item) => (
          <div key={item.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border border-slate-100 rounded-xl p-3">
            <div>
              <p className="text-sm font-bold text-slate-800">{item.patient_name} · {item.kind === 'heart' ? t('apptHeart') : t('apptDiabetes')}</p>
              <p className="text-xs text-slate-500">{item.date} {item.time} · {item.screening_risk || '—'} · {t(STATUS_KEY[item.status] || 'apptPending')}</p>
              {item.note && <p className="text-xs text-slate-600 mt-1">{item.note}</p>}
            </div>
            {item.status === 'pending' && (
              <div className="flex gap-2">
                <button type="button" onClick={() => decide(item.id, 'confirm')} className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg">{t('apptConfirm')}</button>
                <button type="button" onClick={() => decide(item.id, 'decline')} className="px-3 py-1.5 bg-rose-50 text-rose-600 text-xs font-bold rounded-lg border border-rose-200">{t('apptDecline')}</button>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs space-y-4">
      <div>
        <h3 className="text-sm font-bold text-slate-900">{t('apptTitle')}</h3>
        <p className="text-xs text-slate-500 mt-1">{t('apptBody')}</p>
      </div>
      {error && <p className="text-xs font-semibold text-rose-700">{error}</p>}
      {message && <p className="text-xs font-semibold text-slate-700">{message}</p>}
      {doctors.length === 0 ? (
        <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-3">{t('apptNoDoctor')}</p>
      ) : (
        <form onSubmit={book} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="text-xs font-semibold text-slate-600 space-y-1">
            <span className="block">{t('apptKind')}</span>
            <select value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm">
              <option value="diabetes">{t('apptDiabetes')}</option>
              <option value="heart">{t('apptHeart')}</option>
            </select>
          </label>
          <label className="text-xs font-semibold text-slate-600 space-y-1">
            <span className="block">{t('apptDoctor')}</span>
            <select required value={form.doctor_id} onChange={(e) => setForm({ ...form, doctor_id: e.target.value, time: '' })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm">
              <option value="">{t('genderSelect')}</option>
              {doctors.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  {doctor.name}{doctor.specialty ? ` · ${doctor.specialty}` : ''}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs font-semibold text-slate-600 space-y-1">
            <span className="block">{t('apptDate')}</span>
            <input required type="date" min={bounds.min_date} max={bounds.max_date} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value, time: '' })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
          </label>
          <label className="text-xs font-semibold text-slate-600 space-y-1">
            <span className="block">{t('apptTime')}</span>
            <select required value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm">
              <option value="">{t('genderSelect')}</option>
              {slots.filter((slot) => slot.available).map((slot) => (
                <option key={slot.time} value={slot.time}>{slot.time}</option>
              ))}
            </select>
          </label>
          <label className="text-xs font-semibold text-slate-600 space-y-1 sm:col-span-2">
            <span className="block">{t('apptNote')}</span>
            <input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder={t('apptNoteHint')} maxLength={160} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
          </label>
          <button type="submit" className="sm:col-span-2 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl">{t('apptBook')}</button>
        </form>
      )}
      <div className="space-y-2 border-t border-slate-100 pt-3">
        <h4 className="text-xs font-bold text-slate-700">{t('apptMine')}</h4>
        {mine.length === 0 && <p className="text-xs text-slate-500">{t('apptEmpty')}</p>}
        {mine.map((item) => (
          <div key={item.id} className="flex items-center justify-between gap-3 border border-slate-100 rounded-xl p-3">
            <div>
              <p className="text-sm font-bold text-slate-800">{item.doctor_name} · {item.kind === 'heart' ? t('apptHeart') : t('apptDiabetes')}</p>
              <p className="text-xs text-slate-500">{item.date} {item.time} · {t(STATUS_KEY[item.status] || 'apptPending')}</p>
            </div>
            {(item.status === 'pending' || item.status === 'confirmed') && (
              <button type="button" onClick={() => cancel(item.id)} className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg">{t('apptCancel')}</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Appointments;
