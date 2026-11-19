import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import API, { getApiError } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import PageContainer from '../components/ui/PageContainer';
import ClinicalCard from '../components/ui/ClinicalCard';
import AlertBanner from '../components/ui/AlertBanner';

const BOOKMARK_KEY = 'vitaguard-knowledge-bookmarks';

function KnowledgeArticle() {
  const { articleId } = useParams();
  const { lang } = useLanguage();
  const isBn = lang === 'bn';
  const [article, setArticle] = useState(null);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    API.get(`/api/knowledge/articles/${articleId}`)
      .then((response) => {
        setArticle(response.data);
        const marks = JSON.parse(localStorage.getItem(BOOKMARK_KEY) || '[]');
        setSaved(marks.includes(response.data.id));
      })
      .catch((err) => setError(getApiError(err, 'Article not found.')));
  }, [articleId]);

  const toggle = () => {
    const marks = JSON.parse(localStorage.getItem(BOOKMARK_KEY) || '[]');
    const next = marks.includes(article.id) ? marks.filter((id) => id !== article.id) : [...marks, article.id];
    localStorage.setItem(BOOKMARK_KEY, JSON.stringify(next));
    setSaved(next.includes(article.id));
  };

  if (error) {
    return <PageContainer className="py-8"><p className="text-sm text-[#B91C1C]">{error}</p></PageContainer>;
  }
  if (!article) {
    return <PageContainer className="py-8"><p className="text-sm text-[#64748B]">{isBn ? 'লোড হচ্ছে' : 'Loading'}</p></PageContainer>;
  }

  return (
    <PageContainer className="space-y-6 py-8 max-w-3xl">
      <Link to="/knowledge" className="text-sm text-[#0E7490]">{isBn ? 'জ্ঞান হাবে ফিরুন' : 'Back to the knowledge hub'}</Link>
      <ClinicalCard title={isBn ? article.title_bn : article.title_en} subtitle={isBn ? article.summary_bn : article.summary_en}>
        <AlertBanner tone="warning" title={isBn ? 'শিক্ষামূলক তথ্য' : 'Educational information'}>
          {isBn ? article.disclaimer_bn : article.disclaimer_en}
        </AlertBanner>
        <p className="text-sm text-[#334155] mt-4 leading-relaxed">{isBn ? article.body_bn : article.body_en}</p>
        <p className="text-xs text-[#64748B] mt-4">
          {article.author} · {article.source} · {article.last_reviewed} · {article.license}
        </p>
        <p className="text-xs text-[#475569] mt-2">{article.role_note}</p>
        <button type="button" onClick={toggle} className="mt-4 text-sm text-[#0E7490]">
          {saved
            ? (isBn ? 'এই ব্রাউজার থেকে সরান' : 'Remove from this browser')
            : (isBn ? 'এই ব্রাউজারে রাখুন, অ্যাকাউন্টে নয়' : 'Keep in this browser, not on the account')}
        </button>
      </ClinicalCard>
      {(article.related || []).length > 0 && (
        <ClinicalCard title={isBn ? 'সম্পর্কিত নোট' : 'Related notes'}>
          <ul className="space-y-2">
            {article.related.map((item) => (
              <li key={item.id}>
                <Link className="text-sm text-[#0E7490]" to={`/knowledge/articles/${item.id}`}>{isBn ? item.title_bn : item.title_en}</Link>
              </li>
            ))}
          </ul>
        </ClinicalCard>
      )}
    </PageContainer>
  );
}

export default KnowledgeArticle;
