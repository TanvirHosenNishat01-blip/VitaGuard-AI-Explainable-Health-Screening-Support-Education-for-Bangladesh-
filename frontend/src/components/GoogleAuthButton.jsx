import React, { useEffect, useRef, useState } from 'react';
import API from '../services/api';
import { useLanguage } from '../context/LanguageContext';

function GoogleAuthButton({ label, onCredential, onUnavailable }) {
  const hostRef = useRef(null);
  const callbackRef = useRef(onCredential);
  callbackRef.current = onCredential;
  const { lang } = useLanguage();
  const isBn = lang === 'bn';
  const [clientId, setClientId] = useState(import.meta.env.VITE_GOOGLE_CLIENT_ID || '');

  useEffect(() => {
    if (clientId) return undefined;
    let cancelled = false;
    API.get('/api/auth/google-config')
      .then((res) => {
        if (!cancelled && res.data?.client_id) setClientId(res.data.client_id);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [clientId]);

  useEffect(() => {
    if (!clientId || !hostRef.current) return undefined;
    let cancelled = false;

    const render = () => {
      if (cancelled || !window.google?.accounts?.id || !hostRef.current) return;
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response) => callbackRef.current(response.credential),
        auto_select: false,
      });
      hostRef.current.innerHTML = '';
      window.google.accounts.id.renderButton(hostRef.current, {
        theme: 'outline',
        size: 'large',
        text: label === 'signup' ? 'signup_with' : 'continue_with',
        shape: 'pill',
        width: 320,
      });
    };

    if (window.google?.accounts?.id) {
      render();
      return undefined;
    }
    const existing = document.getElementById('google-gsi');
    if (existing) {
      existing.addEventListener('load', render);
      return () => existing.removeEventListener('load', render);
    }
    const script = document.createElement('script');
    script.id = 'google-gsi';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.onload = render;
    document.body.appendChild(script);
    return () => {
      cancelled = true;
    };
  }, [clientId, label]);

  if (!clientId) {
    return (
      <button
        type="button"
        onClick={onUnavailable}
        className="w-full py-2.5 border border-slate-300 bg-white text-slate-800 text-sm font-semibold rounded-xl hover:bg-slate-50"
      >
        {label === 'signup'
          ? (isBn ? 'Google দিয়ে নিবন্ধন' : 'Sign up with Google')
          : (isBn ? 'Google দিয়ে চালিয়ে যান' : 'Continue with Google')}
      </button>
    );
  }

  return <div ref={hostRef} className="flex justify-center min-h-[40px]" />;
}

export default GoogleAuthButton;
