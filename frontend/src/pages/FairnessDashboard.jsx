import React, { useEffect, useState } from 'react';
import { Scale } from 'lucide-react';
import API, { getApiError } from '../services/api';
import PageContainer from '../components/ui/PageContainer';
import ClinicalCard from '../components/ui/ClinicalCard';
import AlertBanner from '../components/ui/AlertBanner';

function FairnessDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    API.get('/api/ai/fairness')
      .then((response) => setData(response.data))
      .catch((err) => setError(getApiError(err, 'Fairness documentation did not load.')));
  }, []);

  const historical = data?.historical_repository_evidence;

  return (
    <PageContainer className="space-y-6 py-8">
      <ClinicalCard title="AI fairness" subtitle="Historical file evidence only. No new subgroup study." icon={Scale}>
        <AlertBanner tone="warning" title="Not a real-world fairness claim">
          This page does not run a synthetic fairness experiment and does not claim real-world fairness.
        </AlertBanner>
        {error && <p className="text-sm text-[#B91C1C] mt-3">{error}</p>}
      </ClinicalCard>
      {historical && (
        <ClinicalCard title="DiaBD historical file">
          <p className="text-xs text-[#64748B]">{historical.evidence_class}</p>
          <p className="text-sm mt-2">Test rows {historical.test_rows}. License on the data card: {historical.license_status_in_data_card}.</p>
          <p className="text-xs text-[#64748B] mt-2">Copied from the existing evaluation file. Not a fairness study.</p>
          <ul className="text-sm mt-3 space-y-1">
            {Object.entries(historical.test_metrics || {}).map(([name, value]) => (
              <li key={name}>{name}: {value}</li>
            ))}
          </ul>
          <p className="text-sm mt-2">{historical.note}</p>
          <p className="text-xs text-[#64748B] mt-2">Source {historical.source}</p>
        </ClinicalCard>
      )}
      {data && (
        <ClinicalCard title="Suppressed metrics">
          <ul className="text-sm space-y-2">
            {(data.suppressed || []).map((item) => (
              <li key={item.metric}>{item.metric}: {item.reason}</li>
            ))}
          </ul>
        </ClinicalCard>
      )}
    </PageContainer>
  );
}

export default FairnessDashboard;
