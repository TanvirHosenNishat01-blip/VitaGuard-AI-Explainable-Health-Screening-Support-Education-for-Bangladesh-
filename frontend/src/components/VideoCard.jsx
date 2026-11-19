import React from 'react';

// Video Card Component for displaying health education video snippets
function VideoCard({ title, duration, sourceUrl }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden p-4 space-y-3">
      <div className="bg-gray-100 h-40 rounded-lg flex items-center justify-center text-gray-400 font-medium">
        [Educational Video Player]
      </div>
      <div>
        <h4 className="font-semibold text-gray-800 text-sm">{title || 'Understanding Health Metrics'}</h4>
        <p className="text-xs text-gray-500 mt-1">{duration || '2-minute read/watch'}</p>
      </div>
    </div>
  );
}

export default VideoCard;