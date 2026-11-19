import React, { useEffect, useState } from 'react';
import { History } from 'lucide-react';
import API from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import ClinicalCard from './ui/ClinicalCard';
import EmptyState from './ui/EmptyState';

function JourneyTimeline() {
  const { lang } = useLanguage();
  const isBn = lang === 'bn';
  const [events, setEvents] = useState([]);

  useEffect(() => {
    API.get('/api/patient/journey')
      .then((res) => setEvents(res.data.events || []))
      .catch(() => setEvents([]));
  }, []);

  return (
    <ClinicalCard
      id="section-journey"
      title={isBn ? 'স্বাস্থ্য যাত্রা' : 'Health journey'}
      subtitle={isBn ? 'সেভ করা স্ক্রিনিং, অ্যাপয়েন্টমেন্ট ও গাইডলাইন' : 'Saved screenings, appointments, and guidelines'}
      icon={History}
    >
      {events.length === 0 ? (
        <EmptyState
          title={isBn ? 'এখনো কোনো ধাপ নেই' : 'No steps yet'}
          description={isBn ? 'একটি স্ক্রিনিং সেভ করলে বা সময় চাইলে এখানে দেখাবে।' : 'A saved screening or appointment request will appear here.'}
        />
      ) : (
        <ol className="space-y-3">
          {events.map((event, index) => (
            <li key={`${event.kind}-${event.at}-${index}`} className="border-l-2 border-[#99F6E4] pl-4">
              <p className="text-sm font-semibold text-[#12304A]">{isBn ? event.title_bn : event.title_en}</p>
              <p className="text-xs text-[#64748B]">{event.detail} · {event.at ? event.at.replace('T', ' ').slice(0, 16) : ''}</p>
            </li>
          ))}
        </ol>
      )}
    </ClinicalCard>
  );
}

export default JourneyTimeline;
