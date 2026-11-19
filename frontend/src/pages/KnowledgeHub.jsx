import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Search } from 'lucide-react';
import API, { getApiError } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import PageContainer from '../components/ui/PageContainer';
import ClinicalCard from '../components/ui/ClinicalCard';
import MedicalButton from '../components/ui/MedicalButton';
import AlertBanner from '../components/ui/AlertBanner';
import ClinicalInput from '../components/ui/ClinicalInput';
import ClinicalSelect from '../components/ui/ClinicalSelect';

const RECENT_KEY = 'vitaguard-knowledge-recent';
const INTEREST_KEY = 'vitaguard-knowledge-interests';

function readList(key) {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function KnowledgeHub() {
  const { lang } = useLanguage();
  const isBn = lang === 'bn';
  const role = (localStorage.getItem('userRole') || 'guest').toLowerCase();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('ALL');
  const [categories, setCategories] = useState([]);
  const [articles, setArticles] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [recent, setRecent] = useState(readList(RECENT_KEY));
  const [interests, setInterests] = useState(readList(INTEREST_KEY));
  const [adminNote, setAdminNote] = useState('');

  const loadArticles = async (nextCategory = category, nextQuery = '') => {
    setCatalogLoading(true);
    try {
      const response = await API.get('/api/knowledge/articles', {
        params: { category: nextCategory, q: nextQuery },
      });
      setArticles(response.data.articles || []);
    } finally {
      setCatalogLoading(false);
    }
  };

  useEffect(() => {
    API.get('/api/knowledge/categories').then((response) => setCategories(response.data.categories || [])).catch(() => {});
    loadArticles('ALL', '').catch(() => setError(isBn ? 'তালিকা আসেনি।' : 'The catalog did not load.'));
  }, []);

  useEffect(() => {
    const handle = setTimeout(() => {
      API.get('/api/knowledge/suggestions', { params: { q: query } })
        .then((response) => setSuggestions(response.data.suggestions || []))
        .catch(() => setSuggestions([]));
    }, 200);
    return () => clearTimeout(handle);
  }, [query]);

  const runSearch = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const [search, catalog] = await Promise.all([
        API.post('/api/knowledge/search', { query, limit: 5 }),
        API.get('/api/knowledge/articles', { params: { category, q: query } }),
      ]);
      setResult(search.data);
      setArticles(catalog.data.articles || []);
    } catch (err) {
      setError(getApiError(err, 'The knowledge search did not run.'));
    } finally {
      setLoading(false);
    }
  };

  const titleOf = (item) => (isBn ? item.title_bn : item.title_en);
  const summaryOf = (item) => (isBn ? item.summary_bn : item.summary_en);
  const popular = articles.filter((item) => item.popular).slice(0, 4);
  const faqs = articles.filter((item) => item.faq);
  const recommended = articles.filter((item) => interests.includes(item.category)).slice(0, 4);

  const toggleInterest = (id) => {
    const next = interests.includes(id) ? interests.filter((item) => item !== id) : [...interests, id];
    setInterests(next);
    localStorage.setItem(INTEREST_KEY, JSON.stringify(next));
  };

  const remember = (item) => {
    const next = [{ id: item.id, title_en: item.title_en, title_bn: item.title_bn }, ...recent.filter((row) => row.id !== item.id)].slice(0, 6);
    setRecent(next);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  };

  return (
    <PageContainer className="space-y-6 py-8">
      <ClinicalCard
        title={isBn ? 'স্বাস্থ্য জ্ঞান হাব' : 'Health knowledge hub'}
        subtitle={isBn ? 'অনুমোদিত প্রকল্প নথি ও শিক্ষামূলক নোট। রোগ নির্ণয় নয়।' : 'Project notes and educational articles. Not a diagnosis.'}
        icon={BookOpen}
      >
        <AlertBanner tone="warning" title={isBn ? 'শিক্ষামূলক সহকারী' : 'Educational knowledge assistant'}>
          {isBn ? 'এটি রোগ নির্ণয় বা চিকিৎসা সেবা নয়।' : 'Not a diagnostic or treatment service.'}
        </AlertBanner>
        <p className="text-xs text-[#64748B] mt-3">
          {role === 'admin' && (isBn ? 'অ্যাডমিন দৃশ্য: তালিকা কোডে প্রকাশিত। নতুন নিবন্ধ ডেটাবেজে সেভ হয় না।' : 'Admin view: the catalog is published in code. A new article is not saved to the database.')}
          {role === 'doctor' && (isBn ? 'ডাক্তার দৃশ্য: একই শিক্ষামূলক তালিকা। নোটিশ আলাদা ওয়ার্কফ্লো।' : 'Doctor view: the same educational catalog. A health notice is a separate workflow.')}
          {role === 'patient' && (isBn ? 'রোগী দৃশ্য: পাবলিক নিবন্ধ। আগ্রহ এই ব্রাউজারে থাকে।' : 'Patient view: public articles. Interests stay in this browser.')}
          {!['admin', 'doctor', 'patient'].includes(role) && (isBn ? 'অতিথি দৃশ্য: পাবলিক শিক্ষামূলক নিবন্ধ।' : 'Guest view: public educational articles.')}
        </p>
        <form onSubmit={runSearch} className="mt-4 grid grid-cols-1 lg:grid-cols-[1fr_16rem_auto] gap-3 items-end">
          <ClinicalInput
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            label={isBn ? 'প্রশ্ন' : 'Question'}
            list="knowledge-suggestions"
          />
          <datalist id="knowledge-suggestions">
            {suggestions.map((item) => <option key={item} value={item} />)}
          </datalist>
          <ClinicalSelect label={isBn ? 'বিষয়' : 'Topic'} value={category} onChange={(e) => { setCategory(e.target.value); loadArticles(e.target.value, query).catch(() => {}); }}>
            <option value="ALL">{isBn ? 'সব বিষয়' : 'All topics'}</option>
            {categories.map((item) => (
              <option key={item.id} value={item.id}>{isBn ? item.label_bn : item.label_en}</option>
            ))}
          </ClinicalSelect>
          <MedicalButton type="submit" loading={loading} leftIcon={<Search className="w-4 h-4" />}>
            {isBn ? 'খুঁজুন' : 'Search'}
          </MedicalButton>
        </form>
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" className="text-xs text-[#0E7490]" onClick={() => { setRecent([]); localStorage.removeItem(RECENT_KEY); }}>
            {isBn ? 'সাম্প্রতিক দেখা মুছুন' : 'Clear recently viewed'}
          </button>
        </div>
        {catalogLoading && <p className="text-sm text-[#64748B] mt-3">{isBn ? 'লোড হচ্ছে' : 'Loading'}</p>}
        {error && (
          <div className="mt-3 space-y-2">
            <p className="text-sm text-[#B91C1C]">{error}</p>
            <MedicalButton type="button" variant="outline" onClick={() => loadArticles(category, query).catch(() => setError(isBn ? 'তালিকা আসেনি।' : 'The catalog did not load.'))}>
              {isBn ? 'আবার চেষ্টা' : 'Retry'}
            </MedicalButton>
          </div>
        )}
      </ClinicalCard>

      <div className="flex flex-wrap gap-2">
        {categories.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => toggleInterest(item.id)}
            className={`px-3 py-1 rounded-full text-xs border ${interests.includes(item.id) ? 'bg-[#12304A] text-white border-[#12304A]' : 'bg-white text-[#334155] border-[#E2E8F0]'}`}
          >
            {isBn ? item.label_bn : item.label_en}
          </button>
        ))}
      </div>

      {recommended.length > 0 && (
        <ClinicalCard title={isBn ? 'নির্বাচিত আগ্রহ' : 'From your selected interests'}>
          <p className="text-xs text-[#64748B] mb-3">{isBn ? 'এই ব্রাউজারে সংরক্ষিত। অ্যাকাউন্টে নয়।' : 'Saved in this browser, not on the account.'}</p>
          <ArticleList items={recommended} isBn={isBn} titleOf={titleOf} summaryOf={summaryOf} onOpen={remember} />
        </ClinicalCard>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ClinicalCard title={isBn ? 'জনপ্রিয় নোট' : 'Popular topics'}>
          <ul className="space-y-2">
            {popular.map((item) => (
              <li key={item.id}>
                <Link className="text-sm text-[#0E7490]" to={`/knowledge/articles/${item.id}`} onClick={() => remember(item)}>{titleOf(item)}</Link>
              </li>
            ))}
          </ul>
        </ClinicalCard>
        <ClinicalCard title={isBn ? 'সম্প্রতি দেখা' : 'Recently viewed'}>
          {recent.length === 0 && <p className="text-sm text-[#64748B]">{isBn ? 'এখনো কিছু খোলা হয়নি।' : 'Nothing opened yet.'}</p>}
          <ul className="space-y-2">
            {recent.map((item) => (
              <li key={item.id}>
                <Link className="text-sm text-[#0E7490]" to={`/knowledge/articles/${item.id}`}>{isBn ? item.title_bn : item.title_en}</Link>
              </li>
            ))}
          </ul>
        </ClinicalCard>
      </div>

      <ClinicalCard title={isBn ? 'শিক্ষামূলক নোট' : 'Educational articles'}>
        <ArticleList items={articles} isBn={isBn} titleOf={titleOf} summaryOf={summaryOf} onOpen={remember} />
        {!catalogLoading && articles.length === 0 && (
          <p className="text-sm text-[#92400E]">{isBn ? 'এই ফিল্টারে কোনো নোট নেই। অন্য শব্দ ব্যবহার করুন।' : 'No note matches this filter. Try another word from the catalog.'}</p>
        )}
      </ClinicalCard>

      <ClinicalCard title={isBn ? 'সচরাচর প্রশ্ন' : 'Frequently asked questions'}>
        <ul className="space-y-2">
          {faqs.map((item) => (
            <li key={item.id}>
              <Link className="text-sm text-[#0E7490]" to={`/knowledge/articles/${item.id}`} onClick={() => remember(item)}>{titleOf(item)}</Link>
            </li>
          ))}
        </ul>
      </ClinicalCard>

      {result && (
        <ClinicalCard title={isBn ? 'উৎসসহ ফল' : 'Attributed results'}>
          <p className="text-xs text-[#64748B] mb-3">{result.disclaimer?.[isBn ? 'bn' : 'en']}</p>
          <p className="text-xs text-[#64748B] mb-3">{result.relevance_meaning || result.retrieval_method}</p>
          {result.unsupported && (
            <p className="text-sm text-[#92400E]">
              {isBn ? 'এই প্রশ্নের জন্য যথেষ্ট নথি নেই। উত্তর খালি রাখা হয়েছে।' : 'The catalog does not contain enough support. The answer stays empty.'}
            </p>
          )}
          <ul className="space-y-3">
            {(result.hits || []).map((hit) => (
              <li key={hit.id} className="rounded-xl border border-[#E2E8F0] p-4">
                <p className="font-semibold text-[#12304A]">{hit.title}</p>
                <p className="text-sm text-[#334155] mt-1">{hit.preview || hit.text}</p>
                <p className="text-xs text-[#64748B] mt-2">
                  {hit.publisher || 'Project'} · {hit.published || ''} · {hit.source} · {hit.license}
                </p>
                <p className="text-[11px] text-[#64748B]">{isBn ? `শব্দ মিল ${hit.score}। এটি ক্লিনিক্যাল আত্মবিশ্বাস নয়।` : `Lexical overlap ${hit.score}. Not clinical confidence.`}</p>
                {hit.category && (
                  <Link className="text-xs text-[#0E7490]" to={`/knowledge/articles/${hit.id}`}>{isBn ? 'নোট খুলুন' : 'Open note'}</Link>
                )}
              </li>
            ))}
          </ul>
          <Link to="/knowledge/graph" className="inline-block mt-4 text-sm text-[#0E7490]">
            {isBn ? 'ইন্টারেকটিভ গ্রাফ' : 'Open the interactive graph'}
          </Link>
        </ClinicalCard>
      )}

      {role === 'admin' && (
        <ClinicalCard title={isBn ? 'কনটেন্ট স্ট্যাটাস' : 'Content status'}>
          <p className="text-sm text-[#475569]">{isBn ? 'প্রতিটি নোটের স্ট্যাটাস কোডে প্রকাশিত। সম্পাদনা সেভ হয় না।' : 'Each note is published in code. Editing is not saved.'}</p>
          <MedicalButton
            type="button"
            variant="outline"
            className="mt-3"
            onClick={async () => {
              try {
                await API.post('/api/knowledge/articles', {});
              } catch (err) {
                setAdminNote(getApiError(err, 'Not saved.'));
              }
            }}
          >
            {isBn ? 'নতুন নিবন্ধ সেভ করার চেষ্টা' : 'Try to save a new article'}
          </MedicalButton>
          {adminNote && <p className="text-sm text-[#92400E] mt-3">{adminNote}</p>}
        </ClinicalCard>
      )}
    </PageContainer>
  );
}

function ArticleList({ items, isBn, titleOf, summaryOf, onOpen }) {
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item.id} className="rounded-xl border border-[#E2E8F0] p-4">
          <Link to={`/knowledge/articles/${item.id}`} onClick={() => onOpen(item)} className="font-semibold text-[#12304A]">
            {titleOf(item)}
          </Link>
          <p className="text-sm text-[#475569] mt-1">{summaryOf(item)}</p>
          <p className="text-[11px] text-[#64748B] mt-2">{item.source} · {item.last_reviewed} · {item.category}</p>
        </li>
      ))}
    </ul>
  );
}

export default KnowledgeHub;
