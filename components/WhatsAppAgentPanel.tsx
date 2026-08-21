'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  QrCode,
  Server,
  Settings,
  Users,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Send,
  Search,
  Phone,
  Check,
  X,
  Pencil,
  Plus,
  Trash2,
  Bell,
  Sparkles,
  Copy,
  ExternalLink,
  ShieldCheck,
  History,
  HelpCircle,
  FileText,
  Terminal
} from 'lucide-react';
import EvolutionApiLogsViewer from '@/components/EvolutionApiLogsViewer';

interface RecipientItem {
  codigo_vendedor: number;
  nome: string;
  email: string;
  phone: string;
  receive_order_copy: boolean;
  updatedAt?: string | null;
}

interface NotificationLog {
  id: string;
  orderNumber: string;
  sellerName: string;
  clientFantasyName: string;
  totalValue: number;
  manufacturers: string;
  messageText: string;
  recipientsCount: number;
  recipients: string[];
  status: string;
  isTest?: boolean;
  createdAt: string;
}

export default function WhatsAppAgentPanel({ sellerName = 'Administrador' }: { sellerName?: string }) {
  const [activeTab, setActiveTab] = useState<'evolution' | 'recipients' | 'test' | 'logs'>('evolution');
  const [showLogsModal, setShowLogsModal] = useState(false);

  // --- Evolution API States ---
  const [evolutionConfig, setEvolutionConfig] = useState({
    serverUrl: 'http://34.95.148.76:8080',
    apiKey: '53754C37-D781-42AA-86FD-2296A88370E6',
    instanceName: 'b2br_coletor'
  });
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [configSaveSuccess, setConfigSaveSuccess] = useState(false);

  const [isCheckingEvoStatus, setIsCheckingEvoStatus] = useState(false);
  const [isRestartingInstance, setIsRestartingInstance] = useState(false);
  const [evoConnectionStatus, setEvoConnectionStatus] = useState<string | null>(null);
  const [isGettingQrCode, setIsGettingQrCode] = useState(false);
  const [evoQrCode, setEvoQrCode] = useState<string | null>(null);
  const [evoPairingCode, setEvoPairingCode] = useState<string | null>(null);
  const [evoErrorMsg, setEvoErrorMsg] = useState<string | null>(null);
  const [showDockerGuide, setShowDockerGuide] = useState(false);

  // --- Recipients States ---
  const [recipients, setRecipients] = useState<RecipientItem[]>([]);
  const [logs, setLogs] = useState<NotificationLog[]>([]);
  const [isLoadingRecipients, setIsLoadingRecipients] = useState(true);
  const [isSavingRecipients, setIsSavingRecipients] = useState(false);
  const [recipientsSaveSuccess, setRecipientsSaveSuccess] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  // Inline Phone Editing
  const [editingCode, setEditingCode] = useState<number | null>(null);
  const [tempPhoneInput, setTempPhoneInput] = useState('');

  // Custom Recipient Modal / Form
  const [showAddCustomModal, setShowAddCustomModal] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customRole, setCustomRole] = useState('');
  const [customPhone, setCustomPhone] = useState('');

  // --- Test Dispatch States ---
  const [testPhone, setTestPhone] = useState('');
  const [testMessage, setTestMessage] = useState('Olá! Esta é uma mensagem de teste da integração WhatsApp via Evolution API do Coletor B2BR.');
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  // Test Copy Order Notification
  const [isTestCopySending, setIsTestCopySending] = useState(false);
  const [testCopyResult, setTestCopyResult] = useState<any>(null);

  // Check Status of Evolution API Instance
  const evolutionConfigRef = React.useRef(evolutionConfig);
  React.useEffect(() => {
    evolutionConfigRef.current = evolutionConfig;
  }, [evolutionConfig]);

  const handleCheckStatus = useCallback(async (overrideCfg?: { serverUrl?: string; apiKey?: string; instanceName?: string }) => {
    const targetUrl = overrideCfg?.serverUrl || evolutionConfigRef.current.serverUrl;
    const targetApiKey = overrideCfg?.apiKey || evolutionConfigRef.current.apiKey;
    const targetInstance = overrideCfg?.instanceName || evolutionConfigRef.current.instanceName || 'b2br_coletor';

    if (!targetUrl || !targetApiKey) {
      setEvoErrorMsg('Por favor, informe a URL do Servidor e a Chave de API da Evolution API.');
      return;
    }
    setIsCheckingEvoStatus(true);
    setEvoErrorMsg(null);
    setShowDockerGuide(false);

    try {
      const res = await fetch('/api/whatsapp/evolution/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serverUrl: targetUrl,
          apiKey: targetApiKey,
          instanceName: targetInstance
        })
      });
      const rawText = await res.text();
      let data: any = {};
      try {
        data = JSON.parse(rawText);
      } catch {
        data = {
          error: `O servidor Evolution API (${targetUrl || 'http://34.95.148.76:8080'}) não respondeu na porta 8080. Verifique se o container Docker está ativo e se a regra de Firewall no Google Cloud libera o tráfego de entrada na porta 8080.`,
          isConnRefused: true,
          isTimeout: true
        };
      }

      if (data.isConnRefused || data.error || data.success === false) {
        setEvoErrorMsg(data.error || 'Não foi possível conectar à Evolution API.');
        setEvoConnectionStatus('error');
        setShowDockerGuide(true);
      } else {
        const rawState = String(data.state || data.evolutionResponse?.instance?.state || '').toLowerCase();
        const isConnected = Boolean(data.connected);
        const finalState = isConnected ? 'open' : (rawState || 'disconnected');

        setEvoConnectionStatus(finalState);
        if (isConnected) {
          setEvoQrCode(null);
          setEvoPairingCode(null);
          setShowDockerGuide(false);
          setEvoErrorMsg(null);
        } else if (!evoQrCode && !isGettingQrCode) {
          // Auto-fetch QR code so user doesn't have to guess
          handleFetchQrCode();
        }
      }
    } catch (err: any) {
      setEvoErrorMsg(`Erro de conexão: ${err.message || 'Servidor indisponível'}`);
      setEvoConnectionStatus('error');
    } finally {
      setIsCheckingEvoStatus(false);
    }
  }, []);

  const loadEvolutionConfig = useCallback(async () => {
    try {
      const res = await fetch('/api/whatsapp/config');
      if (res.ok) {
        const data = await res.json();
        if (data?.config) {
          const cfg = {
            serverUrl: data.config.evolutionServerUrl || 'http://34.95.148.76:8080',
            apiKey: data.config.evolutionApiKey || '',
            instanceName: data.config.evolutionInstanceName || 'b2br_coletor'
          };
          setEvolutionConfig(cfg);
          if (cfg.serverUrl && cfg.apiKey) {
            handleCheckStatus(cfg);
          }
        }
      }
    } catch (err) {
      console.warn('Erro ao carregar configurações da Evolution API:', err);
    }
  }, [handleCheckStatus]);

  const loadRecipientsAndLogs = useCallback(async () => {
    setIsLoadingRecipients(true);
    try {
      const res = await fetch('/api/whatsapp/notifications');
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.sellers)) {
          setRecipients(data.sellers);
        }
        if (data && Array.isArray(data.logs)) {
          setLogs(data.logs);
        }
      }
    } catch (err) {
      console.warn('Erro ao carregar lista de destinatários:', err);
    } finally {
      setIsLoadingRecipients(false);
    }
  }, []);

  // Load Config & Recipients on mount
  useEffect(() => {
    let isMounted = true;
    (async () => {
      if (!isMounted) return;
      await loadEvolutionConfig();
      await loadRecipientsAndLogs();
    })();
    return () => { isMounted = false; };
  }, [loadEvolutionConfig, loadRecipientsAndLogs]);

  // Automatic polling while waiting for QR Code scan / connection sync
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (evoQrCode || evoConnectionStatus === 'connecting') {
      interval = setInterval(() => {
        handleCheckStatus();
      }, 3500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [evoQrCode, evoConnectionStatus, handleCheckStatus]);

  // Save Evolution API Server Credentials
  const handleSaveEvolutionConfig = async () => {
    setIsSavingConfig(true);
    setConfigSaveSuccess(false);
    try {
      const res = await fetch('/api/whatsapp/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: 'evolution',
          evolutionServerUrl: evolutionConfig.serverUrl,
          evolutionApiKey: evolutionConfig.apiKey,
          evolutionInstanceName: evolutionConfig.instanceName,
          userEmail: 'financeiro@b2brdistribuicao.com.br'
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setConfigSaveSuccess(true);
        setTimeout(() => setConfigSaveSuccess(false), 4000);
        handleCheckStatus();
      } else {
        alert(data.error || 'Erro ao salvar credenciais da Evolution API');
      }
    } catch (err) {
      alert('Erro ao conectar com o servidor local ao salvar configurações');
    } finally {
      setIsSavingConfig(false);
    }
  };

  // Fetch QR Code from Evolution API
  const handleFetchQrCode = async (overrideCfg?: { serverUrl?: string; apiKey?: string; instanceName?: string }, force = false) => {
    const targetUrl = overrideCfg?.serverUrl || evolutionConfigRef.current.serverUrl || 'http://34.95.148.76:8080';
    const targetApiKey = overrideCfg?.apiKey || evolutionConfigRef.current.apiKey || '53754C37-D781-42AA-86FD-2296A88370E6';
    const targetInstance = overrideCfg?.instanceName || evolutionConfigRef.current.instanceName || 'b2br_coletor';

    setIsGettingQrCode(true);
    setEvoErrorMsg(null);
    setEvoQrCode(null);
    setEvoPairingCode(null);

    try {
      const res = await fetch('/api/whatsapp/evolution/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serverUrl: targetUrl,
          apiKey: targetApiKey,
          instanceName: targetInstance,
          force
        })
      });
      const rawText = await res.text();
      let data: any = {};
      try {
        data = JSON.parse(rawText);
      } catch {
        data = {
          error: `O servidor Evolution API não respondeu na porta 8080 ao solicitar o QR Code.`,
          isConnRefused: true,
          isTimeout: true
        };
      }

      if (data.qrcodeBase64) {
        setEvoQrCode(data.qrcodeBase64);
        setEvoConnectionStatus('connecting');
        setShowDockerGuide(false);
      } else if (data.pairingCode) {
        setEvoPairingCode(data.pairingCode);
        setEvoConnectionStatus('connecting');
        setShowDockerGuide(false);
      } else if (data.connected || data.state === 'open') {
        setEvoConnectionStatus('open');
        setEvoQrCode(null);
        setEvoPairingCode(null);
        setShowDockerGuide(false);
      } else {
        setEvoErrorMsg(data.error || 'Falha ao conectar ao servidor Evolution API para obter QR Code.');
        setEvoConnectionStatus('error');
        setShowDockerGuide(true);
      }
    } catch (err: any) {
      setEvoErrorMsg(`Falha ao obter QR Code: ${err.message}`);
    } finally {
      setIsGettingQrCode(false);
    }
  };

  // Restart Evolution API Instance Socket
  const handleRestartInstance = async () => {
    const targetUrl = evolutionConfigRef.current.serverUrl || 'http://34.95.148.76:8080';
    const targetApiKey = evolutionConfigRef.current.apiKey || '53754C37-D781-42AA-86FD-2296A88370E6';
    const targetInstance = evolutionConfigRef.current.instanceName || 'b2br_coletor';

    setIsRestartingInstance(true);
    setEvoErrorMsg(null);
    try {
      const res = await fetch('/api/whatsapp/evolution/restart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serverUrl: targetUrl,
          apiKey: targetApiKey,
          instanceName: targetInstance
        })
      });
      const data = await res.json();
      if (data.success) {
        handleCheckStatus();
        handleFetchQrCode();
      } else {
        alert(data.error || 'Erro ao solicitar reinício da instância na Evolution API.');
      }
    } catch (err: any) {
      alert(`Falha na requisição de reinício: ${err.message}`);
    } finally {
      setIsRestartingInstance(false);
    }
  };

  // Explicitly disconnect/logout WhatsApp instance
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const handleDisconnectInstance = async () => {
    if (!confirm('Deseja realmente desconectar o WhatsApp desta instância?')) return;
    const targetUrl = evolutionConfigRef.current.serverUrl || 'http://34.95.148.76:8080';
    const targetApiKey = evolutionConfigRef.current.apiKey || '53754C37-D781-42AA-86FD-2296A88370E6';
    const targetInstance = evolutionConfigRef.current.instanceName || 'b2br_coletor';

    setIsLoggingOut(true);
    try {
      const res = await fetch('/api/whatsapp/evolution/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serverUrl: targetUrl,
          apiKey: targetApiKey,
          instanceName: targetInstance
        })
      });
      if (res.ok) {
        setEvoConnectionStatus('disconnected');
        setEvoQrCode(null);
        setEvoPairingCode(null);
        handleCheckStatus();
      } else {
        alert('Erro ao tentar desconectar instância.');
      }
    } catch (err: any) {
      alert(`Falha ao desconectar: ${err.message}`);
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Toggle recipient active state
  const handleToggleRecipient = (code: number) => {
    setRecipients((prev) =>
      prev.map((r) =>
        r.codigo_vendedor === code ? { ...r, receive_order_copy: !r.receive_order_copy } : r
      )
    );
  };

  // Save phone inline
  const handleSavePhoneInline = (code: number) => {
    setRecipients((prev) =>
      prev.map((r) =>
        r.codigo_vendedor === code ? { ...r, phone: tempPhoneInput.trim() } : r
      )
    );
    setEditingCode(null);
  };

  // Save Recipient Preferences to Firestore
  const handleSaveAllRecipients = async () => {
    setIsSavingRecipients(true);
    setRecipientsSaveSuccess(false);

    try {
      const res = await fetch('/api/whatsapp/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          updates: recipients.map((r) => ({
            codigo_vendedor: r.codigo_vendedor,
            nome: r.nome,
            email: r.email,
            phone: r.phone,
            receive_order_copy: r.receive_order_copy
          })),
          userEmail: 'financeiro@b2brdistribuicao.com.br'
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setRecipientsSaveSuccess(true);
        setTimeout(() => setRecipientsSaveSuccess(false), 4000);
      } else {
        alert(data.error || 'Erro ao salvar destinatários.');
      }
    } catch (err) {
      alert('Erro de comunicação ao salvar destinatários.');
    } finally {
      setIsSavingRecipients(false);
    }
  };

  // Add Custom Recipient
  const handleAddCustomRecipient = () => {
    if (!customName.trim() || !customPhone.trim()) {
      alert('Por favor, informe o Nome e o WhatsApp do contato.');
      return;
    }
    const newCode = 9000 + Math.floor(Math.random() * 1000);
    const newItem: RecipientItem = {
      codigo_vendedor: newCode,
      nome: customName.trim(),
      email: customRole.trim() ? `[${customRole.trim()}]` : 'Contato Interno',
      phone: customPhone.trim(),
      receive_order_copy: true,
      updatedAt: new Date().toISOString()
    };
    setRecipients((prev) => [newItem, ...prev]);
    setCustomName('');
    setCustomRole('');
    setCustomPhone('');
    setShowAddCustomModal(false);
  };

  // Test Send Order Copy Notification
  const handleTestOrderNotification = async () => {
    setIsTestCopySending(true);
    setTestCopyResult(null);

    try {
      const res = await fetch('/api/whatsapp/notify-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderNumber: '9999',
          sellerName: sellerName || 'Vendedor B2BR',
          clientFantasyName: 'Mercado Horizon Peak (TESTE)',
          totalValue: 1250.00,
          manufacturers: ['Serra de Minas', 'Mountain Brewery'],
          isTest: true
        })
      });

      const data = await res.json();
      setTestCopyResult(data);
      loadRecipientsAndLogs();
    } catch (err: any) {
      setTestCopyResult({
        success: false,
        error: err.message || 'Erro ao conectar ao servidor para teste'
      });
    } finally {
      setIsTestCopySending(false);
    }
  };

  // Send Direct Custom Message via Evolution API
  const handleSendTestMessage = async () => {
    if (!testPhone.trim()) {
      alert('Informe o número de WhatsApp para teste (DDD + Número).');
      return;
    }
    setIsSendingTest(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/whatsapp/send-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: testPhone,
          message: testMessage,
          provider: 'evolution',
          evolutionServerUrl: evolutionConfig.serverUrl,
          evolutionApiKey: evolutionConfig.apiKey,
          evolutionInstanceName: evolutionConfig.instanceName
        })
      });

      const data = await res.json();
      setTestResult(data);
    } catch (err: any) {
      setTestResult({
        success: false,
        error: err.message || 'Erro de rede ao disparar teste'
      });
    } finally {
      setIsSendingTest(false);
    }
  };

  const activeRecipientsCount = (Array.isArray(recipients) ? recipients : []).filter((r) => r && r.receive_order_copy).length;

  const filteredRecipients = (Array.isArray(recipients) ? recipients : []).filter((r) => {
    if (!r) return false;
    if (!searchFilter.trim()) return true;
    const term = searchFilter.toLowerCase();
    return (
      (r.nome && r.nome.toLowerCase().includes(term)) ||
      (r.email && r.email.toLowerCase().includes(term)) ||
      (r.phone && r.phone.includes(term))
    );
  });

  return (
    <div className="space-y-6 select-none font-sans">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#075e54] to-[#128c7e] text-white p-6 rounded-2xl shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-white/20 p-3 rounded-2xl shrink-0 backdrop-blur-sm">
            <QrCode size={32} className="text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-emerald-400/20 text-emerald-200 border border-emerald-300/30 text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full">
                Evolution API
              </span>
              <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-100">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    evoConnectionStatus === 'open' || evoConnectionStatus === 'connected'
                      ? 'bg-emerald-400 animate-pulse'
                      : evoConnectionStatus === 'connecting'
                      ? 'bg-amber-400 animate-ping'
                      : isCheckingEvoStatus
                      ? 'bg-blue-300 animate-pulse'
                      : 'bg-red-400'
                  }`}
                ></span>
                {evoConnectionStatus === 'open' || evoConnectionStatus === 'connected'
                  ? 'WhatsApp Conectado'
                  : evoConnectionStatus === 'connecting'
                  ? 'Conectando / Sincronizando...'
                  : isCheckingEvoStatus
                  ? 'Verificando Conexão...'
                  : 'Desconectado'}
                <button
                  onClick={() => handleCheckStatus()}
                  title="Atualizar status da conexão"
                  disabled={isCheckingEvoStatus}
                  className="hover:rotate-180 transition-transform duration-300 p-1 rounded hover:bg-white/10 cursor-pointer ml-1"
                >
                  <RefreshCw size={12} className={isCheckingEvoStatus ? "animate-spin text-emerald-200" : "text-emerald-200"} />
                </button>
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold font-sans tracking-tight mt-1">
              Cópia de Pedidos via WhatsApp
            </h2>
            <p className="text-xs text-emerald-100/90 mt-0.5">
              Envio automático e instantâneo de cópias de cada pedido emitido para os contatos cadastrados pelo Administrador.
            </p>
          </div>
        </div>

        {/* Subtab Selector */}
        <div className="flex flex-wrap items-center bg-black/20 p-1.5 rounded-xl border border-white/10 shrink-0 gap-1">
          <button
            onClick={() => setActiveTab('evolution')}
            className={`px-3.5 py-2 rounded-lg font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'evolution' ? 'bg-white text-[#075e54] shadow-sm' : 'text-white hover:bg-white/10'
            }`}
          >
            <Server size={14} />
            <span>Conexão Evolution API</span>
          </button>

          <button
            onClick={() => setActiveTab('recipients')}
            className={`px-3.5 py-2 rounded-lg font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'recipients' ? 'bg-white text-[#075e54] shadow-sm' : 'text-white hover:bg-white/10'
            }`}
          >
            <Users size={14} />
            <span>Destinatários das Cópias</span>
            {activeRecipientsCount > 0 && (
              <span className="bg-emerald-300 text-[#075e54] text-[10px] font-black px-1.5 py-0.2 rounded-full font-mono">
                {activeRecipientsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('test')}
            className={`px-3.5 py-2 rounded-lg font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'test' ? 'bg-white text-[#075e54] shadow-sm' : 'text-white hover:bg-white/10'
            }`}
          >
            <Send size={14} />
            <span>Teste de Envio</span>
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`px-3.5 py-2 rounded-lg font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'logs' ? 'bg-white text-[#075e54] shadow-sm' : 'text-emerald-100 hover:bg-white/10'
            }`}
          >
            <Terminal size={14} />
            <span>Logs & Diagnóstico JSON</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ABA 1: CONEXÃO EVOLUTION API (SERVIDOR & QR CODE)                         */}
      {/* ========================================================================= */}
      {activeTab === 'evolution' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Form de Configuração do Servidor */}
            <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                    <Server size={18} className="text-[#075e54]" />
                    <span>Servidor da Evolution API</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Insira as credenciais do seu servidor Docker da Evolution API para pareamento.
                  </p>
                </div>

                <button
                  onClick={handleSaveEvolutionConfig}
                  disabled={isSavingConfig}
                  className="bg-[#075e54] hover:bg-[#054d44] text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSavingConfig ? <RefreshCw size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                  <span>{isSavingConfig ? 'Salvando...' : 'Salvar Servidor'}</span>
                </button>
              </div>

              {configSaveSuccess && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  <span>Configurações do Servidor Evolution API salvas com sucesso!</span>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    URL do Servidor Evolution API (com porta 8080)
                  </label>
                  <input
                    type="text"
                    placeholder="http://34.95.148.76:8080"
                    value={evolutionConfig.serverUrl}
                    onChange={(e) => setEvolutionConfig((prev) => ({ ...prev, serverUrl: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#075e54] focus:bg-white"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    IP Público da VM Google Cloud ou servidor interno onde o container da Evolution API foi iniciado.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Chave de API Global (API Key)
                    </label>
                    <input
                      type="password"
                      placeholder="Sua Chave de API secreta"
                      value={evolutionConfig.apiKey}
                      onChange={(e) => setEvolutionConfig((prev) => ({ ...prev, apiKey: e.target.value }))}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#075e54] focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Nome da Instância
                    </label>
                    <input
                      type="text"
                      placeholder="b2br_coletor"
                      value={evolutionConfig.instanceName}
                      onChange={(e) => setEvolutionConfig((prev) => ({ ...prev, instanceName: e.target.value }))}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#075e54] focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Botões de Ação da Instância */}
              <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCheckStatus}
                    disabled={isCheckingEvoStatus}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-800 px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw size={14} className={isCheckingEvoStatus ? 'animate-spin text-[#075e54]' : ''} />
                    <span>{isCheckingEvoStatus ? 'Verificando Conexão...' : 'Verificar Status'}</span>
                  </button>

                  <button
                    onClick={handleRestartInstance}
                    disabled={isRestartingInstance}
                    title="Forçar o reinício da conexão do WhatsApp na Evolution API"
                    className="bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw size={14} className={isRestartingInstance ? 'animate-spin text-amber-700' : ''} />
                    <span>{isRestartingInstance ? 'Reiniciando...' : 'Reiniciar Instância'}</span>
                  </button>
                </div>

                <button
                  onClick={handleFetchQrCode}
                  disabled={isGettingQrCode}
                  className="bg-[#128c7e] hover:bg-[#0e7065] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <QrCode size={15} />
                  <span>{isGettingQrCode ? 'Gerando QR Code...' : 'Escanear QR Code no Celular'}</span>
                </button>

                <button
                  onClick={() => setActiveTab('logs')}
                  className="bg-slate-900 hover:bg-slate-800 text-slate-100 px-4 py-2.5 rounded-xl text-xs font-mono font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Terminal size={15} className="text-emerald-400" />
                  <span>Logs & JSON</span>
                </button>
              </div>

              {evoErrorMsg && (
                <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-2xl text-xs space-y-2">
                  <div className="flex items-center gap-2 font-bold">
                    <AlertCircle size={16} className="text-red-600 shrink-0" />
                    <span>Aviso de Conexão com a Evolution API</span>
                  </div>
                  <p className="text-red-700 leading-relaxed">{evoErrorMsg}</p>
                </div>
              )}
            </div>

            {/* Visualização de Status & QR Code */}
            <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between space-y-4">
              <div>
                <h3 className="font-bold text-base text-slate-900 mb-1 flex items-center gap-2">
                  <QrCode size={18} className="text-[#075e54]" />
                  <span>Conectar WhatsApp da Empresa</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Leia o QR Code abaixo com o aplicativo do WhatsApp no celular da empresa para conectar.
                </p>
              </div>

              {/* Display do QR Code */}
              <div className="my-auto py-4 flex flex-col items-center justify-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 p-6">
                {evoQrCode ? (
                  <div className="text-center space-y-3">
                    <div className="bg-white p-3 rounded-2xl shadow-md inline-block border border-slate-200 relative">
                      <img
                        src={evoQrCode.startsWith('data:') ? evoQrCode : `data:image/png;base64,${evoQrCode}`}
                        alt="QR Code Evolution API"
                        className="w-48 h-48 object-contain rounded-lg"
                      />
                    </div>
                    <div className="text-xs text-slate-600 space-y-1.5 max-w-xs">
                      <div className="flex items-center justify-center gap-1.5 text-emerald-700 font-bold text-xs bg-emerald-50 border border-emerald-200 py-1 px-2.5 rounded-full">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                        <span>Aguardando leitura no WhatsApp...</span>
                      </div>
                      <p className="font-semibold text-slate-900 pt-1">No WhatsApp do celular:</p>
                      <p className="text-[11px] text-slate-600">Configurações / Menu → Dispositivos Conectados → Conectar um aparelho.</p>
                      <div className="pt-2">
                        <button
                          onClick={handleFetchQrCode}
                          disabled={isGettingQrCode}
                          className="text-[11px] text-emerald-700 hover:text-emerald-900 underline font-medium cursor-pointer"
                        >
                          {isGettingQrCode ? 'Atualizando QR Code...' : 'Código expirou? Clique para atualizar'}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : evoConnectionStatus === 'open' ? (
                  <div className="text-center py-6 space-y-3">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                      <CheckCircle2 size={36} />
                    </div>
                    <div>
                      <h4 className="font-bold text-base text-slate-900">WhatsApp Conectado!</h4>
                      <p className="text-xs text-slate-500 max-w-xs mt-1">
                        Sua instância da Evolution API está conectada e pronta para realizar os disparos automáticos de pedidos.
                      </p>
                    </div>
                    <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
                      <button
                        onClick={() => handleFetchQrCode(undefined, true)}
                        disabled={isGettingQrCode}
                        className="text-xs text-emerald-800 hover:text-emerald-950 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                      >
                        <RefreshCw size={13} className={isGettingQrCode ? 'animate-spin' : ''} />
                        <span>{isGettingQrCode ? 'Gerando novo QR...' : 'Gerar Novo QR Code'}</span>
                      </button>
                      <button
                        onClick={handleDisconnectInstance}
                        disabled={isLoggingOut}
                        className="text-xs text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {isLoggingOut ? 'Desconectando...' : 'Desconectar WhatsApp'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 space-y-3">
                    <div className="w-14 h-14 bg-slate-200/80 rounded-2xl flex items-center justify-center mx-auto text-slate-500">
                      <QrCode size={28} />
                    </div>
                    <p className="text-xs text-slate-500 max-w-xs">
                      Clique no botão <strong>&quot;Escanear QR Code no Celular&quot;</strong> ao lado para carregar o código de pareamento.
                    </p>
                  </div>
                )}
              </div>

              {/* Guia do Docker e Firewall Google Cloud caso indisponível */}
              {showDockerGuide && (
                <div className="bg-amber-50/90 border border-amber-300 p-4 rounded-2xl text-xs space-y-3">
                  <div className="font-bold text-amber-950 flex items-center gap-2 border-b border-amber-200/80 pb-2">
                    <ShieldCheck size={16} className="text-amber-700 shrink-0" />
                    <span>Como resolver a conexão com a Evolution API (Porta 8080)</span>
                  </div>

                  <p className="text-amber-900 text-[11px] leading-relaxed">
                    O servidor de testes tentou conectar a <strong>{evolutionConfig.serverUrl || 'http://34.95.148.76:8080'}</strong> mas a porta 8080 não respondeu. Siga os 3 passos abaixo no Google Cloud:
                  </p>

                  <div className="space-y-2 text-[11px] text-amber-950 font-sans">
                    <div className="bg-white/80 p-2.5 rounded-xl border border-amber-200/80 space-y-1">
                      <p className="font-bold text-slate-900">1️⃣ Liberar Porta 8080 no Firewall do Google Cloud Console:</p>
                      <p className="text-slate-600">
                        Acesse <strong>GCP Console → VPC Network → Firewall Rules</strong> → Criar Regra de Firewall:
                      </p>
                      <ul className="list-disc list-inside text-slate-700 pl-1 space-y-0.5 font-mono text-[10px]">
                        <li>Targets: <strong>All instances in the network</strong></li>
                        <li>Source IPv4 ranges: <strong>0.0.0.0/0</strong></li>
                        <li>Protocols & Ports: Marque <strong>tcp</strong> e insira <strong>8080</strong></li>
                      </ul>
                    </div>

                    <div className="bg-white/80 p-2.5 rounded-xl border border-amber-200/80 space-y-1">
                      <p className="font-bold text-slate-900">2️⃣ Verificar se a VM do GCP e o Docker estão Rodando (SSH):</p>
                      <p className="text-slate-600">No terminal SSH da sua máquina virtual (`34.95.148.76`), rode:</p>
                      <div className="bg-slate-900 text-emerald-400 font-mono p-2 rounded-lg text-[10px]">
                        sudo docker ps
                      </div>
                      <p className="text-slate-600">Se o container não aparecer na lista, inicie o container da Evolution API:</p>
                      <div className="bg-slate-900 text-amber-300 font-mono p-2 rounded-lg text-[10px]">
                        sudo docker start evolution_api
                      </div>
                    </div>

                    <div className="bg-white/80 p-2.5 rounded-xl border border-amber-200/80 space-y-1">
                      <p className="font-bold text-slate-900">3️⃣ Testar a resposta localmente no terminal da VM:</p>
                      <div className="bg-slate-900 text-sky-300 font-mono p-2 rounded-lg text-[10px]">
                        curl http://localhost:8080
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ABA 2: DESTINATÁRIOS DAS CÓPIAS DOS PEDIDOS                              */}
      {/* ========================================================================= */}
      {activeTab === 'recipients' && (
        <div className="space-y-6">
          {/* Banner da Seção */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Users size={18} className="text-[#075e54]" />
                <span>Destinatários das Cópias dos Pedidos</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
                Marque abaixo quem deverá receber uma cópia formatada em texto via WhatsApp no momento em que um pedido for emitido pelo aplicativo.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                onClick={() => setShowAddCustomModal(true)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Plus size={14} />
                <span>Adicionar Contato</span>
              </button>

              <button
                onClick={handleTestOrderNotification}
                disabled={isTestCopySending}
                className="bg-[#edf5ec] hover:bg-[#e0eee0] text-[#075e54] border border-[#c3dec0] px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isTestCopySending ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
                <span>{isTestCopySending ? 'Enviando Teste...' : 'Disparar Cópia de Teste'}</span>
              </button>

              <button
                onClick={handleSaveAllRecipients}
                disabled={isSavingRecipients}
                className="bg-[#075e54] hover:bg-[#054d44] text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isSavingRecipients ? <RefreshCw size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                <span>{isSavingRecipients ? 'Salvando...' : 'Salvar Lista'}</span>
              </button>
            </div>
          </div>

          {recipientsSaveSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-xl text-xs font-bold flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <span>Lista de destinatários atualizada com sucesso no banco de dados!</span>
            </div>
          )}

          {/* Resultado do Teste de Cópia */}
          {testCopyResult && (
            <div className="bg-[#f0f8ef] border border-emerald-300 p-4 rounded-2xl space-y-2 relative">
              <button
                onClick={() => setTestCopyResult(null)}
                className="absolute top-3 right-3 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X size={16} />
              </button>
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                <CheckCircle2 size={18} className="text-emerald-600" />
                <span>Cópia de Pedido de Teste Disparada!</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-emerald-200 text-xs font-mono text-slate-800 whitespace-pre-wrap">
                {testCopyResult.message}
              </div>
            </div>
          )}

          {/* Tabela de Destinatários */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Users size={16} className="text-[#075e54]" />
                <h4 className="font-bold text-xs text-slate-800">Contatos do Omie ERP e Equipe Interna</h4>
              </div>

              <div className="relative w-64">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar contato ou celular..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#075e54]"
                />
              </div>
            </div>

            <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto p-2">
              {isLoadingRecipients ? (
                <div className="py-12 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                  <RefreshCw size={16} className="animate-spin text-[#075e54]" />
                  <span>Carregando destinatários...</span>
                </div>
              ) : filteredRecipients.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  Nenhum contato encontrado com os filtros aplicados.
                </div>
              ) : (
                filteredRecipients.map((item) => {
                  const isEditingThis = editingCode === item.codigo_vendedor;
                  return (
                    <div
                      key={item.codigo_vendedor}
                      className={`p-3.5 flex items-start justify-between gap-4 rounded-xl transition-colors ${
                        item.receive_order_copy ? 'bg-emerald-50/50 border border-emerald-100/60' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <input
                          type="checkbox"
                          checked={item.receive_order_copy}
                          onChange={() => handleToggleRecipient(item.codigo_vendedor)}
                          className="w-4 h-4 accent-[#075e54] rounded cursor-pointer mt-0.5"
                          id={`chk_${item.codigo_vendedor}`}
                        />

                        <div className="min-w-0 flex-1">
                          <label
                            htmlFor={`chk_${item.codigo_vendedor}`}
                            className="font-bold text-xs text-slate-900 cursor-pointer block truncate hover:text-[#075e54]"
                          >
                            {item.nome}
                          </label>
                          <p className="text-[11px] text-slate-500 truncate">{item.email}</p>

                          {/* Campo Telefone */}
                          <div className="mt-1 flex items-center gap-2">
                            {isEditingThis ? (
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="text"
                                  placeholder="(19) 99999-8888"
                                  value={tempPhoneInput}
                                  onChange={(e) => setTempPhoneInput(e.target.value)}
                                  className="border border-[#075e54] rounded px-2 py-0.5 text-xs font-mono bg-white focus:outline-none"
                                  autoFocus
                                />
                                <button
                                  onClick={() => handleSavePhoneInline(item.codigo_vendedor)}
                                  className="bg-[#075e54] text-white p-1 rounded hover:bg-[#054d44]"
                                >
                                  <Check size={12} />
                                </button>
                                <button
                                  onClick={() => setEditingCode(null)}
                                  className="bg-slate-200 text-slate-700 p-1 rounded hover:bg-slate-300"
                                >
                                  <X size={12} />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 text-xs font-mono">
                                <Phone size={12} className="text-slate-400" />
                                <span className={item.phone ? 'text-slate-800 font-bold' : 'text-slate-400 italic text-[11px]'}>
                                  {item.phone || 'Sem telefone cadastrado'}
                                </span>
                                <button
                                  onClick={() => {
                                    setEditingCode(item.codigo_vendedor);
                                    setTempPhoneInput(item.phone || '');
                                  }}
                                  className="text-slate-400 hover:text-[#075e54] p-0.5 cursor-pointer"
                                  title="Editar telefone"
                                >
                                  <Pencil size={12} />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span
                          className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                            item.receive_order_copy
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {item.receive_order_copy ? '🟢 Recebe Cópia' : '⚪ Inativo'}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal para Adicionar Contato Personalizado */}
      {showAddCustomModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Plus size={16} className="text-[#075e54]" />
                <span>Adicionar Contato para Cópias</span>
              </h3>
              <button
                onClick={() => setShowAddCustomModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nome do Contato</label>
                <input
                  type="text"
                  placeholder="Ex: Carlos (Financeiro)"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#075e54]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Setor / Função (Opcional)</label>
                <input
                  type="text"
                  placeholder="Ex: Gerência / Expedição"
                  value={customRole}
                  onChange={(e) => setCustomRole(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#075e54]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">WhatsApp (DDD + Número)</label>
                <input
                  type="text"
                  placeholder="(19) 99582-0909"
                  value={customPhone}
                  onChange={(e) => setCustomPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-1 focus:ring-[#075e54]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowAddCustomModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancelar
              </button>

              <button
                onClick={handleAddCustomRecipient}
                className="bg-[#075e54] hover:bg-[#054d44] text-white px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Adicionar Destinatário
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ABA 3: TESTE DE ENVIO DIRETO                                               */}
      {/* ========================================================================= */}
      {activeTab === 'test' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-5 max-w-2xl">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <Send size={18} className="text-[#075e54]" />
              <span>Disparo de Teste Manual (Evolution API)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Envie uma mensagem direta de teste para qualquer número de WhatsApp para confirmar que a Evolution API está ativa.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Número de Destino (DDD + Telefone)
              </label>
              <input
                type="text"
                placeholder="(19) 99582-0909"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-1 focus:ring-[#075e54]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Mensagem de Teste
              </label>
              <textarea
                rows={3}
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-sans focus:outline-none focus:ring-1 focus:ring-[#075e54]"
              />
            </div>

            <button
              onClick={handleSendTestMessage}
              disabled={isSendingTest}
              className="bg-[#075e54] hover:bg-[#054d44] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSendingTest ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
              <span>{isSendingTest ? 'Disparando...' : 'Disparar Mensagem no WhatsApp'}</span>
            </button>
          </div>

          {testResult && (
            <div
              className={`p-4 rounded-2xl text-xs space-y-3 border ${
                testResult.success
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-red-50 border-red-200 text-red-900'
              }`}
            >
              <div className="flex items-center gap-2 font-bold">
                {testResult.success ? (
                  <CheckCircle2 size={16} className="text-emerald-600" />
                ) : (
                  <AlertCircle size={16} className="text-red-600" />
                )}
                <span>
                  {testResult.success
                    ? 'Mensagem enviada com sucesso no WhatsApp!'
                    : 'Falha no envio da mensagem'}
                </span>
              </div>

              <p className="text-[11px] leading-relaxed">
                {testResult.message || testResult.error || 'Verifique se a instância da Evolution API está conectada.'}
              </p>

              {testResult.diagnosticHelp && (
                <div className="bg-white/80 p-3 rounded-xl border border-red-200 text-[11px] text-slate-700 space-y-1.5">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <HelpCircle size={14} className="text-amber-600" />
                    <span>Como Resolver:</span>
                  </div>
                  <div className="whitespace-pre-line text-slate-600 leading-relaxed font-mono text-[10px]">
                    {testResult.diagnosticHelp}
                  </div>
                </div>
              )}

              <div className="pt-1 flex flex-wrap items-center gap-2">
                {!testResult.success && (
                  <>
                    <button
                      onClick={handleFetchQrCode}
                      className="bg-[#075e54] hover:bg-[#054d44] text-white px-3.5 py-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <QrCode size={13} />
                      <span>Escanear QR Code</span>
                    </button>

                    <button
                      onClick={handleRestartInstance}
                      disabled={isRestartingInstance}
                      className="bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 px-3.5 py-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw size={13} className={isRestartingInstance ? 'animate-spin' : ''} />
                      <span>{isRestartingInstance ? 'Reiniciando...' : 'Reiniciar Instância'}</span>
                    </button>
                  </>
                )}

                <button
                  onClick={() => setActiveTab('logs')}
                  className="bg-slate-900 hover:bg-slate-800 text-slate-100 px-3.5 py-1.5 rounded-lg text-[11px] font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Terminal size={13} className="text-emerald-400" />
                  <span>Ver Payload & Resposta nos Logs JSON</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* ABA 4: LOGS & DIAGNÓSTICO EM TEMPO REAL (EVOLUTION API)                   */}
      {/* ========================================================================= */}
      {activeTab === 'logs' && (
        <div className="space-y-4">
          <EvolutionApiLogsViewer
            onTriggerTest={() => setActiveTab('test')}
          />
        </div>
      )}

      {/* Modal View for Logs (when opened from any screen) */}
      {showLogsModal && (
        <EvolutionApiLogsViewer
          isModal
          onClose={() => setShowLogsModal(false)}
          onTriggerTest={() => {
            setShowLogsModal(false);
            setActiveTab('test');
          }}
        />
      )}
    </div>
  );
}
