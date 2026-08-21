'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Terminal,
  RefreshCw,
  Trash2,
  Copy,
  Check,
  Search,
  Filter,
  AlertCircle,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2,
  FileCode,
  Shield,
  Activity,
  Send,
  QrCode,
  Radio,
  Server,
  Download,
  Info,
  X
} from 'lucide-react';
import { WhatsAppApiLogEntry } from '@/lib/whatsapp-logger';

interface Props {
  isModal?: boolean;
  onClose?: () => void;
  onTriggerTest?: () => void;
}

export default function EvolutionApiLogsViewer({ isModal = false, onClose, onTriggerTest }: Props) {
  const [logs, setLogs] = useState<WhatsAppApiLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'SEND' | 'STATUS' | 'QR' | 'ERROR'>('ALL');
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copyReportSuccess, setCopyReportSuccess] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date | null>(null);

  // Fetch logs from API
  const fetchLogs = useCallback(async (isSilent = false) => {
    if (!isSilent) setIsLoading(true);
    try {
      const res = await fetch('/api/whatsapp/logs?limit=60');
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.logs)) {
          setLogs(data.logs);
          setLastRefreshedAt(new Date());
          
          // Auto-expand the very latest log if none is expanded
          setExpandedIds((prev) => {
            if (data.logs.length > 0 && Object.keys(prev).length === 0) {
              return { [data.logs[0].id]: true };
            }
            return prev;
          });
        }
      }
    } catch (err) {
      console.warn('Erro ao carregar logs da Evolution API:', err);
    } finally {
      if (!isSilent) setIsLoading(false);
    }
  }, []);

  // Initial fetch and auto-refresh interval
  useEffect(() => {
    let isMounted = true;

    const loadInitial = async () => {
      setIsLoading(true);
      try {
        const res = await fetch('/api/whatsapp/logs?limit=60');
        if (res.ok && isMounted) {
          const data = await res.json();
          if (data && Array.isArray(data.logs)) {
            setLogs(data.logs);
            setLastRefreshedAt(new Date());
            if (data.logs.length > 0) {
              setExpandedIds({ [data.logs[0].id]: true });
            }
          }
        }
      } catch (err) {
        console.warn('Erro ao carregar logs da Evolution API:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadInitial();

    let interval: NodeJS.Timeout | null = null;
    if (autoRefresh) {
      interval = setInterval(() => {
        if (isMounted) {
          fetchLogs(true);
        }
      }, 3500);
    }

    return () => {
      isMounted = false;
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, fetchLogs]);

  // Clear all logs
  const handleClearLogs = async () => {
    if (!confirm('Deseja realmente limpar todo o histórico de logs da Evolution API?')) return;
    setIsClearing(true);
    try {
      const res = await fetch('/api/whatsapp/logs', { method: 'DELETE' });
      if (res.ok) {
        setLogs([]);
        setExpandedIds({});
      } else {
        alert('Erro ao limpar logs.');
      }
    } catch {
      alert('Erro de conexão ao limpar logs.');
    } finally {
      setIsClearing(false);
    }
  };

  // Toggle expand individual log
  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const expandAll = () => {
    const allExpanded: Record<string, boolean> = {};
    logs.forEach((l) => {
      allExpanded[l.id] = true;
    });
    setExpandedIds(allExpanded);
  };

  const collapseAll = () => {
    setExpandedIds({});
  };

  // Copy single log JSON to clipboard formatted for Evolution API team
  const handleCopyLog = (log: WhatsAppApiLogEntry) => {
    const formatted = {
      tipo: 'LOG_COMUNICACAO_EVOLUTION_API',
      timestamp: log.timestamp,
      acao: log.label,
      metodo_http: log.method,
      endpoint_url: log.url,
      headers_enviados: log.headers,
      payload_requisicao: log.requestPayload || null,
      status_resposta: log.status,
      status_texto: log.statusText,
      tempo_resposta_ms: log.durationMs,
      resposta_servidor: log.responsePayload || null,
      erro_diagnosticado: log.error || null,
      dicas_resolucao: log.diagnosticHelp || null
    };

    navigator.clipboard.writeText(JSON.stringify(formatted, null, 2));
    setCopiedId(log.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Copy full debugging report in Markdown for Evolution API support team
  const handleCopyFullReport = () => {
    if (logs.length === 0) return;

    let md = `# RELATÓRIO DE DEBUG - EVOLUTION API (COLETOR B2BR)\n`;
    md += `**Gerado em:** ${new Date().toLocaleString('pt-BR')}\n`;
    md += `**Total de Requisições Registradas:** ${logs.length}\n\n`;
    md += `---\n\n`;

    filteredLogs.slice(0, 15).forEach((log, index) => {
      md += `### ${index + 1}. [${log.method}] ${log.label} (${new Date(log.timestamp).toLocaleTimeString('pt-BR')})\n`;
      md += `- **URL:** \`${log.url}\`\n`;
      md += `- **Status HTTP:** \`${log.status} (${log.statusText || 'N/A'})\` | **Duração:** \`${log.durationMs}ms\`\n`;
      md += `- **Sucesso:** ${log.isSuccess ? '✅ SIM' : '❌ NÃO'}\n`;
      if (log.error) {
        md += `- **Erro:** \`${log.error}\`\n`;
      }
      if (log.requestPayload) {
        md += `\n**Payload Enviado (Request JSON):**\n\`\`\`json\n${JSON.stringify(log.requestPayload, null, 2)}\n\`\`\`\n`;
      }
      if (log.responsePayload) {
        md += `\n**Resposta do Servidor (Response JSON):**\n\`\`\`json\n${JSON.stringify(log.responsePayload, null, 2)}\n\`\`\`\n`;
      }
      md += `\n---\n\n`;
    });

    navigator.clipboard.writeText(md);
    setCopyReportSuccess(true);
    setTimeout(() => setCopyReportSuccess(false), 3000);
  };

  // Category Filter Counts
  const counts = {
    all: logs.length,
    send: logs.filter((l) => l.action === 'SEND_MESSAGE' || l.action === 'ORDER_NOTIFICATION').length,
    status: logs.filter((l) => l.action === 'CHECK_STATUS' || l.action === 'RESTART_INSTANCE' || l.action === 'LOGOUT_INSTANCE').length,
    qr: logs.filter((l) => l.action === 'FETCH_QR' || l.action === 'CREATE_INSTANCE').length,
    errors: logs.filter((l) => !l.isSuccess || String(l.status).includes('ERR') || String(l.status).includes('TIME') || Number(l.status) >= 400).length
  };

  // Filtered Logs
  const filteredLogs = logs.filter((log) => {
    // Category check
    if (categoryFilter === 'SEND' && !(log.action === 'SEND_MESSAGE' || log.action === 'ORDER_NOTIFICATION')) {
      return false;
    }
    if (categoryFilter === 'STATUS' && !(log.action === 'CHECK_STATUS' || log.action === 'RESTART_INSTANCE' || log.action === 'LOGOUT_INSTANCE')) {
      return false;
    }
    if (categoryFilter === 'QR' && !(log.action === 'FETCH_QR' || log.action === 'CREATE_INSTANCE')) {
      return false;
    }
    if (categoryFilter === 'ERROR' && (log.isSuccess && !String(log.status).includes('ERR') && !String(log.status).includes('TIME') && (typeof log.status !== 'number' || log.status < 400))) {
      return false;
    }

    // Search Query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const jsonReq = log.requestPayload ? JSON.stringify(log.requestPayload).toLowerCase() : '';
      const jsonRes = log.responsePayload ? JSON.stringify(log.responsePayload).toLowerCase() : '';
      const matchesUrl = log.url.toLowerCase().includes(query);
      const matchesLabel = log.label.toLowerCase().includes(query);
      const matchesStatus = String(log.status).toLowerCase().includes(query) || String(log.statusText || '').toLowerCase().includes(query);
      const matchesError = (log.error || '').toLowerCase().includes(query);

      return matchesUrl || matchesLabel || matchesStatus || matchesError || jsonReq.includes(query) || jsonRes.includes(query);
    }

    return true;
  });

  const content = (
    <div className="space-y-4">
      {/* Top Header / Control Toolbar */}
      <div className="bg-slate-900 text-slate-100 p-4 sm:p-5 rounded-2xl border border-slate-800 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className="bg-emerald-500/20 text-emerald-400 p-2.5 rounded-xl border border-emerald-500/30 shrink-0">
            <Terminal size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-mono font-bold text-sm sm:text-base text-white tracking-tight">
                Logs de Comunicação Evolution API
              </h3>
              <div className="flex items-center gap-1.5 bg-slate-800 border border-slate-700 px-2.5 py-0.5 rounded-full text-[11px] font-mono">
                <span className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`}></span>
                <span className={autoRefresh ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                  {autoRefresh ? 'Tempo Real Ativo' : 'Pausado'}
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Inspetor de Payloads JSON, Headers e Respostas brutas do servidor Docker da Evolution API.
            </p>
          </div>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Auto Refresh Toggle */}
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            title={autoRefresh ? 'Pausar monitoramento automático' : 'Ativar monitoramento automático'}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
              autoRefresh
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <Radio size={13} className={autoRefresh ? 'animate-pulse text-emerald-400' : ''} />
            <span>{autoRefresh ? 'Auto (3s)' : 'Pausado'}</span>
          </button>

          {/* Refresh Manual */}
          <button
            onClick={() => fetchLogs()}
            disabled={isLoading}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Atualizar logs manualmente"
          >
            <RefreshCw size={13} className={isLoading ? 'animate-spin text-emerald-400' : ''} />
            <span className="hidden sm:inline">Atualizar</span>
          </button>

          {/* Copy Report for Evolution Support */}
          <button
            onClick={handleCopyFullReport}
            disabled={logs.length === 0}
            className="bg-[#075e54] hover:bg-[#054d44] text-white px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40 shadow-sm"
            title="Copiar relatório completo formatado em Markdown para enviar ao time de suporte da Evolution API"
          >
            {copyReportSuccess ? <Check size={13} className="text-emerald-300" /> : <Copy size={13} />}
            <span>{copyReportSuccess ? 'Relatório Copiado!' : 'Copiar para Suporte'}</span>
          </button>

          {/* Clear Logs */}
          <button
            onClick={handleClearLogs}
            disabled={isClearing || logs.length === 0}
            className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
            title="Limpar todos os logs armazenados"
          >
            {isClearing ? <RefreshCw size={13} className="animate-spin" /> : <Trash2 size={13} />}
            <span className="hidden sm:inline">Limpar</span>
          </button>

          {isModal && onClose && (
            <button
              onClick={onClose}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-1.5 rounded-xl border border-slate-700 cursor-pointer ml-1"
              title="Fechar janela de logs"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Filter Chips & Search Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs">
            <button
              onClick={() => setCategoryFilter('ALL')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                categoryFilter === 'ALL'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Todos ({counts.all})
            </button>

            <button
              onClick={() => setCategoryFilter('SEND')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1 cursor-pointer ${
                categoryFilter === 'SEND'
                  ? 'bg-[#075e54] text-white shadow-xs'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200/60'
              }`}
            >
              <Send size={12} />
              <span>Envios ({counts.send})</span>
            </button>

            <button
              onClick={() => setCategoryFilter('STATUS')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1 cursor-pointer ${
                categoryFilter === 'STATUS'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200/60'
              }`}
            >
              <Activity size={12} />
              <span>Status & Socket ({counts.status})</span>
            </button>

            <button
              onClick={() => setCategoryFilter('QR')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1 cursor-pointer ${
                categoryFilter === 'QR'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-purple-50 text-purple-800 hover:bg-purple-100 border border-purple-200/60'
              }`}
            >
              <QrCode size={12} />
              <span>QR Code ({counts.qr})</span>
            </button>

            <button
              onClick={() => setCategoryFilter('ERROR')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1 cursor-pointer ${
                categoryFilter === 'ERROR'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200/60'
              }`}
            >
              <AlertCircle size={12} />
              <span>Erros & Falhas ({counts.errors})</span>
            </button>
          </div>

          {/* Expand / Collapse Controls */}
          <div className="flex items-center gap-2 font-mono text-[11px] text-slate-500">
            <button
              onClick={expandAll}
              className="hover:text-slate-900 cursor-pointer flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-100"
            >
              <ChevronDown size={13} />
              <span>Expandir Todos</span>
            </button>
            <span className="text-slate-300">|</span>
            <button
              onClick={collapseAll}
              className="hover:text-slate-900 cursor-pointer flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-100"
            >
              <ChevronUp size={13} />
              <span>Recolher</span>
            </button>
          </div>
        </div>

        {/* Live Search Input */}
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Pesquisar por endpoint, número de telefone, código HTTP ou chave JSON..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#075e54] focus:bg-white"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Main Monospaced Scrollable Stream */}
      <div className="space-y-3 max-h-[620px] overflow-y-auto pr-1">
        {filteredLogs.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3 font-mono">
            <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
              <Terminal size={28} />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-sm text-slate-800">Nenhum log encontrado</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {searchQuery || categoryFilter !== 'ALL'
                  ? 'Nenhum registro corresponde aos filtros de busca atuais.'
                  : 'Nenhuma comunicação com a Evolution API foi registrada ainda na sessão.'}
              </p>
            </div>
            {onTriggerTest && (
              <button
                onClick={onTriggerTest}
                className="mt-2 bg-[#075e54] hover:bg-[#054d44] text-white px-4 py-2 rounded-xl text-xs font-bold font-sans transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-sm"
              >
                <Send size={14} />
                <span>Disparar Mensagem de Teste</span>
              </button>
            )}
          </div>
        ) : (
          filteredLogs.map((log) => {
            const isExpanded = Boolean(expandedIds[log.id]);
            const isSuccess = log.isSuccess;
            const statusNum = typeof log.status === 'number' ? log.status : null;
            const isTimeoutOrConn = String(log.status).includes('TIME') || String(log.status).includes('CONN') || String(log.status).includes('ERR');
            
            // Badge color for HTTP status
            let statusBadgeClass = 'bg-slate-800 text-slate-300 border-slate-700';
            if (isSuccess || (statusNum && statusNum >= 200 && statusNum < 300)) {
              statusBadgeClass = 'bg-emerald-950/80 text-emerald-300 border-emerald-600/40';
            } else if (statusNum && statusNum >= 400 && statusNum < 500) {
              statusBadgeClass = 'bg-amber-950/80 text-amber-300 border-amber-600/40';
            } else if ((statusNum && statusNum >= 500) || isTimeoutOrConn) {
              statusBadgeClass = 'bg-rose-950/80 text-rose-300 border-rose-600/40';
            }

            // Method color
            let methodBadgeClass = 'bg-slate-700 text-slate-200';
            if (log.method === 'POST') methodBadgeClass = 'bg-emerald-700 text-emerald-100';
            if (log.method === 'GET') methodBadgeClass = 'bg-sky-700 text-sky-100';
            if (log.method === 'PUT') methodBadgeClass = 'bg-amber-700 text-amber-100';
            if (log.method === 'DELETE') methodBadgeClass = 'bg-rose-700 text-rose-100';

            return (
              <div
                key={log.id}
                className={`bg-slate-950 border rounded-2xl shadow-sm transition-all overflow-hidden font-mono ${
                  isExpanded ? 'border-slate-700 ring-1 ring-slate-700' : 'border-slate-800/90 hover:border-slate-700'
                }`}
              >
                {/* Log Header Summary Bar */}
                <div
                  onClick={() => toggleExpand(log.id)}
                  className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer select-none hover:bg-slate-900/60 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    {/* Expand/Collapse Chevron */}
                    <div className="text-slate-400 shrink-0">
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>

                    {/* HTTP Method Badge */}
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider shrink-0 ${methodBadgeClass}`}>
                      {log.method}
                    </span>

                    {/* Status Code Badge */}
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border shrink-0 ${statusBadgeClass}`}>
                      {log.status} {log.statusText ? `• ${log.statusText}` : ''}
                    </span>

                    {/* Label / Description */}
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-bold text-slate-100 truncate block">
                        {log.label}
                      </span>
                      <span className="text-[11px] text-slate-400 truncate block font-normal">
                        {log.url}
                      </span>
                    </div>
                  </div>

                  {/* Right Meta Info */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 text-slate-400 text-[11px] pl-6 sm:pl-0">
                    <span className="flex items-center gap-1 text-slate-300">
                      <Clock size={12} className="text-slate-500" />
                      {log.durationMs}ms
                    </span>

                    <span className="text-slate-500 font-mono text-[10px]">
                      {new Date(log.timestamp).toLocaleTimeString('pt-BR')}
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyLog(log);
                      }}
                      title="Copiar JSON completo desta requisição"
                      className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-2.5 py-1 rounded-lg text-[10px] font-mono flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      {copiedId === log.id ? (
                        <>
                          <Check size={12} className="text-emerald-400" />
                          <span className="text-emerald-400">Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy size={12} />
                          <span>Copiar JSON</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Expanded Inspection Section (Request & Response Payloads) */}
                {isExpanded && (
                  <div className="border-t border-slate-800 bg-slate-950 p-4 sm:p-5 space-y-4 text-xs">
                    {/* Error Banner if applicable */}
                    {log.error && (
                      <div className="bg-rose-950/60 border border-rose-800 text-rose-200 p-3.5 rounded-xl space-y-1.5">
                        <div className="flex items-center gap-2 font-bold text-rose-300">
                          <AlertCircle size={15} className="shrink-0" />
                          <span>Mensagem de Falha / Erro:</span>
                        </div>
                        <p className="text-[11px] font-mono text-rose-200/90 leading-relaxed">
                          {log.error}
                        </p>
                        {log.diagnosticHelp && (
                          <div className="mt-2 pt-2 border-t border-rose-900 text-[10px] text-amber-200 font-sans leading-relaxed">
                            <strong>Dica Técnica:</strong> {log.diagnosticHelp}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {/* 1. Request Payload Inspector */}
                      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-2 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                            <div className="flex items-center gap-1.5 text-slate-300 font-bold text-[11px]">
                              <FileCode size={14} className="text-emerald-400" />
                              <span>1. REQUISIÇÃO (HTTP {log.method})</span>
                            </div>
                            <span className="text-[10px] text-slate-500 font-mono">Payload JSON</span>
                          </div>

                          <div className="space-y-1.5 text-[10px] text-slate-400 mb-2">
                            <div className="truncate">
                              <strong className="text-slate-300">URL:</strong> {log.url}
                            </div>
                            {log.headers && (
                              <div className="truncate">
                                <strong className="text-slate-300">Headers:</strong> {JSON.stringify(log.headers)}
                              </div>
                            )}
                          </div>

                          {log.requestPayload ? (
                            <pre className="bg-black/80 border border-slate-800/80 rounded-lg p-3 text-[11px] text-emerald-300 overflow-x-auto max-h-64 leading-relaxed font-mono whitespace-pre-wrap select-text">
                              {JSON.stringify(log.requestPayload, null, 2)}
                            </pre>
                          ) : (
                            <div className="bg-black/40 border border-dashed border-slate-800 rounded-lg p-4 text-center text-slate-500 text-[11px]">
                              Nenhum corpo de requisição (Body vazio / Requisição GET)
                            </div>
                          )}
                        </div>

                        <div className="pt-2 flex justify-end">
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(JSON.stringify(log.requestPayload || {}, null, 2));
                              setCopiedId(`${log.id}_req`);
                              setTimeout(() => setCopiedId(null), 2000);
                            }}
                            className="text-[10px] text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            {copiedId === `${log.id}_req` ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                            <span>{copiedId === `${log.id}_req` ? 'Copiado!' : 'Copiar Request'}</span>
                          </button>
                        </div>
                      </div>

                      {/* 2. Response Body Inspector */}
                      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-2 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                            <div className="flex items-center gap-1.5 text-slate-300 font-bold text-[11px]">
                              <Server size={14} className="text-sky-400" />
                              <span>2. RESPOSTA DA EVOLUTION API</span>
                            </div>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${statusBadgeClass}`}>
                              HTTP {log.status}
                            </span>
                          </div>

                          <div className="space-y-1.5 text-[10px] text-slate-400 mb-2">
                            <div className="flex items-center justify-between">
                              <span><strong className="text-slate-300">Tempo de Execução:</strong> {log.durationMs}ms</span>
                              <span><strong className="text-slate-300">Data:</strong> {new Date(log.timestamp).toLocaleString('pt-BR')}</span>
                            </div>
                          </div>

                          {log.responsePayload ? (
                            <pre
                              className={`bg-black/80 border rounded-lg p-3 text-[11px] overflow-x-auto max-h-64 leading-relaxed font-mono whitespace-pre-wrap select-text ${
                                isSuccess ? 'text-sky-300 border-slate-800/80' : 'text-rose-300 border-rose-900/60'
                              }`}
                            >
                              {JSON.stringify(log.responsePayload, null, 2)}
                            </pre>
                          ) : (
                            <div className="bg-black/40 border border-dashed border-slate-800 rounded-lg p-4 text-center text-slate-500 text-[11px]">
                              Nenhuma resposta recebida do servidor.
                            </div>
                          )}
                        </div>

                        <div className="pt-2 flex justify-end">
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(JSON.stringify(log.responsePayload || {}, null, 2));
                              setCopiedId(`${log.id}_res`);
                              setTimeout(() => setCopiedId(null), 2000);
                            }}
                            className="text-[10px] text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            {copiedId === `${log.id}_res` ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                            <span>{copiedId === `${log.id}_res` ? 'Copiado!' : 'Copiar Resposta'}</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Full interaction copy bar */}
                    <div className="pt-2 flex items-center justify-between border-t border-slate-900 text-[11px] text-slate-400">
                      <span className="text-[10px] text-slate-500">ID da Requisição: {log.id}</span>
                      <button
                        onClick={() => handleCopyLog(log)}
                        className="bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 px-3 py-1 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        {copiedId === log.id ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                        <span>{copiedId === log.id ? 'JSON Completo Copiado!' : 'Copiar Par Completo (Req + Res)'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer Info */}
      {lastRefreshedAt && (
        <div className="text-[11px] font-mono text-slate-400 text-right pr-1">
          Última sincronização: {lastRefreshedAt.toLocaleTimeString('pt-BR')} • {logs.length} registros no buffer
        </div>
      )}
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 z-50 animate-in fade-in duration-200">
        <div className="bg-slate-950 rounded-3xl p-4 sm:p-6 max-w-5xl w-full shadow-2xl border border-slate-800 max-h-[90vh] overflow-y-auto">
          {content}
        </div>
      </div>
    );
  }

  return content;
}
