'use client';

import React from 'react';
import WhatsAppAgentPanel from '@/components/WhatsAppAgentPanel';

export default function SettingsPanel({
  sellerName = 'Administrador',
  userEmail = 'financeiro@b2brdistribuicao.com.br'
}: {
  sellerName?: string;
  userEmail?: string;
}) {
  return (
    <div className="space-y-6 select-none font-sans">
      <WhatsAppAgentPanel sellerName={sellerName} />
    </div>
  );
}
