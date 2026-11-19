import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users } from 'lucide-react';
import API from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import PageContainer from '../components/ui/PageContainer';
import ClinicalCard from '../components/ui/ClinicalCard';
import EmptyState from '../components/ui/EmptyState';
import MedicalButton from '../components/ui/MedicalButton';
import AlertBanner from '../components/ui/AlertBanner';

function DoctorDirectory() {
  const { lang } = useLanguage();
  const isBn = lang === 'bn';
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    setError('');
    API.get('/api/doctors/directory')
      .then((res) => setDoctors(res.data.doctors || []))
      .catch((err) => setError(err.response?.data?.detail || (isBn ? 'ডিরেক্টরি আসেনি।' : 'The directory did not load.')))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <PageContainer className="space-y-6 py-8">
      <ClinicalCard
        title={isBn ? 'ডাক্তার ডিরেক্টরি' : 'Doctor directory'}
        subtitle={isBn ? 'শুধু অ্যাডমিন-রিভিউ করা অ্যাকাউন্ট' : 'Only admin-reviewed accounts'}
        icon={Users}
      >
        <AlertBanner tone="info">
          {isBn
            ? 'অ্যাডমিন দাবি করা নিবন্ধন লেখা দেখেছে। এটি সরকারি সিল বা স্বাধীন যাচাই নয়।'
            : 'An admin reviewed claimed registration text. This is not a government seal or independent registry check.'}
        </AlertBanner>
        {loading && <p className="text-sm text-[#64748B] mt-4">{isBn ? 'লোড হচ্ছে' : 'Loading'}</p>}
        {error && (
          <div className="mt-4 space-y-2">
            <p className="text-sm text-[#B91C1C]">{error}</p>
            <MedicalButton type="button" variant="outline" size="sm" onClick={load}>{isBn ? 'আবার চেষ্টা' : 'Retry'}</MedicalButton>
          </div>
        )}
        {!loading && !error && doctors.length === 0 && (
          <EmptyState
            className="mt-4"
            title={isBn ? 'এখন কোনো অনুমোদিত ডাক্তার নেই' : 'No approved doctors yet'}
            description={isBn ? 'অ্যাডমিন যাচাই শেষ হলে নাম এখানে আসবে। ফিল্টার খালি করলেও নতুন নাম তৈরি হয় না।' : 'Names appear after an admin finishes review. Clearing a filter does not create a doctor.'}
          />
        )}
        {!loading && !error && doctors.length > 0 && (
          <ul className="mt-4 space-y-3">
            {doctors.map((doctor) => (
              <li key={doctor.id} className="rounded-xl border border-[#E2E8F0] p-4 flex flex-wrap justify-between gap-3">
                <div>
                  <p className="font-semibold text-[#12304A]">{doctor.name}</p>
                  <p className="text-sm text-[#475569]">
                    {doctor.specialty || (isBn ? 'দেওয়া হয়নি' : 'Not provided')}
                    {' · '}
                    {doctor.workplace || (isBn ? 'দেওয়া হয়নি' : 'Not provided')}
                  </p>
                  <p className="text-xs text-[#92400E] mt-1">{isBn ? 'হাসপাতাল শাখার সাথে যাচাইকৃত সংযুক্তি নেই।' : 'No verified hospital-branch affiliation.'}</p>
                  <p className="text-xs text-[#64748B] mt-1">{isBn ? doctor.credential_note_bn : doctor.credential_note_en}</p>
                </div>
                <MedicalButton variant="outline" size="sm" onClick={() => navigate('/dashboard?section=appointments')}>
                  {isBn ? 'সময় চান' : 'Request a time'}
                </MedicalButton>
              </li>
            ))}
          </ul>
        )}
      </ClinicalCard>
    </PageContainer>
  );
}

export default DoctorDirectory;
