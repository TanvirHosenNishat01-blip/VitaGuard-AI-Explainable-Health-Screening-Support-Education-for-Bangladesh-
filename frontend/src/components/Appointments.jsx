import React, { useEffect, useState } from 'react';
import { Calendar, Clock, Stethoscope, XCircle, CheckCircle2 } from 'lucide-react';
import API, { getApiError } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import ClinicalCard from './ui/ClinicalCard';
import ClinicalSelect from './ui/ClinicalSelect';
import ClinicalInput from './ui/ClinicalInput';
import StatusBadge from './ui/StatusBadge';
import MedicalButton from './ui/MedicalButton';
import AlertBanner from './ui/AlertBanner';
import EmptyState from './ui/EmptyState';

const STATUS_KEY = {
  pending: 'apptPending',
  confirmed: 'apptConfirmed',
  rejected: 'apptDeclined',
  declined: 'apptDeclined',
  cancelled: 'apptCancelled',
  completed: 'apptCompleted',
  reschedule_requested: 'apptReschedule',
};

const STATUS_TONE = {
  pending: 'moderate',
  confirmed: 'low',
  declined: 'high',
  rejected: 'high',
  cancelled: 'neutral',
  completed: 'info',
  reschedule_requested: 'moderate',
};

function Appointments({ mode = 'patient' }) {
  const { lang, t } = useLanguage();
  const isBn = lang === 'bn';
  const [doctors, setDoctors] = useState([]);
  const [mine, setMine] = useState([]);
  const [queue, setQueue] = useState([]);
  const [slots, setSlots] = useState([]);
  const [bounds, setBounds] = useState({ min_date: '', max_date: '' });
  const [form, setForm] = useState({
    kind: 'diabetes',
    doctor_id: '',
    date: '',
    time: '',
    note: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadPatient = () => {
    API.get('/api/appointments/doctors')
      .then((res) => setDoctors(res.data.doctors || []))
      .catch(() => setDoctors([]));
    API.get('/api/appointments/mine')
      .then((res) => setMine(res.data.appointments || []))
      .catch(() => setMine([]));
    API.get('/api/appointments/meta')
      .then((res) => setBounds(res.data || {}))
      .catch(() => {});
  };

  const loadDoctor = () => {
    API.get('/api/doctor/appointments')
      .then((res) => setQueue(res.data.appointments || []))
      .catch(() => setQueue([]));
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
    API.get('/api/appointments/slots', {
      params: { doctor_id: form.doctor_id, date: form.date },
    })
      .then((res) => setSlots(res.data.slots || []))
      .catch(() => setSlots([]));
  }, [mode, form.doctor_id, form.date]);

  const book = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    setSubmitting(true);
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
    } finally {
      setSubmitting(false);
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
      <ClinicalCard accent="teal">
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2 border-b border-[#E2E8F0] pb-3">
            <div>
              <h3 className="text-base font-bold text-[#12304A]">{t('apptQueue')}</h3>
              <p className="text-xs text-[#64748B] mt-0.5">{t('apptDoctorNote')}</p>
            </div>
            <StatusBadge tone="info" size="sm" label={`${queue.length}`} />
          </div>

          {error && (
            <AlertBanner tone="critical">
              <p>{error}</p>
            </AlertBanner>
          )}

          {queue.length === 0 ? (
            <p className="text-xs text-[#64748B] py-3">{t('apptQueueEmpty')}</p>
          ) : (
            <div className="space-y-3">
              {queue.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border border-[#E2E8F0] bg-[#F6F9FC] rounded-xl p-4"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-bold text-[#12304A]">
                        {item.patient_name} ·{' '}
                        {item.kind === 'heart' ? t('apptHeart') : t('apptDiabetes')}
                      </p>
                      <StatusBadge
                        tone={STATUS_TONE[item.status] || 'neutral'}
                        size="sm"
                        label={t(STATUS_KEY[item.status] || 'apptPending')}
                      />
                    </div>
                    <p className="text-xs font-mono text-[#64748B]">
                      {item.date} · {item.time} · Risk: {item.screening_risk || '—'}
                    </p>
                    {item.note && (
                      <p className="text-xs text-[#334155] bg-white p-2 rounded-lg border border-[#E2E8F0] mt-1">
                        {item.note}
                      </p>
                    )}
                    {item.suggested_date && (
                      <p className="text-xs text-[#0F766E]">
                        {isBn ? 'প্রস্তাবিত' : 'Suggested'} {item.suggested_date} · {item.suggested_time}
                      </p>
                    )}
                  </div>
                  {item.status === 'pending' && (
                    <div className="flex flex-wrap gap-2 shrink-0">
                      <MedicalButton
                        type="button"
                        variant="primary"
                        size="sm"
                        onClick={() => decide(item.id, 'confirm')}
                        leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                      >
                        {t('apptConfirm')}
                      </MedicalButton>
                      <MedicalButton
                        type="button"
                        variant="danger"
                        size="sm"
                        onClick={() => decide(item.id, 'decline')}
                        leftIcon={<XCircle className="w-3.5 h-3.5" />}
                      >
                        {t('apptDecline')}
                      </MedicalButton>
                    </div>
                  )}
                  {item.status === 'reschedule_requested' && (
                    <MedicalButton type="button" variant="primary" size="sm" onClick={() => decide(item.id, 'confirm')}>
                      {t('apptConfirm')}
                    </MedicalButton>
                  )}
                  {item.status === 'confirmed' && (
                    <MedicalButton type="button" variant="outline" size="sm" onClick={() => decide(item.id, 'complete')}>
                      {isBn ? 'সম্পন্ন' : 'Complete'}
                    </MedicalButton>
                  )}
                  {(item.status === 'pending' || item.status === 'confirmed' || item.status === 'reschedule_requested') && (
                    <MedicalButton
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={async () => {
                        const date = window.prompt(isBn ? 'প্রস্তাবিত তারিখ YYYY-MM-DD' : 'Suggested date YYYY-MM-DD');
                        const time = window.prompt(isBn ? 'প্রস্তাবিত সময় HH:MM' : 'Suggested time HH:MM');
                        if (!date || !time) return;
                        try {
                          await API.post(`/api/doctor/appointments/${item.id}/suggest`, { date, time, note: 'Simulated alternative time' });
                          loadDoctor();
                        } catch (err) {
                          setError(getApiError(err, 'The time was not suggested.'));
                        }
                      }}
                    >
                      {isBn ? 'অন্য সময়' : 'Suggest time'}
                    </MedicalButton>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </ClinicalCard>
    );
  }

  const availableSlots = slots.filter((slot) => slot.available);

  return (
    <ClinicalCard accent="teal">
      <div className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#E2E8F0] pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#0D9488]" aria-hidden="true" />
              <h3 className="text-base sm:text-lg font-bold text-[#12304A]">{t('apptTitle')}</h3>
            </div>
            <p className="text-xs text-[#64748B] max-w-2xl leading-relaxed">{t('apptBody')}</p>
          </div>
          <StatusBadge
            tone="info"
            size="sm"
            label={
              isBn
                ? `${mine.length}টি অ্যাপয়েন্টমেন্ট`
                : `${mine.length} Scheduled / Requested`
            }
          />
        </div>

        {error && (
          <AlertBanner tone="critical">
            <p>{error}</p>
          </AlertBanner>
        )}

        {message && (
          <AlertBanner tone="success">
            <p>{message}</p>
          </AlertBanner>
        )}

        {doctors.length === 0 ? (
          <AlertBanner tone="warning">
            <p>{t('apptNoDoctor')}</p>
          </AlertBanner>
        ) : (
          <form onSubmit={book} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ClinicalSelect
              id="appt-kind"
              label={t('apptKind')}
              value={form.kind}
              onChange={(e) => setForm({ ...form, kind: e.target.value })}
              options={[
                { value: 'diabetes', label: t('apptDiabetes') },
                { value: 'heart', label: t('apptHeart') },
              ]}
            />

            <ClinicalSelect
              id="appt-doctor"
              label={t('apptDoctor')}
              required
              placeholder={t('genderSelect')}
              value={form.doctor_id}
              onChange={(e) => setForm({ ...form, doctor_id: e.target.value, time: '' })}
              options={doctors.map((doctor) => ({
                value: String(doctor.id),
                label: `${doctor.name}${doctor.specialty ? ` · ${doctor.specialty}` : ''}`,
              }))}
            />

            <ClinicalInput
              id="appt-date"
              type="date"
              required
              label={t('apptDate')}
              min={bounds.min_date}
              max={bounds.max_date}
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value, time: '' })}
            />

            <ClinicalSelect
              id="appt-time"
              label={t('apptTime')}
              required
              placeholder={t('genderSelect')}
              value={form.time}
              onChange={(e) => setForm({ ...form, time: e.target.value })}
              options={availableSlots.map((slot) => ({
                value: slot.time,
                label: slot.time,
              }))}
              hint={
                form.doctor_id && form.date && availableSlots.length === 0
                  ? isBn
                    ? 'এই তারিখে কোনো খালি স্লট নেই।'
                    : 'No appointment slots available.'
                  : undefined
              }
            />

            <div className="sm:col-span-2">
              <ClinicalInput
                id="appt-note"
                label={t('apptNote')}
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
                placeholder={t('apptNoteHint')}
                maxLength={160}
              />
            </div>

            <div className="sm:col-span-2 flex justify-end">
              <MedicalButton
                type="submit"
                variant="primary"
                size="md"
                loading={submitting}
                leftIcon={<Clock className="w-4 h-4" />}
              >
                {t('apptBook')}
              </MedicalButton>
            </div>
          </form>
        )}

        {/* Upcoming & Past Appointment Requests */}
        <div className="space-y-3 border-t border-[#E2E8F0] pt-5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
            {t('apptMine')}
          </h4>

          {mine.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title={t('apptEmpty')}
              description={
                isBn
                  ? 'আপনার সেভ করা ডায়াবেটিস বা হৃদরোগ স্ক্রিনিং নিয়ে অনুমোদিত ডাক্তারের সাথে কথা বলতে উপরের ফর্ম থেকে সময় নির্বাচন করুন।'
                  : 'Select an approved doctor, date, and 30-minute time slot above to discuss your saved screening.'
              }
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {mine.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-wrap items-center justify-between gap-3 border border-[#E2E8F0] bg-[#F6F9FC] rounded-xl p-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Stethoscope className="w-4 h-4 text-[#0D9488]" aria-hidden="true" />
                      <p className="text-sm font-bold text-[#12304A]">
                        {item.doctor_name} ·{' '}
                        {item.kind === 'heart' ? t('apptHeart') : t('apptDiabetes')}
                      </p>
                    </div>
                    <p className="text-xs font-mono text-[#64748B]">
                      {item.date} · {item.time}
                    </p>
                    <div className="pt-1">
                      <StatusBadge
                        tone={STATUS_TONE[item.status] || 'neutral'}
                        size="sm"
                        label={t(STATUS_KEY[item.status] || 'apptPending')}
                      />
                    </div>
                  </div>
                  {(item.status === 'pending' || item.status === 'confirmed' || item.status === 'reschedule_requested') && (
                    <div className="flex flex-wrap gap-2">
                      {item.status === 'confirmed' && (
                        <MedicalButton
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={async () => {
                            const date = window.prompt(isBn ? 'নতুন তারিখ YYYY-MM-DD' : 'New date YYYY-MM-DD');
                            const time = window.prompt(isBn ? 'নতুন সময় HH:MM' : 'New time HH:MM');
                            if (!date || !time) return;
                            try {
                              await API.post(`/api/appointments/${item.id}/reschedule`, { date, time, note: 'Simulated reschedule' });
                              loadPatient();
                            } catch (err) {
                              setError(getApiError(err, 'The time was not changed.'));
                            }
                          }}
                        >
                          {isBn ? 'সময় পরিবর্তন' : 'Reschedule'}
                        </MedicalButton>
                      )}
                      <MedicalButton type="button" variant="outline" size="sm" onClick={() => cancel(item.id)}>
                        {t('apptCancel')}
                      </MedicalButton>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ClinicalCard>
  );
}

export default Appointments;
