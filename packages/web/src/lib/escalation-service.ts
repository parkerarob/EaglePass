/**
 * EaglePass Escalation Service
 * Handles time-based escalations with configurable thresholds and notifications
 */

import { Timestamp } from 'firebase/firestore';
import { PassService, UserService, LocationService, StudentService } from './database-service';
import { 
  type Pass, 
  type EscalationLevel, 
  type Notification,
  COLLECTIONS
} from './database';
import { type EscalationThresholds } from './schemas';
import { addDoc, collection } from 'firebase/firestore';
import { db } from './firebase';

// ============================================================================
// ESCALATION CONFIGURATION
// ============================================================================

/**
 * Default escalation thresholds (in minutes)
 */
export const DEFAULT_ESCALATION_THRESHOLDS: EscalationThresholds = {
  warning: 10,  // 10 minutes
  alert: 20     // 20 minutes
};

/**
 * Escalation level configuration
 */
export const ESCALATION_LEVELS: Record<EscalationLevel, { 
  threshold: keyof EscalationThresholds;
  color: string;
  icon: string;
  description: string;
}> = {
  warning: {
    threshold: 'warning',
    color: 'yellow',
    icon: '⚠️',
    description: 'Pass duration approaching limit'
  },
  alert: {
    threshold: 'alert', 
    color: 'red',
    icon: '🚨',
    description: 'Pass duration exceeded - immediate attention required'
  },
  critical: {
    threshold: 'alert',
    color: 'red',
    icon: '🚨',
    description: 'Critical escalation - administrative intervention needed'
  }
};

// ============================================================================
// ESCALATION SERVICE
// ============================================================================

