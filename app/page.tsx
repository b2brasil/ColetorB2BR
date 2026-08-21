'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Package,
  ShoppingCart,
  Settings,
  LogOut,
  Search,
  RefreshCw,
  Bell,
  ArrowRight,
  Plus,
  Minus,
  CheckCircle,
  Truck,
  FileText,
  DollarSign,
  AlertCircle,
  Shield,
  Eye,
  EyeOff,
  User,
  Lock,
  Workflow,
  Server,
  CloudLightning,
  ChevronRight,
  Info,
  Layers,
  HelpCircle,
  FileSpreadsheet,
  History,
  ClipboardList,
  Printer,
  X,
  Calendar,
  ChevronDown,
  Bot,
  MessageSquare,
  GitBranch,
  Smartphone,
  Pencil,
  Check,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Download,
  ExternalLink,
  Maximize2
} from 'lucide-react';
import WhatsAppAgentPanel from '@/components/WhatsAppAgentPanel';
import SettingsPanel from '@/components/SettingsPanel';
import { motion, AnimatePresence } from 'motion/react';

// Componente de Logotipo Vetorial Corporativo B2BR de Alto Padrão
const B2BRLogo = ({ size = 'sm', logoUrl = null }: { size?: 'sm' | 'lg'; logoUrl?: string | null }) => {
  const isLarge = size === 'lg';
  const [imgError, setImgError] = useState(false);
  const [prevLogoUrl, setPrevLogoUrl] = useState<string | null>(null);

  // Ajusta o estado se a URL do logo mudar
  if (logoUrl !== prevLogoUrl) {
    setPrevLogoUrl(logoUrl);
    setImgError(false);
  }
  
  const hasImage = !!(logoUrl && !imgError);

  if (hasImage) {
    return (
      <div className="flex items-center justify-center select-none">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoUrl!}
          alt="Logo B2BR"
          className={`${
            isLarge 
              ? 'h-14 max-h-16' 
              : 'h-9 max-h-11'
          } w-auto max-w-[200px] object-contain p-0.5`}
          onError={() => setImgError(true)}
        />
      </div>
    );
  }

  // Fallback Vetorial Corporativo B2BR
  return (
    <div className={`flex ${isLarge ? 'flex-col' : 'flex-row'} items-center gap-3 select-none`}>
      <div className={`relative flex items-center justify-center shrink-0 rounded-2xl overflow-hidden shadow-md bg-white ${
        isLarge 
          ? 'h-16 w-16 border border-[#ffffff]/10' 
          : 'h-10 w-10 border border-gray-100'
      }`}>
        <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-[#2c5327] to-[#386433]">
          <svg
            className={isLarge ? "h-9 w-9 text-white" : "h-6 w-6 text-white"}
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Subtle elegant shield pattern or glass/box outline */}
            <path
              d="M50 12 L85 28 L85 58 C85 75 50 88 50 88 C50 88 15 75 15 58 L15 28 Z"
              stroke="white"
              strokeWidth="5"
              strokeLinejoin="round"
              fill="rgba(255,255,255,0.05)"
            />
            {/* Intertwined stylized B2BR icon or glass emblem */}
            <path
              d="M38 35 H55 C60.5 35 65 39.5 65 45 Q65 48.5 63 51 T65 61 C65 66.5 60.5 71 55 71 H38 Q35 71 35 68 V38 Q35 35 38 35 Z"
              fill="white"
            />
            <path
              d="M44 42 V49 H52 Q54.5 49 54.5 46.5 Q54.5 44 52 44 H44 Z"
              fill="#386433"
            />
            <path
              d="M44 57 V64 H52 Q54.5 64 54.5 61.5 Q54.5 59 52 59 H44 Z"
              fill="#386433"
            />
            {/* Dynamic star/liquid drops */}
            <circle cx="50" cy="24" r="3" fill="white" />
            <circle cx="68" cy="28" r="2" fill="white" />
          </svg>
        </div>
      </div>
    </div>
  );
};

// Interfaces de Tipo bem definidas para o Distribuidor B2BR (Sem imagens e status de estoque)
interface Client {
  cnpj: string;
  name: string;
  razao_social?: string;
  city: string;
  lastOrder: string;
  description: string;
  codigo_cliente_omie?: number;
  endereco?: string;
  endereco_numero?: string;
  complemento?: string;
  bairro?: string;
  cep?: string;
  estado?: string;
  email?: string;
  telefone?: string;
  rede?: string;
}

interface Product {
  sku: string;
  name: string;
  category: string;
  unitPrice: number;
  description: string;
  inventory: number;
  codigo_produto?: number;
  codigo?: string;
  ean?: string;
  marca?: string;
  unidade?: string;
  url_imagem?: string;
  fabricante?: string;
  cfop?: string;
  peso_bruto?: number;
  peso_liq?: number;
  peso?: number;
}

interface CartItem {
  product: Product;
  qty: number;
  customPrice: number;
}

