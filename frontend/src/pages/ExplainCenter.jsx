import React, { useEffect, useState } from 'react';
import { Info } from 'lucide-react';
import API, { getApiError } from '../services/api';
import PageContainer from '../components/ui/PageContainer';
import ClinicalCard from '../components/ui/ClinicalCard';
import AlertBanner from '../components/ui/AlertBanner';

function ExplainCenter() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    API.get('/api/ai/explain')
      .then((response) => setData(response.data))
      .catch((err) => setError(getApiError(err, 'Explainability did not load.')));
  }, []);

  return (
    <PageContainer className="space-y-6 py-8">
      <ClinicalCard title="AI explainability" subtitle="Four separate pathways. No new thresholds." icon={Info}>
        <AlertBanner tone="warning" title="Educational knowledge assistant">
          Educational knowledge assistant. Not a diagnostic or treatment service.
        </AlertBanner>
        {error && <p className="text-sm text-[#B91C1C] mt-3">{error}</p>}
        {!data && !error && <p className="text-sm mt-3">Loading pathway documentation.</p>}
      </ClinicalCard>
      {data && (data.pathways || []).map((pathway) => (
        <ClinicalCard key={pathway.id} title={pathway.label || pathway.id}>
          <p className="text-sm">{data.shap_policy?.[pathway.id]}</p>
          <p className="text-xs text-[#64748B] mt-2">Engine {pathway.engine}. SHAP {pathway.shap}.</p>
          <p className="text-xs text-[#64748B]">Patient access {pathway.patient_access || 'unchanged from the existing pathway'}.</p>
          <p className="text-xs break-all text-[#64748B]">{pathway.artifact_sha256 || 'No trained-artifact hash for this pathway.'}</p>
          <p className="text-xs text-[#64748B]">{pathway.meaning}</p>
        </ClinicalCard>
      ))}
    </PageContainer>
  );
}

export default ExplainCenter;
