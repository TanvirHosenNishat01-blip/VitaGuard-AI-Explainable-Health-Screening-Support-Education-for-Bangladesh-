import React, { useState } from 'react';

// Awareness Section Component for health education, risk classifications, and WHO/CDC resource guides
function AwarenessSection() {
  const [activeTab, setActiveTab] = useState('diabetes');

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900">Health Awareness & Risk Hub</h2>
        <p className="text-sm text-gray-500 mt-1">
          Simple, source-linked information for your everyday health questions, risk thresholds, and prevention guidelines.
        </p>

        {/* Category Tabs */}
        <div className="flex gap-4 mt-4 border-b border-gray-200 pb-2">
          <button
            onClick={() => setActiveTab('diabetes')}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition ${activeTab === 'diabetes' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            Diabetes Risk Guidelines
          </button>
          <button
            onClick={() => setActiveTab('cardio')}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition ${activeTab === 'cardio' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            Cardiovascular Risk Guidelines
          </button>
          <button
            onClick={() => setActiveTab('resources')}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition ${activeTab === 'resources' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            Trusted Resources & Videos
          </button>
        </div>
      </div>

      {/* Content Area based on Selected Tab */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
        {activeTab === 'diabetes' && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-800">Diabetes Risk Ranges & Preventive Suggestions</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-red-50/60 rounded-xl border border-red-100 space-y-2">
                <h4 className="font-bold text-red-900">High Risk</h4>
                <p className="text-xs text-red-700 font-mono">FBS ≥ 126 mg/dL | HbA1c ≥ 6.5%</p>
                <p className="text-sm text-gray-700">Prompt consultation with a qualified healthcare professional is strongly recommended. Monitor blood glucose and maintain a strict diet[cite: 7].</p>
              </div>

              <div className="p-4 bg-yellow-50/60 rounded-xl border border-yellow-100 space-y-2">
                <h4 className="font-bold text-yellow-900">Medium Risk</h4>
                <p className="text-xs text-yellow-700 font-mono">FBS 100–125 mg/dL | HbA1c 5.7%–6.4%</p>
                <p className="text-sm text-gray-700">Improve dietary habits, exercise regularly, maintain a healthy weight, and schedule routine checkups[cite: 7].</p>
              </div>

              <div className="p-4 bg-green-50/60 rounded-xl border border-green-100 space-y-2">
                <h4 className="font-bold text-green-900">Low Risk</h4>
                <p className="text-xs text-green-700 font-mono">FBS &lt; 100 mg/dL | HbA1c &lt; 5.7%</p>
                <p className="text-sm text-gray-700">Maintain a balanced lifestyle through proper nutrition, hydration, regular physical activity, and routine monitoring[cite: 7].</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'cardio' && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-800">Cardiovascular Disease Risk & Blood Pressure Thresholds</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-red-50/60 rounded-xl border border-red-100 space-y-2">
                <h4 className="font-bold text-red-900">High Risk</h4>
                <p className="text-xs text-red-700 font-mono">10-Year ASCVD ≥ 10% | BP ≥ 140/90 mmHg</p>
                <p className="text-sm text-gray-700">Prompt medical consultation required. Monitor blood pressure and cholesterol, reduce sodium, avoid smoking, and follow clinical advice[cite: 7].</p>
              </div>

              <div className="p-4 bg-yellow-50/60 rounded-xl border border-yellow-100 space-y-2">
                <h4 className="font-bold text-yellow-900">Medium Risk</h4>
                <p className="text-xs text-yellow-700 font-mono">ASCVD 3%–10% | BP 130–139/80–89 mmHg</p>
                <p className="text-sm text-gray-700">Adopt heart-healthy dietary habits, limit salt intake, manage weight, avoid smoking, and monitor blood pressure regularly[cite: 7].</p>
              </div>

              <div className="p-4 bg-green-50/60 rounded-xl border border-green-100 space-y-2">
                <h4 className="font-bold text-green-900">Low Risk</h4>
                <p className="text-xs text-green-700 font-mono">ASCVD &lt; 3% | Normal BP &lt; 120/80 mmHg</p>
                <p className="text-sm text-gray-700">Maintain a healthy lifestyle, balanced nutrition, adequate sleep, stress management, and routine wellness monitoring[cite: 7].</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'resources' && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-800">Verified Medical Resources & Guidelines</h3>
            <p className="text-sm text-gray-500">Explore official global guidelines and educational resources to support your health awareness:</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
                <h4 className="font-semibold text-gray-800">American Heart Association (AHA)</h4>
                <p className="text-xs text-gray-600">Explore PREVENT Risk Calculator and Life's Essential 8 for optimal cardiovascular wellness[cite: 8, 9].</p>
                <a href="https://www.heart.org" target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline inline-block">Visit AHA Guidelines →</a>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
                <h4 className="font-semibold text-gray-800">World Health Organization (WHO)</h4>
                <p className="text-xs text-gray-600">Access official factsheets on diabetes prevention, hypertension management, and global health metrics[cite: 8, 9].</p>
                <a href="https://www.who.int" target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline inline-block">Visit WHO Factsheets →</a>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
                <h4 className="font-semibold text-gray-800">BIRDEM & National Heart Foundation (Bangladesh)</h4>
                <p className="text-xs text-gray-600">Local institutional resources specializing in diabetes care, endocrinology, and cardiovascular treatment[cite: 9].</p>
                <span className="text-xs text-gray-500">Available via National Health Directories</span>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
                <h4 className="font-semibold text-gray-800">CDC Diabetes Prevention & Education</h4>
                <p className="text-xs text-gray-600">Clinical insights on prediabetes risk testing, lifestyle modifications, and Type 2 diabetes prevention[cite: 8].</p>
                <a href="https://www.cdc.gov/diabetes" target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline inline-block">Visit CDC DiabetesTV →</a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AwarenessSection;