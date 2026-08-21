'use client';

import React, { useEffect } from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#f9faf7] flex flex-col items-center justify-center p-6 text-[#191c1b]" id="error-boundary-container">
      <div className="max-w-md w-full text-center space-y-6" id="error-boundary-card">
        {/* Visual Cue */}
        <div className="flex justify-center" id="error-boundary-icon-wrapper">
          <div className="p-4 bg-[#ffdad6] text-[#410002] rounded-full inline-flex items-center justify-center">
            <AlertTriangle size={48} id="error-boundary-icon" />
          </div>
        </div>

        {/* Text content */}
        <div className="space-y-2" id="error-boundary-text-wrapper">
          <h1 className="text-2xl font-bold tracking-tight text-[#191c1b] font-sans" id="error-boundary-title">
            Algo deu errado!
          </h1>
          <p className="text-sm text-[#444941]/80 max-w-sm mx-auto" id="error-boundary-description">
            Ocorreu um erro inesperado na execução do aplicativo. Por favor, tente recarregar.
          </p>
        </div>

        {/* Action Button */}
        <div className="pt-4 flex justify-center gap-3" id="error-boundary-action-wrapper">
          <button
            onClick={() => reset()}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#416a3c] hover:bg-[#2d4f29] text-white rounded-xl text-sm font-semibold shadow-sm transition-all duration-200 select-none cursor-pointer"
            id="error-boundary-retry-button"
          >
            <RefreshCw size={16} className="animate-spin-hover" />
            Tentar Novamente
          </button>
          
          <button
            onClick={() => window.location.href = '/'}
            className="inline-flex items-center gap-2 px-5 py-2.5 border border-[#e1e3e0] hover:bg-[#e1e3e0]/35 text-[#444941] rounded-xl text-sm font-semibold transition-all duration-200 select-none cursor-pointer"
            id="error-boundary-home-button"
          >
            Ir para Início
          </button>
        </div>
      </div>
    </div>
  );
}
