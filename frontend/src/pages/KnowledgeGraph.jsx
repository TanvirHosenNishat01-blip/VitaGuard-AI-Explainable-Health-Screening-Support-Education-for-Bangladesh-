import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Network } from 'lucide-react';
import API, { getApiError } from '../services/api';
import PageContainer from '../components/ui/PageContainer';
import ClinicalCard from '../components/ui/ClinicalCard';
import AlertBanner from '../components/ui/AlertBanner';

function KnowledgeGraph() {
  const [graph, setGraph] = useState(null);
  const [error, setError] = useState('');
  const [kind, setKind] = useState('all');
  const [selected, setSelected] = useState(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    API.get('/api/knowledge/graph')
      .then((response) => setGraph(response.data))
      .catch((err) => setError(getApiError(err, 'The graph did not load.')));
  }, []);

  const nodes = useMemo(
    () => (graph?.nodes || []).filter((node) => kind === 'all' || node.kind === kind),
    [graph, kind],
  );

  const layout = nodes.map((node, index) => {
    const angle = (Math.PI * 2 * index) / Math.max(nodes.length, 1);
    return { ...node, x: 220 + Math.cos(angle) * 140, y: 180 + Math.sin(angle) * 110 };
  });

  return (
    <PageContainer className="space-y-6 py-8">
      <ClinicalCard title="Knowledge graph" subtitle="Documented project concepts. No causal medical claims." icon={Network}>
        <AlertBanner tone="warning" title="Educational knowledge assistant">
          Educational knowledge assistant. Not a diagnostic or treatment service.
        </AlertBanner>
        <div className="mt-4 flex flex-wrap gap-2">
          {['all', 'pathway', 'lookup', 'restricted', 'governance', 'oversight'].map((item) => (
            <button key={item} type="button" onClick={() => setKind(item)} className="rounded-full border border-[#E2E8F0] px-3 py-1 text-xs">
              {item}
            </button>
          ))}
          <button type="button" onClick={() => setScale((value) => Math.min(1.6, value + 0.1))} className="text-xs px-2">Zoom in</button>
          <button type="button" onClick={() => setScale((value) => Math.max(0.7, value - 0.1))} className="text-xs px-2">Zoom out</button>
        </div>
        {error && <p className="text-sm text-[#B91C1C] mt-3">{error}</p>}
        {!error && graph && nodes.length === 0 && <p className="text-sm mt-3">No concepts in this category.</p>}
        <div className="overflow-auto mt-4 border border-[#E2E8F0] rounded-2xl">
          <svg viewBox="0 0 440 360" style={{ transform: `scale(${scale})`, transformOrigin: 'center' }} className="w-full min-h-[320px]">
            {(graph?.edges || []).map((edge) => {
              const from = layout.find((node) => node.id === edge.from);
              const to = layout.find((node) => node.id === edge.to);
              if (!from || !to) return null;
              return <line key={`${edge.from}-${edge.to}`} x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke="#94A3B8" />;
            })}
            {layout.map((node) => (
              <g key={node.id} onClick={() => setSelected(node)} className="cursor-pointer">
                <circle cx={node.x} cy={node.y} r="28" fill={selected?.id === node.id ? '#0E7490' : '#E0F2FE'} />
                <text x={node.x} y={node.y + 4} textAnchor="middle" fontSize="9">{node.id}</text>
              </g>
            ))}
          </svg>
        </div>
        <p className="text-xs text-[#64748B] mt-2">Legend: pathway, lookup, restricted, governance, oversight. Drag the frame to pan.</p>
      </ClinicalCard>
      {selected && (
        <ClinicalCard title={selected.label}>
          <p className="text-sm">{selected.description}</p>
          <p className="text-xs text-[#64748B] mt-2">Category {selected.kind}. License {selected.license}.</p>
          <p className="text-xs text-[#64748B]">Source {selected.source}</p>
          <Link to="/knowledge" className="text-sm text-[#0E7490]">Back to search</Link>
        </ClinicalCard>
      )}
    </PageContainer>
  );
}

export default KnowledgeGraph;
