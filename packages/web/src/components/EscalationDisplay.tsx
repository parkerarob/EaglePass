/**
 * EaglePass Escalation Display Component
 * Shows escalation status, duration, and thresholds for passes
 */

import { useEscalationDisplay, useEscalation } from '../hooks/useEscalation';
import { type Pass } from '../lib/database';

// ============================================================================
// ESCALATION DISPLAY COMPONENT
// ============================================================================

interface EscalationDisplayProps {
  pass: Pass | null;
  showThresholds?: boolean;
  showDuration?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function EscalationDisplay({ 
  pass, 
  showThresholds = true, 
  showDuration = true,
  className = '',
  size = 'md'
}: EscalationDisplayProps) {
  const {
    duration,
    thresholds,
    escalationLevel,
    formattedDuration,
    escalationColor,
    escalationIcon,
    isEscalated,
    isWarning,
    isAlert
  } = useEscalationDisplay(pass);

  if (!pass) {
    return null;
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-2',
    lg: 'text-base px-4 py-3'
  };

  const colorClasses = {
    gray: 'bg-gray-100 text-gray-700 border-gray-300',
    yellow: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    red: 'bg-red-100 text-red-800 border-red-300'
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {/* Escalation Status */}
      <div className={`flex items-center gap-2 rounded-lg border ${sizeClasses[size]} ${colorClasses[escalationColor as keyof typeof colorClasses]}`}>
        <span className="text-lg">{escalationIcon}</span>
        <span className="font-medium">
          {isEscalated ? `Escalation: ${escalationLevel?.toUpperCase()}` : 'No Escalation'}
        </span>
      </div>

      {/* Duration Display */}
      {showDuration && (
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Duration:</span>
          <span className={`text-sm font-mono ${isAlert ? 'text-red-600 font-bold' : isWarning ? 'text-yellow-600' : 'text-gray-600'}`}>
            {formattedDuration}
          </span>
        </div>
      )}

      {/* Thresholds Display */}
      {showThresholds && (
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
            <span>Warning: {thresholds.warning}m</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 bg-red-400 rounded-full"></span>
            <span>Alert: {thresholds.alert}m</span>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all duration-300 ${
            isAlert ? 'bg-red-500' : isWarning ? 'bg-yellow-500' : 'bg-green-500'
          }`}
          style={{ 
            width: `${Math.min((duration / thresholds.alert) * 100, 100)}%` 
          }}
        ></div>
      </div>
    </div>
  );
}

// ============================================================================
// ESCALATION BADGE COMPONENT
// ============================================================================

interface EscalationBadgeProps {
  pass: Pass | null;
  className?: string;
}

export function EscalationBadge({ pass, className = '' }: EscalationBadgeProps) {
  const {
    escalationLevel,
    escalationColor,
    escalationIcon,
    isEscalated
  } = useEscalationDisplay(pass);

  if (!pass || !isEscalated) {
    return null;
  }

  const colorClasses = {
    yellow: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    red: 'bg-red-100 text-red-800 border-red-300'
  };

  return (
    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full border text-xs font-medium ${colorClasses[escalationColor as keyof typeof colorClasses]} ${className}`}>
      <span>{escalationIcon}</span>
      <span>{escalationLevel?.toUpperCase()}</span>
    </div>
  );
}

// ============================================================================
// ESCALATION STATS COMPONENT
// ============================================================================

interface EscalationStatsProps {
  className?: string;
}

export function EscalationStats({ className = '' }: EscalationStatsProps) {
  const { escalationStats, refreshStats, lastCheck } = useEscalation();

  return (
    <div className={`bg-white rounded-lg border p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Escalation Status</h3>
        <button
          onClick={refreshStats}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{escalationStats.totalActive}</div>
          <div className="text-sm text-gray-600">Active Passes</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-600">{escalationStats.warnings}</div>
          <div className="text-sm text-gray-600">Warnings</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">{escalationStats.alerts}</div>
          <div className="text-sm text-gray-600">Alerts</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-800">{escalationStats.critical}</div>
          <div className="text-sm text-gray-600">Critical</div>
        </div>
      </div>

      {lastCheck && (
        <div className="mt-4 text-xs text-gray-500 text-center">
          Last updated: {lastCheck.toLocaleTimeString()}
        </div>
      )}
    </div>
  );
} 