export const EscalationService = {
  /**
   * Get escalation thresholds for a specific pass
   * Priority: Student > Location > Group > Global defaults
   */
  async getEscalationThresholds(pass: Pass): Promise<EscalationThresholds> {
    try {
      // 1. Check student-specific thresholds
      const student = await StudentService.getStudent(pass.studentId);
      if (student?.escalationThresholds) {
        return student.escalationThresholds;
      }

      // 2. Check location-specific thresholds
      const location = await LocationService.getLocation(pass.destinationLocationId);
      if (location?.escalationThresholds) {
        return location.escalationThresholds;
      }

      // 3. Check group thresholds (if student is in groups)
      if (student?.groupIds && student.groupIds.length > 0) {
        // TODO: Implement group threshold checking when GroupService is available
        // For now, we'll use location thresholds
      }

      // 4. Fall back to global defaults
      return DEFAULT_ESCALATION_THRESHOLDS;
    } catch (error) {
      console.error('Error getting escalation thresholds:', error);
      return DEFAULT_ESCALATION_THRESHOLDS;
    }
  },

  /**
   * Calculate current pass duration in minutes
   */
  calculatePassDuration(pass: Pass): number {
    const now = Timestamp.now();
    const openedAt = pass.openedAt;
    const durationMs = now.toMillis() - openedAt.toMillis();
    return Math.floor(durationMs / (1000 * 60)); // Convert to minutes
  },

  /**
   * Determine escalation level based on pass duration and thresholds
   */
  determineEscalationLevel(durationMinutes: number, thresholds: EscalationThresholds): EscalationLevel | null {
    if (durationMinutes >= thresholds.alert) {
      return 'alert';
    } else if (durationMinutes >= thresholds.warning) {
      return 'warning';
    }
    return null;
  },

  /**
   * Check and update escalation status for a pass
   */
  async checkAndUpdateEscalation(pass: Pass): Promise<{ 
    updated: boolean; 
    newLevel: EscalationLevel | null; 
    duration: number;
  }> {
    try {
      const duration = this.calculatePassDuration(pass);
      const thresholds = await this.getEscalationThresholds(pass);
      const newLevel = this.determineEscalationLevel(duration, thresholds);

      // Check if escalation level has changed
      if (newLevel !== pass.escalationLevel) {
        const updates: Partial<Pass> = {
          escalationLevel: newLevel,
          escalationTriggeredAt: newLevel ? Timestamp.now() : null
        };

        await PassService.updatePass(pass.id, updates);

        // Send notifications if escalation level increased
        if (newLevel && (!pass.escalationLevel || this.isHigherEscalation(newLevel, pass.escalationLevel))) {
          await this.sendEscalationNotifications(pass, newLevel, duration);
        }

        return { updated: true, newLevel, duration };
      }

      return { updated: false, newLevel: pass.escalationLevel, duration };
    } catch (error) {
      console.error('Error checking escalation for pass:', pass.id, error);
      return { updated: false, newLevel: pass.escalationLevel, duration: 0 };
    }
  },

  /**
   * Check if new escalation level is higher than current
   */
  isHigherEscalation(newLevel: EscalationLevel, currentLevel: EscalationLevel): boolean {
    const levels: EscalationLevel[] = ['warning', 'alert', 'critical'];
    const newIndex = levels.indexOf(newLevel);
    const currentIndex = levels.indexOf(currentLevel);
    return newIndex > currentIndex;
  },

  /**
   * Send escalation notifications to relevant parties
   */
  async sendEscalationNotifications(
    pass: Pass, 
    level: EscalationLevel, 
    duration: number
  ): Promise<void> {
    try {
      const notifications: Omit<Notification, 'id'>[] = [];
      const now = Timestamp.now();

      // Get escalation configuration
      const config = ESCALATION_LEVELS[level];
      const title = `${config.icon} Pass Escalation - ${level.toUpperCase()}`;

      // 1. Notify the student
      const student = await StudentService.getStudent(pass.studentId);
      if (student) {
        const studentUser = await UserService.getUser(student.userId);
        if (studentUser) {
          notifications.push({
            userId: student.userId,
            type: 'escalation',
            title,
            message: `Your pass to ${pass.destinationLocationName} has been out for ${duration} minutes. Please return promptly.`,
            passId: pass.id,
            isRead: false,
            createdAt: now,
            readAt: null
          });
        }
      }

      // 2. Notify the issuing staff member
      const issuingStaff = await UserService.getUser(pass.issuedById);
      if (issuingStaff) {
        notifications.push({
          userId: pass.issuedById,
          type: 'escalation',
          title,
          message: `Pass issued to ${pass.studentName} has been out for ${duration} minutes.`,
          passId: pass.id,
          isRead: false,
          createdAt: now,
          readAt: null
        });
      }

      // 3. Notify current location staff (if different from issuing staff)
      if (pass.currentLocationId && pass.currentLocationId !== pass.originLocationId) {
        const location = await LocationService.getLocation(pass.currentLocationId);
        if (location?.staffAssignments) {
          for (const assignment of location.staffAssignments) {
            if (assignment.staffId !== pass.issuedById) {
              const staff = await UserService.getUser(assignment.staffId);
              if (staff) {
                notifications.push({
                  userId: assignment.staffId,
                  type: 'escalation',
                  title,
                  message: `${pass.studentName} has been at ${location.name} for ${duration} minutes.`,
                  passId: pass.id,
                  isRead: false,
                  createdAt: now,
                  readAt: null
                });
              }
            }
          }
        }
      }

      // 4. Notify admins for alert/critical levels
      if (level === 'alert' || level === 'critical') {
        const admins = await UserService.getUsers('admin', 'approved');
        for (const admin of admins) {
          notifications.push({
            userId: admin.uid,
            type: 'escalation',
            title,
            message: `Escalation alert: ${pass.studentName} has been out for ${duration} minutes.`,
            passId: pass.id,
            isRead: false,
            createdAt: now,
            readAt: null
          });
        }
      }

      // Create all notifications
      for (const notification of notifications) {
        await addDoc(collection(db, COLLECTIONS.NOTIFICATIONS), notification);
      }

      console.log(`Sent ${notifications.length} escalation notifications for pass ${pass.id}`);
    } catch (error) {
      console.error('Error sending escalation notifications:', error);
    }
  },

  /**
   * Get all active passes that need escalation checking
   */
  async getActivePassesForEscalationCheck(): Promise<Pass[]> {
    try {
      return await PassService.getAllActivePasses();
    } catch (error) {
      console.error('Error getting active passes for escalation check:', error);
      return [];
    }
  },

  /**
   * Batch check escalations for all active passes
   */
  async checkAllActivePasses(): Promise<{
    checked: number;
    escalated: number;
    errors: number;
  }> {
    try {
      const activePasses = await this.getActivePassesForEscalationCheck();
      let escalated = 0;
      let errors = 0;

      for (const pass of activePasses) {
        try {
          const result = await this.checkAndUpdateEscalation(pass);
          if (result.updated) {
            escalated++;
          }
        } catch (error) {
          console.error(`Error checking escalation for pass ${pass.id}:`, error);
          errors++;
        }
      }

      return {
        checked: activePasses.length,
        escalated,
        errors
      };
    } catch (error) {
      console.error('Error in batch escalation check:', error);
      return { checked: 0, escalated: 0, errors: 1 };
    }
  },

  /**
   * Get escalation statistics
   */
  async getEscalationStats(): Promise<{
    totalActive: number;
    warnings: number;
    alerts: number;
    critical: number;
  }> {
    try {
      const activePasses = await PassService.getAllActivePasses();
      
      const stats = {
        totalActive: activePasses.length,
        warnings: 0,
        alerts: 0,
        critical: 0
      };

      for (const pass of activePasses) {
        if (pass.escalationLevel) {
          if (pass.escalationLevel === 'warning') {
            stats.warnings++;
          } else if (pass.escalationLevel === 'alert') {
            stats.alerts++;
          } else if (pass.escalationLevel === 'critical') {
            stats.critical++;
          }
        }
      }

      return stats;
    } catch (error) {
      console.error('Error getting escalation stats:', error);
      return { totalActive: 0, warnings: 0, alerts: 0, critical: 0 };
    }
  },

  /**
   * Clear escalation for a pass (when pass is returned)
   */
  async clearEscalation(passId: string): Promise<void> {
    try {
      await PassService.updatePass(passId, {
        escalationLevel: null,
        escalationTriggeredAt: null
      });
    } catch (error) {
      console.error('Error clearing escalation for pass:', passId, error);
    }
  }
};

// ============================================================================
// ESCALATION MONITORING
// ============================================================================

/**
 * Start escalation monitoring (runs every minute)
 */
export function startEscalationMonitoring(): () => void {
  const intervalId = setInterval(async () => {
    try {
      const result = await EscalationService.checkAllActivePasses();
      console.log(`Escalation check: ${result.checked} passes checked, ${result.escalated} escalated, ${result.errors} errors`);
    } catch (error) {
      console.error('Error in escalation monitoring:', error);
    }
  }, 60000); // Check every minute

  // Return cleanup function
  return () => {
    clearInterval(intervalId);
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Format duration for display
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
}

/**
 * Get escalation color for UI
 */
export function getEscalationColor(level: EscalationLevel | null): string {
  if (!level) return 'gray';
  return ESCALATION_LEVELS[level].color;
}

/**
 * Get escalation icon for UI
 */
export function getEscalationIcon(level: EscalationLevel | null): string {
  if (!level) return '✅';
  return ESCALATION_LEVELS[level].icon;
} 