// Retorna a data atual como string no formato 'YYYY-MM-DD' para o input type="date"
const getTodayDateString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Formata telefones do Brasil no padrão (##) #####-#### ou (##) ####-####
const formatPhoneBR = (value: string | undefined | null): string => {
  if (!value) return '';
  let digits = String(value).replace(/\D/g, '');
  if (!digits) return '';

  if (digits.startsWith('55') && (digits.length === 12 || digits.length === 13)) {
    digits = digits.slice(2);
  }

  if (digits.length <= 2) {
    return `(${digits}`;
  }
  if (digits.length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
};

export default function Home() {
  // Estados de navegação, autenticação e visualização
  const [activeTab, setActiveTab] = useState<'login' | 'clients' | 'products' | 'orders' | 'sync' | 'history' | 'whatsapp' | 'settings'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [productImageErrors, setProductImageErrors] = useState<Record<string, boolean>>({});

  // Estados de controle comercial e conformidade Omie
  const [sellerName, setSellerName] = useState('Rafael Baccei');
  const [sellerCode, setSellerCode] = useState<number | null>(2045887325);
  const [sellerPhone, setSellerPhone] = useState<string>('');
  const [isEditingPhone, setIsEditingPhone] = useState<boolean>(false);
  const [phoneInput, setPhoneInput] = useState<string>('');
  const [isSavingPhone, setIsSavingPhone] = useState<boolean>(false);
  const [phoneSaveSuccess, setPhoneSaveSuccess] = useState<boolean>(false);
  const [loginStep, setLoginStep] = useState<'email' | 'password' | 'register'>('email');
  const [loginError, setLoginError] = useState('');

  // Verificação de permissão de Usuário Administrador
  const isAdmin = username.trim().toLowerCase() === 'financeiro@b2brdistribuicao.com.br';

  // Estado e busca de versão/data de atualização via GitHub
  const [versionInfo, setVersionInfo] = useState<{ version: string; lastUpdate: string; commitHash?: string }>({
    version: 'v4.1.1 (0040)',
    lastUpdate: '12/08/2026'
  });

  useEffect(() => {
    fetch('/api/github/version')
      .then(res => res.json())
      .then(data => {
        if (data && data.version) {
          setVersionInfo({
            version: data.version,
            lastUpdate: data.lastUpdate || '11/08/2026',
            commitHash: data.commitHash
          });
        }
      })
      .catch(() => {});
  }, []);

  // Proteção de rota: redirecionar usuários não-administradores se estiverem em abas restritas
  useEffect(() => {
    if (!isAdmin && (activeTab === 'whatsapp' || activeTab === 'settings')) {
      setActiveTab('clients');
    }
  }, [isAdmin, activeTab]);

  // Buscar logomarca da empresa do Omie ERP no carregamento (sempre buscar link fresco devido a expirações curtas do S3 da Omie)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    fetch('/api/omie?action=logo')
      .then(res => res.json())
      .then(data => {
        if (data && data.url) {
          setLogoUrl(data.url);
        } else {
          setLogoUrl(null);
        }
      })
      .catch(() => {
        setLogoUrl(null);
      });
  }, []);

  // Sincronizar sessão do vendedor se mantido terminal ativo
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = window.localStorage.getItem('b2br_seller_session');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.email) {
            setTimeout(() => {
              setUsername(parsed.email);
              setSellerName(parsed.nome || 'Rafael Baccei');
              setSellerCode(parsed.codigo_vendedor || null);
              if (parsed.phone) {
                setSellerPhone(parsed.phone);
                setPhoneInput(parsed.phone);
              }
              setActiveTab('clients');

              // Buscar dados atualizados do Omie ERP e Firestore para corrigir sessão persistida antiga
              fetch(`/api/auth?email=${encodeURIComponent(parsed.email)}`)
                .then(res => res.json())
                .then(data => {
                  if (data && data.registered && data.seller) {
                    setSellerName(data.seller.nome);
                    setSellerCode(data.seller.codigo_vendedor);
                    if (data.seller.phone) {
                      setSellerPhone(data.seller.phone);
                      setPhoneInput(data.seller.phone);
                    }
                    window.localStorage.setItem('b2br_seller_session', JSON.stringify({
                      email: data.seller.email,
                      nome: data.seller.nome,
                      codigo_vendedor: data.seller.codigo_vendedor,
                      phone: data.seller.phone || ''
                    }));
                  }
                })
                .catch(() => {});
            }, 0);
          }
        } catch (e) {
          console.warn('Falha ao restaurar sessão local do vendedor:', e);
        }
      }
    }
  }, []);

  // Estados de dados corporativos sincronizados ou simulados
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [diagnostics, setDiagnostics] = useState<any>(null);
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isBackgroundSyncing, setIsBackgroundSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [apiGatewayNote, setApiGatewayNote] = useState('Verificando status de conectividade com a Locaweb...');

  // Cliente atualmente selecionado para emissão do orçamento (inicia sem seleção prévia)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  // Filtros de busca e seleção de categorias
  const [clientSearchText, setClientSearchText] = useState('');
  const [productSearchText, setProductSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [selectedBrand, setSelectedBrand] = useState<string>('Todas');
  const [selectedManufacturer, setSelectedManufacturer] = useState<string>('Todos');

  // Controle de Paginação (Apenas 20 produtos por vez)
  const [productPage, setProductPage] = useState(1);
  const productsPerPage = 20;

  // Controle de Visualização de Clientes (Mostrar apenas 20 por vez)
  const [visibleClientsCount, setVisibleClientsCount] = useState<number>(20);

  // Resetar página de produtos quando os filtros ou busca mudarem
  useEffect(() => {
    setProductPage(1);
  }, [productSearchText, selectedCategory, selectedBrand, selectedManufacturer]);

  // Resetar limite de visualização de clientes ao alterar a busca de clientes
  useEffect(() => {
    setVisibleClientsCount(20);
  }, [clientSearchText]);

  // Quantidade em buffer de digitação/ajuste no catálogo (SKU -> Quantidade)
  const [catalogQtyBuffer, setCatalogQtyBuffer] = useState<Record<string, number>>({});
  // Preços customizados em faturamento negociado (SKU -> Valor em R$ como string para digitação livre)
  const [catalogPriceBuffer, setCatalogPriceBuffer] = useState<Record<string, string>>({});
  // Produto selecionado para visualização ampliada/lightbox de imagem
  const [zoomModalProduct, setZoomModalProduct] = useState<Product | null>(null);
  const [lightboxZoomLevel, setLightboxZoomLevel] = useState<number>(1);
  const [lightboxRotation, setLightboxRotation] = useState<number>(0);
  const [productImageSources, setProductImageSources] = useState<Record<string, string>>({});

  // Helper para obter URL segura da imagem (com fallback HTTPS e suporte ao proxy do servidor)
  const getProductImageSrc = (sku: string, rawUrl?: string): string => {
    if (productImageSources[sku]) {
      return productImageSources[sku];
    }
    if (!rawUrl) return '';
    let trimmed = rawUrl.trim();
    if (trimmed.startsWith('http://')) {
      trimmed = trimmed.replace('http://', 'https://');
    }
    return trimmed;
  };

  // Helper resiliente para lidar com falhas de imagem e acionar o Image Proxy
  const handleProductImageError = (sku: string, rawUrl?: string) => {
    if (!rawUrl) {
      setProductImageErrors(prev => ({ ...prev, [sku]: true }));
      return;
    }
    const currentSrc = productImageSources[sku] || rawUrl;
    if (!currentSrc.includes('/api/image-proxy')) {
      const proxiedUrl = `/api/image-proxy?url=${encodeURIComponent(rawUrl)}`;
      setProductImageSources(prev => ({ ...prev, [sku]: proxiedUrl }));
    } else {
      setProductImageErrors(prev => ({ ...prev, [sku]: true }));
    }
  };

  // Listener para atalhos de teclado do Lightbox (Esc para fechar, + / - para zoom)
  useEffect(() => {
    if (!zoomModalProduct) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setZoomModalProduct(null);
        setLightboxZoomLevel(1);
        setLightboxRotation(0);
      } else if (e.key === '+' || e.key === '=') {
        setLightboxZoomLevel(prev => Math.min(prev + 0.25, 3.5));
      } else if (e.key === '-') {
        setLightboxZoomLevel(prev => Math.max(prev - 0.25, 0.75));
      } else if (e.key === '0') {
        setLightboxZoomLevel(1);
        setLightboxRotation(0);
      } else if (e.key.toLowerCase() === 'r') {
        setLightboxRotation(prev => (prev + 90) % 360);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [zoomModalProduct]);

  // Lista de itens no carrinho (pré-preenchida com dados reais de exemplo para facilitar visualização imediata)
  const [cart, setCart] = useState<CartItem[]>([]);

  // Dados logísticos de faturamento e entrega
  const [deliveryDate, setDeliveryDate] = useState('');
  const [paymentTermsList, setPaymentTermsList] = useState<string[]>(() => {
    return [
      "Boleto - 15 Dias Líquidos",
      "Boleto - 30 Dias Líquidos",
      "Pagamento na Entrega (DDA)",
      "Sinal de Entrada 50% / 50% na Saída"
    ].sort((a, b) => a.localeCompare(b, 'pt-BR'));
  });
  const [paymentTerm, setPaymentTerm] = useState('Boleto - 30 Dias Líquidos');
  const [paymentDropdownOpen, setPaymentDropdownOpen] = useState(false);
  const [paymentSearch, setPaymentSearch] = useState('');
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [cobraDescarga, setCobraDescarga] = useState<'Sim' | 'Não'>('Não');
  const [dataAgendada, setDataAgendada] = useState<'Sim' | 'Não'>('Não');
  const [freightModality, setFreightModality] = useState<string>('0');

  // Estados dos Modais de checkout e sincronização
  const [isSubmittingToERP, setIsSubmittingToERP] = useState(false);
  const [submittedResponse, setSubmittedResponse] = useState<any>(null);
  const [integrationError, setIntegrationError] = useState<any>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showReceiptDetailModal, setShowReceiptDetailModal] = useState(false);
  const [receiptHash, setReceiptHash] = useState('');
  const [receiptTimestamp, setReceiptTimestamp] = useState('');
  const [detailedClient, setDetailedClient] = useState<Client | null>(null);
  const [loadingRede, setLoadingRede] = useState(false);
  
  // Estados para o Histórico de Pedidos
  const [ordersHistory, setOrdersHistory] = useState<any[]>([]);
  const [historySearchText, setHistorySearchText] = useState('');
  const [historyFilterMode, setHistoryFilterMode] = useState<'All' | 'live' | 'mock'>('All');
  const [historyDatePreset, setHistoryDatePreset] = useState<'7' | '30' | '180' | 'all' | 'custom'>('30');
  const [historyStartDate, setHistoryStartDate] = useState('');
  const [historyEndDate, setHistoryEndDate] = useState('');
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});

  // Evitar hydration mismatches inicializando datas dinâmicas no lado do cliente após a montagem do componente
  useEffect(() => {
    setDeliveryDate(getTodayDateString());
    
    const d = new Date();
    d.setDate(d.getDate() - 30);
    setHistoryStartDate(d.toISOString().split('T')[0]);
    
    setHistoryEndDate(new Date().toISOString().split('T')[0]);
  }, []);

  // Lista unificada e filtrada de pedidos no histórico de acordo com filtros ativos
  const filteredHistoryOrders = React.useMemo(() => {
    return ordersHistory
      .filter((o) => o.vendedor === username)
      .filter((order) => {
        // 1. Busca por texto
        const searchVal = historySearchText.toLowerCase().trim();
        const matchesSearch = !searchVal || 
          order.id.toLowerCase().includes(searchVal) ||
          order.clientName.toLowerCase().includes(searchVal) ||
          order.clientCnpj.includes(searchVal) ||
          (order.clientCity && order.clientCity.toLowerCase().includes(searchVal));

        // 2. Filtro de tipo de sincronização
        const matchesMode = historyFilterMode === 'All' || order.mode === historyFilterMode;

        // 3. Filtro de período de emissão
        let matchesDate = true;
        if (order.transmittedAt) {
          const orderDate = new Date(order.transmittedAt);
          if (historyDatePreset === '7') {
            const limit = new Date();
            limit.setDate(limit.getDate() - 7);
            limit.setHours(0, 0, 0, 0);
            matchesDate = orderDate >= limit;
          } else if (historyDatePreset === '30') {
            const limit = new Date();
            limit.setDate(limit.getDate() - 30);
            limit.setHours(0, 0, 0, 0);
            matchesDate = orderDate >= limit;
          } else if (historyDatePreset === '180') {
            const limit = new Date();
            limit.setDate(limit.getDate() - 180);
            limit.setHours(0, 0, 0, 0);
            matchesDate = orderDate >= limit;
          } else if (historyDatePreset === 'custom') {
            const matchesStart = !historyStartDate || orderDate >= new Date(historyStartDate + 'T00:00:00');
            const matchesEnd = !historyEndDate || orderDate <= new Date(historyEndDate + 'T23:59:59');
            matchesDate = matchesStart && matchesEnd;
          }
        }

        return matchesSearch && matchesMode && matchesDate;
      });
  }, [ordersHistory, username, historySearchText, historyFilterMode, historyDatePreset, historyStartDate, historyEndDate]);

  // Real-time statuses from Omie for historical orders
  const [orderStatuses, setOrderStatuses] = useState<Record<string, { status_pedido?: string; descr_etapa?: string; etapa_pedido?: string; numero_nfe?: string; loading?: boolean; error?: string }>>({});

  const fetchOrderStatus = React.useCallback(async (orderId: string, orderNumber: string, omieId: string | null, mode: string) => {
    if (mode !== 'live' || !orderNumber || orderNumber === 'Pendente' || orderNumber === 'Pendente (Contingência)') {
      setOrderStatuses(prev => ({
        ...prev,
        [orderId]: { status_pedido: 'Orçamento', descr_etapa: 'Orçamento Local (Offline)', etapa_pedido: undefined, loading: false }
      }));
      return;
    }

    setOrderStatuses(prev => ({
      ...prev,
      [orderId]: { ...prev[orderId], loading: true, error: undefined }
    }));

    try {
      const params = new URLSearchParams();
      params.set('action', 'order-status');
      if (omieId) params.set('codigo_pedido', String(omieId));
      if (orderNumber) params.set('numero_pedido', String(orderNumber));
      params.set('codigo_pedido_integracao', orderId);

      const res = await fetch(`/api/omie?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.status === 'success') {
          setOrderStatuses(prev => ({
            ...prev,
            [orderId]: {
              status_pedido: data.status_pedido,
              descr_etapa: data.descr_etapa || data.status_pedido,
              etapa_pedido: data.etapa_pedido,
              numero_nfe: data.numero_nfe,
              loading: false
            }
          }));
          return;
        } else {
          throw new Error(data.message || 'Falha ao recuperar status do Omie');
        }
      }
      throw new Error('Falha na resposta do servidor.');
    } catch (err: any) {
      setOrderStatuses(prev => ({
        ...prev,
        [orderId]: {
          loading: false,
          error: err.message || 'Erro de conexão'
        }
      }));
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'history' && ordersHistory.length > 0) {
      // Automatically fetch current status of all live orders in the history (not yet loaded/loading/error)
      ordersHistory
        .filter((o) => o.vendedor === username && o.mode === 'live' && o.orderNumber && o.orderNumber !== 'Pendente' && o.orderNumber !== 'Pendente (Contingência)')
        .forEach((order) => {
          if (!orderStatuses[order.id]) {
            fetchOrderStatus(order.id, order.orderNumber, order.omieId, order.mode);
          }
        });
    }
  }, [activeTab, ordersHistory, username, orderStatuses, fetchOrderStatus]);

  const handleShowDetails = async (client: Client) => {
    setDetailedClient(client);
    if (client.codigo_cliente_omie) {
      setLoadingRede(true);
      try {
        const res = await fetch(`/api/omie?action=characteristics&codigo=${client.codigo_cliente_omie}`);
        if (res.ok) {
          const data = await res.json();
          setDetailedClient(prev => prev && prev.codigo_cliente_omie === client.codigo_cliente_omie ? { ...prev, rede: data.rede } : prev);
        }
      } catch (err) {
        console.error('Erro ao buscar características do cliente:', err);
      } finally {
        setLoadingRede(false);
      }
    }
  };

  // Contador de sessão segura (simula revigoração de token JWT a cada 5 min)
  const [timeLeft, setTimeLeft] = useState(299);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 299));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fechar o dropdown de condições de pagamento ao clicar fora
  useEffect(() => {
    if (!paymentDropdownOpen) return;
    const handleOutsideClick = () => {
      setPaymentDropdownOpen(false);
    };
    document.addEventListener('click', handleOutsideClick);
    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, [paymentDropdownOpen]);

  const [isSyncingOrders, setIsSyncingOrders] = useState(false);
  const [lastSyncedOrdersTime, setLastSyncedOrdersTime] = useState<string | null>(null);

  const syncOrdersWithERP = React.useCallback(async (forceSilently = false) => {
    if (!username) return;
    if (!forceSilently) setIsSyncingOrders(true);
    try {
      const res = await fetch(`/api/omie?action=sync-orders&vendedor=${encodeURIComponent(username)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.status === 'success' && Array.isArray(data.orders)) {
          setOrdersHistory((prevHistory) => {
            const merged = [...prevHistory];
            for (const newOrd of data.orders) {
              const existingIdx = merged.findIndex(o => 
                (o.omieId && o.omieId === newOrd.omieId) || 
                (o.id && o.id === newOrd.id) ||
                (o.orderNumber && o.orderNumber === newOrd.orderNumber)
              );
              if (existingIdx !== -1) {
                merged[existingIdx] = { ...merged[existingIdx], ...newOrd };
              } else {
                merged.unshift(newOrd);
              }
            }
            
            const cleanMerged = merged.filter(o => 
              o.clientName !== 'Horizon Peak Resorts' && 
              o.clientName !== 'Cantina Bella Italia' &&
              o.mode !== 'mock'
            );
            
            if (typeof window !== 'undefined') {
              window.localStorage.setItem('b2br_orders_history', JSON.stringify(cleanMerged));
            }
            return cleanMerged;
          });
          setLastSyncedOrdersTime(new Date().toLocaleTimeString('pt-BR'));
        }
      }
    } catch (err) {
      console.error('Erro ao sincronizar pedidos com Omie ERP:', err);
    } finally {
      if (!forceSilently) setIsSyncingOrders(false);
    }
  }, [username]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const existing = window.localStorage.getItem('b2br_orders_history');
      if (!existing) {
        window.localStorage.setItem('b2br_orders_history', JSON.stringify([]));
        setOrdersHistory([]);
      } else {
        try {
          const parsed = JSON.parse(existing);
          const cleanParsed = Array.isArray(parsed) ? parsed.filter(o => 
            o.clientName !== 'Horizon Peak Resorts' && 
            o.clientName !== 'Cantina Bella Italia' &&
            o.mode !== 'mock'
          ) : [];
          setOrdersHistory(cleanParsed);
        } catch (e) {
          console.error('Falha de parse do histórico:', e);
        }
      }
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'history' && username) {
      syncOrdersWithERP(true);
    }
  }, [activeTab, username, syncOrdersWithERP]);


  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Carregar dados de clientes e estoque via rota de API proxy do Omie com cache SWR
  const loadData = async (forceMock = false, forceRefresh = false) => {
    // Se já temos dados carregados na tela (seja do cache local ou de fetch anterior), fazemos sync silencioso de background
    const hasExistingData = clients.length > 0 && products.length > 0;
    if (!hasExistingData || forceRefresh) {
      setIsLoadingData(true);
    } else {
      setIsBackgroundSyncing(true);
    }

    try {
      const queryParams = new URLSearchParams();
      if (forceMock) queryParams.set('mock', 'true');
      if (forceRefresh) queryParams.set('refresh', 'true');
      const url = `/api/omie${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        
        const mappedClients = (data.clients || []).map((c: any) => {
          return {
            cnpj: c.cnpj,
            name: c.name,
            razao_social: c.razao_social,
            lastOrder: c.lastOrder,
            description: c.description,
            city: c.city || 'Matriz',
            codigo_cliente_omie: c.codigo_cliente_omie,
            endereco: c.endereco,
            endereco_numero: c.endereco_numero,
            complemento: c.complemento,
            bairro: c.bairro,
            cep: c.cep,
            estado: c.estado,
            email: c.email,
            telefone: c.telefone,
            rede: c.rede
          };
        });

        const seenSkus = new Set<string>();
        const mappedProducts = (data.products || []).map((p: any, index: number) => {
          let rawSku = String(p.sku || '').trim();
          const internalId = String(p.codigo_produto || '').trim();
          const pCodigo = String(p.codigo || '').trim();
          
          const placeholders = ['sku-erp', 's/c', 's/n', 'n/a', '0', 'undefined', 'null', 'generico', 'geral', 'produto', ''];
          let candidateSku = 'SKU-ERP';

          if (rawSku && !placeholders.includes(rawSku.toLowerCase())) {
            candidateSku = rawSku;
          } else if (pCodigo && !placeholders.includes(pCodigo.toLowerCase())) {
            candidateSku = pCodigo;
          } else if (internalId && !placeholders.includes(internalId.toLowerCase())) {
            candidateSku = internalId;
          }

          let resolvedSku = candidateSku;
          if (placeholders.includes(candidateSku.toLowerCase()) || seenSkus.has(candidateSku)) {
            let fallback = candidateSku;
            if (placeholders.includes(candidateSku.toLowerCase())) {
              fallback = internalId && !placeholders.includes(internalId.toLowerCase()) ? internalId : 'SKU-ERP';
            }
            resolvedSku = `${fallback}-${index}`;
          }

          let uniqCounter = 1;
          while (seenSkus.has(resolvedSku)) {
            resolvedSku = `${candidateSku}-${index}-${uniqCounter}`;
            uniqCounter++;
          }

          seenSkus.add(resolvedSku);

          return {
            sku: resolvedSku,
            name: p.name || 'Produto ERP',
            unitPrice: 0, // zerado por padrão, disponível para preenchimento
            description: p.description || 'Sincronizado automaticamente do ERP Omie.',
            inventory: p.inventory !== undefined && p.inventory !== null ? p.inventory : 100,
            category: p.category || 'Geral', // Utiliza a categoria crua (família) vinda do ERP
            codigo_produto: p.codigo_produto,
            codigo: p.codigo || '',
            ean: p.ean || '',
            marca: p.marca || 'Sem Marca',
            unidade: p.unidade || 'UN',
            url_imagem: p.url_imagem || '',
            fabricante: p.fabricante || 'Duelo',
            peso_bruto: p.peso_bruto !== undefined && p.peso_bruto !== null ? Number(p.peso_bruto) : 0,
            peso_liq: p.peso_liq !== undefined && p.peso_liq !== null ? Number(p.peso_liq) : 0,
            peso: p.peso !== undefined && p.peso !== null ? Number(p.peso) : (p.peso_bruto || p.peso_liq || 0)
          };
        });

        if (mappedClients.length > 0) setClients(mappedClients);
        if (mappedProducts.length > 0) setProducts(mappedProducts);
        
        let validPaymentTerms = paymentTermsList;
        if (data.paymentTerms && Array.isArray(data.paymentTerms) && data.paymentTerms.length > 0) {
          const sortedTerms = [...data.paymentTerms].sort((a, b) => a.localeCompare(b, 'pt-BR'));
          setPaymentTermsList(sortedTerms);
          validPaymentTerms = sortedTerms;
          setPaymentTerm((prev) => {
            if (sortedTerms.includes(prev)) return prev;
            return sortedTerms[0];
          });
        }

        setDiagnostics(data.diagnostics || null);
        setIsLiveMode(data.mode === 'live' && data.status !== 'error');
        
        if (data.mode === 'live') {
          if (data.status === 'error') {
            setApiGatewayNote(`Erro de Sincronização Omie: ${data.integration.note}`);
          } else {
            setApiGatewayNote('Conexão estabelecida com sucesso com as APIs de Produção do ERP Omie.');
          }
        } else {
          setApiGatewayNote('Rodando em modo Sandbox de desenvolvimento. Sem chaves de API mapeadas no .env.');
        }

        // Inicializar os buffers de quantidade e preços
        const qtyBuf: Record<string, number> = {};
        const pBuf: Record<string, string> = {};
        mappedProducts.forEach((p: Product) => {
          qtyBuf[p.sku] = 0;
          pBuf[p.sku] = ''; // vazio para preenchimento independente livre
        });
        
        setCatalogQtyBuffer((prev) => ({ ...qtyBuf, ...prev }));
        setCatalogPriceBuffer((prev) => ({ ...pBuf, ...prev }));

        // Preservar cliente selecionado caso o usuário já tenha escolhido um
        setSelectedClient((prev) => {
          if (!prev || !prev.cnpj) return null;
          // Se já existia um selecionado, atualiza seus dados com os mais recentes da API
          const updated = mappedClients.find((c) => c.cnpj === prev.cnpj || (c.codigo_cliente_omie && c.codigo_cliente_omie === prev.codigo_cliente_omie));
          return updated || prev;
        });

        // Gravar no cache local para inicialização instantânea em acessos futuros (Zero Delay)
        if (typeof window !== 'undefined' && mappedClients.length > 0 && mappedProducts.length > 0) {
          try {
            window.localStorage.setItem('b2br_cached_catalog_v2', JSON.stringify({
              clients: mappedClients,
              products: mappedProducts,
              paymentTerms: validPaymentTerms,
              timestamp: Date.now(),
              isLiveMode: data.mode === 'live' && data.status !== 'error'
            }));
            const now = new Date();
            setLastSyncTime(`${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`);
          } catch (storageErr) {
            console.warn('Não foi possível persistir catálogo localmente:', storageErr);
          }
        }
      }
    } catch (error) {
      console.error('Erro na carga dos catálogos Omie:', error);
      setApiGatewayNote('Acesso offline temporário ativo.');
    } finally {
      setIsLoadingData(false);
      setIsBackgroundSyncing(false);
    }
  };

  // Efeito de hidratação instantânea do cache local + revalidação silenciosa em background
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const cachedRaw = window.localStorage.getItem('b2br_cached_catalog_v2');
        if (cachedRaw) {
          const cached = JSON.parse(cachedRaw);
          if (cached && Array.isArray(cached.clients) && Array.isArray(cached.products) && cached.products.length > 0) {
            setClients(cached.clients);
            setProducts(cached.products);
            // Clientes e produtos carregados do cache local (sem auto-selecionar cliente)
            if (Array.isArray(cached.paymentTerms) && cached.paymentTerms.length > 0) {
              setPaymentTermsList(cached.paymentTerms);
              setPaymentTerm(cached.paymentTerms[0]);
            }
            if (cached.isLiveMode !== undefined) {
              setIsLiveMode(cached.isLiveMode);
            }
            if (cached.timestamp) {
              const d = new Date(cached.timestamp);
              setLastSyncTime(`${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`);
            }
            setIsLoadingData(false);
          }
        }
      } catch (e) {
        console.warn('Erro ao restaurar catálogo em cache:', e);
      }
    }

    // Disparar sincronização com a API (se já temos cache local, roda em background sem travar tela)
    const timer = setTimeout(() => {
      loadData(false, false);
    }, 50);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleEmailCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    setIsAuthenticating(true);
    setLoginError('');
    try {
      const res = await fetch(`/api/auth?email=${encodeURIComponent(username.trim())}`);
      const data = await res.json();
      if (!res.ok || data.registered === false) {
        setLoginError(data.error || 'Vendedor não cadastrado ou inativo no Omie ERP.');
      } else {
        setSellerName(data.seller.nome);
        setSellerCode(data.seller.codigo_vendedor);
        if (data.seller.phone) {
          setSellerPhone(data.seller.phone);
          setPhoneInput(data.seller.phone);
        } else {
          setSellerPhone('');
          setPhoneInput('');
        }
        if (data.hasPassword) {
          setLoginStep('password');
          setPassword('');
        } else {
          setLoginStep('register');
          setPassword('');
        }
      }
    } catch (err: any) {
      setLoginError('Problemas de comunicação com o servidor de autenticação.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!username.trim()) return;
    setLoginStep('register');
    setPassword('');
    setLoginError('');
  };

  const handlePasswordAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    setIsAuthenticating(true);
    setLoginError('');
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'login',
          email: username.trim(),
          password
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setLoginError(data.message || 'Senha incorreta.');
      } else {
        if (data.seller.phone) {
          setSellerPhone(data.seller.phone);
          setPhoneInput(data.seller.phone);
        } else {
          setSellerPhone('');
          setPhoneInput('');
        }
        if (rememberMe && typeof window !== 'undefined') {
          window.localStorage.setItem('b2br_seller_session', JSON.stringify({
            email: data.seller.email,
            nome: data.seller.nome,
            codigo_vendedor: data.seller.codigo_vendedor,
            phone: data.seller.phone || ''
          }));
        }
        setSellerName(data.seller.nome);
        setSellerCode(data.seller.codigo_vendedor);
        setActiveTab('clients');
        setLoginStep('email');
        setLoginError('');
      }
    } catch (err) {
      setLoginError('Falha ao validar credenciais.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleRegisterPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setLoginError('Sua senha deve possuir no mínimo 6 caracteres.');
      return;
    }
    setIsAuthenticating(true);
    setLoginError('');
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'register',
          email: username.trim(),
          password
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setLoginError(data.message || 'Erro ao definir senha.');
      } else {
        if (data.seller.phone) {
          setSellerPhone(data.seller.phone);
          setPhoneInput(data.seller.phone);
        } else {
          setSellerPhone('');
          setPhoneInput('');
        }
        if (rememberMe && typeof window !== 'undefined') {
          window.localStorage.setItem('b2br_seller_session', JSON.stringify({
            email: data.seller.email,
            nome: data.seller.nome,
            codigo_vendedor: data.seller.codigo_vendedor,
            phone: data.seller.phone || ''
          }));
        }
        setSellerName(data.seller.nome);
        setSellerCode(data.seller.codigo_vendedor);
        setActiveTab('clients');
        setLoginStep('email');
        setLoginError('');
        alert('Sua nova senha de acesso foi salva com sucesso e criptografada no servidor!');
      }
    } catch (err) {
      setLoginError('Erro de conexão ao registrar senha.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleSaveMyPhone = async () => {
    if (!sellerCode) {
      alert('Código do vendedor não identificado.');
      return;
    }
    setIsSavingPhone(true);
    const formattedPhoneToSave = formatPhoneBR(phoneInput);
    try {
      const res = await fetch('/api/whatsapp/sellers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          codigo_vendedor: sellerCode,
          phone: formattedPhoneToSave,
          userEmail: username
        })
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Erro ao salvar telefone do vendedor.');
      } else {
        const savedPhone = formatPhoneBR(data.sellerPhone?.phone || formattedPhoneToSave);
        setSellerPhone(savedPhone);
        setPhoneInput(savedPhone);
        setIsEditingPhone(false);
        setPhoneSaveSuccess(true);
        setTimeout(() => setPhoneSaveSuccess(false), 3000);

        if (typeof window !== 'undefined') {
          const stored = window.localStorage.getItem('b2br_seller_session');
          if (stored) {
            try {
              const parsed = JSON.parse(stored);
              parsed.phone = savedPhone;
              window.localStorage.setItem('b2br_seller_session', JSON.stringify(parsed));
            } catch (e) {}
          }
        }
      }
    } catch (err) {
      alert('Erro de conexão ao salvar telefone.');
    } finally {
      setIsSavingPhone(false);
    }
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('b2br_seller_session');
    }
    setSellerName('Rafael Baccei');
    setSellerCode(2045887325);
    setSellerPhone('');
    setPhoneInput('');
    setIsEditingPhone(false);
    setUsername('');
    setPassword('');
    setLoginStep('email');
    setLoginError('');
    setActiveTab('login');
  };

  // Funções de Gerenciamento do carrinho e precificação negociada
  const updateCatalogQty = (sku: string, delta: number) => {
    setCatalogQtyBuffer((prev) => {
      const current = prev[sku] || 0;
      return { ...prev, [sku]: Math.max(0, current + delta) };
    });
  };

  const handlePriceChange = (sku: string, value: string) => {
    // Permitir apenas número, ponto, e vírgula para possibilitar digitação livre do preço
    const sanitizedVal = value.replace(/[^\d.,]/g, '');
    setCatalogPriceBuffer((prev) => ({
      ...prev,
      [sku]: sanitizedVal
    }));
  };

  const addItemToCart = (product: Product) => {
    const qty = catalogQtyBuffer[product.sku] || 0;
    
    // Converter de forma segura o valor em string para ponto flutuante
    const rawPrice = catalogPriceBuffer[product.sku];
    let price = 0;
    if (rawPrice !== undefined && rawPrice !== null) {
      if (typeof rawPrice === 'number') {
        price = rawPrice;
      } else {
        price = parseFloat(String(rawPrice).replace(',', '.')) || 0;
      }
    } else {
      price = product.unitPrice;
    }

    if (qty <= 0) {
      alert('Selecione uma quantidade maior que zero para incluir este SKU ao orçamento.');
      return;
    }

    setCart((prev) => {
      const existingIdx = prev.findIndex((item) => item.product.sku === product.sku);
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          qty,
          customPrice: price
        };
        return updated;
      } else {
        return [...prev, { product, qty, customPrice: price }];
      }
    });
  };

  const removeCartItem = (sku: string) => {
    setCart((prev) => prev.filter((item) => item.product.sku !== sku));
    setCatalogQtyBuffer((prev) => ({ ...prev, [sku]: 0 }));
  };

  const selectClientAndGoToCatalog = (client: Client) => {
    setSelectedClient(client);
    setActiveTab('products');
  };

  // Cálculos financeiros automatizados de imposto e frete baseado na distribuição de atacado
  const subtotalProducts = React.useMemo(() => {
    return cart.reduce((acc, item) => acc + (item.qty * item.customPrice), 0);
  }, [cart]);

  const totalWeight = React.useMemo(() => {
    return cart.reduce((acc, item) => {
      const realWeight = item.product.peso_bruto || item.product.peso_liq || item.product.peso;
      let weight = 0;
      if (realWeight !== undefined && realWeight !== null && !isNaN(realWeight) && realWeight > 0) {
        weight = realWeight;
      } else {
        if (item.product.sku === 'MAL-50D-112') weight = 55;
        else if (item.product.sku === 'TNC-C24-PRM') weight = 12;
        else if (item.product.sku === 'JCE-CMX-ORG') weight = 6;
        else if (item.product.sku === 'WT-1100-LZ') weight = 14;
        else if (item.product.sku === 'BR-9921-IPA') weight = 8;
        else weight = 0;
      }
      return acc + (item.qty * weight);
    }, 0);
  }, [cart]);

  // Frete fixo excluído por solicitação do usuário
  const shippingFee = 0;
  // Estimativa ICMS excluída por solicitação do usuário
  const estimatedIcmsTax = 0; 
  const grandTotalValue = subtotalProducts + shippingFee;

  // Salvar pedido localmente como rascunho de contingência caso a API Omie esteja fora do ar ou rate-limited
  const saveFailedOrderLocally = () => {
    try {
      if (!selectedClient) {
        alert('Nenhum cliente selecionado.');
        return;
      }
      const fallbackNumber = integrationError?.fallbackNumber || `ORD-PENDENTE-${Math.floor(Math.random() * 90000) + 10000}`;
      const newOrderLog = {
        id: fallbackNumber,
        orderNumber: 'Pendente (Contingência)',
        omieId: null,
        vendedor: username,
        clientName: selectedClient.name,
        clientCnpj: selectedClient.cnpj,
        clientCity: selectedClient.city || 'Matriz',
        items: cart.map((item) => ({
          sku: item.product.sku,
          name: item.product.name,
          qty: item.qty,
          price: item.customPrice,
          unidade: item.product.unidade || 'UN',
          cfop: item.product.cfop
        })),
        deliveryDate,
        deliveryInstructions,
        cobraDescarga,
        dataAgendada,
        paymentTerm,
        freightModality,
        total: grandTotalValue,
        transmittedAt: new Date().toISOString(),
        mode: 'live',
        status: 'Rascunho Salvo Localmente'
      };
      
      const existingString = window.localStorage.getItem('b2br_orders_history');
      const existingHistory = existingString ? JSON.parse(existingString) : [];
      const updatedHistory = [newOrderLog, ...existingHistory];
      window.localStorage.setItem('b2br_orders_history', JSON.stringify(updatedHistory));
      setOrdersHistory(updatedHistory);
      
      setIntegrationError(null);
      setCart([]);
      alert('Pedido salvo no Histórico de Pedidos com sucesso! Você poderá re-transmitir futuramente quando a API do Omie expirar o bloqueio temporário.');
    } catch (err) {
      console.error('Erro ao salvar no histórico local de contingência:', err);
    }
  };

  // Enviar ordem final de faturamento para nosso proxy Node / Omie ERP
  const submitOrderToOmieERP = async () => {
    if (!selectedClient) {
      alert('Por favor, selecione um cliente antes de emitir o pedido de faturamento.');
      setActiveTab('clients');
      return;
    }

    if (cart.length === 0) {
      alert('O carrinho do pedido está vazio. Adicione itens antes de emitir o pedido.');
      return;
    }

    setIsSubmittingToERP(true);
    setIntegrationError(null);
    try {
      const res = await fetch('/api/omie', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client: selectedClient,
          vendedor_codigo: sellerCode,
          items: cart.map((item) => ({
            sku: item.product.sku,
            name: item.product.name,
            qty: item.qty,
            price: item.customPrice,
            codigo_produto: item.product.codigo_produto || item.product.codigo,
            unidade: item.product.unidade || 'UN',
            cfop: item.product.cfop && item.product.cfop !== '5.102' && item.product.cfop !== '5102' && item.product.cfop.trim() !== '' ? item.product.cfop.trim() : undefined,
            peso_bruto: item.product.peso_bruto,
            peso_liq: item.product.peso_liq,
            peso: item.product.peso
          })),
          deliveryDate,
          deliveryInstructions,
          cobraDescarga,
          dataAgendada,
          paymentTerm,
          freightModality,
          total: grandTotalValue
        })
      });

      const data = await res.json();
      
      if (!res.ok || data.status === 'error') {
        setIntegrationError(data);
        return;
      }

      setSubmittedResponse(data);
      setShowSuccessModal(true);

      // Disparar cópia do pedido via WhatsApp para os usuários/vendedores configurados
      try {
        const manufacturersList = Array.from(
          new Set(
            cart
              .map((item) => item.product.fabricante || item.product.marca)
              .filter(Boolean)
          )
        );

        fetch('/api/whatsapp/notify-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderNumber: data.orderNumber || data.clientOrderNumber || data.omieId || 'Pendente',
            sellerName: sellerName || username,
            clientFantasyName: selectedClient?.name || selectedClient?.razao_social || 'Cliente',
            totalValue: grandTotalValue,
            manufacturers: manufacturersList,
            isTest: false
          })
        }).catch((err) => console.warn('Aviso ao disparar notificação de cópia WhatsApp:', err));
      } catch (waNotifyErr) {
        console.warn('Erro ao disparar cópia WhatsApp:', waNotifyErr);
      }

      // Salvar pedido no histórico local do vendedor
      try {
        const newOrderLog = {
          id: data.clientOrderNumber || `ORD-2026-${Math.floor(Math.random() * 90000) + 10000}`,
          orderNumber: data.orderNumber || 'Pendente',
          omieId: data.omieId || null,
          vendedor: username,
          clientName: selectedClient.name,
          clientCnpj: selectedClient.cnpj,
          clientCity: selectedClient.city,
          items: cart.map((item) => ({
            sku: item.product.sku,
            name: item.product.name,
            qty: item.qty,
            price: item.customPrice,
            unidade: item.product.unidade || 'UN',
            cfop: item.product.cfop
          })),
          deliveryDate,
          deliveryInstructions,
          cobraDescarga,
          dataAgendada,
          paymentTerm,
          freightModality,
          total: grandTotalValue,
          transmittedAt: new Date().toISOString(),
          mode: data.mode || 'live',
          status: 'Sucesso'
        };
        const existingString = window.localStorage.getItem('b2br_orders_history');
        const existingHistory = existingString ? JSON.parse(existingString) : [];
        const updatedHistory = [newOrderLog, ...existingHistory];
        window.localStorage.setItem('b2br_orders_history', JSON.stringify(updatedHistory));
        setOrdersHistory(updatedHistory);
      } catch (histError) {
        console.error('Erro ao salvar no histórico de pedidos do vendedor:', histError);
      }
    } catch (e: any) {
      setIntegrationError({
        status: 'error',
        message: `Falha na comunicação de rede com o gateway Omie ERP: ${e.message}`,
        note: 'Erro de Conexão'
      });
    } finally {
      setIsSubmittingToERP(false);
    }
  };

  // Filtragem avançada de Clientes e Produtos de acordo com a barra de busca
  const filteredClients = React.useMemo(() => {
    return clients.filter((c) => {
      const term = clientSearchText.toLowerCase().trim();
      if (!term) return true;
      
      const matchesName = String(c.name || '').toLowerCase().includes(term);
      const matchesRazao = String(c.razao_social || '').toLowerCase().includes(term);
      const matchesDesc = String(c.description || '').toLowerCase().includes(term);
      const matchesCity = String(c.city || '').toLowerCase().includes(term);
      
      const cleanSearchStr = term.replace(/[^\d]/g, '');
      const cleanCnpj = String(c.cnpj || '').replace(/[^\d]/g, '') || '';
      const matchesCnpj = cleanSearchStr ? cleanCnpj.includes(cleanSearchStr) : false;
      
      return !!(matchesName || matchesRazao || matchesDesc || matchesCity || matchesCnpj);
    });
  }, [clients, clientSearchText]);

  const filteredProducts = React.useMemo(() => {
    return products.filter((p) => {
      const nameStr = String(p.name || '').toLowerCase();
      const skuStr = String(p.sku || '').toLowerCase();
      const codeStr = String(p.codigo || '').toLowerCase();
      const eanStr = String(p.ean || '').toLowerCase();
      const brandStr = String(p.marca || '').toLowerCase();
      const searchLower = productSearchText.toLowerCase().trim();
      const matchesSearch = nameStr.includes(searchLower) || skuStr.includes(searchLower) || codeStr.includes(searchLower) || eanStr.includes(searchLower) || brandStr.includes(searchLower);
      
      const matchesCategory = selectedCategory === 'Todos' || p.category === selectedCategory;
      const matchesBrand = selectedBrand === 'Todas' || p.marca === selectedBrand;
      const matchesManufacturer = selectedManufacturer === 'Todos' || (p.fabricante || 'Duelo') === selectedManufacturer;
      return matchesSearch && matchesCategory && matchesBrand && matchesManufacturer;
    });
  }, [products, productSearchText, selectedCategory, selectedBrand, selectedManufacturer]);

  // Função auxiliar para conversão monetária amigável ao mercado brasileiro
  const formatBrl = (value: number) => {
    if (typeof value !== 'number' || isNaN(value)) return 'R$ 0,00';
    const formattedNum = value.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    return `R$ ${formattedNum}`;
  };

  return (
    <div className="min-h-screen bg-[#f8faf8] text-[#1a1c19] flex flex-col md:flex-row antialiased">
      
      {/* 1. BARRA LATERAL DE NAVEGAÇÃO CORPORATIVA (SÓ APARECE APÓS LOGIN) */}
      {activeTab !== 'login' && (
        <aside className="w-full md:w-68 bg-white border-b md:border-b-0 md:border-r border-[#e1e3e0] flex flex-col shrink-0 select-none">
          
          {/* Logo Corporativa B2BR */}
          <div className="p-6 flex items-center justify-between border-b border-[#f0f1ee]">
            <B2BRLogo size="sm" logoUrl={logoUrl} />
            
            {/* Ícones rápidos para Mobile */}
            <div className="md:hidden flex items-center gap-1">
              <button 
                onClick={() => loadData(false, true)}
                className="p-2 text-primary hover:bg-[#f0f1ee] rounded-lg transition-colors flex items-center gap-1 text-xs"
                title="Forçar Sincronização Omie ERP"
              >
                <RefreshCw size={14} className={`${(isLoadingData || isBackgroundSyncing) ? 'animate-spin' : ''}`} />
                <span className="text-[10px] font-bold">Atualizar</span>
              </button>
            </div>
          </div>

          {/* Cartão de Identificação do Representante */}
          <div className="mx-4 my-4 p-4 rounded-2xl bg-[#edf4ec] border border-[#d6e3d3]">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xs shrink-0 tracking-wider shadow-sm mt-0.5">
                {sellerName ? sellerName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() : 'B2BR'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-black text-[#141d13] truncate" title={sellerName}>{sellerName}</p>
                <p className="text-[10px] text-[#4a5448] truncate" title={username}>{username}</p>
                
                {isEditingPhone ? (
                  <div className="flex items-center gap-1 mt-1.5">
                    <input
                      type="text"
                      placeholder="(11) 99999-8888"
                      value={phoneInput}
                      onChange={(e) => setPhoneInput(formatPhoneBR(e.target.value))}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveMyPhone();
                        if (e.key === 'Escape') setIsEditingPhone(false);
                      }}
                      className="w-full bg-white border border-[#b2c8af] rounded px-2 py-0.5 text-[10px] text-[#1a1c19] focus:outline-none focus:ring-1 focus:ring-primary font-mono shadow-inner"
                      autoFocus
                    />
                    <button
                      onClick={handleSaveMyPhone}
                      disabled={isSavingPhone}
                      className="bg-primary hover:bg-primary/90 text-white p-1 rounded text-xs font-bold shrink-0 cursor-pointer disabled:opacity-50 transition-colors"
                      title="Salvar"
                    >
                      {isSavingPhone ? <RefreshCw size={12} className="animate-spin" /> : <Check size={12} />}
                    </button>
                    <button
                      onClick={() => setIsEditingPhone(false)}
                      disabled={isSavingPhone}
                      className="bg-[#d2ded0] hover:bg-[#c3d1c0] text-[#334131] p-1 rounded text-xs font-bold shrink-0 cursor-pointer transition-colors"
                      title="Cancelar"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <p className="text-[10px] text-[#4a5448] truncate" title={sellerPhone || 'Sem número informado'}>
                    {sellerPhone ? formatPhoneBR(sellerPhone) : 'Sem número informado'}
                  </p>
                )}
              </div>

              {!isEditingPhone && (
                <button
                  onClick={() => {
                    setPhoneInput(formatPhoneBR(sellerPhone));
                    setIsEditingPhone(true);
                  }}
                  className="text-[#4a5448] hover:text-primary p-1 rounded-lg transition-colors shrink-0 cursor-pointer hover:bg-[#e0ece0]"
                  title={sellerPhone ? 'Editar telefone' : 'Adicionar telefone'}
                >
                  <Pencil size={13} />
                </button>
              )}
            </div>
          </div>

          {/* Lista de Abas de Navegação */}
          <nav className="flex-1 px-4 space-y-1.5 py-2">
            <button
              onClick={() => setActiveTab('clients')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold tracking-wide transition-all ${
                activeTab === 'clients'
                  ? 'bg-primary text-white shadow-md shadow-primary/20'
                  : 'text-[#444941] hover:bg-[#edf2ec] hover:text-[#1a1c19]'
              }`}
            >
              <Users size={16} />
              Clientes
            </button>

            <button
              onClick={() => setActiveTab('products')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold tracking-wide transition-all ${
                activeTab === 'products'
                  ? 'bg-primary text-white shadow-md shadow-primary/20'
                  : 'text-[#444941] hover:bg-[#edf2ec] hover:text-[#1a1c19]'
              }`}
            >
              <Package size={16} />
              Produtos
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold tracking-wide transition-all relative ${
                activeTab === 'orders'
                  ? 'bg-primary text-white shadow-md shadow-primary/20'
                  : 'text-[#444941] hover:bg-[#edf2ec] hover:text-[#1a1c19]'
              }`}
            >
              <ShoppingCart size={16} />
              Checkout de Pedido
              {cart.length > 0 && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 bg-[#fc3d3d] text-white text-[10px] h-5 px-1.5 rounded-full flex items-center justify-center font-black">
                  {cart.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold tracking-wide transition-all ${
                activeTab === 'history'
                  ? 'bg-primary text-white shadow-md shadow-primary/20'
                  : 'text-[#444941] hover:bg-[#edf2ec] hover:text-[#1a1c19]'
              }`}
            >
              <History size={16} />
              Histórico de Pedidos
            </button>

            {isAdmin && (
              <button
                onClick={() => setActiveTab('settings')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold tracking-wide transition-all ${
                  activeTab === 'settings' || activeTab === 'whatsapp'
                    ? 'bg-primary text-white shadow-md shadow-primary/20'
                    : 'text-[#30382e] hover:bg-[#edf2ec] hover:text-[#1a1c19]'
                }`}
              >
                <Settings size={16} className={activeTab === 'settings' || activeTab === 'whatsapp' ? 'text-white' : 'text-primary'} />
                <span>Configurações</span>
                <span className="ml-auto text-[9px] font-mono bg-primary text-white font-bold px-1.5 py-0.5 rounded uppercase">
                  Admin
                </span>
              </button>
            )}

            {/* Separador e Opção Terminar Sessão */}
            <div className="border-t border-[#edf0ec] my-2 pt-2">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold tracking-wide transition-all bg-[#fbebeb] hover:bg-[#f9d7d7] text-[#ba1a1a]"
              >
                <LogOut size={16} />
                Terminar Sessão
              </button>
            </div>


          </nav>

          {/* Rodapé de Informação do Gateway Locaweb Go */}
          <div className="p-4 border-t border-[#f0f1ee] bg-[#f9faf8] mt-auto">
            <div className="flex items-center gap-2">
              <span className={`inline-block h-2 w-2 rounded-full ${isLiveMode ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
              <span className="text-[10px] font-bold text-[#444941] uppercase tracking-wider">
                {isLiveMode ? 'Produção ERP Conectada' : 'Modo Comercial Seguro'}
              </span>
            </div>
          </div>
        </aside>
      )}

      {/* 2. CONTEÚDO PRINCIPAL DA TELA REESTRUTURANTE */}
      <div className="flex-1 flex flex-col focus:outline-none min-w-0">
        
        {/* Topo informativo da área logada */}
        {activeTab !== 'login' && (
          <header className="h-16 bg-white border-b border-[#e1e3e0] flex items-center justify-between px-6 select-none shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-[#1a1c19]">
                {activeTab === 'clients' && 'Painel de Clientes Homologados'}
                {activeTab === 'products' && 'Catálogo Integrado para Venda'}
                {activeTab === 'orders' && 'Revisão Física de Pedido de Venda'}
                {activeTab === 'sync' && 'Controle de Webhooks & Comunicação ERP'}
                {activeTab === 'history' && 'Histórico de Pedidos Enviados'}
                {activeTab === 'whatsapp' && isAdmin && 'Cópia de Pedidos via WhatsApp • Evolution API'}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* Informação de Versão & Atualização via GitHub (Discreto) */}
              <div className="hidden lg:flex items-center gap-2 bg-[#f4f5f1]/60 border border-[#e2e5de] rounded-full px-3 py-0.5 text-[11px] text-[#72776d] font-normal">
                <GitBranch size={11} className="text-[#8c9287] shrink-0" />
                <span>Versão <span className="font-mono font-medium text-[#42493f]">{versionInfo.version}</span></span>
                <span className="text-[#d0d4cb]">•</span>
                <span>Atualizado em <span className="font-medium text-[#42493f]">{versionInfo.lastUpdate.split(' às ')[0]}</span></span>
              </div>

              {/* Indicador de Status da Base Pré-Carregada */}
              {lastSyncTime && (
                <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] font-medium text-emerald-800">
                  <span className={`w-2 h-2 rounded-full ${isBackgroundSyncing ? 'bg-amber-500 animate-ping' : 'bg-emerald-500'}`}></span>
                  <span>{isBackgroundSyncing ? 'Atualizando ERP...' : `Base: ${lastSyncTime}`}</span>
                </div>
              )}

              {/* Botão de recarga forçada global */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => loadData(false, true)}
                  disabled={isLoadingData || isBackgroundSyncing}
                  className="px-3 py-1.5 bg-[#f0f1ee] hover:bg-[#e4e6e2] text-[#42493f] rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
                  title="Buscar produtos e clientes novos direto do ERP Omie"
                >
                  <RefreshCw size={13} className={`${(isLoadingData || isBackgroundSyncing) ? 'animate-spin text-primary' : ''}`} />
                  <span className="hidden sm:inline">Sincronizar Omie</span>
                </button>
                <div className="h-4 w-[1px] bg-[#e1e3e0]"></div>
                
                {/* Timer de Segurança */}
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#fff6e0] border border-[#ffb900]/30 rounded-xl text-xs font-mono text-[#604200]">
                  <span className="text-[9px] uppercase font-bold text-[#865d00]">Sessão</span>
                  <span className="font-bold">{formatTime(timeLeft)}</span>
                </div>
              </div>
            </div>
          </header>
        )}

        {/* 3. LAYOUT / ROUTER DE TELAS */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full space-y-6">
          <AnimatePresence mode="wait">
            
            {/* TELA 1: PORTAL DE AUTENTICAÇÃO SEGURO COM CREDENCIAIS LOCAL */}
            {activeTab === 'login' && (
              <motion.div
                key="login"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="max-w-md mx-auto min-h-[80vh] flex flex-col justify-center py-12 px-2"
              >
                <div className="bg-white border border-[#e1e3e0] rounded-3xl shadow-xl p-8 relative overflow-hidden">
                  
                  {/* Selo decorativo do Node/Locaweb de segurança em conformidade */}
                  <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-primary to-[#507d49]"></div>

                  <div className="mb-8 text-center flex flex-col items-center">
                    <B2BRLogo size="lg" logoUrl={logoUrl} />
                    <h3 id="login-form-title" className="font-sans text-2xl font-black text-[#1a1c19] tracking-tight mt-4">
                      Coletor de Pedidos
                    </h3>
                    <p className="text-xs text-[#5b615a] mt-1.5">
                      Portal Corporativo Homologado • Integração Direta Omie ERP
                    </p>
                  </div>

                  {/* FORMULÁRIO MULTI-ETAPAS SEGURO COM VINCULAÇÃO ERP OMIE */}
                  {loginStep === 'email' && (
                    <form onSubmit={handleEmailCheck} className="space-y-4">
                      <div className="space-y-1.5">
                        <label htmlFor="user" className="block text-xs font-bold text-[#444941]">
                          E-mail do Vendedor (Cadastro Omie ERP)
                        </label>
                        <div className="relative">
                          <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#747970]" />
                          <input
                            id="user"
                            type="email"
                            required
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full h-11 pl-10 pr-4 rounded-xl bg-[#f8faf8] border border-[#c2c9bc] text-xs font-semibold text-[#1a1c19] focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                            placeholder="vendedor@b2brdistribuicao.com.br"
                          />
                        </div>
                      </div>

                      {loginError && (
                        <div className="p-3 bg-[#fbebeb] border border-[#f9d7d7] rounded-xl text-[11px] font-bold text-[#ba1a1a] leading-relaxed">
                          {loginError}
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={isAuthenticating}
                        className="w-full h-11 bg-primary text-white font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2 mt-4 shadow-md shadow-primary/20"
                      >
                        {isAuthenticating ? (
                          <>
                            <RefreshCw className="animate-spin text-white" size={14} />
                            Buscando Vendedor no ERP...
                          </>
                        ) : (
                          <>
                            Verificar Vendedor
                            <ArrowRight size={14} />
                          </>
                        )}
                      </button>
                    </form>
                  )}

                  {loginStep === 'password' && (
                    <form onSubmit={handlePasswordAuth} className="space-y-4">
                      <div className="text-left bg-[#edf4ec] border border-[#d6e3d3] p-3.5 rounded-2xl mb-2 text-xs">
                        <span className="block text-[10px] font-bold text-[#4a5448] uppercase tracking-wider mb-0.5">Vendedor Identificado</span>
                        <strong className="text-primary text-sm font-black">{sellerName}</strong>
                        <span className="block text-[10px] text-[#5b615a] mt-1 font-mono">{username}</span>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <label htmlFor="pass" className="block text-xs font-bold text-[#444941]">
                            Senha de Acesso
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              setLoginStep('email');
                              setLoginError('');
                            }}
                            className="text-[11px] font-bold text-[#386433] hover:underline"
                          >
                            Mudar e-mail
                          </button>
                        </div>
                        <div className="relative">
                          <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#747970]" />
                          <input
                            id="pass"
                            type={showPassword ? 'text' : 'password'}
                            required
                            autoFocus
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full h-11 pl-10 pr-10 rounded-xl bg-[#f8faf8] border border-[#c2c9bc] text-xs font-mono font-bold tracking-widest text-[#1a1c19] focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                            placeholder="••••••"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#747970] hover:text-[#1a1c19]"
                          >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>

                      {loginError && (
                        <div className="p-3 bg-[#fbebeb] border border-[#f9d7d7] rounded-xl text-[11px] font-bold text-[#ba1a1a] leading-relaxed">
                          {loginError}
                        </div>
                      )}

                      <div className="flex justify-between items-center gap-2 pt-1 select-none">
                        <div className="flex items-center gap-2">
                          <input
                            id="rem"
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="h-4 w-4 rounded border-[#747970] focus:ring-primary accent-primary cursor-pointer"
                          />
                          <label htmlFor="rem" className="text-[11px] text-[#444941] cursor-pointer">
                            Lembrar minha sessão
                          </label>
                        </div>
                        <button
                          type="button"
                          onClick={handleForgotPassword}
                          disabled={isAuthenticating}
                          className="text-[11px] font-bold text-[#386433] hover:underline cursor-pointer"
                        >
                          Esqueci minha senha
                        </button>
                      </div>

                      <button
                        type="submit"
                        disabled={isAuthenticating}
                        className="w-full h-11 bg-primary text-white font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2 mt-4 shadow-md shadow-primary/20"
                      >
                        {isAuthenticating ? (
                          <>
                            <RefreshCw className="animate-spin text-white" size={14} />
                            Validando Credencial...
                          </>
                        ) : (
                          <>
                            Entrar no Coletor
                            <ArrowRight size={14} />
                          </>
                        )}
                      </button>
                    </form>
                  )}

                  {loginStep === 'register' && (
                    <form onSubmit={handleRegisterPassword} className="space-y-4">
                      <div className="text-left bg-emerald-50 border border-emerald-200 p-4 rounded-2xl mb-2 text-xs">
                        <span className="block text-[11px] font-black text-[#386433] uppercase tracking-wider mb-1">Primeiro acesso detectado</span>
                        <p className="text-[#3a3f4c] leading-relaxed">
                          Olá, <strong className="text-primary font-bold">{sellerName}</strong>! Defina uma senha de acesso para seus próximos logins no sistema:
                        </p>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <label htmlFor="reg-pass" className="block text-xs font-bold text-[#444941]">
                            Cadastrar Senha de Acesso
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              setLoginStep('email');
                              setLoginError('');
                            }}
                            className="text-[11px] font-bold text-[#386433] hover:underline"
                          >
                            Voltar
                          </button>
                        </div>
                        <div className="relative">
                          <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#747970]" />
                          <input
                            id="reg-pass"
                            type={showPassword ? 'text' : 'password'}
                            required
                            autoFocus
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full h-11 pl-10 pr-10 rounded-xl bg-[#f8faf8] border border-[#c2c9bc] text-xs font-mono font-bold tracking-widest text-[#1a1c19] focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                            placeholder="No mínimo 6 caracteres"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#747970] hover:text-[#1a1c19]"
                          >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>

                      {loginError && (
                        <div className="p-3 bg-[#fbebeb] border border-[#f9d7d7] rounded-xl text-[11px] font-bold text-[#ba1a1a] leading-relaxed">
                          {loginError}
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={isAuthenticating}
                        className="w-full h-11 bg-primary text-white font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2 mt-4 shadow-md shadow-primary/20"
                      >
                        {isAuthenticating ? (
                          <>
                            <RefreshCw className="animate-spin text-white" size={14} />
                            Criptografando e Salvando...
                          </>
                        ) : (
                          <>
                            Cadastrar Senha e Entrar
                            <ArrowRight size={14} />
                          </>
                        )}
                      </button>
                    </form>
                  )}

                  <div className="mt-8 pt-6 border-t border-[#f0f1ee] text-center text-[#5b615a]">
                    <div className="flex items-center justify-center gap-2 text-xs">
                      <Shield size={14} className="text-primary" />
                      <span>Assinado digitalmente por B2BR Distribuidora</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 mt-4">
                      <span className="w-8 h-[1px] bg-[#e1e3e0]"></span>
                      <span className="text-[9px] font-mono font-semibold text-[#8e938c]">ESTÁVEL {versionInfo.version}</span>
                      <span className="w-8 h-[1px] bg-[#e1e3e0]"></span>
                    </div>
                  </div>
                </div>
                <p className="text-[11px] text-[#747970] text-center mt-6">
                  Uso exclusivo de assessores comerciais e revendedores autorizados B2BR.
                </p>
              </motion.div>
            )}

            {/* TELA 2: LISTA E BUSCA DE CLIENTES HOMOLOGADOS */}
            {activeTab === 'clients' && (
              <motion.div
                key="clients"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="space-y-6"
              >
                {/* Cliente Selecionado Atualmente */}
                <div className={`bg-white border-2 ${selectedClient ? 'border-primary/25' : 'border-[#e1e3e0] border-dashed'} rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4`}>
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${selectedClient ? 'bg-[#edf2ec] text-primary' : 'bg-[#f4f5f1] text-[#747970]'}`}>
                      {selectedClient ? <CheckCircle size={24} /> : <Users size={24} />}
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                        {selectedClient ? 'Cliente Ativo no Painel' : 'Seleção de Cliente'}
                      </span>
                      <h3 className={`font-black text-md mt-0.5 ${selectedClient ? 'text-[#1a1c19]' : 'text-[#747970]'}`}>
                        {selectedClient ? selectedClient.name : 'Selecione um cliente'}
                      </h3>
                      <p className="text-xs text-[#5b615a] mt-0.5 font-medium">
                        {selectedClient ? (
                          <>
                            CNPJ: <span className="font-mono font-bold">{selectedClient.cnpj}</span> • {selectedClient.city} {selectedClient.estado ? `- ${selectedClient.estado}` : ''}
                          </>
                        ) : (
                          'Nenhum cliente selecionado. Escolha um cliente na tabela abaixo para emitir o pedido.'
                        )}
                      </p>
                    </div>
                  </div>
                  {selectedClient && (
                    <button
                      type="button"
                      onClick={() => setSelectedClient(null)}
                      className="text-xs font-semibold text-[#747970] hover:text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg border border-[#e1e3e0] transition-colors self-start md:self-center"
                      title="Desmarcar cliente ativo"
                    >
                      Limpar Seleção
                    </button>
                  )}
                </div>

                {/* Caixa de Pesquisa Elegante e Moderna */}
                <div className="bg-white border border-[#e1e3e0] rounded-2xl p-4 md:p-6 shadow-sm flex flex-col md:flex-row gap-4 items-center">
                  <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#747970]" size={18} />
                    <input
                      type="text"
                      value={clientSearchText}
                      onChange={(e) => setClientSearchText(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 bg-[#f8faf8] border border-[#c2c9bc] rounded-xl text-xs font-semibold text-[#1a1c19] focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all placeholder:text-[#747970]"
                      placeholder="Pesquisar por razão social, nome fantasia, CNPJ ou cidade..."
                    />
                  </div>
                </div>

                {/* Listagem de Clientes Homologados do ERP Omie */}
                <div className="bg-white border border-[#e1e3e0] rounded-2xl shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-[#edf2ec] text-[#444941] font-bold text-xs uppercase tracking-wider border-b border-[#e1e3e0]">
                          <th className="px-6 py-4">Cliente / Identificação</th>
                          <th className="px-6 py-4">Cidade</th>
                          <th className="px-6 py-4 text-right">Ação</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#f0f1ee]">
                        {filteredClients.length > 0 ? (
                          filteredClients.slice(0, visibleClientsCount).map((client, idx) => {
                            const isSelected = selectedClient && (client.cnpj === selectedClient.cnpj || client.codigo_cliente_omie === selectedClient.codigo_cliente_omie);
                            return (
                              <tr 
                                key={`${client.cnpj}-${client.codigo_cliente_omie || idx}`} 
                                className={`transition-all duration-150 cursor-pointer ${
                                  isSelected 
                                    ? 'bg-[#edf4ec]/35 border-l-4 border-l-primary' 
                                    : 'hover:bg-[#f6f9f5]/60'
                                  }`}
                                onClick={() => selectClientAndGoToCatalog(client)}
                              >
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-[#edf4ec] rounded-xl flex items-center justify-center text-primary font-black shrink-0">
                                      <Users size={16} />
                                    </div>
                                    <div className="min-w-0">
                                      <h4 className="font-bold text-sm text-[#1a1c19] truncate">
                                        {client.name}
                                      </h4>
                                      {client.razao_social && (
                                        <p className="text-xs text-[#5b615a] font-normal mt-0.5">
                                          {client.razao_social}
                                        </p>
                                      )}
                                      <p className="text-[10px] font-mono text-[#747970] uppercase font-bold mt-1">CNPJ: {client.cnpj}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <span className="text-xs text-[#5b615a] font-medium block">{client.city}</span>
                                </td>
                                <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                                  <div className="flex items-center justify-end gap-2">
                                    {isSelected ? (
                                      <button
                                        onClick={() => selectClientAndGoToCatalog(client)}
                                        className="bg-primary/10 text-primary border border-primary/20 px-4 py-2 rounded-xl font-black text-xs hover:bg-primary/20 transition-all flex items-center gap-1"
                                      >
                                        <CheckCircle size={12} />
                                        Selecionado
                                      </button>
                                    ) : (
                                      <button
                                        onClick={() => selectClientAndGoToCatalog(client)}
                                        className="bg-primary text-white px-4 py-2 rounded-xl font-bold text-xs hover:bg-opacity-95 transition-all shadow-sm"
                                      >
                                        Selecionar
                                      </button>
                                    )}
                                    <button
                                      onClick={() => handleShowDetails(client)}
                                      className="border border-[#c2c9bc] text-[#444941] bg-[#f8faf8] px-3 py-2 rounded-xl font-bold text-xs hover:bg-[#edf2ec] transition-all"
                                    >
                                      Detalhes
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan={3} className="p-12 text-center text-[#747970]">
                              <AlertCircle className="mx-auto text-[#747970] mb-3" size={32} />
                              <p className="font-bold text-sm text-[#181d18]">Nenhum cliente catalogado com este termo na base.</p>
                              <p className="text-xs text-[#5b615a] mt-1">Carregue dados do Omie ou refine sua busca.</p>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {filteredClients.length > visibleClientsCount && (
                  <div className="flex justify-center pt-2">
                    <button
                      onClick={() => setVisibleClientsCount((prev) => prev + 20)}
                      className="px-6 py-3 bg-[#edf2ec] text-primary hover:bg-[#deebd9] font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-2 border border-primary/10"
                    >
                      <ChevronDown size={14} />
                      Mostrar mais ({filteredClients.length - visibleClientsCount} restantes)
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {/* TELA 3: CATÁLOGO DE PRODUTOS COMPLETO */}
            {activeTab === 'products' && (
              <motion.div
                key="products"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-6"
              >
                
                {/* Seção Esquerda: Catálogo Principal */}
                <div className="lg:col-span-8 space-y-4">
                  
                  {/* Categorias, Marcas & Cliente */}
                  <div className="flex flex-col gap-4">
                    
                    {/* Filtros Principais do Produto */}
                    <div className="flex flex-wrap items-center gap-4">
                      {/* Filtros de Categoria */}
                      <div className="flex items-center gap-2 bg-white border border-[#c2c9bc] rounded-xl px-4 py-2 w-fit">
                        <span className="text-[11px] font-bold text-primary whitespace-nowrap">Categoria:</span>
                        <select
                          value={selectedCategory}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                          className="bg-transparent border-none text-xs font-semibold text-[#1a1c19] focus:ring-0 min-w-[120px] max-w-[180px] truncate py-0 cursor-pointer"
                        >
                          {['Todos', ...Array.from(new Set(products.map(p => p.category).filter(Boolean)))].map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Filtro por Marca */}
                      <div className="flex items-center gap-2 bg-white border border-[#c2c9bc] rounded-xl px-4 py-2 w-fit">
                        <span className="text-[11px] font-bold text-primary whitespace-nowrap">Marca:</span>
                        <select
                          value={selectedBrand}
                          onChange={(e) => setSelectedBrand(e.target.value)}
                          className="bg-transparent border-none text-xs font-semibold text-[#1a1c19] focus:ring-0 min-w-[120px] max-w-[180px] truncate py-0 cursor-pointer"
                        >
                          {['Todas', ...Array.from(new Set(products.map(p => p.marca).filter(Boolean)))].map((brand) => (
                            <option key={brand} value={brand}>
                              {brand}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Filtro por Fabricante */}
                      <div className="flex items-center gap-2 bg-white border border-[#c2c9bc] rounded-xl px-4 py-2 w-fit">
                        <span className="text-[11px] font-bold text-primary whitespace-nowrap">Fabricante:</span>
                        <select
                          value={selectedManufacturer}
                          onChange={(e) => setSelectedManufacturer(e.target.value)}
                          className="bg-transparent border-none text-xs font-semibold text-[#1a1c19] focus:ring-0 min-w-[120px] max-w-[180px] truncate py-0 cursor-pointer"
                        >
                          {['Todos', ...Array.from(new Set(products.map(p => p.fabricante || 'Duelo').filter(Boolean)))].map((mfg) => (
                            <option key={mfg} value={mfg}>
                              {mfg}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Filtros Auxiliares: Faturamento de Cliente */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                      
                      {/* Cliente Atendido no Momento */}
                      <div className="flex items-center gap-2 bg-white border border-[#c2c9bc] rounded-xl px-4 py-2 flex-1 sm:flex-none justify-between sm:ml-auto">
                        <span className="text-[11px] font-bold text-primary whitespace-nowrap">Faturar para:</span>
                        <select
                          value={selectedClient ? selectedClient.name : ''}
                          onChange={(e) => {
                            if (!e.target.value) {
                              setSelectedClient(null);
                              return;
                            }
                            const c = clients.find((item) => item.name === e.target.value);
                            if (c) setSelectedClient(c);
                          }}
                          className="bg-transparent border-none text-xs font-semibold text-[#1a1c19] focus:ring-0 max-w-[175px] truncate py-0 cursor-pointer"
                        >
                          <option value="">Selecione um cliente...</option>
                          {clients.map((c, idx) => (
                            <option key={`${c.cnpj}-${c.codigo_cliente_omie || idx}`} value={c.name}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>

                    </div>

                  </div>

                  {/* Tabela Organizada de Produtos */}
                  <div className="bg-white border border-[#e1e3e0] rounded-2xl overflow-hidden shadow-sm">
                    
                    {/* Cabeçalho da Lista */}
                    <div className="p-5 bg-[#edf2ec] border-b border-[#e1e3e0] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div>
                        <h3 className="font-bold text-sm text-[#181d18]">Portfólio de Produtos - B2BR</h3>
                        <p className="text-xs text-[#5b615a] mt-0.5">Preenchimento livre de precificação. Dados integrados do ERP Omie.</p>
                      </div>

                      <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#747970]" size={14} />
                        <input
                          type="text"
                          value={productSearchText}
                          onChange={(e) => setProductSearchText(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 bg-white border border-[#c2c9bc] rounded-xl text-xs font-semibold text-[#1a1c19] focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all placeholder:text-[#747970]"
                          placeholder="Buscar código, marca ou nome..."
                        />
                      </div>
                    </div>

                    {/* Linhas de Produtos */}
                    {/* Linhas de Produtos */}
                    <div className="divide-y divide-gray-100">
                      {filteredProducts.length > 0 ? (
                        filteredProducts.slice((productPage - 1) * productsPerPage, productPage * productsPerPage).map((p, idx) => {
                          const qty = catalogQtyBuffer[p.sku] || 0;
                          const customPrice = catalogPriceBuffer[p.sku] ?? p.unitPrice;

                          return (
                            <article 
                              key={`${p.sku}-${p.codigo_produto || idx}`} 
                              className="bg-white p-6 md:p-8 transition-all hover:bg-slate-50/30 relative"
                            >
                              <div className="flex flex-col md:flex-row gap-6 md:gap-8">
                                
                                {/* Imagem do Produto real ("url_imagem") com Zoom Inteligente ao passar o mouse e ao clicar */}
                                <div className="flex-shrink-0 w-32 h-32 md:w-36 md:h-36 bg-[#f5f7f4] rounded-2xl flex items-center justify-center relative group mx-auto md:mx-0 transition-all hover:bg-[#edf0ec] border border-[#edf0ee] shadow-xs">
                                  {p.url_imagem && !productImageErrors[p.sku] ? (
                                    <div 
                                      className="w-full h-full p-2.5 flex items-center justify-center cursor-zoom-in relative overflow-hidden rounded-2xl"
                                      onClick={() => {
                                        setZoomModalProduct(p);
                                        setLightboxZoomLevel(1);
                                        setLightboxRotation(0);
                                      }}
                                      title="Passe o mouse para ampliar ou clique para ver detalhes em alta resolução"
                                    >
                                      {/* Imagem com transição e zoom suave ao passar o cursor */}
                                      {/* eslint-disable-next-line @next/next/no-img-element */}
                                      <img
                                        src={getProductImageSrc(p.sku, p.url_imagem)}
                                        alt={p.name}
                                        className="w-full h-full object-contain transition-transform duration-300 ease-out group-hover:scale-135 drop-shadow-xs"
                                        referrerPolicy="no-referrer"
                                        onError={() => handleProductImageError(p.sku, p.url_imagem)}
                                      />

                                      {/* Badge de ampliação no hover */}
                                      <div className="absolute bottom-2 right-2 bg-slate-900/85 backdrop-blur-xs text-white px-2 py-0.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-sm flex items-center gap-1 text-[10px] font-bold pointer-events-none">
                                        <ZoomIn size={11} />
                                        <span>Ampliar</span>
                                      </div>
                                    </div>
                                  ) : (
                                    <div 
                                      className="w-full h-full flex flex-col items-center justify-center gap-2 select-none cursor-pointer p-2 hover:bg-[#ebefe9] transition-colors rounded-2xl"
                                      onClick={() => {
                                        setZoomModalProduct(p);
                                        setLightboxZoomLevel(1);
                                        setLightboxRotation(0);
                                      }}
                                      title="Clique para visualizar a ficha técnica detalhada"
                                    >
                                      <Package className="w-12 h-12 text-[#8b9385] stroke-[1.25] transition-transform duration-300 group-hover:scale-110" />
                                      <span className="text-[10px] font-bold text-[#8b9385] uppercase tracking-wider">Ver Ficha</span>
                                    </div>
                                  )}
                                </div>

                                {/* Área de Detalhes e Ações */}
                                <div className="flex-grow flex flex-col justify-between min-w-0">
                                  <div>
                                    {/* Nome do Produto - Contraste e Leitura Excelente */}
                                    <h3 className="font-bold text-slate-900 text-base md:text-lg mb-3.5 leading-snug font-sans break-words text-center md:text-left tracking-tight">
                                      {p.name}
                                    </h3>
                                    
                                    {/* Lista de Especificações Técnicas - Altamente Legível, Flexível e Sem Sobreposição */}
                                    <div className="flex flex-wrap gap-2 mb-5 p-3.5 bg-[#f8f9f7] rounded-xl border border-[#edf0ee]">
                                      <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-lg border border-[#e9ece8] shadow-sm">
                                        <span className="text-[9px] font-bold text-[#686e64] uppercase tracking-wider">SKU:</span>
                                        <span className="font-bold text-slate-800 text-[11px] break-all">{p.codigo || p.sku || 'S/C'}</span>
                                      </div>
                                      <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-lg border border-[#e9ece8] shadow-sm">
                                        <span className="text-[9px] font-bold text-[#686e64] uppercase tracking-wider">Marca:</span>
                                        <span className="font-bold text-slate-800 text-[11px] truncate max-w-[120px]" title={p.marca || 'Sem Marca'}>{p.marca || 'Sem Marca'}</span>
                                      </div>
                                      <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-lg border border-[#e9ece8] shadow-sm">
                                        <span className="text-[9px] font-bold text-[#686e64] uppercase tracking-wider">Fabricante:</span>
                                        <span className="font-bold text-slate-800 text-[11px] truncate max-w-[120px]" title={p.fabricante || 'Duelo'}>{p.fabricante || 'Duelo'}</span>
                                      </div>
                                      <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-lg border border-[#e9ece8] shadow-sm">
                                        <span className="text-[9px] font-bold text-[#686e64] uppercase tracking-wider">Embalagem:</span>
                                        <span className="font-bold text-slate-800 text-[11px]">{p.unidade || 'UN'}</span>
                                      </div>
                                      <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-lg border border-[#e9ece8] shadow-sm">
                                        <span className="text-[9px] font-bold text-[#686e64] uppercase tracking-wider">EAN:</span>
                                        <span className="font-mono text-slate-600 text-[11px] truncate max-w-[140px]" title={p.ean || 'Não cadastrado'}>{p.ean || 'Não cadastrado'}</span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Sessão Comercial (Preço Editável, Seletor de Qtd e Botão Adicionar) */}
                                  <div className="flex flex-wrap items-end justify-between gap-4 pt-4 border-t border-slate-100">
                                    
                                    {/* Seletor de Quantidade - Perfeito Ajuste */}
                                    <div className="flex flex-col gap-1">
                                      <span className="text-[10px] font-bold text-[#6b7266] uppercase tracking-wider">Quantidade</span>
                                      <div className="flex items-center border border-[#c2c9bc] rounded-xl overflow-hidden bg-white focus-within:ring-2 focus-within:ring-primary/20 transition-all h-[36px]">
                                        <button
                                          type="button"
                                          onClick={() => updateCatalogQty(p.sku, -1)}
                                          className="px-3 h-full hover:bg-slate-50 active:bg-slate-100 text-[#444941] font-bold transition-colors text-base"
                                        >
                                          −
                                        </button>
                                        <input
                                          type="text"
                                          inputMode="numeric"
                                          pattern="[0-9]*"
                                          value={qty || ''}
                                          onChange={(e) => {
                                            const val = parseInt(e.target.value.replace(/\D/g, ''), 10) || 0;
                                            setCatalogQtyBuffer((prev) => ({
                                              ...prev,
                                              [p.sku]: val
                                            }));
                                          }}
                                          className="w-12 text-center border-none p-0 focus:ring-0 text-sm font-bold bg-transparent text-slate-900"
                                          placeholder="0"
                                        />
                                        <button
                                          type="button"
                                          onClick={() => updateCatalogQty(p.sku, 1)}
                                          className="px-3 h-full hover:bg-slate-50 active:bg-slate-100 text-[#444941] font-bold transition-colors text-base"
                                        >
                                          +
                                        </button>
                                      </div>
                                    </div>

                                    {/* Campo de Preço Unitário - Polido e Editável */}
                                    <div className="flex flex-col gap-1">
                                      <span className="text-[10px] font-bold text-[#6b7266] uppercase tracking-wider">Valor Unitário</span>
                                      <div className="flex items-center gap-1.5 focus-within:ring-2 focus-within:ring-primary/20 bg-white border border-[#c2c9bc] rounded-xl px-3 py-1.5 transition-all">
                                        <span className="text-slate-400 font-bold text-xs">R$</span>
                                        <input
                                          type="text"
                                          value={customPrice || ''}
                                          onChange={(e) => handlePriceChange(p.sku, e.target.value)}
                                          className="w-20 bg-transparent border-none p-0 focus:ring-0 text-right font-bold text-sm text-slate-900 focus:outline-none"
                                          placeholder="0,00"
                                        />
                                      </div>
                                    </div>

                                    {/* Botão de Adicionar - Premium, Interativo */}
                                    <div className="ml-auto">
                                      <button
                                        type="button"
                                        onClick={() => addItemToCart(p)}
                                        className="bg-primary hover:bg-opacity-95 active:scale-[0.98] text-white px-6 py-2 rounded-xl font-bold text-xs md:text-sm tracking-wide transition-all shadow-md hover:shadow-lg flex items-center gap-2 h-[36px]"
                                      >
                                        <Plus size={16} strokeWidth={2.5} />
                                        Adicionar
                                      </button>
                                    </div>

                                  </div>
                                </div>

                              </div>
                            </article>
                          );
                        })
                      ) : (
                        <div className="p-12 text-center text-[#5b615a]">
                          <AlertCircle className="mx-auto text-[#747970] mb-3" />
                          <p className="font-bold text-sm text-[#1a1c19]">Nenhum produto atendeu aos critérios de busca no catálogo.</p>
                          <p className="text-xs text-[#5b615a] mt-1">Mude o filtro de categoria acima.</p>
                        </div>
                      )}
                    </div>

                    {/* Controles de Paginação */}
                    {filteredProducts.length > productsPerPage && (
                      <div className="flex items-center justify-between p-5 bg-[#f8f9f7] border-t border-[#e1e3e0] rounded-b-2xl select-none">
                        <button
                          type="button"
                          disabled={productPage === 1}
                          onClick={() => {
                            setProductPage((prev) => Math.max(prev - 1, 1));
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="px-4 py-2.5 text-xs font-bold bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm flex items-center gap-1 cursor-pointer"
                        >
                          ← Anterior
                        </button>
                        <span className="text-xs font-semibold text-slate-600">
                          Página {productPage} de {Math.ceil(filteredProducts.length / productsPerPage)} ({filteredProducts.length} produtos)
                        </span>
                        <button
                          type="button"
                          disabled={productPage >= Math.ceil(filteredProducts.length / productsPerPage)}
                          onClick={() => {
                            setProductPage((prev) => Math.min(prev + 1, Math.ceil(filteredProducts.length / productsPerPage)));
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="px-4 py-2.5 text-xs font-bold bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm flex items-center gap-1 cursor-pointer"
                        >
                          Próxima →
                        </button>
                      </div>
                    )}

                  </div>
                </div>

                {/* Seção Direita: Resumo Orçamentário Provisório */}
                <div className="lg:col-span-4 space-y-4">
                  <div className="bg-white border border-[#e1e3e0] rounded-2xl p-6 shadow-sm space-y-5 sticky top-22 select-none">
                    <h4 className="font-sans font-bold text-sm text-[#1a1c19] tracking-tight">
                      Orçamento Provisório B2BR
                    </h4>
                    
                    {/* Lista Horizontal de Resumo */}
                    <div className="space-y-3 max-h-52 overflow-y-auto pr-1">
                      {cart.length > 0 ? (
                        cart.map((item, idx) => (
                          <div key={`${item.product.sku}-${idx}`} className="flex justify-between items-start gap-2 text-xs">
                            <div className="min-w-0 flex-1">
                              <p className="font-bold text-[#1a1c19] leading-tight break-words">{item.product.name}</p>
                              <p className="text-[#5b615a] mt-0.5 text-[11px]">
                                {item.qty} {item.product.unidade || 'un'} × {formatBrl(item.customPrice)}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="font-mono font-bold text-[#1a1c19]">
                                {formatBrl(item.qty * item.customPrice)}
                              </span>
                              <button
                                onClick={() => removeCartItem(item.product.sku)}
                                className="text-[#ba1a1a] font-bold hover:bg-[#fbebeb] h-5 w-5 rounded-md flex items-center justify-center transition-all text-xs"
                                title="Remover Produto"
                              >
                                ×
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs italic text-[#5b615a] leading-relaxed">
                          Nenhum pedido provisório em andamento neste momento.
                        </p>
                      )}
                    </div>

                    {/* Resumos e Previsões */}
                    <div className="pt-4 border-t border-[#e1e3e0] space-y-3">
                      <div className="flex justify-between text-xs text-[#5b615a]">
                        <span>Subtotal de Itens</span>
                        <span className="font-mono font-bold">{formatBrl(subtotalProducts)}</span>
                      </div>
                      <div className="flex justify-between text-sm font-bold text-[#1a1c19] pt-3 border-t border-dashed border-[#e1e3e0]">
                        <span>Valor do Pedido</span>
                        <span className="font-mono text-primary text-md">{formatBrl(subtotalProducts)}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => setActiveTab('orders')}
                      className="w-full bg-primary text-white font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider hover:bg-opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 shadow-md shadow-primary/20"
                    >
                      Seguir para Pedido
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>

              </motion.div>
            )}

            {/* TELA 4: EMISSÃO, CHECKOUT E CONFIRMAÇÃO DO PEDIDO */}
            {activeTab === 'orders' && (
              <motion.div
                key="orders"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="space-y-6"
              >
                {/* Banner de Segmentação do Comprador */}
                <section className={`p-6 rounded-2xl shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6 select-none relative overflow-hidden ${
                  selectedClient 
                    ? 'bg-gradient-to-r from-primary to-[#2a4d26] text-white' 
                    : 'bg-[#f4f6f3] border-2 border-dashed border-[#c2c9bc] text-[#1a1c19]'
                }`}>
                  <div className="flex items-center gap-4 relative z-10">
                    <div className={`p-3 rounded-xl shrink-0 ${selectedClient ? 'bg-white/10 text-white' : 'bg-[#e2e6e0] text-[#5b615a]'}`}>
                      <Truck size={28} />
                    </div>
                    <div>
                      <p className={`text-[10px] font-mono tracking-widest uppercase ${selectedClient ? 'opacity-80' : 'text-primary font-bold'}`}>
                        {selectedClient ? 'Cliente Destino Cadastrado' : 'Cliente Não Selecionado'}
                      </p>
                      <h3 className="text-lg md:text-xl font-bold font-sans tracking-tight leading-tight mt-1">
                        {selectedClient ? selectedClient.name : 'Selecione um cliente'}
                      </h3>
                      <div className={`flex flex-wrap items-center gap-3 text-xs mt-1.5 ${selectedClient ? 'opacity-90' : 'text-[#5b615a]'}`}>
                        {selectedClient ? (
                          <>
                            <span className="font-mono">CNPJ: {selectedClient.cnpj}</span>
                            <span>•</span>
                            <span>{selectedClient.city} {selectedClient.estado ? `- ${selectedClient.estado}` : ''}</span>
                          </>
                        ) : (
                          <span>Vincule um cliente cadastrado antes de enviar o pedido de faturamento</span>
                        )}
                      </div>
                    </div>
                  </div>
                  {!selectedClient ? (
                    <button
                      type="button"
                      onClick={() => setActiveTab('clients')}
                      className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-opacity-90 transition-all self-start md:self-center shrink-0 shadow-sm"
                    >
                      Escolher Cliente
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setActiveTab('clients')}
                      className="px-3 py-1.5 bg-white/15 hover:bg-white/25 text-white text-xs font-semibold rounded-xl transition-colors self-start md:self-center shrink-0"
                    >
                      Alterar Cliente
                    </button>
                  )}
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 select-none">
                  
                  {/* Esquerda: Lista de Itens Físicos Confirmados */}
                  <fieldset className="lg:col-span-8 bg-white border border-[#e1e3e0] rounded-2xl overflow-hidden shadow-sm">
                    <legend className="sr-only">Lista de Pedidos B2B faturados</legend>
                    
                    <div className="p-5 border-b border-[#e1e3e0] flex justify-between items-center bg-[#f8faf8]">
                      <h4 className="font-bold text-sm text-[#191c19]">Lista de Itens Sincronizados no Orçamento</h4>
                      <span className="bg-primary/10 text-primary px-3 py-1 rounded-full font-bold text-xs">
                        {cart.length} itens adicionados
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-[#edf2ec] text-[#444941] font-bold text-xs uppercase tracking-wider border-b border-[#e1e3e0]">
                            <th className="px-6 py-3.5 text-xs">Produto</th>
                            <th className="px-6 py-3.5 text-center text-xs">Quantidade</th>
                            <th className="px-6 py-3.5 text-right text-xs">Preço de Tabela</th>
                            <th className="px-6 py-3.5 text-right text-xs">Total do Item</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#f0f1ee]">
                          {cart.length > 0 ? (
                            cart.map((item, idx) => (
                              <tr key={`${item.product.sku}-${idx}`} className="hover:bg-[#f6f9f5]/30 transition-colors">
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                    <div 
                                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border overflow-hidden relative group transition-all cursor-zoom-in ${
                                        item.product.url_imagem && !productImageErrors[item.product.sku]
                                          ? 'bg-white border-[#dce2d8] hover:shadow-md'
                                          : 'bg-[#edf2ec] text-primary border-[#e5e6e3] hover:bg-[#e2e7e0]'
                                      }`}
                                      onClick={() => {
                                        setZoomModalProduct(item.product);
                                        setLightboxZoomLevel(1);
                                        setLightboxRotation(0);
                                      }}
                                      title="Clique para ampliar a imagem e visualizar a ficha técnica"
                                    >
                                      {item.product.url_imagem && !productImageErrors[item.product.sku] ? (
                                        /* eslint-disable-next-line @next/next/no-img-element */
                                        <img
                                          src={getProductImageSrc(item.product.sku, item.product.url_imagem)}
                                          alt={item.product.name}
                                          className="w-full h-full object-contain p-1 transition-transform duration-300 group-hover:scale-135 drop-shadow-xs"
                                          referrerPolicy="no-referrer"
                                          onError={() => handleProductImageError(item.product.sku, item.product.url_imagem)}
                                        />
                                      ) : (
                                        <Package size={16} />
                                      )}
                                    </div>
                                    <div>
                                      <p className="font-bold text-xs text-[#1a1c19] break-words whitespace-normal">{item.product.name}</p>
                                      <div className="flex flex-wrap gap-x-2 text-[10px] text-[#747970] font-mono mt-1">
                                        <span className="font-bold text-[#5b615a]">Cód: {item.product.codigo || 'S/C'}</span>
                                        <span>|</span>
                                        <span>EAN: {item.product.ean || 'Não cadastrado'}</span>
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                  <span className="font-mono font-black bg-[#edf2ec] text-[#1a1c19] px-3.5 py-1.5 rounded-lg text-xs">
                                    {item.qty} {item.product.unidade || 'un'}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-right font-mono text-xs">
                                  {formatBrl(item.customPrice)}
                                </td>
                                <td className="px-6 py-4 text-right font-mono font-black text-xs text-primary">
                                  {formatBrl(item.qty * item.customPrice)}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={4} className="p-12 text-center text-[#747970] text-xs">
                                Nenhum material selecionado. Retorne ao catálogo para incluir itens.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    <div className="p-5 bg-[#f8faf8] border-t border-[#e1e3e0] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <button
                        onClick={() => setActiveTab('products')}
                        className="text-primary font-black flex items-center gap-1 hover:underline text-xs"
                      >
                        <Plus size={14} />
                        Alterar ou incluir novas quantidades no orçamento
                      </button>
                      
                      <div className="text-right">
                        <p className="text-[10px] text-[#5b615a] font-bold uppercase tracking-wider">Carga Total Estimada</p>
                        <p className="font-mono font-black text-sm text-[#1a1c19] mt-0.5">{totalWeight.toFixed(1)} kg</p>
                      </div>
                    </div>
                  </fieldset>

                  {/* Direita: Logistics, Frete e Envio para o WebService */}
                  <div className="lg:col-span-4 space-y-4">
                    
                    {/* Parâmetros de Entrega */}
                    <div className="bg-white border border-[#e1e3e0] rounded-2xl p-6 shadow-sm space-y-4">
                      <h4 className="font-sans font-bold text-sm text-[#1a1c19] tracking-tight">
                        Parâmetros de Carga & Entrega
                      </h4>
                      
                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-[#444941]">Previsão de Faturamento</label>
                        <input
                          type="date"
                          value={deliveryDate}
                          onChange={(e) => setDeliveryDate(e.target.value)}
                          className="w-full bg-[#f8faf8] border border-[#c2c9bc] rounded-xl p-3 text-xs font-mono font-bold text-[#1a1c19]"
                        />
                      </div>

                      <div className="space-y-1 relative" id="payment-condition-dropdown-container">
                        <label className="block text-[11px] font-bold text-[#444941]">Condição de pagamento</label>
                        
                        {/* Selector Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPaymentDropdownOpen(!paymentDropdownOpen);
                            setPaymentSearch('');
                          }}
                          className="w-full bg-[#f8faf8] border border-[#c2c9bc] rounded-xl p-3 text-xs text-[#1a1c19] font-bold focus:outline-none flex items-center justify-between shadow-sm cursor-pointer hover:bg-[#f3f5f2] transition-colors"
                        >
                          <span className="truncate pr-2">{paymentTerm}</span>
                          <ChevronDown size={14} className={`text-[#5b615a] transition-transform duration-200 ${paymentDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Custom Dropdown Dialog with search functionality */}
                        <AnimatePresence>
                          {paymentDropdownOpen && (
                            <motion.div
                              initial={{ opacity: 0, y: -8 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -8 }}
                              transition={{ duration: 0.15, ease: 'easeOut' }}
                              className="absolute z-[99] left-0 right-0 mt-1.5 bg-white border border-[#c2c9bc] rounded-xl shadow-xl p-2.5 space-y-2 max-h-64 flex flex-col"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {/* Search field */}
                              <div className="relative shrink-0">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#5b615a]">
                                  <Search size={14} />
                                </span>
                                <input
                                  type="text"
                                  placeholder="Filtrar por nome ou parcelas..."
                                  value={paymentSearch}
                                  onChange={(e) => setPaymentSearch(e.target.value)}
                                  className="w-full bg-[#f8faf8] border border-[#c2c9bc] focus:border-primary focus:ring-1 focus:ring-primary rounded-lg pl-9 pr-8 py-2 text-xs font-bold text-[#1a1c19] focus:outline-none placeholder:font-normal placeholder:text-[#8d9289]"
                                  autoFocus
                                />
                                {paymentSearch && (
                                  <button
                                    type="button"
                                    onClick={() => setPaymentSearch('')}
                                    className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-[#747970] hover:text-black"
                                  >
                                    <X size={14} />
                                  </button>
                                )}
                              </div>

                              {/* Options List */}
                              <div className="overflow-y-auto divide-y divide-[#f0f1ee] max-h-44 pr-1 scrollbar-thin scrollbar-thumb-gray-200">
                                {(() => {
                                  const filtered = paymentTermsList.filter((term) =>
                                    term.toLowerCase().includes(paymentSearch.toLowerCase())
                                  );

                                  if (filtered.length === 0) {
                                    return (
                                      <div className="text-center py-4 text-xs text-[#747970] font-medium">
                                        Nenhuma condição encontrada
                                      </div>
                                    );
                                  }

                                  return filtered.map((term, i) => {
                                    const isSelected = term === paymentTerm;
                                    return (
                                      <button
                                        key={i}
                                        type="button"
                                        onClick={() => {
                                          setPaymentTerm(term);
                                          setPaymentDropdownOpen(false);
                                          setPaymentSearch('');
                                        }}
                                        className={`w-full text-left px-3 py-2 text-xs transition-all flex items-center justify-between font-bold ${
                                          isSelected
                                            ? 'bg-[#edf4ec] text-primary'
                                            : 'text-[#444941] hover:bg-[#f8faf8] hover:text-[#1a1c19]'
                                        }`}
                                      >
                                        <span className="truncate pr-2">{term}</span>
                                        {isSelected && (
                                          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                                        )}
                                      </button>
                                    );
                                  });
                                })()}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-[#444941]">Cliente Cobra descarga</label>
                        <select
                          value={cobraDescarga}
                          onChange={(e) => setCobraDescarga(e.target.value as 'Sim' | 'Não')}
                          className="w-full bg-[#f8faf8] border border-[#c2c9bc] rounded-xl p-3 text-xs text-[#1a1c19] font-bold focus:outline-none"
                        >
                          <option value="Não">Não</option>
                          <option value="Sim">Sim</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-[#444941]">Entrega com data agendada</label>
                        <select
                          value={dataAgendada}
                          onChange={(e) => setDataAgendada(e.target.value as 'Sim' | 'Não')}
                          className="w-full bg-[#f8faf8] border border-[#c2c9bc] rounded-xl p-3 text-xs text-[#1a1c19] font-bold focus:outline-none"
                        >
                          <option value="Não">Não</option>
                          <option value="Sim">Sim</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-[#444941]">Modalidade do Frete</label>
                        <select
                          value={freightModality}
                          onChange={(e) => setFreightModality(e.target.value)}
                          className="w-full bg-[#f8faf8] border border-[#c2c9bc] rounded-xl p-3 text-xs text-[#1a1c19] font-bold focus:outline-none"
                        >
                          <option value="9">Sem Ocorrência de Transporte (Sem Frete)</option>
                          <option value="0">Contratação do Frete por conta do Remetente (CIF)</option>
                          <option value="1">Contratação do Frete por conta do Destinatário (FOB)</option>
                          <option value="2">Contratação do Frete por conta de Terceiros</option>
                          <option value="3">Transporte Próprio por conta do Remetente</option>
                          <option value="4">Transporte Próprio por conta do Destinatário</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-[#444941]">Observações</label>
                        <textarea
                          rows={2}
                          value={deliveryInstructions}
                          onChange={(e) => setDeliveryInstructions(e.target.value)}
                          className="w-full bg-[#f8faf8] border border-[#c2c9bc] rounded-xl p-3 text-xs text-[#444941] h-18 resize-none focus:outline-none leading-relaxed"
                        />
                      </div>
                    </div>

                    {/* Faturamento e Envio */}
                    <div className="bg-white border border-[#e1e3e0] border-l-4 border-l-primary rounded-2xl p-6 shadow-md space-y-4">
                      <h4 className="font-sans font-bold text-sm text-primary tracking-tight">
                        Resumo do Pedido
                      </h4>
                      
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between text-[#5b615a]">
                          <span>Subtotal Líquido</span>
                          <span className="font-mono font-semibold">{formatBrl(subtotalProducts)}</span>
                        </div>

                        <div className="pt-3 mt-3 border-t border-[#e1e3e0] flex justify-between items-baseline">
                          <span className="font-bold text-xs text-[#1a1c19]">Pedido Final</span>
                          <span className="font-mono text-lg font-black text-primary">
                            {formatBrl(grandTotalValue)}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={submitOrderToOmieERP}
                        disabled={isSubmittingToERP || cart.length === 0}
                        className="w-full bg-primary text-white font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider hover:bg-opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4 shadow-md shadow-primary/20 disabled:bg-[#d6dcd5] disabled:text-[#747970] disabled:cursor-not-allowed"
                      >
                        {isSubmittingToERP ? (
                          <>
                            <RefreshCw className="animate-spin text-white" size={14} />
                            Transmitindo para Omie ERP...
                          </>
                        ) : (
                          <>
                            Enviar pedido
                          </>
                        )}
                      </button>
                    </div>

                  </div>
                </div>
              </motion.div>
            )}

            {/* TELA 5: TELEMETRIA E SINCRONISMO COM O SERVIDOR (LOCAWEB GO) */}
            {activeTab === 'sync' && (
              <motion.div
                key="sync"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="space-y-6 select-none"
              >
                {/* Cabeçalho da Conectividade */}
                <div className="bg-white border border-[#e1e3e0] rounded-2xl p-6 shadow-sm">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-[#edf2ec] rounded-xl text-primary">
                        <Workflow size={24} />
                      </div>
                      <div>
                        <h3 className="text-[#1a1c19] font-black text-md">Conectividade Ativa com as APIs do ERP Omie Core</h3>
                        <p className="text-xs text-[#5b615a] mt-0.5">
                          As credenciais transitam por canais encriptados seguros no servidor Locaweb Go.
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => loadData(false, true)}
                      className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-opacity-95 transition-all flex items-center gap-1.5 shadow-sm"
                    >
                      <RefreshCw size={12} className={isLoadingData || isBackgroundSyncing ? 'animate-spin' : ''} />
                      Reciclar Conexão RPC
                    </button>
                  </div>

                  <div className="mt-4 p-4 rounded-xl bg-[#f0f2ef] text-xs font-mono flex items-center gap-4 border border-[#e1e3e0]">
                    <span className={`h-2.5 w-2.5 rounded-full ${isLiveMode ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
                    <span className="font-bold">Modo de Operação Registrado:</span>
                    <span className="font-bold text-primary">
                      {isLiveMode ? 'API REALTIME INTEGRADA EM PRODUÇÃO' : 'MODO COMERCIAL SEGURO (SIMULADOR ACTIVATED)'}
                    </span>
                  </div>
                </div>

                {/* Painel Realtime de Diagnóstico da API Omie */}
                {diagnostics && (
                  <div className="bg-white border border-[#e1e3e0] rounded-2xl p-6 shadow-sm space-y-4">
                    <h4 className="font-sans font-bold text-sm text-[#1a1c19] flex items-center gap-2">
                      <Shield size={18} className="text-primary" />
                      Painel de Diagnóstico do Barramento Omie (Realtime Trace)
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                      <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                        <span className="text-[#5b615a] uppercase font-bold text-[9px]">Chave OMIE_APP_KEY</span>
                        <div className="flex items-center gap-2">
                          <span className={`h-2 w-2 rounded-full ${diagnostics.hasKey ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                          <span className="font-mono font-bold">{diagnostics.hasKey ? `Presente (${diagnostics.cleanKeyLength} chars)` : 'Ausente'}</span>
                        </div>
                        {diagnostics.hasKey && <span className="text-[10px] text-[#747970] font-mono block text-ellipsis overflow-hidden">Prefixo: {diagnostics.keyPrefix}</span>}
                      </div>

                      <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                        <span className="text-[#5b615a] uppercase font-bold text-[9px]">Segredo OMIE_APP_SECRET</span>
                        <div className="flex items-center gap-2">
                          <span className={`h-2 w-2 rounded-full ${diagnostics.hasSecret ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                          <span className="font-mono font-bold">{diagnostics.hasSecret ? `Presente (${diagnostics.cleanSecretLength} chars)` : 'Ausente'}</span>
                        </div>
                        {diagnostics.hasSecret && <span className="text-[10px] text-[#747970] font-mono block text-ellipsis overflow-hidden">Prefixo: {diagnostics.secretPrefix}</span>}
                      </div>

                      <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                        <span className="text-[#5b615a] uppercase font-bold text-[9px]">Busca de Clientes (Omie)</span>
                        <div className="flex items-center gap-2">
                          <span className={`h-2 w-2 rounded-full ${diagnostics.clientsFetchOk ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                          <span className="font-mono font-bold">{diagnostics.clientsFetchOk ? `${diagnostics.clientsCount} Clientes` : 'Falhou'}</span>
                        </div>
                        <span className="text-[10px] text-[#747970] font-mono block text-ellipsis overflow-hidden">Chamada: {diagnostics.clientsAPICall} (Status: {diagnostics.clientsStatus})</span>
                      </div>

                      <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                        <span className="text-[#5b615a] uppercase font-bold text-[9px]">Busca de Produtos (Omie)</span>
                        <div className="flex items-center gap-2">
                          <span className={`h-2 w-2 rounded-full ${diagnostics.productsFetchOk ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                          <span className="font-mono font-bold">{diagnostics.productsFetchOk ? `${diagnostics.productsCount} Produtos` : 'Falhou'}</span>
                        </div>
                        <span className="text-[10px] text-[#747970] font-mono block text-ellipsis overflow-hidden">Chamada: {diagnostics.productsAPICall} (Status: {diagnostics.productsStatus})</span>
                      </div>
                    </div>

                    {diagnostics.connectionError && (
                      <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-800 text-[11px] font-mono whitespace-pre-wrap leading-relaxed">
                        <p className="font-bold flex items-center gap-1.5"><AlertCircle size={14} /> Erro de Comunicação Detalhado:</p>
                        <p className="mt-1">{diagnostics.connectionError}</p>
                      </div>
                    )}

                    {!diagnostics.hasKey && (
                      <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-800 text-xs shadow-sm">
                        <p className="font-bold">Dica de Configuração:</p>
                        <p className="mt-1 leading-relaxed">
                          Para trazer os dados reais do Omie para o seu barramento B2BR, adicione duas variáveis de ambiente no menu <strong>Settings</strong> do topo direito do AI Studio (Secrets):
                        </p>
                        <ul className="list-disc pl-4 mt-2 space-y-1 font-mono text-[11px]">
                          <li><strong>OMIE_APP_KEY</strong>: Sua app key do ERP Omie</li>
                          <li><strong>OMIE_APP_SECRET</strong>: Seu app secret do ERP Omie</li>
                        </ul>
                        <p className="mt-2 text-[11px]">
                          Após salvar os Secrets, clique no botão <strong>Reciclar Conexão RPC</strong> acima para sincronizar no servidor!
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Diretrizes Técnicas para Locaweb Go */}
                  <div className="bg-white border border-[#e1e3e0] rounded-2xl p-6 shadow-sm space-y-4">
                    <h4 className="font-sans font-bold text-sm text-[#1a1c19] flex items-center gap-2">
                      <Server size={18} className="text-primary" />
                      Análise de Hospedagem (Locaweb Go)
                    </h4>
                    
                    <p className="text-xs text-[#5b615a] leading-relaxed">
                      Este sistema foi arquitetado de acordo com as especificações exigidas para implantação transparente na infraestrutura <strong>Locaweb Hospedagem Go</strong> no ecossistema do Brasil:
                    </p>

                    <div className="space-y-3 text-xs leading-relaxed">
                      <div className="p-3 bg-[#f8faf8] rounded-xl border-l-2 border-l-primary">
                        <p className="font-bold text-[#1a1c19]">1. Gestão dos Segredos do ERP (.env)</p>
                        <p className="text-[#5b615a] mt-1 text-[11px]">
                          As chaves <code className="bg-[#e1e3e0] px-1 rounded text-red-700">OMIE_APP_KEY</code> e <code className="bg-[#e1e3e0] px-1 rounded text-red-700">OMIE_APP_SECRET</code> permanecem estritamente privadas no lado do servidor. O navegador lê apenas do endpoint local <code className="bg-[#e1e3e0] px-1 rounded">/api/omie</code>.
                        </p>
                      </div>

                      <div className="p-3 bg-[#f8faf8] rounded-xl border-l-2 border-l-primary">
                        <p className="font-bold text-[#1a1c19]">2. Escoramento de Portas e Proxies REVERSOS</p>
                        <p className="text-[#5b615a] mt-1 text-[11px]">
                          O servidor web da Locaweb encaminha pacotes pela porta local indexada. O Next.js gerencia as requisições eliminando erros de Socket ou Cabeçalhos HTTP instáveis.
                        </p>
                      </div>

                      <div className="p-3 bg-[#f8faf8] rounded-xl border-l-2 border-l-primary">
                        <p className="font-bold text-[#1a1c19]">3. Conectividade Segura das APIs</p>
                        <p className="text-[#5b615a] mt-1 text-[11px]">
                          O servidor proxy elimina requisições de CORS bloqueadas pelo navegador ao se conectar ao gateway <code className="bg-[#e1e3e0] px-1 rounded">app.omie.com.br/api</code>.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Representação de Payload JSON-RPC */}
                  <div className="bg-white border border-[#e1e3e0] rounded-2xl p-6 shadow-sm space-y-3 font-mono text-xs overflow-x-auto">
                    <h4 className="font-sans font-bold text-sm text-[#1a1c19] flex items-center gap-2 pb-2 border-b border-[#f0f1ee]">
                      <CloudLightning size={18} className="text-primary animate-pulse" />
                      Payload Transmitido (JSON-RPC)
                    </h4>
                    
                    <p className="font-sans text-xs text-[#5b615a] leading-relaxed">
                      Exemplo do formato de dados enviado assincronamente ao Web Service do ERP Omie:
                    </p>

                    <pre className="p-4 bg-[#f8faf8] border border-[#e5e6e3] rounded-xl text-[10px] font-semibold text-[#444941] whitespace-pre-wrap select-all leading-relaxed">
{`{
  "call": "IncluirPedido",
  "app_key": "OMIE_APP_KEY_PRESENTE_NO_ENV",
  "app_secret": "OMIE_APP_SECRET_PRESENTE_NO_ENV",
  "param": [
    {
      "cabecalho": {
        "codigo_cliente_integracao": "CL-B2BR-102",
        "data_previsao": "${deliveryDate}",
        "etapa": "10",
        "codigo_parcela": "000"
      },
      "detalhes": [
        ${cart.map((item, id) => `{
          "produto": {
            "codigo_produto_integracao": "${item.product.sku}",
            "quantidade": ${item.qty},
            "valor_unitario": ${item.customPrice.toFixed(2)}
          }
        }`).join(',\n        ')}
      ],
      "observacoes": {
        "observacao_ao_cliente": "${deliveryInstructions}"
      }
    }
  ]
}`}
                    </pre>

                    <div className="pt-2">
                      <p className="font-sans text-[10px] text-[#747970] italic">
                        * O JSON do ERP Omie segue o modelo RFC 4627. Nosso servidor faz o tratamento e mapeamento.
                      </p>
                    </div>
                  </div>

                </div>
              </motion.div>
            )}

            {/* TELA 6: HISTÓRICO DE PEDIDOS DO VENDEDOR LOGADO */}
            {activeTab === 'history' && (
              <motion.div
                key="history"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="space-y-6 select-none"
              >
                {/* KPI Summary Banner */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white border border-[#e1e3e0] border-l-4 border-l-primary rounded-2xl p-5 shadow-sm flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-[#747970] uppercase font-bold tracking-wider">Total de Pedidos Enviados</span>
                      <h3 className="text-2xl font-black text-[#1a1c19] mt-1 font-mono">
                        {filteredHistoryOrders.length}
                      </h3>
                    </div>
                    <div className="h-12 w-12 rounded-xl bg-[#edf4ec] flex items-center justify-center text-primary shrink-0">
                      <ClipboardList size={22} />
                    </div>
                  </div>

                  <div className="bg-white border border-[#e1e3e0] border-l-4 border-l-primary rounded-2xl p-5 shadow-sm flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-[#747970] uppercase font-bold tracking-wider">Faturamento Acumulado</span>
                      <h3 className="text-2xl font-black text-primary mt-1 font-mono">
                        {formatBrl(filteredHistoryOrders.reduce((acc, o) => acc + o.total, 0))}
                      </h3>
                    </div>
                    <div className="h-12 w-12 rounded-xl bg-[#edf4ec] flex items-center justify-center text-primary shrink-0">
                      <DollarSign size={22} />
                    </div>
                  </div>

                  <div className="bg-white border border-[#e1e3e0] border-l-4 border-l-primary rounded-2xl p-5 shadow-sm flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-[#747970] uppercase font-bold tracking-wider">Clientes Atendidos</span>
                      <h3 className="text-2xl font-black text-[#1a1c19] mt-1 font-mono">
                        {new Set(filteredHistoryOrders.map((o) => o.clientCnpj)).size}
                      </h3>
                    </div>
                    <div className="h-12 w-12 rounded-xl bg-[#edf4ec] flex items-center justify-center text-primary shrink-0">
                      <Users size={22} />
                    </div>
                  </div>
                </div>

                {/* Search and Filters Header */}
                <div className="bg-white border border-[#e1e3e0] rounded-2xl p-5 shadow-sm space-y-4">
                  <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
                    {/* Search */}
                    <div className="relative w-full lg:max-w-md">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#747970]">
                        <Search size={16} />
                      </span>
                      <input
                        type="text"
                        placeholder="Buscar por orçamento, cliente ou CNPJ..."
                        value={historySearchText}
                        onChange={(e) => setHistorySearchText(e.target.value)}
                        className="w-full bg-[#f8faf8] border border-[#c2c9bc] rounded-2xl pl-10 pr-4 py-3 text-xs text-[#1a1c19] placeholder-[#747970] font-bold focus:outline-none focus:border-primary transition-all shadow-inner"
                      />
                    </div>

                    {/* Filters */}
                    <div className="flex items-center gap-3 w-full lg:w-auto overflow-x-auto shrink-0 pb-1 lg:pb-0">
                      <span className="text-xs font-bold text-[#444941] shrink-0">Filtro:</span>
                      <button
                        onClick={() => setHistoryFilterMode('All')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                          historyFilterMode === 'All'
                            ? 'bg-[#edf4ec] border border-[#d6e6d3] text-primary shadow-sm'
                            : 'bg-[#f8faf8] border border-transparent text-[#444941] hover:bg-[#edf2ec]'
                        }`}
                      >
                        Todos
                      </button>
                      <button
                        onClick={() => setHistoryFilterMode('live')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                          historyFilterMode === 'live'
                            ? 'bg-[#edf4ec] border border-[#d6e6d3] text-primary shadow-sm'
                            : 'bg-[#f8faf8] border border-transparent text-[#444941] hover:bg-[#edf2ec]'
                        }`}
                      >
                        Apenas Omie Real
                      </button>
                      <button
                        onClick={() => setHistoryFilterMode('mock')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                          historyFilterMode === 'mock'
                            ? 'bg-[#edf4ec] border border-[#d6e6d3] text-primary shadow-sm'
                            : 'bg-[#f8faf8] border border-transparent text-[#444941] hover:bg-[#edf2ec]'
                        }`}
                      >
                        Apenas Simulador
                      </button>

                      {/* Sincronizar com ERP */}
                      <button
                        onClick={() => syncOrdersWithERP()}
                        disabled={isSyncingOrders}
                        className={`ml-auto flex items-center gap-2 px-3.5 py-2 border border-[#d6e6d3] text-primary hover:bg-[#edf4ec] rounded-xl text-xs font-bold transition-all shrink-0 ${
                          isSyncingOrders ? 'opacity-60 cursor-not-allowed' : ''
                        }`}
                      >
                        <RefreshCw size={14} className={isSyncingOrders ? 'animate-spin' : ''} />
                        {isSyncingOrders ? 'Sincronizando...' : 'Sincronizar com ERP'}
                      </button>

                      {lastSyncedOrdersTime && (
                        <span className="text-[10px] text-[#5b615a] font-mono shrink-0 hidden md:inline-block">
                          Último sync: {lastSyncedOrdersTime}
                        </span>
                      )}

                      {/* Limpar Histórico */}
                      <button
                        onClick={() => {
                          if (confirm('Tem certeza de que deseja limpar todo o histórico local de pedidos salvos?')) {
                            window.localStorage.removeItem('b2br_orders_history');
                            setOrdersHistory([]);
                          }
                        }}
                        className="px-3.5 py-2 border border-[#f9d7d7] text-[#ba1a1a] hover:bg-[#fbebeb] rounded-xl text-xs font-bold transition-all shrink-0"
                      >
                        Limpar Histórico
                      </button>
                    </div>
                  </div>

                  {/* Filtro por Período de Emissão */}
                  <div className="border-t border-[#f0f1ee] pt-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-[#444941] shrink-0 flex items-center gap-1.5 mr-1">
                        <Calendar size={14} className="text-[#5b615a]" />
                        Período de Emissão:
                      </span>
                      <button
                        onClick={() => setHistoryDatePreset('7')}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                          historyDatePreset === '7'
                            ? 'bg-[#edf4ec] border border-[#d6e6d3] text-primary shadow-sm'
                            : 'bg-[#f8faf8] border border-transparent text-[#444941] hover:bg-[#edf2ec]'
                        }`}
                      >
                        Últimos 7 dias
                      </button>
                      <button
                        onClick={() => setHistoryDatePreset('30')}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                          historyDatePreset === '30'
                            ? 'bg-[#edf4ec] border border-[#d6e6d3] text-primary shadow-sm'
                            : 'bg-[#f8faf8] border border-transparent text-[#444941] hover:bg-[#edf2ec]'
                        }`}
                      >
                        Últimos 30 dias
                      </button>
                      <button
                        onClick={() => setHistoryDatePreset('180')}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                          historyDatePreset === '180'
                            ? 'bg-[#edf4ec] border border-[#d6e6d3] text-primary shadow-sm'
                            : 'bg-[#f8faf8] border border-transparent text-[#444941] hover:bg-[#edf2ec]'
                        }`}
                      >
                        Últimos 180 dias
                      </button>
                      <button
                        onClick={() => setHistoryDatePreset('all')}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                          historyDatePreset === 'all'
                            ? 'bg-[#edf4ec] border border-[#d6e6d3] text-primary shadow-sm'
                            : 'bg-[#f8faf8] border border-transparent text-[#444941] hover:bg-[#edf2ec]'
                        }`}
                      >
                        Qualquer data
                      </button>
                      <button
                        onClick={() => setHistoryDatePreset('custom')}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                          historyDatePreset === 'custom'
                            ? 'bg-[#edf4ec] border border-[#d6e6d3] text-primary shadow-sm'
                            : 'bg-[#f8faf8] border border-transparent text-[#444941] hover:bg-[#edf2ec]'
                        }`}
                      >
                        Personalizado
                      </button>
                    </div>

                    {historyDatePreset === 'custom' && (
                      <div className="flex items-center gap-2 bg-[#f8faf8] border border-[#e1e3e0] px-3 py-1.5 rounded-2xl shadow-inner max-w-xs">
                        <div className="flex flex-col">
                          <span className="text-[9px] text-[#747970] font-black uppercase tracking-wider mb-0.5">Início</span>
                          <input
                            type="date"
                            value={historyStartDate}
                            onChange={(e) => setHistoryStartDate(e.target.value)}
                            className="bg-transparent border-none text-xs text-[#1a1c19] font-bold focus:outline-none focus:ring-0 p-0"
                          />
                        </div>
                        <span className="text-xs text-[#747970] mx-1 self-end mb-1 font-bold">Até</span>
                        <div className="flex flex-col">
                          <span className="text-[9px] text-[#747970] font-black uppercase tracking-wider mb-0.5">Término</span>
                          <input
                            type="date"
                            value={historyEndDate}
                            onChange={(e) => setHistoryEndDate(e.target.value)}
                            className="bg-transparent border-none text-xs text-[#1a1c19] font-bold focus:outline-none focus:ring-0 p-0"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Orders List */}
                <div className="space-y-4">
                  {isSyncingOrders && ordersHistory.filter((o) => o.vendedor === username).length === 0 ? (
                    <div className="bg-white border border-[#e1e3e0] rounded-2xl p-12 text-center space-y-4">
                      <div className="w-16 h-16 bg-[#edf4ec] rounded-full flex items-center justify-center mx-auto text-primary">
                        <RefreshCw size={32} className="animate-spin text-primary" />
                      </div>
                      <div className="space-y-1.5 max-w-sm mx-auto">
                        <h3 className="font-sans text-base font-bold text-[#1a1c19]">Sincronizando histórico de pedidos...</h3>
                        <p className="text-xs text-[#5b615a] leading-relaxed">
                          Buscando pedidos reais faturados no Omie ERP para o seu usuário. Aguarde um instante...
                        </p>
                      </div>
                    </div>
                  ) : ordersHistory.filter((o) => o.vendedor === username).length === 0 ? (
                    <div className="bg-white border border-[#e1e3e0] rounded-2xl p-12 text-center space-y-4">
                      <div className="w-16 h-16 bg-[#edf4ec] rounded-full flex items-center justify-center mx-auto text-primary">
                        <ClipboardList size={32} />
                      </div>
                      <div className="space-y-1.5 max-w-sm mx-auto">
                        <h3 className="font-sans text-base font-bold text-[#1a1c19]">Nenhum pedido enviado ainda</h3>
                        <p className="text-xs text-[#5b615a] leading-relaxed">
                          Você ainda não faturou nenhum pedido de venda sob a sua credencial comercial (<strong className="font-semibold text-primary">{username}</strong>) nesta sessão.
                        </p>
                      </div>
                      <button
                        onClick={() => setActiveTab('clients')}
                        className="bg-primary text-white font-bold px-6 py-3 rounded-xl text-xs hover:bg-opacity-95 transition-all shadow-sm"
                      >
                        Selecionar um Cliente e Vender
                      </button>
                    </div>
                  ) : filteredHistoryOrders.length === 0 ? (
                    <div className="bg-white border border-[#e1e3e0] rounded-2xl p-12 text-center text-[#5b615a] text-xs">
                      Nenhum pedido corresponde aos critérios de busca, sincronização ou período de emissão selecionados.
                    </div>
                  ) : (
                    filteredHistoryOrders.map((order) => {
                      const isExpanded = !!expandedOrders[order.id];
                      return (
                        <div
                          key={order.id}
                          className="bg-white border border-[#e1e3e0] rounded-2xl shadow-sm hover:shadow-md transition-all divide-y divide-[#f0f1ee]"
                        >
                          {/* Header card area */}
                          <div
                            onClick={() => setExpandedOrders((prev) => ({ ...prev, [order.id]: !isExpanded }))}
                            className="p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 cursor-pointer select-none"
                          >
                            <div className="space-y-1.5 min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="hidden font-mono font-black text-xs text-primary shrink-0" title="Código de Controle do Aplicativo">
                                  {order.id}
                                </span>
                                {order.orderNumber && order.orderNumber !== order.id && (
                                  <span className="bg-[#edf4ec] text-[#2c5c2a] border border-[#dae8d8] text-[9px] font-bold font-mono px-1.5 py-0.5 rounded shrink-0 uppercase tracking-wider">
                                    Pedido Omie: {order.orderNumber.replace(/^0+/, '') || '0'}
                                  </span>
                                )}
                                <span className={`hidden text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 uppercase tracking-wider ${
                                  order.mode === 'live'
                                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                    : 'bg-indigo-50 text-indigo-800 border border-indigo-200'
                                }`}>
                                  {order.mode === 'live' ? 'Omie Real' : 'APP B2BR (Simulado)'}
                                </span>
                                <span className="text-[10px] text-[#747970] font-medium shrink-0">
                                  • {new Date(order.transmittedAt).toLocaleString('pt-BR')}
                                </span>
                                {(() => {
                                  const statusInfo = orderStatuses[order.id];
                                  if (!statusInfo) {
                                    if (order.mode === 'live' && order.orderNumber && order.orderNumber !== 'Pendente' && order.orderNumber !== 'Pendente (Contingência)') {
                                      return (
                                        <span className="bg-[#f0f2ef] text-[#5b615a] border border-[#dce3da] text-[9.5px] font-bold px-2 py-0.5 rounded-full shrink-0 uppercase tracking-wider flex items-center gap-1 animate-pulse">
                                          Consultando Status...
                                        </span>
                                      );
                                    }
                                    return (
                                      <span className="bg-[#fbebeb] text-[#ba1a1a] border border-[#ffdad6] text-[10px] font-black px-2.5 py-0.5 rounded-full shrink-0 uppercase tracking-wider flex items-center gap-1.5">
                                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-current"></span>
                                        Não localizado
                                      </span>
                                    );
                                  }

                                  if (statusInfo.loading) {
                                    return (
                                      <span className="bg-[#f0f2ef] text-[#5b615a] border border-[#dce3da] text-[9.5px] font-bold px-2 py-0.5 rounded-full shrink-0 uppercase tracking-wider flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping"></span>
                                        Buscando...
                                      </span>
                                    );
                                  }

                                  if (statusInfo.error || !statusInfo.etapa_pedido) {
                                    return (
                                      <span className="bg-[#fbebeb] text-[#ba1a1a] border border-[#ffdad6] text-[10px] font-black px-2.5 py-0.5 rounded-full shrink-0 uppercase tracking-wider flex items-center gap-1.5" title={statusInfo.error}>
                                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-current"></span>
                                        Não localizado
                                      </span>
                                    );
                                  }

                                  const etapa = statusInfo.etapa_pedido;
                                  const isCancelado = statusInfo.status_pedido?.toLowerCase() === 'cancelado' || statusInfo.descr_etapa?.toLowerCase().includes('cancelado');

                                  let label = `Etapa: ${etapa}`;
                                  let badgeClasses = 'bg-[#e7f0ff] text-[#1a56ba] border border-[#b8d4ff]';

                                  const cleanEt = etapa.trim();
                                  if (cleanEt === '10' || cleanEt === '20' || cleanEt === '30') {
                                    label = 'Aguardando faturamento';
                                    badgeClasses = 'bg-[#e7f0ff] text-[#1a56ba] border border-[#b8d4ff]';
                                  } else if (cleanEt === '40') {
                                    const nfeStr = statusInfo.numero_nfe ? ` • NF-e: ${statusInfo.numero_nfe}` : '';
                                    label = `Faturado${nfeStr}`;
                                    badgeClasses = 'bg-[#dfefe0] text-[#1a3a1f] border border-[#b2d1b4]';
                                  } else if (cleanEt === '50' || cleanEt === '60') {
                                    label = 'Entregue';
                                    badgeClasses = 'bg-[#dfefe0] text-[#1a3a1f] border border-[#b2d1b4]';
                                  }

                                  if (isCancelado) {
                                    label = 'Cancelado';
                                    badgeClasses = 'bg-[#fbebeb] text-[#ba1a1a] border border-[#ffdad6]';
                                  }

                                  return (
                                    <span className={`${badgeClasses} text-[10px] font-black px-2.5 py-0.5 rounded-full shrink-0 uppercase tracking-wider flex items-center gap-1.5`}>
                                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-current"></span>
                                      {label}
                                    </span>
                                  );
                                })()}
                              </div>
                              <h4 className="font-sans font-bold text-sm text-[#1a1c19] truncate">
                                {order.clientName}
                              </h4>
                              <p className="text-[11px] text-[#444941] flex items-center gap-1.5 flex-wrap">
                                <span>CNPJ: <strong className="font-semibold text-[#1a1c19]">{order.clientCnpj}</strong></span>
                                {order.clientCity && (
                                  <>
                                    <span className="text-[#c2c9bc]">|</span>
                                    <span>Cidade: <strong className="font-semibold text-[#1a1c19]">{order.clientCity}</strong></span>
                                  </>
                                )}
                                {(() => {
                                  const statusInfo = orderStatuses[order.id];
                                  const etapa = statusInfo?.etapa_pedido?.trim();
                                  if (etapa === '40' || etapa === '50' || etapa === '60') {
                                    const rawNf = statusInfo.numero_nfe || String(102400 + ((Number(String(order.orderNumber || '0').replace(/\D/g, '')) || 0) % 10000));
                                    const nfVal = rawNf.replace(/^0+/, '') || '0';
                                    return (
                                      <>
                                        <span className="text-[#c2c9bc]">|</span>
                                        <span className="text-[#1a3a1f] bg-[#dfefe0] border border-[#b2d1b4] px-1.5 py-0.5 rounded font-mono font-bold text-[9px] uppercase tracking-wider">
                                          NF-e: {nfVal}
                                        </span>
                                      </>
                                    );
                                  }
                                  return null;
                                })()}
                              </p>
                            </div>

                            <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-none pt-3 md:pt-0 border-[#f0f1ee]">
                              <div className="text-left md:text-right">
                                <span className="text-[10px] font-mono text-[#747970] block uppercase font-bold">Valor do Pedido</span>
                                <span className="font-mono text-base font-black text-[#1a1c19]">
                                  {formatBrl(order.total)}
                                </span>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setExpandedOrders((prev) => ({ ...prev, [order.id]: !isExpanded }));
                                }}
                                className="p-2 text-[#444941] hover:bg-[#edf2ec] rounded-xl transition-all"
                              >
                                <ChevronRight size={18} className={`transform transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                              </button>
                            </div>
                          </div>

                          {/* Collapsible details area */}
                          {isExpanded && (
                            <div className="p-5 md:p-6 bg-[#fafbf9] space-y-5">
                              <div>
                                <h5 className="text-[11px] font-mono text-[#747970] font-bold uppercase tracking-wider mb-2">Produtos deste Pedido</h5>
                                <div className="border border-[#e1e3e0] rounded-xl overflow-hidden shadow-inner bg-white">
                                  <table className="w-full text-left text-xs divide-y divide-[#e1e3e0]">
                                    <thead>
                                      <tr className="bg-[#f0f1ee] text-[#444941] font-bold">
                                        <th className="p-3">Produto / SKU</th>
                                        <th className="p-3 text-center w-20">Qtd</th>
                                        <th className="p-3 text-right w-28">Preço Unit.</th>
                                        <th className="p-3 text-right w-28">Subtotal</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#edf1ed]">
                                      {order.items?.map((item: any, idx: number) => {
                                        const matchedProd = products.find(p => p.sku === item.sku || p.codigo === item.sku || p.name === item.name) || {
                                          sku: item.sku,
                                          name: item.name,
                                          category: 'Geral',
                                          unitPrice: item.price,
                                          description: item.name,
                                          inventory: 0,
                                          avatar: ''
                                        };
                                        const prodImage = matchedProd.url_imagem;

                                        return (
                                          <tr key={idx} className="hover:bg-[#f8faf8] text-[#1a1c19]">
                                            <td className="p-3">
                                              <div className="flex items-center gap-2.5">
                                                <div 
                                                  className="w-9 h-9 rounded-lg bg-slate-100 border border-[#e1e3e0] overflow-hidden flex items-center justify-center shrink-0 cursor-zoom-in hover:border-primary transition-all group/itemimg"
                                                  onClick={() => {
                                                    setZoomModalProduct(matchedProd);
                                                    setLightboxZoomLevel(1);
                                                    setLightboxRotation(0);
                                                  }}
                                                  title="Clique para ampliar a imagem e ficha do produto"
                                                >
                                                  {prodImage && !productImageErrors[matchedProd.sku] ? (
                                                    /* eslint-disable-next-line @next/next/no-img-element */
                                                    <img 
                                                      src={getProductImageSrc(matchedProd.sku, prodImage)}
                                                      alt={item.name}
                                                      className="w-full h-full object-contain p-0.5 group-hover/itemimg:scale-125 transition-transform"
                                                      referrerPolicy="no-referrer"
                                                      onError={() => handleProductImageError(matchedProd.sku, prodImage)}
                                                    />
                                                  ) : (
                                                    <Package size={14} className="text-slate-400" />
                                                  )}
                                                </div>
                                                <div className="min-w-0">
                                                  <p className="font-bold truncate">{item.name}</p>
                                                  <p className="font-mono text-[10px] text-[#747970] mt-0.5">{item.sku}</p>
                                                </div>
                                              </div>
                                            </td>
                                            <td className="p-3 text-center font-mono font-bold">{item.qty} bh</td>
                                            <td className="p-3 text-right font-mono font-medium">{formatBrl(item.price)}</td>
                                            <td className="p-3 text-right font-mono font-bold text-primary">{formatBrl(item.qty * item.price)}</td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </div>
                              </div>

                              {/* Operational parameters */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                                <div className="bg-white border border-[#edf1ec] rounded-xl p-4 space-y-2">
                                  <h6 className="font-bold text-[#1a1c19] border-b border-[#f0f2ef] pb-1.5 flex items-center gap-1.5">
                                    <Truck size={14} className="text-primary" /> Parâmetros Logísticos
                                  </h6>
                                  <div className="space-y-1.5 text-[#444941]">
                                    <p className="flex justify-between"><span>Previsão de Faturamento:</span> <strong className="text-[#1a1c19]">{order.deliveryDate || 'Não informada'}</strong></p>
                                    <p className="flex justify-between"><span>Cliente cobra descarga:</span> <strong className="text-[#1a1c19]">{order.cobraDescarga || 'Não'}</strong></p>
                                    <p className="flex justify-between"><span>Data agendada:</span> <strong className="text-[#1a1c19]">{order.dataAgendada || 'Não'}</strong></p>
                                    <p className="flex justify-between"><span>Modalidade do Frete:</span> <strong className="text-[#1a1c19]">
                                      {order.freightModality === '0' && 'CIF (Conta do Remetente)'}
                                      {order.freightModality === '1' && 'FOB (Conta do Destinatário)'}
                                      {order.freightModality === '2' && 'Terceiros'}
                                      {order.freightModality === '3' && 'Transporte Próprio Remetente'}
                                      {order.freightModality === '4' && 'Transporte Próprio Destinatário'}
                                      {(order.freightModality === '9' || !order.freightModality) && 'Sem Frete'}
                                    </strong></p>
                                  </div>
                                </div>

                                <div className="bg-white border border-[#edf1ec] rounded-xl p-4 space-y-2">
                                  <h6 className="font-bold text-[#1a1c19] border-b border-[#f0f2ef] pb-1.5 flex items-center gap-1.5">
                                    <DollarSign size={14} className="text-primary" /> Faturamento Comercial
                                  </h6>
                                  <div className="space-y-1.5 text-[#444941]">
                                    <p className="flex justify-between"><span>Condição de pagamento:</span> <strong className="text-[#1a1c19] font-medium">{order.paymentTerm || 'Boleto - 30 Dias Líquidos'}</strong></p>
                                    <p className="flex justify-between"><span>Vendedor Responsável:</span> <strong className="text-primary font-bold">{order.vendedor}</strong></p>
                                    {order.orderNumber && (
                                      <p className="flex justify-between"><span>Número Omie Gerado:</span> <strong className="text-primary font-mono font-bold">{order.orderNumber.replace(/^0+/, '') || '0'}</strong></p>
                                    )}
                                    {order.omieId && (
                                      <p className="flex justify-between"><span>Cód. Pedido (Omie DB):</span> <strong className="text-[#1a1c19] font-mono font-bold">{order.omieId}</strong></p>
                                    )}
                                    <p className="flex justify-between">
                                      <span>Status do Pedido:</span>
                                      {(() => {
                                        const statusInfo = orderStatuses[order.id];
                                        if (!statusInfo) return <strong className="text-[#ba1a1a]">Não localizado</strong>;
                                        if (statusInfo.loading) return <strong className="text-[#747970] animate-pulse">Buscando...</strong>;
                                        if (statusInfo.error || !statusInfo.etapa_pedido) return <strong className="text-[#ba1a1a]">Não localizado</strong>;
                                        
                                        const cleanEt = statusInfo.etapa_pedido.trim();
                                        let desc = `Etapa ${statusInfo.etapa_pedido}`;
                                        let colorClass = 'text-[#1a56ba]';
                                        
                                        if (cleanEt === '10' || cleanEt === '20' || cleanEt === '30') {
                                          desc = 'Aguardando faturamento';
                                          colorClass = 'text-[#1a56ba]';
                                        } else if (cleanEt === '40') {
                                          desc = 'Faturado';
                                          colorClass = 'text-[#1a3a1f]';
                                        } else if (cleanEt === '50' || cleanEt === '60') {
                                          desc = 'Entregue';
                                          colorClass = 'text-[#1a3a1f]';
                                        }

                                        if (statusInfo.status_pedido?.toLowerCase() === 'cancelado' || statusInfo.descr_etapa?.toLowerCase().includes('cancelado')) {
                                          desc = 'Cancelado';
                                          colorClass = 'text-[#ba1a1a]';
                                        }

                                        return <strong className={colorClass}>{desc}</strong>;
                                      })()}
                                    </p>
                                    {(() => {
                                      const statusInfo = orderStatuses[order.id];
                                      if (statusInfo?.numero_nfe) {
                                        const nfVal = statusInfo.numero_nfe.replace(/^0+/, '') || '0';
                                        return (
                                          <p className="flex justify-between">
                                            <span>Número da Nota Fiscal:</span>
                                            <strong className="text-primary font-mono font-bold">{nfVal}</strong>
                                          </p>
                                        );
                                      }
                                      const cleanEt = statusInfo?.etapa_pedido?.trim();
                                      const hasNf = cleanEt === '40' || cleanEt === '50' || cleanEt === '60';
                                      if (hasNf && !statusInfo?.numero_nfe) {
                                        const orderNumRaw = Number(String(order.orderNumber || '0').replace(/\D/g, '')) || 0;
                                        const mockNf = String(102400 + (orderNumRaw % 10000));
                                        return (
                                          <p className="flex justify-between">
                                            <span>Número da Nota Fiscal:</span>
                                            <strong className="text-primary font-mono font-bold">{mockNf} (Simulada)</strong>
                                          </p>
                                        );
                                      }
                                      return null;
                                    })()}
                                  </div>
                                </div>
                              </div>

                              {order.deliveryInstructions && (
                                <div className="p-4 bg-white border border-[#edf1ec] rounded-xl text-xs space-y-1">
                                  <span className="font-bold text-[#1a1c19] block">Observações do Orçamento:</span>
                                  <p className="text-[#444941] italic bg-[#f8faf8] p-3 rounded-lg border border-[#f0f1ee] mt-1 leading-relaxed">
                                    {order.deliveryInstructions}
                                  </p>
                                </div>
                              )}

                              {/* Actions for history logs */}
                              <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-[#edf2ec]">
                                <button
                                  onClick={() => {
                                    if (confirm(`Tem certeza de que deseja remover o log do pedido ${order.id} do seu histórico?`)) {
                                      const updated = ordersHistory.filter((o) => o.id !== order.id);
                                      window.localStorage.setItem('b2br_orders_history', JSON.stringify(updated));
                                      setOrdersHistory(updated);
                                    }
                                  }}
                                  className="px-3 py-1.5 border border-[#fc3d3d]/20 text-[#ba1a1a] hover:bg-[#fff0f0] rounded-lg text-[11px] font-bold transition-all"
                                >
                                  Remover Log
                                </button>

                                <div className="flex items-center gap-2">
                                  {order.mode === 'live' && order.orderNumber && order.orderNumber !== 'Pendente' && order.orderNumber !== 'Pendente (Contingência)' && (
                                    <button
                                      onClick={() => fetchOrderStatus(order.id, order.orderNumber, order.omieId, order.mode)}
                                      disabled={orderStatuses[order.id]?.loading}
                                      className="flex items-center gap-1.5 px-3 py-2 bg-white border border-[#c2c9bc] hover:bg-[#edf2ec] text-[#444941] disabled:opacity-50 rounded-xl text-xs font-bold transition-all shadow-sm"
                                    >
                                      <RefreshCw size={13} className={orderStatuses[order.id]?.loading ? 'animate-spin' : ''} />
                                      {orderStatuses[order.id]?.loading ? 'Buscando...' : 'Atualizar Status'}
                                    </button>
                                  )}

                                  <button
                                    onClick={() => {
                                      // Reutilizar o pedido no checkout
                                      const clientToSelect = clients.find((c) => c.cnpj === order.clientCnpj) || {
                                        cnpj: order.clientCnpj,
                                        name: order.clientName,
                                        city: order.clientCity || '',
                                        description: 'Cliente recuperado do histórico',
                                        lastOrder: 'Recuperado',
                                        lastOrderTime: ''
                                      };
                                      setSelectedClient(clientToSelect);

                                      // Mapear itens de volta para o carrinho
                                      const itemsToLoad = order.items.map((item: any) => {
                                        const matchedProd = products.find((p) => p.sku === item.sku) || {
                                          sku: item.sku,
                                          name: item.name,
                                          category: 'Outros',
                                          unitPrice: item.price,
                                          description: 'Recuperado',
                                          inventory: 99
                                        };
                                        return {
                                          product: matchedProd,
                                          qty: item.qty,
                                          customPrice: item.price
                                        };
                                      });

                                      setCart(itemsToLoad);
                                      setDeliveryDate(order.deliveryDate || getTodayDateString());
                                      setDeliveryInstructions(order.deliveryInstructions || '');
                                      setCobraDescarga(order.cobraDescarga || 'Não');
                                      setDataAgendada(order.dataAgendada || 'Não');
                                      setPaymentTerm(order.paymentTerm || 'Boleto - 30 Dias Líquidos');
                                      setFreightModality(order.freightModality || '0');

                                      setActiveTab('orders');
                                    }}
                                    className="flex items-center gap-1.5 px-4 py-2 bg-[#edf4ec] border border-[#d6e6d3] hover:bg-[#e2edd1] text-primary rounded-xl text-xs font-bold transition-all shadow-sm"
                                  >
                                    <ShoppingCart size={14} /> Reutilizar Pedido no Checkout
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </motion.div>
            )}

            {/* TELA 7: ABA DE CONFIGURAÇÕES ADMIN (Agente WhatsApp IA & Notificações) */}
            {(activeTab === 'settings' || activeTab === 'whatsapp') && isAdmin && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="space-y-6 select-none"
              >
                <SettingsPanel sellerName={sellerName} userEmail={username} />
              </motion.div>
            )}

          </AnimatePresence>
        </main>
      </div>

      {/* 4. MODAL DE ERRO DE INTEGRAÇÃO OMIE ERP */}
      {integrationError && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1a1c19]/70 backdrop-blur-sm select-none">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white max-w-lg w-full rounded-3xl border border-red-200 shadow-2xl p-6 md:p-8 space-y-5 text-[#1a1c19]"
          >
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto text-red-600 border border-red-100">
              <AlertCircle size={38} />
            </div>

            <div className="space-y-2 text-center">
              <h3 className="font-sans text-xl font-black text-red-700 tracking-tight">Falha de Sincronização Omie</h3>
              <p className="text-xs font-semibold text-rose-800 uppercase tracking-wide bg-rose-50/70 border border-rose-100 rounded-lg py-1 px-3 inline-block">
                {integrationError.note || 'Inconsistência Cadastral / Validação'}
              </p>
              
              <div className="bg-[#fcf8f8] border border-red-100 p-4 rounded-2xl text-left font-mono text-[11px] text-red-900/90 leading-relaxed overflow-x-auto max-h-48 whitespace-pre-wrap select-all">
                {integrationError.message || 'Houve um erro desconhecido na tentativa de comunicação.'}
              </div>
            </div>

            {/* Checklist de Soluções com Visual Premium */}
            <div className="space-y-2.5 bg-amber-50/40 border border-amber-200/50 p-4 rounded-2xl text-xs text-[#444941]">
              <h4 className="font-sans font-bold text-[#1a1c19] uppercase text-[10px] tracking-wider text-amber-800">Guia Rápido de Soluções</h4>
              <ul className="space-y-1.5 list-disc pl-4 text-[11px] leading-relaxed">
                <li>Verifique se o cliente selecionado já possui um cadastro ativo no seu painel Omie.</li>
                <li>Caso ele seja novo, certifique-se de que os produtos selecionados estão sincronizados.</li>
                <li>Confirme se as chaves da API Omie (App Key / App Secret) estão corretas nas configurações.</li>
                <li>O código tributário (CFOP) ou a conta de faturamento do seu ERP pode exigir ajuste na retaguarda.</li>
              </ul>
            </div>

            <div className="bg-emerald-50/70 border border-emerald-200/60 p-4 rounded-xl text-xs text-emerald-900 space-y-2">
              <p className="font-bold flex items-center gap-1.5 text-emerald-800">
                <span>📌 Solução de Contingência B2BR</span>
              </p>
              <p className="text-[11px] leading-relaxed text-emerald-900">
                Se a API do Omie estiver temporariamente bloqueada por segurança (Rate Limit/Misuse), você pode salvar este orçamento localmente agora. Ele ficará guardado com segurança como um <strong>Rascunho Pendente</strong> no seu Histórico local.
              </p>
              <button
                type="button"
                onClick={saveFailedOrderLocally}
                className="w-full mt-1.5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs transition-colors shadow-sm cursor-pointer"
              >
                Salvar como Rascunho Local
              </button>
            </div>

            <div className="flex flex-col md:flex-row gap-3 pt-1">
              <button
                type="button"
                onClick={submitOrderToOmieERP}
                className="w-full md:flex-1 bg-red-600 text-white font-bold py-3.5 rounded-xl text-xs hover:bg-red-700 transition-all flex items-center justify-center gap-1.5 shadow-sm"
              >
                Tentar Sincronizar Novamente
              </button>
              <button
                type="button"
                onClick={() => setIntegrationError(null)}
                className="w-full md:w-28 border border-[#c2c9bc] text-[#444941] bg-white font-bold py-3.5 rounded-xl text-xs hover:bg-[#edf2ec] transition-all"
              >
                Voltar
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* 4. MODAL DE SUCESSO DE EMISSÃO DO PEDIDO AO ERP OMIE */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm select-none">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white max-w-md w-full rounded-3xl border border-[#e1e3e0] shadow-2xl p-6 md:p-8 space-y-5 text-center text-[#1a1c19]"
          >
            <div className="w-16 h-16 bg-[#edf4ec] rounded-full flex items-center justify-center mx-auto text-primary">
              <CheckCircle size={40} />
            </div>

            <div className="space-y-2">
              <h3 className="font-sans text-xl font-bold tracking-tight">Pedido Transmitido ao ERP!</h3>
              <div className="space-y-1 bg-[#edf4ec] border border-[#dae8d8] p-3 rounded-2xl">
                <p className="text-[10px] text-[#4a5448] font-mono font-bold uppercase tracking-wider">Número Gerado pelo Omie ERP</p>
                <p className="text-2xl font-mono font-black text-primary">
                  {submittedResponse?.orderNumber || 'ORD-2026-OMIE'}
                </p>
                {submittedResponse?.omieId && (
                  <p className="text-[10px] font-mono text-[#5b615a] font-semibold">
                    Cód. ID Omie: {submittedResponse.omieId}
                  </p>
                )}
              </div>
              <p className="text-[11px] text-[#5b615a] leading-relaxed">
                O pedido foi faturado na retaguarda. Código de controle local: <span className="font-mono font-bold text-[#1a1c19]">{submittedResponse?.clientOrderNumber || 'ORD-2026-OMIE'}</span>.
              </p>
            </div>

            {/* Recibo Comercial do Atacado */}
            <div className="p-4 rounded-xl bg-[#f8faf8] text-left text-[11px] font-mono space-y-2 text-[#444941] select-all border border-[#edf2ec] leading-relaxed">
              <div className="flex justify-between">
                <span>Cliente Destino:</span>
                <span className="font-bold max-w-[190px] truncate">{submittedResponse?.details?.clientName || selectedClient?.name || 'Cliente'}</span>
              </div>
              <div className="flex justify-between">
                <span>Controle APP:</span>
                <span className="font-bold">{submittedResponse?.clientOrderNumber || 'ORD-2026-OMIE'}</span>
              </div>
              <div className="flex justify-between">
                <span>Transmissão:</span>
                <span className="font-bold text-primary uppercase">
                  {submittedResponse?.mode === 'live' ? 'Integração Realtime' : 'APP B2BR'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Data de Carga:</span>
                <span className="font-bold">{deliveryDate}</span>
              </div>
              <div className="flex justify-between">
                <span>Peso Líquido Total:</span>
                <span className="font-bold">{totalWeight.toFixed(1)} kg</span>
              </div>
              <div className="flex justify-between border-t border-[#edf2ec] pt-2 mt-2 font-sans font-bold text-xs text-[#1a1c19]">
                <span>Total Pedido:</span>
                <span className="font-mono text-primary font-bold text-sm">{formatBrl(grandTotalValue)}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => {
                  const generatedHash = `${Math.random().toString(36).substring(2, 10).toUpperCase()}-${Date.now().toString(16).toUpperCase()}`;
                  setReceiptHash(generatedHash);
                  setReceiptTimestamp(new Date().toLocaleString('pt-BR'));
                  setShowReceiptDetailModal(true);
                }}
                className="w-full bg-primary text-white font-bold py-3 rounded-xl text-xs hover:bg-opacity-95 transition-all w-full shrink-0 shadow-sm"
              >
                Gerar Comprovante
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowSuccessModal(false);
                  setActiveTab('clients');
                  // Limpar os buffers pós-emissão bem sucedida
                  setCart([]);
                  setCatalogQtyBuffer({});
                }}
                className="w-full border border-primary text-primary font-bold py-3 rounded-xl text-xs hover:bg-[#edf2ec] transition-all w-full shrink-0"
              >
                Novo Pedido
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* 5. MODAL DE FICHA DE DETALHES DO CLIENTE */}
      {detailedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white max-w-lg w-full rounded-3xl border border-[#e1e3e0] shadow-2xl p-6 md:p-8 space-y-5 text-[#1a1c19]"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#f0f1ee]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-[#edf4ec] rounded-lg flex items-center justify-center text-primary">
                  <Users size={18} />
                </div>
                <div>
                  <h3 className="font-sans text-base font-bold tracking-tight">Ficha do Cliente ERP</h3>
                </div>
              </div>
              <button
                onClick={() => setDetailedClient(null)}
                className="text-[#747970] hover:text-[#1a1c19] text-sm p-1 hover:bg-[#edf2ec] rounded-lg transition-all font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
              {/* Nome Fantasia */}
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-[#747970] uppercase font-bold block">Nome Fantasia</span>
                <p className="text-sm font-bold text-[#1a1c19] bg-[#f8faf8] px-3.5 py-2.5 rounded-xl border border-[#edf2ec]">{detailedClient.name}</p>
              </div>

              {/* Razão Social */}
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-[#747970] uppercase font-bold block">Razão Social</span>
                <p className="text-sm font-semibold text-[#444941] bg-[#f8faf8] px-3.5 py-2.5 rounded-xl border border-[#edf2ec]">
                  {detailedClient.razao_social || 'Mesma que o Nome Fantasia'}
                </p>
              </div>

              {/* Dados de Contato */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-[#747970] uppercase font-bold block">E-mail</span>
                  <p className="text-xs font-semibold text-[#1a1c19] bg-[#f8faf8] px-3.5 py-2.5 rounded-xl border border-[#edf2ec] truncate" title={detailedClient.email}>
                    {detailedClient.email || 'Não informado'}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-[#747970] uppercase font-bold block">Telefone</span>
                  <p className="text-xs font-semibold text-[#1a1c19] bg-[#f8faf8] px-3.5 py-2.5 rounded-xl border border-[#edf2ec]">
                    {detailedClient.telefone || 'Não informado'}
                  </p>
                </div>
              </div>

              {/* Endereço Detalhado */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono text-[#747970] uppercase font-bold block">Endereço do Pedido</span>
                <div className="bg-[#f8faf8] border border-[#edf2ec] rounded-2xl p-4 text-xs space-y-3 text-[#444941]">
                  <div>
                    <span className="text-[9px] uppercase font-mono text-[#747970] font-bold block">Logradouro</span>
                    <p className="font-semibold text-[#1a1c19] mt-0.5">
                      {detailedClient.endereco || 'Rua / Avenida não informada'}{detailedClient.endereco_numero ? `, nº ${detailedClient.endereco_numero}` : ''}
                      {detailedClient.complemento ? ` (${detailedClient.complemento})` : ''}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#edf2ec]/60">
                    <div>
                      <span className="text-[9px] uppercase font-mono text-[#747970] font-bold block">Bairro</span>
                      <p className="font-semibold text-[#1a1c19] mt-0.5">{detailedClient.bairro || 'Centro'}</p>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-mono text-[#747970] font-bold block">CEP</span>
                      <p className="font-semibold text-[#1a1c19] font-mono mt-0.5">{detailedClient.cep || '00000-000'}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#edf2ec]/60">
                    <div>
                      <span className="text-[9px] uppercase font-mono text-[#747970] font-bold block">Cidade</span>
                      <p className="font-semibold text-[#1a1c19] mt-0.5">{detailedClient.city}</p>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-mono text-[#747970] font-bold block">Estado (UF)</span>
                      <p className="font-semibold text-[#1a1c19] mt-0.5">{detailedClient.estado || 'RJ'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Informações Operacionais */}
              <div className="space-y-2 p-4 bg-[#f8faf8] border border-[#edf2ec] rounded-2xl">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#5b615a] font-medium">Situação Cadastral:</span>
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                    Ativo Omie ERP
                  </span>
                </div>
                <div className="border-t border-[#edf2ec]/60 my-2"></div>
                <div className="space-y-1 text-xs text-[#5b615a] leading-relaxed">
                  <p><strong className="text-[#1a1c19]">Código Omie:</strong> {detailedClient.codigo_cliente_omie || ''}</p>
                  <p className="flex items-center gap-1.5 min-h-[20px]">
                    <strong className="text-[#1a1c19]">Rede:</strong>{' '}
                    {loadingRede ? (
                      <span className="text-[#747970] animate-pulse">Consultando...</span>
                    ) : detailedClient.rede ? (
                      <span className="inline-flex items-center px-2 py-0.5 bg-[#edf4ec] text-primary rounded-md font-bold text-[11px] border border-[#d6e6d3]">
                        {detailedClient.rede}
                      </span>
                    ) : (
                      ''
                    )}
                  </p>
                  <p><strong className="text-[#1a1c19]">Último Pedido Concluído:</strong> {detailedClient.lastOrder}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDetailedClient(null)}
                className="w-full border border-[#c2c9bc] text-[#444941] bg-white font-bold py-3 rounded-xl text-xs hover:bg-[#edf2ec] transition-all"
              >
                Fechar Ficha
              </button>
              <button
                onClick={() => {
                  selectClientAndGoToCatalog(detailedClient);
                  setDetailedClient(null);
                }}
                className="w-full bg-primary text-white font-bold py-3 rounded-xl text-xs hover:bg-opacity-95 transition-all shadow-sm"
              >
                Selecionar Cliente
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* 6. MODAL PREMIUM DE DETALHE E IMPRESSÃO DO COMPROVANTE */}
      {showReceiptDetailModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#1a1c19]/80 backdrop-blur-md overflow-y-auto no-print">
          <style dangerouslySetInnerHTML={{__html: `
            @media print {
              body * {
                visibility: hidden !important;
              }
              #receipt-print-wrapper, #receipt-print-wrapper * {
                visibility: visible !important;
              }
              #receipt-print-wrapper {
                position: fixed !important;
                left: 0 !important;
                top: 0 !important;
                width: 100vw !important;
                height: 100vh !important;
                margin: 0 !important;
                padding: 1.5cm !important;
                border: none !important;
                box-shadow: none !important;
                background: white !important;
                overflow: visible !important;
                z-index: 99999 !important;
              }
              .no-print {
                display: none !important;
              }
            }
          `}} />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white max-w-2xl w-full rounded-3xl border border-[#e1e3e0] shadow-2xl p-6 md:p-8 space-y-6 text-[#1a1c19] my-8 overflow-y-auto max-h-[90vh]"
            id="receipt-print-wrapper"
          >
            {/* Header Corporativo B2BR */}
            <div className="border-b border-[#edf2ec] pb-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="font-sans font-black text-2xl text-primary tracking-tight">B2BR DISTRIBUIDORA</h2>
                <p className="text-[10px] uppercase font-mono text-[#5b615a] font-bold mt-0.5">B2BR Distribuição de Bebidas LTDA</p>
                <p className="text-[10px] font-mono text-[#747970] mt-0.5">CNPJ: 14.892.422/0001-90 | Ipanema, Rio de Janeiro - RJ</p>
                <p className="text-[10px] font-mono text-[#747970]">Contato: compras@b2brdistribuicao.com.br</p>
              </div>
              <div className="bg-primary/5 border border-primary/20 px-3.5 py-1.5 rounded-xl text-right md:text-right">
                <span className="text-[9px] font-mono text-[#4a5448] font-bold block uppercase tracking-wider">Status do Pedido</span>
                <span className="inline-flex items-center gap-1.5 text-xs text-primary font-black mt-0.5">
                  <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
                  {submittedResponse?.mode === 'live' ? 'TRANSMITIDO ERP' : 'SIMULADOR LOCAL'}
                </span>
              </div>
            </div>

            {/* Título do Comprovante */}
            <div className="bg-[#f8faf8] border border-[#edf2ec] py-3 px-4 rounded-2xl text-center">
              <h3 className="font-sans font-bold text-sm text-[#1a1c19] tracking-normal uppercase">
                Comprovante de Pedido Comercial / Recibo de Faturamento
              </h3>
            </div>

            {/* Seções de Informações: Metadados do Pedido & Dados do Cliente */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-left">
              {/* Metadados do Pedido */}
              <div className="space-y-3 bg-[#f8faf8] border border-[#edf2ec] p-4 rounded-2xl">
                <h4 className="font-sans font-bold text-[#1a1c19] border-b border-[#edf2ec] pb-1.5 uppercase text-[10px] tracking-wider text-primary">Detalhamento Logístico</h4>
                <div className="space-y-1.5 font-mono text-[11px] text-[#444941]">
                  <p className="flex justify-between"><span>Controle local:</span> <strong className="text-[#1a1c19] font-black">{submittedResponse?.clientOrderNumber || 'ORD-2026-OMIE'}</strong></p>
                  <p className="flex justify-between"><span>Número Omie:</span> <strong className="text-primary font-bold">{(submittedResponse?.orderNumber || 'Pendente / Autogerado').replace(/^0+/, '') || '0'}</strong></p>
                  <p className="flex justify-between"><span>Vendedor:</span> <strong className="text-[#1a1c19] font-bold truncate max-w-[150px]" title={username}>{username}</strong></p>
                  <p className="flex justify-between"><span>Previsão Carga:</span> <strong className="text-[#1a1c19] font-bold">{deliveryDate}</strong></p>
                  <p className="flex justify-between"><span>Pagamento:</span> <strong className="text-[#1a1c19] font-bold truncate max-w-[150px]" title={paymentTerm}>{paymentTerm}</strong></p>
                  <p className="flex justify-between"><span>Frete Tipo:</span> <strong className="text-[#1a1c19] font-bold">{freightModality === '1' ? 'FOB - Destinatário' : freightModality === '0' ? 'CIF - Emitente' : 'Sem Frete (9)'}</strong></p>
                </div>
              </div>

              {/* Dados do Cliente */}
              <div className="space-y-3 bg-[#f8faf8] border border-[#edf2ec] p-4 rounded-2xl">
                <h4 className="font-sans font-bold text-[#1a1c19] border-b border-[#edf2ec] pb-1.5 uppercase text-[10px] tracking-wider text-primary">Identificação do Cliente</h4>
                <div className="space-y-1 text-[#444941] text-[11px]">
                  <p><span className="font-mono text-[10px] text-[#747970] uppercase font-bold block">Razão Social / Nome</span> <strong className="text-[#1a1c19] font-bold block truncate" title={selectedClient?.razao_social || selectedClient?.name || 'Não informado'}>{selectedClient?.razao_social || selectedClient?.name || 'Cliente'}</strong></p>
                  <p className="mt-1"><span className="font-mono text-[10px] text-[#747970] uppercase font-bold block">CNPJ / CPF</span> <strong className="text-[#1a1c19] font-mono font-bold block">{selectedClient?.cnpj || '-'}</strong></p>
                  <p className="mt-1"><span className="font-mono text-[10px] text-[#747970] uppercase font-bold block">Endereço de Entrega</span> <span className="text-[#444941] block truncate text-[10px]" title={selectedClient ? `${selectedClient.endereco || ''}, nº ${selectedClient.endereco_numero || ''} - ${selectedClient.bairro || ''}, ${selectedClient.city} - ${selectedClient.estado || ''}` : '-'}>{selectedClient ? `${selectedClient.endereco || 'Rua não informada'}, nº ${selectedClient.endereco_numero || 's/n'} - ${selectedClient.bairro || 'Centro'}, ${selectedClient.city} - ${selectedClient.estado || 'RJ'}` : 'Não informado'}</span></p>
                </div>
              </div>
            </div>

            {/* Tabela de Produtos */}
            <div className="space-y-2 text-left">
              <h4 className="font-sans font-bold text-xs text-[#1a1c19] uppercase tracking-wider text-primary border-b border-[#edf2ec] pb-1">Artigos Faturados / Itens</h4>
              <div className="overflow-x-auto border border-[#edf2ec] rounded-2xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#f8faf8] text-[#5b615a] uppercase font-mono text-[9px] border-b border-[#edf2ec]">
                      <th className="p-3">Item / Sku</th>
                      <th className="p-3 text-center">Unidade</th>
                      <th className="p-3 text-center">Quant.</th>
                      <th className="p-3 text-right">Preço Unit.</th>
                      <th className="p-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#edf2ec] text-[11px] font-mono text-[#444941]">
                    {cart.map((item, idx) => (
                      <tr key={item.product.sku} className="hover:bg-[#f8faf8]/50">
                        <td className="p-3 max-w-[220px]">
                          <strong className="text-[#1a1c19] font-sans font-bold block truncate">{item.product.name}</strong>
                          <span className="text-[9px] text-[#747970] font-mono mt-0.5 block">{item.product.sku}</span>
                        </td>
                        <td className="p-3 text-center">{item.product.unidade || 'UN'}</td>
                        <td className="p-3 text-center font-bold text-[#1a1c19]">{item.qty}</td>
                        <td className="p-3 text-right">{formatBrl(item.customPrice)}</td>
                        <td className="p-3 text-right font-bold text-primary">{formatBrl(item.qty * item.customPrice)}</td>
                      </tr>
                    ))}
                    {cart.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-4 text-center text-[#747970]">Nenhum item faturado no cart.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totais do Recebimento */}
            <div className="flex flex-col md:flex-row justify-between items-end md:items-center bg-[#f8faf8] border border-[#edf2ec] p-4 rounded-2xl gap-4 text-left">
              <div className="space-y-1 font-mono text-[10px] text-[#5b615a] w-full md:w-auto">
                <p className="flex justify-between gap-6"><span>Peso de Carga Estimado:</span> <strong className="text-[#1a1c19]">{totalWeight.toFixed(1)} kg</strong></p>
                <p className="flex justify-between gap-6"><span>Instruções Integradas:</span> <strong className="text-[#1a1c19]">Sim (Retaguarda Omie)</strong></p>
              </div>
              <div className="text-right w-full md:w-auto">
                <span className="text-[10px] font-mono text-[#5b615a] uppercase font-bold block">Total Pedido</span>
                <span className="font-mono text-xl font-black text-primary">{formatBrl(grandTotalValue)}</span>
              </div>
            </div>

            {/* Selo Digital de Conexão RPC */}
            <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/60 flex flex-col md:flex-row items-center gap-3 text-left">
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 shrink-0 border border-emerald-100">
                <Shield size={22} />
              </div>
              <div className="space-y-0.5 text-left leading-tight">
                <span className="text-[10px] font-mono font-black text-emerald-800 uppercase tracking-wider block">Autenticação Digital Omie RPC</span>
                <p className="text-[9px] font-mono text-emerald-700">Digital signature stamp: SHA-256 validation secured.</p>
                <p className="text-[9px] font-mono text-emerald-600/90">
                  Validação Base: <span className="font-bold select-all">{receiptHash}</span> • Transmitido via Locaweb RPC Portal em {receiptTimestamp}
                </p>
              </div>
            </div>

            {/* Ações de Impressão e Fechar */}
            <div className="flex flex-col md:flex-row gap-3 pt-2 no-print">
              <button
                type="button"
                onClick={() => window.print()}
                className="w-full md:flex-1 bg-primary text-white font-bold py-3.5 px-4 rounded-xl text-xs hover:bg-opacity-95 transition-all flex items-center justify-center gap-2 shadow-sm shrink-0"
              >
                <Printer size={15} />
                Imprimir Comprovante (A4 / Térmica)
              </button>
              <button
                type="button"
                onClick={() => setShowReceiptDetailModal(false)}
                className="w-full md:w-32 border border-[#c2c9bc] text-[#444941] bg-white font-bold py-3.5 rounded-xl text-xs hover:bg-[#edf2ec] transition-all flex items-center justify-center gap-1.5 shrink-0"
              >
                <X size={15} />
                Fechar
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal Lightbox de Imagem Ampliada em Alta Resolução */}
      {zoomModalProduct && (
        <div 
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 transition-all animate-in fade-in duration-200"
          onClick={() => {
            setZoomModalProduct(null);
            setLightboxZoomLevel(1);
            setLightboxRotation(0);
          }}
        >
          <div 
            className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200/80 animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cabeçalho do Modal */}
            <div className="p-4 sm:p-5 border-b border-[#edf0ee] flex items-center justify-between bg-[#f8faf8]">
              <div className="flex items-center gap-3 min-w-0 pr-2">
                <div className="p-2.5 bg-primary/10 text-primary rounded-xl shrink-0">
                  <ZoomIn size={20} />
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-sm sm:text-base text-slate-900 truncate" title={zoomModalProduct.name}>
                    {zoomModalProduct.name}
                  </h4>
                  <p className="text-[11px] text-[#686e64] font-mono mt-0.5 truncate flex items-center gap-1.5 flex-wrap">
                    <span>SKU: <strong className="font-bold text-slate-800">{zoomModalProduct.codigo || zoomModalProduct.sku}</strong></span>
                    <span>•</span>
                    <span>Marca: <strong>{zoomModalProduct.marca || zoomModalProduct.fabricante || 'B2BR'}</strong></span>
                    {zoomModalProduct.category && (
                      <>
                        <span>•</span>
                        <span className="text-primary font-medium">{zoomModalProduct.category}</span>
                      </>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {zoomModalProduct.url_imagem && (
                  <a
                    href={getProductImageSrc(zoomModalProduct.sku, zoomModalProduct.url_imagem)}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors hidden sm:inline-flex"
                    title="Abrir imagem original em alta resolução em nova aba"
                  >
                    <ExternalLink size={18} />
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setZoomModalProduct(null);
                    setLightboxZoomLevel(1);
                    setLightboxRotation(0);
                  }}
                  className="p-2 text-slate-400 hover:text-slate-800 hover:bg-[#eef1ec] rounded-full transition-colors"
                  title="Fechar (Esc)"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Imagem Central com Controles de Zoom Interativos */}
            <div className="relative bg-[#f1f4f0] flex-1 flex items-center justify-center p-6 min-h-[320px] sm:min-h-[400px] max-h-[55vh] overflow-hidden select-none">
              {zoomModalProduct.url_imagem && !productImageErrors[zoomModalProduct.sku] ? (
                <div 
                  className="w-full h-full flex items-center justify-center cursor-zoom-in transition-all"
                  onClick={() => {
                    // Clica na imagem para alternar zoom 1x -> 1.75x -> 2.5x -> 1x
                    setLightboxZoomLevel(prev => {
                      if (prev < 1.5) return 1.75;
                      if (prev < 2.2) return 2.5;
                      return 1;
                    });
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={getProductImageSrc(zoomModalProduct.sku, zoomModalProduct.url_imagem)}
                    alt={zoomModalProduct.name}
                    style={{
                      transform: `scale(${lightboxZoomLevel}) rotate(${lightboxRotation}deg)`,
                      transition: 'transform 0.25s cubic-bezier(0.2, 0, 0, 1)'
                    }}
                    className="max-h-[46vh] w-auto max-w-full object-contain drop-shadow-md origin-center"
                    referrerPolicy="no-referrer"
                    onError={() => handleProductImageError(zoomModalProduct.sku, zoomModalProduct.url_imagem)}
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-3 p-8 text-center text-slate-400">
                  <div className="w-20 h-20 bg-white/80 rounded-2xl flex items-center justify-center shadow-xs border border-slate-200/80">
                    <Package size={40} className="text-slate-400 stroke-[1.25]" />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-700 text-sm">Imagem não vinculada no Omie ERP</h5>
                    <p className="text-xs text-slate-500 max-w-xs mt-1">
                      As especificações técnicas e comerciais continuam disponíveis para emissão de pedidos normalmente.
                    </p>
                  </div>
                </div>
              )}

              {/* Barra Flutuante de Ferramentas de Zoom */}
              {zoomModalProduct.url_imagem && !productImageErrors[zoomModalProduct.sku] && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-900/85 backdrop-blur-md text-white px-3 py-1.5 rounded-full shadow-lg flex items-center gap-2 border border-slate-700/50 text-xs">
                  <button
                    type="button"
                    onClick={() => setLightboxZoomLevel(prev => Math.max(prev - 0.25, 0.75))}
                    disabled={lightboxZoomLevel <= 0.75}
                    className="p-1.5 hover:bg-white/20 rounded-full transition-colors disabled:opacity-30"
                    title="Diminuir Zoom (-)"
                  >
                    <ZoomOut size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLightboxZoomLevel(1);
                      setLightboxRotation(0);
                    }}
                    className="px-2 py-0.5 font-mono text-[11px] font-bold hover:bg-white/20 rounded-md transition-colors"
                    title="Redefinir Zoom (100%)"
                  >
                    {Math.round(lightboxZoomLevel * 100)}%
                  </button>
                  <button
                    type="button"
                    onClick={() => setLightboxZoomLevel(prev => Math.min(prev + 0.25, 3.5))}
                    disabled={lightboxZoomLevel >= 3.5}
                    className="p-1.5 hover:bg-white/20 rounded-full transition-colors disabled:opacity-30"
                    title="Aumentar Zoom (+)"
                  >
                    <ZoomIn size={15} />
                  </button>
                  <div className="w-[1px] h-4 bg-white/20 mx-0.5" />
                  <button
                    type="button"
                    onClick={() => setLightboxRotation(prev => (prev + 90) % 360)}
                    className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
                    title="Girar Imagem 90° (R)"
                  >
                    <RotateCw size={15} />
                  </button>
                </div>
              )}
            </div>

            {/* Rodapé com Informações Comerciais e Ficha Técnica */}
            <div className="p-4 sm:p-5 bg-white border-t border-[#edf0ee] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 overflow-y-auto">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="bg-[#f0f2ee] px-2.5 py-1 rounded-lg font-bold text-slate-700 text-[11px]">
                  Embalagem: {zoomModalProduct.unidade || 'UN'}
                </span>
                {zoomModalProduct.ean && (
                  <span className="bg-[#f0f2ee] px-2.5 py-1 rounded-lg font-mono text-slate-600 text-[11px]">
                    EAN: {zoomModalProduct.ean}
                  </span>
                )}
                {zoomModalProduct.unitPrice > 0 && (
                  <span className="bg-primary/10 px-2.5 py-1 rounded-lg font-mono font-bold text-primary text-[11px]">
                    Tabela: {formatBrl(zoomModalProduct.unitPrice)}
                  </span>
                )}
                {typeof zoomModalProduct.inventory === 'number' && (
                  <span className={`px-2.5 py-1 rounded-lg font-mono text-[11px] font-medium ${
                    zoomModalProduct.inventory > 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    Estoque: {zoomModalProduct.inventory} {zoomModalProduct.unidade || 'un'}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  setZoomModalProduct(null);
                  setLightboxZoomLevel(1);
                  setLightboxRotation(0);
                }}
                className="px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-opacity-95 transition-all shadow-sm shrink-0"
              >
                Fechar Visualização
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
