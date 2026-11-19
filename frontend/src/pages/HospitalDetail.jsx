import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import API, { getApiError } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import PageContainer from '../components/ui/PageContainer';
import ClinicalCard from '../components/ui/ClinicalCard';
import AlertBanner from '../components/ui/AlertBanner';

function HospitalDetail() {
  const { hospitalId } = useParams();
  const { lang } = useLanguage();
  const isBn = lang === 'bn';
  const [row, setRow] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    API.get(`/api/hospitals/${hospitalId}`)
      .then((response) => setRow(response.data))
      .catch((err) => setError(getApiError(err, 'Hospital not found.')));
  }, [hospitalId]);

  if (error) return <PageContainer className="py-8"><p className="text-sm text-[#B91C1C]">{error}</p></PageContainer>;
  if (!row) return <PageContainer className="py-8"><p className="text-sm">{isBn ? 'লোড হচ্ছে' : 'Loading'}</p></PageContainer>;

  return (
    <PageContainer className="space-y-6 py-8 max-w-3xl">
      <Link to="/hospitals" className="text-sm text-[#0E7490]">{isBn ? 'তালিকায় ফিরুন' : 'Back to the directory'}</Link>
      <ClinicalCard title={row.hospital_name} subtitle={`${row.branch_name} · ${row.branch_name_status}`}>
        <AlertBanner tone="warning" title={isBn ? 'যাচাই বাকি' : 'Verification pending'}>
          {row.verification_status}. {isBn ? 'এই পাতা হাসপাতালের সাথে সংযুক্ত নয়।' : 'This page is not a hospital integration.'}
        </AlertBanner>
        <dl className="mt-4 space-y-2 text-sm">
          <div><dt className="font-semibold">{isBn ? 'বিভাগ ও জেলা' : 'Division and district'}</dt><dd>{row.division} · {row.district}</dd></div>
          <div><dt className="font-semibold">{isBn ? 'থানা' : 'Thana'}</dt><dd>{row.thana || (isBn ? 'যাচাই হয়নি' : 'Not verified')}</dd></div>
          <div><dt className="font-semibold">{isBn ? 'এলাকা' : 'Area'}</dt><dd>{row.area || (isBn ? 'যাচাই হয়নি' : 'Not verified')}</dd></div>
          <div><dt className="font-semibold">{isBn ? 'ঠিকানা' : 'Address'}</dt><dd>{row.address || (isBn ? 'যাচাই হয়নি' : 'Not verified')}</dd></div>
          <div><dt className="font-semibold">{isBn ? 'ফোন' : 'Phone'}</dt><dd>{row.phone || (isBn ? 'যাচাই হয়নি' : 'Not verified')}</dd></div>
          <div><dt className="font-semibold">{isBn ? 'ওয়েবসাইট' : 'Website'}</dt><dd>{row.website ? <a className="text-[#0E7490]" href={row.website} target="_blank" rel="noreferrer">{row.website}</a> : (isBn ? 'দেওয়া হয়নি' : 'Not provided')}</dd></div>
          <div><dt className="font-semibold">{isBn ? 'উৎস' : 'Source'}</dt><dd>{row.source_url || (isBn ? 'দেওয়া হয়নি' : 'Not provided')} · {row.last_verified || (isBn ? 'যাচাই তারিখ নেই' : 'Not verified')}</dd></div>
          <div><dt className="font-semibold">{isBn ? 'বিশেষত্ব' : 'Specialties'}</dt><dd>{row.specialties?.length ? row.specialties.join(', ') : (isBn ? 'বিশেষত্বের তথ্য যাচাই হয়নি' : 'Specialty information not verified')}</dd></div>
          <div><dt className="font-semibold">{isBn ? 'মানচিত্র' : 'Map'}</dt><dd>{row.map_url || (isBn ? 'বর্তমানে নেই' : 'Currently unavailable')}</dd></div>
        </dl>
      </ClinicalCard>
      <ClinicalCard title={isBn ? 'এই হাসপাতালে যাচাইকৃত ডাক্তার' : 'Doctors available at this hospital'}>
        <p className="text-sm text-[#475569]">{row.affiliation_note}</p>
        <p className="text-sm text-[#475569] mt-2">{row.appointment_note}</p>
        {(row.doctors || []).length === 0 && <p className="text-xs text-[#64748B] mt-3">{isBn ? 'কোনো যাচাইকৃত সংযুক্তি নেই।' : 'No verified affiliation is on record.'}</p>}
      </ClinicalCard>
    </PageContainer>
  );
}

export default HospitalDetail;
