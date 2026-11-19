import React from 'react';

// Footer Component for application layout
function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 py-6 text-center text-sm text-gray-500">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <p>&copy; 2026 VitaGuard AI. International AI Builders Congress Submission.</p>
        <p className="text-xs text-gray-400 font-mono">Explainable AI & Privacy Compliant (v1.1)</p>
      </div>
    </footer>
  );
}

export default Footer;