import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell } from 'lucide-react';
import API from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import ClinicalCard from './ui/ClinicalCard';
import EmptyState from './ui/EmptyState';
import MedicalButton from './ui/MedicalButton';

function NotificationCenter({ compact = false }) {
  const { lang, t } = useLanguage();
  const isBn = lang === 'bn';
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);

  const [kind, setKind] = useState('');

  const load = async (nextKind = kind) => {
    try {
      const res = await API.get('/api/notifications', { params: { lang, kind: nextKind || undefined, limit: 20, offset: 0 } });
      setItems(res.data.notifications || []);
      setUnread(res.data.unread || 0);
    } catch {
      setItems([]);
    }
  };

  useEffect(() => {
    load();
  }, [lang]);

  const markRead = async (id) => {
    try {
      await API.post(`/api/notifications/${id}/read`);
      load();
    } catch {
      /* keep list */
    }
  };

  return (
    <ClinicalCard
      id="section-notifications"
      title={isBn ? 'নোটিফিকেশন' : 'Notifications'}
      subtitle={isBn ? `${unread}টি অপঠিত` : `${unread} unread`}
      icon={Bell}
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <label className="text-xs font-semibold text-slate-500" htmlFor="notice-kind">{isBn ? 'ধরন' : 'Category'}</label>
        <select id="notice-kind" value={kind} onChange={(e) => { setKind(e.target.value); load(e.target.value); }} className="rounded-lg border border-slate-200 px-2 py-1 text-xs">
          <option value="">{isBn ? 'সব' : 'All'}</option>
          <option value="appointment">appointment</option>
          <option value="blood">blood</option>
          <option value="message">message</option>
          <option value="verification">verification</option>
        </select>
        <MedicalButton variant="ghost" size="sm" onClick={async () => { await API.post('/api/notifications/read-all'); load(); }}>
          {isBn ? 'সব পড়া হয়েছে' : 'Mark all read'}
        </MedicalButton>
      </div>
      {items.length === 0 ? (
        <EmptyState
          icon={Bell}
          title={isBn ? 'নতুন নোটিশ নেই' : 'No notices yet'}
          description={isBn ? 'অ্যাপয়েন্টমেন্ট, যাচাই ও স্ক্রিনিং আপডেট এখানে আসবে।' : 'Appointment, verification, and screening updates will appear here.'}
        />
      ) : (
        <ul className="space-y-3">
          {items.slice(0, compact ? 5 : 20).map((item) => (
            <li key={item.id} className={`rounded-xl border p-3 ${item.is_read ? 'border-[#E2E8F0]' : 'border-[#99F6E4] bg-[#F0FDFA]'}`}>
              <p className="text-sm font-semibold text-[#12304A]">{item.title}</p>
              <p className="text-xs text-[#475569] mt-1">{item.body}</p>
              <p className="text-[11px] text-slate-400 mt-1">{item.kind} · {item.created_at}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {item.link && (
                  <Link to={item.link} className="text-xs font-semibold text-[#0F766E]">
                    {isBn ? 'খুলুন' : 'Open'}
                  </Link>
                )}
                {!item.is_read && (
                  <MedicalButton variant="ghost" size="sm" onClick={() => markRead(item.id)}>
                    {isBn ? 'পড়া হয়েছে' : 'Mark read'}
                  </MedicalButton>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </ClinicalCard>
  );
}

export default NotificationCenter;
