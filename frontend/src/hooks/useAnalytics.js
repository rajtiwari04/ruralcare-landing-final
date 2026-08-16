/**
 * useAnalytics — Phase 5 Hook
 * ─────────────────────────────
 * Auto-tracks page views and user actions.
 * Usage:
 *   const { track } = useAnalytics();
 *   track("report_uploaded", { reportType: "blood_report" });
 */

import { useCallback, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { analyticsAPI } from "../services/phase5_6";

export default function useAnalytics() {
  const location = useLocation();

  // Auto-track page views
  useEffect(() => {
    analyticsAPI.track("page_view", {
      path:   location.pathname,
      search: location.search,
    }).catch(() => {}); // non-fatal
  }, [location.pathname]);

  // Manual event tracking
  const track = useCallback((eventType, properties = {}) => {
    analyticsAPI.track(eventType, properties).catch(() => {});
  }, []);

  return { track };
}
