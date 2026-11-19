import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API, { getApiError } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import PageContainer from '../components/ui/PageContainer';
import ClinicalCard from '../components/ui/ClinicalCard';
import MedicalButton from '../components/ui/MedicalButton';
import AlertBanner from '../components/ui/AlertBanner';
import ClinicalInput from '../components/ui/ClinicalInput';
import ClinicalSelect from '../components/ui/ClinicalSelect';

const FAVORITES = 'vitaguard-hospital-favorites';
const COMPARE = 'vitaguard-hospital-compare';

function readIds(key) {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

const EMPTY = { division: '', district: '', thana: '', area: '', hospital: '', branch: '', specialty: '' };

function Hospitals() {
  const { lang } = useLanguage();
  const isBn = lang === 'bn';
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState(EMPTY);
  const [options, setOptions] = useState({ divisions: [], districts: [], thanas: [], areas: [], hospitals: [], branches: [], specialties: [] });
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState(readIds(FAVORITES));
  const [compare, setCompare] = useState(readIds(COMPARE));

  const load = async (nextFilters, nextQuery) => {
    setLoading(true);
    setError('');
    try {
      const [list, opts] = await Promise.all([
        API.get('/api/hospitals', { params: { q: nextQuery, ...nextFilters } }),
        API.get('/api/hospitals/filters', { params: nextFilters }),
      ]);
      setRows(list.data.hospitals || []);
      setMeta(list.data);
      setOptions({ ...opts.data, specialties: list.data.specialties || [] });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(EMPTY, '').catch((err) => setError(getApiError(err, 'The directory did not load.')));
  }, []);

  const change = (key, value) => {
    const next = { ...filters, [key]: value };
    if (key === 'division') {
      next.district = '';
      next.thana = '';
      next.area = '';
      next.hospital = '';
      next.branch = '';
    }
    if (key === 'district') {
      next.thana = '';
      next.area = '';
      next.hospital = '';
      next.branch = '';
    }
    if (key === 'hospital') next.branch = '';
    setFilters(next);
    load(next, query).catch((err) => setError(getApiError(err, 'The filter did not run.')));
  };

  const toggle = (key, id, current, setter) => {
    const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id].slice(0, 3);
    setter(next);
    localStorage.setItem(key, JSON.stringify(next));
  };

  const compared = rows.filter((row) => compare.includes(row.id));

  return (
    <PageContainer className="space-y-6 py-8">
      <ClinicalCard
        title={isBn ? 'হাসপাতাল খুঁজুন' : 'Find a hospital'}
        subtitle={isBn ? '৫০টি পরিচিত বেসরকারি হাসপাতালের তালিকা। র‍্যাঙ্কিং নয়।' : 'A curated directory of 50 prominent private hospitals. Not a ranking.'}
      >
        <AlertBanner tone="info" title={isBn ? 'যাচাই বাকি' : 'Verification pending'}>
          {isBn
            ? 'রাস্তার ঠিকানা, ফোন, থানা এবং বিভাগের তালিকা এই সেশনে অফিসিয়াল পাতার সাথে মেলানো হয়নি, তাই সেগুলো খালি।'
            : 'Street address, phone, thana, and specialty lists were not checked against an official page in this session, so those fields stay empty.'}
        </AlertBanner>
        <form
          className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            load(filters, query).catch((err) => setError(getApiError(err, 'Search did not run.')));
          }}
        >
          <ClinicalInput label={isBn ? 'নাম' : 'Name'} value={query} onChange={(e) => setQuery(e.target.value)} />
          <ClinicalSelect label={isBn ? 'বিভাগ' : 'Division'} value={filters.division} onChange={(e) => change('division', e.target.value)}>
            <option value="">{isBn ? 'সব' : 'All'}</option>
            {options.divisions.map((item) => <option key={item} value={item}>{item}</option>)}
          </ClinicalSelect>
          <ClinicalSelect label={isBn ? 'জেলা' : 'District'} value={filters.district} onChange={(e) => change('district', e.target.value)}>
            <option value="">{isBn ? 'সব' : 'All'}</option>
            {options.districts.map((item) => <option key={item} value={item}>{item}</option>)}
          </ClinicalSelect>
          <ClinicalSelect label={isBn ? 'থানা' : 'Thana'} value={filters.thana} onChange={(e) => change('thana', e.target.value)} disabled={!options.thanas.length}>
            <option value="">{options.thanas.length ? (isBn ? 'সব' : 'All') : (isBn ? 'যাচাই হয়নি' : 'Not verified')}</option>
            {options.thanas.map((item) => <option key={item} value={item}>{item}</option>)}
          </ClinicalSelect>
          <ClinicalSelect label={isBn ? 'এলাকা' : 'Area'} value={filters.area} onChange={(e) => change('area', e.target.value)} disabled={!options.areas.length}>
            <option value="">{options.areas.length ? (isBn ? 'সব' : 'All') : (isBn ? 'যাচাই হয়নি' : 'Not verified')}</option>
            {options.areas.map((item) => <option key={item} value={item}>{item}</option>)}
          </ClinicalSelect>
          <ClinicalSelect label={isBn ? 'হাসপাতাল' : 'Hospital'} value={filters.hospital} onChange={(e) => change('hospital', e.target.value)}>
            <option value="">{isBn ? 'সব' : 'All'}</option>
            {options.hospitals.map((item) => <option key={item} value={item}>{item}</option>)}
          </ClinicalSelect>
          <ClinicalSelect label={isBn ? 'ক্যাম্পাস' : 'Branch'} value={filters.branch} onChange={(e) => change('branch', e.target.value)}>
            <option value="">{isBn ? 'সব' : 'All'}</option>
            {options.branches.map((item) => <option key={item} value={item}>{item}</option>)}
          </ClinicalSelect>
          <ClinicalSelect label={isBn ? 'বিশেষত্ব' : 'Specialty'} value={filters.specialty} onChange={(e) => change('specialty', e.target.value)}>
            <option value="">{isBn ? 'সব' : 'All'}</option>
            {(options.specialties || []).map((item) => <option key={item} value={item}>{item}</option>)}
          </ClinicalSelect>
          <div className="flex gap-2">
            <MedicalButton type="submit">{isBn ? 'খুঁজুন' : 'Search'}</MedicalButton>
            <MedicalButton type="button" variant="outline" onClick={() => { setFilters(EMPTY); setQuery(''); load(EMPTY, ''); }}>
              {isBn ? 'ফিল্টার মুছুন' : 'Clear filters'}
            </MedicalButton>
          </div>
        </form>
        {loading && <p className="text-sm text-[#64748B] mt-3">{isBn ? 'লোড হচ্ছে' : 'Loading'}</p>}
        {error && (
          <div className="mt-3 space-y-2">
            <p className="text-sm text-[#B91C1C]">{error}</p>
            <MedicalButton type="button" variant="outline" onClick={() => load(filters, query).catch((err) => setError(getApiError(err, 'Search did not run.')))}>
              {isBn ? 'আবার চেষ্টা' : 'Retry'}
            </MedicalButton>
          </div>
        )}
      </ClinicalCard>

      {!loading && !error && rows.length === 0 && (
        <ClinicalCard title={meta?.specialty_requested && !meta?.specialty_data_available ? (isBn ? 'বিশেষত্ব যাচাই হয়নি' : 'Specialty information not verified') : (isBn ? 'কোনো ফল নেই' : 'No results')}>
          <p className="text-sm text-[#475569]">
            {meta?.specialty_requested && !meta?.specialty_data_available
              ? (isBn ? 'কোনো শাখার বিশেষত্বের তালিকা যাচাই হয়নি। হাসপাতাল বন্ধ করা হয়নি। বিশেষত্ব ফিল্টার সরালে শাখাগুলো আবার দেখা যাবে।' : 'No branch has a verified specialty list. The hospitals were not removed. Clear the specialty filter to see the branches again.')
              : (isBn ? 'এই ফিল্টারে কোনো শাখা নেই।' : 'No branch matches these filters.')}
          </p>
          <MedicalButton
            type="button"
            variant="outline"
            className="mt-3"
            onClick={() => {
              const next = { ...filters, specialty: '' };
              setFilters(next);
              load(next, query).catch((err) => setError(getApiError(err, 'Search did not run.')));
            }}
          >
            {isBn ? 'বিশেষত্ব ফিল্টার মুছুন' : 'Clear specialty filter'}
          </MedicalButton>
        </ClinicalCard>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rows.map((row) => (
          <ClinicalCard key={row.id} title={row.hospital_name} subtitle={row.branch_name}>
            <p className="text-sm text-[#475569]">{row.division} · {row.district}</p>
            <p className="text-xs text-[#92400E] mt-2">{isBn ? 'ঠিকানা: যাচাই হয়নি। ফোন: যাচাই হয়নি।' : 'Address: Not verified. Phone: Not verified.'}</p>
            <p className="text-xs text-[#64748B] mt-1">{isBn ? 'বিশেষত্বের তথ্য যাচাই হয়নি' : 'Specialty information not verified'}</p>
            {row.website && <a className="text-xs text-[#0E7490] mt-2 inline-block" href={row.website} target="_blank" rel="noreferrer">{row.website}</a>}
            <div className="flex flex-wrap gap-3 mt-3 text-xs">
              <Link className="text-[#0E7490]" to={`/hospitals/${row.id}`}>{isBn ? 'বিস্তারিত' : 'View details'}</Link>
              <button type="button" className="text-[#0E7490]" onClick={() => toggle(FAVORITES, row.id, favorites, setFavorites)}>
                {favorites.includes(row.id) ? (isBn ? 'পছন্দ থেকে সরান' : 'Remove favorite') : (isBn ? 'এই ব্রাউজারে রাখুন' : 'Save in this browser')}
              </button>
              <button type="button" className="text-[#0E7490]" onClick={() => toggle(COMPARE, row.id, compare, setCompare)}>
                {isBn ? 'তুলনা' : 'Compare'}
              </button>
            </div>
          </ClinicalCard>
        ))}
      </div>

      {compared.length > 1 && (
        <ClinicalCard title={isBn ? 'তুলনা' : 'Comparison'}>
          <p className="text-xs text-[#64748B] mb-3">{isBn ? 'শুধু জেলা এবং যাচাইকৃত সেবা। দূরত্ব বা রেটিং বানানো হয়নি।' : 'District and verified services only. Distance and ratings are not invented.'}</p>
          <ul className="space-y-2 text-sm">
            {compared.map((row) => (
              <li key={row.id}>{row.hospital_name} · {row.district} · {isBn ? 'যাচাইকৃত বিশেষত্ব নেই' : 'no verified specialty'}</li>
            ))}
          </ul>
        </ClinicalCard>
      )}
    </PageContainer>
  );
}

export default Hospitals;
