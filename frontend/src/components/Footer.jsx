import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-white border-t border-[#E2E8F0] mt-auto pt-8 pb-20 md:pb-8 text-sm text-[#64748B]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Brand & Non-Diagnostic Notice */}
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2.5">
              <div
                className="w-7 h-7 rounded-lg bg-[#12304A] flex items-center justify-center text-white shrink-0"
                aria-hidden="true"
              >
                <Activity className="w-4 h-4 text-[#2DD4BF]" />
              </div>
              <span className="font-extrabold text-[#12304A] tracking-tight">
                TriNexus | VitaGuard AI
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#F0FDFA] border border-[#99F6E4] text-[11px] font-bold text-[#0F766E]">
                <ShieldCheck className="w-3 h-3" aria-hidden="true" />
                <span>XAI CDSS</span>
              </span>
            </div>
            <p className="text-xs text-[#64748B] leading-relaxed">
              {t('footerDisclaimer')}
            </p>
          </div>

          {/* Quick Clinical Links */}
          <nav
            aria-label="Footer Navigation"
            className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-semibold text-[#12304A]"
          >
            <Link
              to="/assessment"
              className="hover:text-[#0D9488] transition-colors py-1"
            >
              {t('assessment')}
            </Link>
            <Link
              to="/bangladesh"
              className="hover:text-[#0D9488] transition-colors py-1"
            >
              {t('bangladesh')}
            </Link>
            <Link
              to="/evaluation"
              className="hover:text-[#0D9488] transition-colors py-1"
            >
              {t('evaluation')}
            </Link>
            <Link
              to="/awareness"
              className="hover:text-[#0D9488] transition-colors py-1"
            >
              {t('awareness')}
            </Link>
            <Link
              to="/blood"
              className="hover:text-[#0D9488] transition-colors py-1"
            >
              {t('blood')}
            </Link>
            <Link
              to="/notices"
              className="hover:text-[#0D9488] transition-colors py-1"
            >
              {t('notice')}
            </Link>
          </nav>
        </div>

        <div className="pt-4 border-t border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#64748B]">
          <p>&copy; 2026 TriNexus &middot; VitaGuard AI. All rights reserved.</p>
          <p className="font-mono text-[11px] text-[#64748B]">
            Screening support. Not a diagnosis. Not a certified clinical system.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
