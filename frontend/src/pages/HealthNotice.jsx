import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

function HealthNotice() {
  const { t } = useLanguage();
  const { token, user } = useAuth();
  const [notices, setNotices] = useState([]);
  const [drafts, setDrafts] = useState({});
  const [reports, setReports] = useState({});
  const [message, setMessage] = useState('');

  const loadNotices = () => {
    API.get('/api/notices')
      .then((res) => setNotices(res.data.notices || []))
      .catch(() => setNotices([]));
  };

  useEffect(() => {
    loadNotices();
  }, [token]);

  const sendReport = async (noticeId) => {
    const reason = (reports[noticeId] || '').trim();
    setMessage('');
    try {
      await API.post(`/api/notices/${noticeId}/report`, { reason });
      setReports((current) => ({ ...current, [noticeId]: '' }));
      setMessage(t('reportSent'));
    } catch (err) {
      const detail = err.response?.data?.detail;
      setMessage(typeof detail === 'string' ? detail : 'Report was not sent.');
    }
  };

  const sendReply = async (noticeId) => {
    const content = (drafts[noticeId] || '').trim();
    setMessage('');
    if (content.length < 8) {
      setMessage('Write at least 8 characters. Do not include a phone number, report, or symptom list.');
      return;
    }
    try {
      await API.post(`/api/notices/${noticeId}/replies`, { content });
      setDrafts((current) => ({ ...current, [noticeId]: '' }));
      setMessage('Reply published on this notice.');
      loadNotices();
    } catch (err) {
      const detail = err.response?.data?.detail;
      setMessage(typeof detail === 'string' ? detail : 'Reply was not published.');
    }
  };

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 space-y-4">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <h1 className="text-2xl font-extrabold text-slate-900">{t('notice')}</h1>
        <p className="text-sm text-slate-500 mt-2">{t('replyPublic')}</p>
      </div>
      {message && <p className="text-sm font-semibold text-slate-700">{message}</p>}
      {notices.length === 0 && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 text-sm text-slate-500">
          {t('noNoticeYet')}
        </div>
      )}
      {notices.map((item) => (
        <article key={item.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex justify-between text-xs">
            <span className="px-2 py-0.5 bg-blue-50 text-blue-700 font-bold rounded">{item.category}</span>
            <span className="text-slate-400">{item.date}</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900">{item.title}</h2>
          <p className="text-sm text-slate-700 leading-relaxed">{item.content}</p>
          <p className="text-xs font-semibold text-emerald-700">{item.doctor_name} · {t('doctorBadge')}</p>
          <div className="space-y-2 border-t border-slate-100 pt-3">
            {(item.replies || []).map((reply) => (
              <div key={reply.id} className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                <p className="text-[11px] font-bold text-slate-500">
                  {reply.author_name} · {reply.author_role === 'doctor' ? 'Doctor reply' : 'Patient reply'} · {reply.date}
                </p>
                <p className="text-sm text-slate-700 mt-1">{reply.content}</p>
              </div>
            ))}
            {item.can_reply ? (
              <div className="space-y-2">
                <textarea
                  rows={2}
                  value={drafts[item.id] || ''}
                  onChange={(e) => setDrafts((current) => ({ ...current, [item.id]: e.target.value }))}
                  placeholder={user?.role === 'doctor' ? 'Answer this patient reply' : 'Reply to this notice'}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
                />
                <button type="button" onClick={() => sendReply(item.id)} className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg">
                  {t('replyButton')}
                </button>
              </div>
            ) : (
              <p className="text-xs text-slate-500">
                {token ? 'Only a patient, or the doctor who published this notice, can reply.' : (
                  <Link to="/login" className="text-blue-600 font-semibold">{t('signInToReply')}</Link>
                )}
              </p>
            )}
            {token ? (
              <div className="space-y-2 border-t border-slate-100 pt-3">
                <textarea
                  rows={2}
                  value={reports[item.id] || ''}
                  onChange={(e) => setReports((current) => ({ ...current, [item.id]: e.target.value }))}
                  placeholder={t('reportPlaceholder')}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg"
                />
                <button type="button" onClick={() => sendReport(item.id)} className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg">
                  {t('reportNotice')}
                </button>
              </div>
            ) : (
              <p className="text-xs text-slate-500 border-t border-slate-100 pt-3">
                <Link to="/login" className="text-blue-600 font-semibold">{t('reportSignIn')}</Link>
              </p>
            )}
          </div>
        </article>
      ))}
    </main>
  );
}

export default HealthNotice;
