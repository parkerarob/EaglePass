/**
 * EaglePass Escalation Hook
 * Provides escalation state management and monitoring for UI components
 */

import { useState, useEffect, useCallback } from 'react';
import { EscalationService, startEscalationMonitoring, formatDuration, getEscalationColor, getEscalationIcon } from '../lib/escalation-service';
import { type Pass, type EscalationLevel } from '../lib/database';

// ============================================================================
// ESCALATION HOOK
// ============================================================================

export function useEscalation() {
  const [escalationStats, setEscalationStats] = useState({
    totalActive: 0,
    warnings: 0,
    alerts: 0,
    critical: 0
  });
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  // Start escalation monitoring
  const startMonitoring = useCallback(() => {
    if (isMonitoring) return;

    setIsMonitoring(true);
    const cleanup = startEscalationMonitoring();
    
    // Return cleanup function
    return () => {
      cleanup();
      setIsMonitoring(false);
    };
  }, [isMonitoring]);

  // Check escalation for a specific pass
  const checkPassEscalation = useCallback(async (pass: Pass) => {
    try {
      const result = await EscalationService.checkAndUpdateEscalation(pass);
      setLastCheck(new Date());
      return result;
    } catch (error) {
      console.error('Error checking pass escalation:', error);
      return { updated: false, newLevel: pass.escalationLevel, duration: 0 };
    }
  }, []);

  // Get escalation statistics
  const refreshStats = useCallback(async () => {
    try {
      const stats = await EscalationService.getEscalationStats();
      setEscalationStats(stats);
      setLastCheck(new Date());
    } catch (error) {
      console.error('Error refreshing escalation stats:', error);
    }
  }, []);

  // Batch check all active passes
  const checkAllPasses = useCallback(async () => {
    try {
      const result = await EscalationService.checkAllActivePasses();
      setLastCheck(new Date());
      return result;
    } catch (error) {
      console.error('Error checking all passes:', error);
      return { checked: 0, escalated: 0, errors: 1 };
    }
  }, []);

  // Clear escalation for a pass
  const clearEscalation = useCallback(async (passId: string) => {
    try {
      await EscalationService.clearEscalation(passId);
      setLastCheck(new Date());
    } catch (error) {
      console.error('Error clearing escalation:', error);
    }
  }, []);

  // Get escalation thresholds for a pass
  const getThresholds = useCallback(async (pass: Pass) => {
    try {
      return await EscalationService.getEscalationThresholds(pass);
    } catch (error) {
      console.error('Error getting escalation thresholds:', error);
      return { warning: 10, alert: 20 };
    }
  }, []);

  // Calculate pass duration
  const calculateDuration = useCallback((pass: Pass) => {
    return EscalationService.calculatePassDuration(pass);
  }, []);

  // Format duration for display
  const formatPassDuration = useCallback((minutes: number) => {
    return formatDuration(minutes);
  }, []);

  // Get escalation color for UI
  const getEscalationColorForUI = useCallback((level: EscalationLevel | null) => {
    return getEscalationColor(level);
  }, []);

  // Get escalation icon for UI
  const getEscalationIconForUI = useCallback((level: EscalationLevel | null) => {
    return getEscalationIcon(level);
  }, []);

  // Auto-refresh stats every 30 seconds
  useEffect(() => {
    refreshStats();
    
    const interval = setInterval(refreshStats, 30000);
    return () => clearInterval(interval);
  }, [refreshStats]);

  return {
    // State
    escalationStats,
    isMonitoring,
    lastCheck,
    
    // Actions
    startMonitoring,
    checkPassEscalation,
    refreshStats,
    checkAllPasses,
    clearEscalation,
    getThresholds,
    
    // Utilities
    calculateDuration,
    formatPassDuration,
    getEscalationColorForUI,
    getEscalationIconForUI
  };
}

// ============================================================================
// ESCALATION DISPLAY COMPONENT HOOK
// ============================================================================

export function useEscalationDisplay(pass: Pass | null) {
  const [duration, setDuration] = useState(0);
  const [thresholds, setThresholds] = useState({ warning: 10, alert: 20 });
  const [escalationLevel, setEscalationLevel] = useState<EscalationLevel | null>(null);

  const { checkPassEscalation, calculateDuration, getThresholds } = useEscalation();

  // Update duration and escalation level when pass changes
  useEffect(() => {
    if (!pass) {
      setDuration(0);
      setEscalationLevel(null);
      return;
    }

    const updatePassInfo = async () => {
      // Calculate current duration
      const currentDuration = calculateDuration(pass);
      setDuration(currentDuration);

      // Get thresholds
      const passThresholds = await getThresholds(pass);
      setThresholds(passThresholds);

      // Check escalation
      const result = await checkPassEscalation(pass);
      setEscalationLevel(result.newLevel);
    };

    updatePassInfo();

    // Update every minute
    const interval = setInterval(updatePassInfo, 60000);
    return () => clearInterval(interval);
  }, [pass, checkPassEscalation, calculateDuration, getThresholds]);

  const { getEscalationColorForUI, getEscalationIconForUI, formatPassDuration } = useEscalation();

  return {
    duration,
    thresholds,
    escalationLevel,
    formattedDuration: formatPassDuration(duration),
    escalationColor: getEscalationColorForUI(escalationLevel),
    escalationIcon: getEscalationIconForUI(escalationLevel),
    isEscalated: escalationLevel !== null,
    isWarning: escalationLevel === 'warning',
    isAlert: escalationLevel === 'alert' || escalationLevel === 'critical'
  };
} 