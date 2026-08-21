import { db } from '@/lib/firebase-admin';
import { doc, setDoc, collection, getDocs, query, orderBy, limit, deleteDoc } from 'firebase/firestore';

export interface WhatsAppApiLogEntry {
  id: string;
  timestamp: string;
  provider: 'evolution' | 'meta';
  action: 'SEND_MESSAGE' | 'CHECK_STATUS' | 'FETCH_QR' | 'RESTART_INSTANCE' | 'LOGOUT_INSTANCE' | 'CREATE_INSTANCE' | 'ORDER_NOTIFICATION' | 'OTHER';
  label: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  url: string;
  headers?: Record<string, string>;
  requestPayload?: any;
  status: number | string;
  statusText?: string;
  isSuccess: boolean;
  responsePayload?: any;
  durationMs: number;
  error?: string;
  diagnosticHelp?: string;
}

export async function logWhatsAppCommunication(entry: Omit<WhatsAppApiLogEntry, 'id' | 'timestamp'> & { id?: string; timestamp?: string }): Promise<WhatsAppApiLogEntry> {
  const id = entry.id || `wlog_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const timestamp = entry.timestamp || new Date().toISOString();
  
  // Mask sensitive header values
  const safeHeaders: Record<string, string> = {};
  if (entry.headers) {
    Object.entries(entry.headers).forEach(([k, v]) => {
      const lower = k.toLowerCase();
      if (lower === 'apikey' || lower === 'authorization' || lower.includes('key') || lower.includes('token') || lower.includes('secret')) {
        const str = String(v || '');
        if (str.length > 8) {
          safeHeaders[k] = `${str.slice(0, 4)}••••${str.slice(-4)}`;
        } else {
          safeHeaders[k] = '••••••••';
        }
      } else {
        safeHeaders[k] = String(v);
      }
    });
  }

  const completeLog: WhatsAppApiLogEntry = {
    ...entry,
    id,
    timestamp,
    headers: safeHeaders,
  };

  try {
    const docRef = doc(db, 'whatsapp_api_logs', id);
    await setDoc(docRef, completeLog);
  } catch (err) {
    console.warn('[WhatsApp Logger] Failed to save log to Firestore:', err);
  }

  return completeLog;
}

export async function getRecentWhatsAppLogs(maxCount = 50): Promise<WhatsAppApiLogEntry[]> {
  try {
    const q = query(
      collection(db, 'whatsapp_api_logs'),
      orderBy('timestamp', 'desc'),
      limit(maxCount)
    );
    const snap = await getDocs(q);
    const results: WhatsAppApiLogEntry[] = [];
    snap.forEach((docSnap) => {
      results.push(docSnap.data() as WhatsAppApiLogEntry);
    });
    return results;
  } catch (err) {
    console.warn('[WhatsApp Logger] Failed to read logs from Firestore:', err);
    return [];
  }
}

export async function clearAllWhatsAppLogs(): Promise<boolean> {
  try {
    const q = query(collection(db, 'whatsapp_api_logs'), limit(100));
    const snap = await getDocs(q);
    const deletePromises: Promise<void>[] = [];
    snap.forEach((docSnap) => {
      deletePromises.push(deleteDoc(docSnap.ref));
    });
    await Promise.all(deletePromises);
    return true;
  } catch (err) {
    console.warn('[WhatsApp Logger] Failed to clear logs from Firestore:', err);
    return false;
  }
}
