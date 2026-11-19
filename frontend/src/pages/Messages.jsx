import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import API, { getApiError } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import PageContainer from '../components/ui/PageContainer';
import ClinicalCard from '../components/ui/ClinicalCard';
import MedicalButton from '../components/ui/MedicalButton';
import AlertBanner from '../components/ui/AlertBanner';
import EmptyState from '../components/ui/EmptyState';
import { MessageSquare } from 'lucide-react';

const NOTICE = 'Messages are for simulated platform coordination only. They are not monitored for emergencies and must not be used for urgent medical assistance.';

function Messages() {
  const { lang } = useLanguage();
  const isBn = lang === 'bn';
  const [params] = useSearchParams();
  const [threads, setThreads] = useState([]);
  const [activeId, setActiveId] = useState(params.get('thread') || '');
  const [messages, setMessages] = useState([]);
  const [body, setBody] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const loadThreads = async () => {
    const res = await API.get('/api/messages/threads');
    setThreads(res.data.threads || []);
    return res.data.threads || [];
  };

  const openThread = async (id) => {
    setActiveId(String(id));
    const res = await API.get(`/api/messages/threads/${id}`);
    setMessages(res.data.messages || []);
    await API.post(`/api/messages/threads/${id}/read`);
  };

  useEffect(() => {
    loadThreads()
      .then((rows) => {
        const requested = params.get('thread');
        if (requested) return openThread(requested);
        if (rows[0]) return openThread(rows[0].id);
        return null;
      })
      .catch((err) => setError(getApiError(err, 'Messages could not be loaded.')))
      .finally(() => setLoading(false));
  }, []);

  const send = async (event) => {
    event.preventDefault();
    setError('');
    try {
      await API.post(`/api/messages/threads/${activeId}`, { body });
      setBody('');
      await openThread(activeId);
      await loadThreads();
    } catch (err) {
      setError(getApiError(err, 'The message was not sent.'));
    }
  };

  return (
    <PageContainer>
      <ClinicalCard title={isBn ? 'সমন্বয় বার্তা' : 'Coordination messages'} icon={MessageSquare}>
        <AlertBanner tone="warning"><p>{NOTICE}</p></AlertBanner>
        {error && <AlertBanner tone="critical"><p>{error}</p></AlertBanner>}
        {loading ? <p className="text-sm text-slate-500">{isBn ? 'লোড হচ্ছে...' : 'Loading...'}</p> : null}
        {!loading && threads.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title={isBn ? 'কোনো থ্রেড নেই' : 'No threads yet'}
            description={isBn
              ? 'নিশ্চিত অ্যাপয়েন্টমেন্টের পর ডাক্তারের সাথে সমন্বয় বার্তা খোলা যায়।'
              : 'A thread opens after a confirmed appointment with that doctor.'}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-4">
            <ul className="space-y-2">
              {threads.map((thread) => (
                <li key={thread.id}>
                  <button type="button" onClick={() => openThread(thread.id)} className={`w-full text-left rounded-lg border px-3 py-2 text-sm ${String(activeId) === String(thread.id) ? 'border-teal-600 bg-teal-50' : 'border-slate-200'}`}>
                    {thread.other_name}
                    {thread.unread ? ` · ${thread.unread}` : ''}
                  </button>
                </li>
              ))}
            </ul>
            <div>
              <ul className="space-y-2 max-h-80 overflow-y-auto">
                {messages.map((item) => (
                  <li key={item.id} className={`rounded-lg px-3 py-2 text-sm ${item.mine ? 'bg-[#12304A] text-white' : 'bg-slate-100 text-slate-800'}`}>
                    <p>{item.body}</p>
                    <p className="text-[11px] opacity-70 mt-1">{item.created_at} · {item.read ? (isBn ? 'পড়া' : 'read') : (isBn ? 'অপঠিত' : 'unread')}</p>
                  </li>
                ))}
              </ul>
              {activeId && (
                <form onSubmit={send} className="mt-3 flex gap-2">
                  <label className="sr-only" htmlFor="coord-body">{isBn ? 'বার্তা' : 'Message'}</label>
                  <input id="coord-body" value={body} onChange={(e) => setBody(e.target.value)} maxLength={500} className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder={isBn ? 'সমন্বয় বার্তা' : 'Coordination message'} />
                  <MedicalButton type="submit">{isBn ? 'পাঠান' : 'Send'}</MedicalButton>
                </form>
              )}
            </div>
          </div>
        )}
      </ClinicalCard>
    </PageContainer>
  );
}

export default Messages;
