/**
 * useOfflineSync — Phase 6 PWA Hook
 * ────────────────────────────────────
 * Queues actions when offline, syncs when online.
 * Usage:
 *   const { queueAction, syncStatus } = useOfflineSync();
 *   queueAction("symptom_log", { symptoms: "fever", language: "hindi" });
 */

import { useState, useEffect, useCallback } from "react";
import { syncAPI } from "../services/phase5_6";

const QUEUE_KEY = "rc_offline_queue";

function getQueue() {
  try { return JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]"); }
  catch { return []; }
}

function saveQueue(q) {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(q));
}

export default function useOfflineSync() {
  const [isOnline,   setIsOnline]   = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState({ pending: 0, syncing: false, lastSync: null });

  // Monitor online/offline
  useEffect(() => {
    const goOnline  = () => { setIsOnline(true);  triggerSync(); };
    const goOffline = () => setIsOnline(false);
    window.addEventListener("online",  goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online",  goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  // Update pending count
  useEffect(() => {
    const q = getQueue();
    setSyncStatus(s => ({ ...s, pending: q.length }));
  }, []);

  // Queue an action for later sync
  const queueAction = useCallback((type, payload) => {
    const action = { type, payload, timestamp: Date.now(), id: crypto.randomUUID() };
    const queue  = getQueue();
    queue.push(action);
    saveQueue(queue);
    setSyncStatus(s => ({ ...s, pending: queue.length }));

    // Try to sync immediately if online
    if (navigator.onLine) triggerSync();

    return action.id;
  }, []);

  // Sync queued actions to backend
  const triggerSync = useCallback(async () => {
    const queue = getQueue();
    if (queue.length === 0) return;

    setSyncStatus(s => ({ ...s, syncing: true }));
    try {
      // First queue to server
      await syncAPI.queueActions(queue);
      // Then process
      const result = await syncAPI.processQueue();

      // Clear successfully synced items
      const failedIds = result.data.data.results
        .filter(r => r.status === "failed")
        .map(r => r.id);

      const remaining = getQueue().filter(a => failedIds.includes(a.id));
      saveQueue(remaining);

      setSyncStatus({
        pending:  remaining.length,
        syncing:  false,
        lastSync: new Date().toISOString(),
      });

      console.log(`✅ Synced ${queue.length - remaining.length} offline actions`);
    } catch (err) {
      console.warn("Sync failed (will retry when online):", err.message);
      setSyncStatus(s => ({ ...s, syncing: false }));
    }
  }, []);

  return { isOnline, syncStatus, queueAction, triggerSync };
}
