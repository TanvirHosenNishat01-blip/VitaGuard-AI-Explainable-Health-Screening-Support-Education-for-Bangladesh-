import React from 'react';
import { useNavigate } from 'react-router-dom';

function Assessment() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f3f6f9] flex flex-col justify-between font-sans">
      {/* Main Choice Cards */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-12 flex flex-col justify-center">
        <div className="mb-10 text-center sm:text-left">
          <span className="text-[11px] font-bold text-blue-600 uppercase tracking-widest">
            TAKE A MOMENT FOR YOU
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mt-1">
            What would you like to assess?
          </h2>
          <p className="text-sm text-gray-500 mt-2">
            Choose an assessment and enter measurements from your health records.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Diabetes Card */}
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <span className="text-xs font-mono font-bold text-gray-400">01</span>
                <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[11px] font-semibold">
                  8 measurements · Guided form
                </span>
              </div>
              <div className="w-16 h-16 rounded-2xl bg-rose-50 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                🩸
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Diabetes assessment</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Bring together eight measurements from your health records in a simple, guided form.
              </p>
            </div>

            <div className="pt-8">
              <button
                onClick={() => navigate('/predict/diabetes')}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold flex items-center justify-center space-x-2 transition shadow-md group-hover:shadow-blue-500/20"
              >
                <span>Start assessment</span>
                <span>→</span>
              </button>
            </div>
          </div>

          {/* Cardiovascular Card */}
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <span className="text-xs font-mono font-bold text-gray-400">02</span>
                <span className="px-3 py-1 bg-rose-50 text-rose-600 rounded-full text-[11px] font-semibold">
                  13 measurements · Guided form
                </span>
              </div>
              <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                🫀
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Cardiovascular assessment</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Organize thirteen heart-health measurements with clear fields and a review before saving.
              </p>
            </div>

            <div className="pt-8">
              <button
                onClick={() => navigate('/predict/cardio')}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold flex items-center justify-center space-x-2 transition shadow-md group-hover:shadow-blue-500/20"
              >
                <span>Start assessment</span>
                <span>→</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-white border-t border-gray-200 py-4 px-8 text-center text-xs text-gray-400">
        &copy; 2026 TriNexus · VitaGuard AI. A little care today. A better tomorrow.
      </footer>
    </div>
  );
}

export default Assessment;