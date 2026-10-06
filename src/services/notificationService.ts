/**
 * Browser-based Notification & Audio Alert Service for MedAssist Medication Schedules
 * Utilizing Web Notifications API and Web Audio API for persistent alerts
 */
import { storageService } from './storageService';
import { DoseLog, DueDoseAlert, MedicationScheduleItem } from '../types';

class NotificationService {
  private audioCtx: AudioContext | null = null;
  private notifiedSlots: Set<string> = new Set();
  private alertListeners: Set<(alert: DueDoseAlert) => void> = new Set();
  private navigateListeners: Set<() => void> = new Set();
  private schedulerInterval: number | null = null;
  private snoozedAlerts: Array<{ alert: DueDoseAlert; wakeTimeMs: number }> = [];
  private isSchedulerRunning = false;

  // Initialize or get Web Audio Context
  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    try {
      if (!this.audioCtx) {
        const AudioCtxClass =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtxClass) {
          this.audioCtx = new AudioCtxClass();
        }
      }
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume().catch(() => {});
      }
      return this.audioCtx;
    } catch (e) {
      console.warn('AudioContext not supported or blocked:', e);
      return null;
    }
  }

  /**
   * Play a gentle medical melodic alert sound using synthesized Web Audio API.
   * Works on any modern browser without needing external audio assets.
   */
  public playReminderChime(): void {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      // Note 1: E5 (659.25 Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(659.25, now);
      gain1.gain.setValueAtTime(0, now);
      gain1.gain.linearRampToValueAtTime(0.18, now + 0.04);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.4);

      // Note 2: B5 (987.77 Hz)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(987.77, now + 0.16);
      gain2.gain.setValueAtTime(0, now + 0.16);
      gain2.gain.linearRampToValueAtTime(0.22, now + 0.2);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.16);
      osc2.stop(now + 0.7);
    } catch (e) {
      console.warn('Unable to play reminder chime:', e);
    }
  }

  /**
   * Play a clean hospital-grade physician alert sound when a patient logs in or requests triage
   */
  public playDoctorAlertChime(): void {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // High chime 1: A5 (880 Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(880, now);
      gain1.gain.setValueAtTime(0, now);
      gain1.gain.linearRampToValueAtTime(0.25, now + 0.03);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.45);

      // High chime 2: E6 (1318.5 Hz)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1318.51, now + 0.14);
      gain2.gain.setValueAtTime(0, now + 0.14);
      gain2.gain.linearRampToValueAtTime(0.3, now + 0.17);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.75);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.14);
      osc2.stop(now + 0.75);
    } catch (e) {
      console.warn('Unable to play doctor alert chime:', e);
    }
  }

  /**
   * Play an uplifting confirmation sound when medicine is taken
   */
  public playSuccessChime(): void {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99]; // C5 -> E5 -> G5
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const startTime = now + idx * 0.08;
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.15, startTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.28);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + 0.3);
      });
    } catch (e) {
      console.warn('Unable to play success chime:', e);
    }
  }

  /**
   * Check if the browser supports Web Notifications API
   */
  public isSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  /**
   * Current notification permission: 'granted' | 'denied' | 'default' | 'unsupported'
   */
  public getPermissionStatus(): NotificationPermission | 'unsupported' {
    if (!this.isSupported()) return 'unsupported';
    try {
      return Notification.permission;
    } catch {
      return 'unsupported';
    }
  }

  /**
   * Request permission from the user to display notifications
   */
  public async requestPermission(): Promise<NotificationPermission | 'unsupported'> {
    if (!this.isSupported()) return 'unsupported';
    try {
      const permission = await Notification.requestPermission();
      return permission;
    } catch (err) {
      console.warn('Failed to request notification permission:', err);
      return this.getPermissionStatus();
    }
  }

  /**
   * Trigger a native browser notification using Web Notifications API
   * Ensures the user is prompted even if they are not actively looking at the dashboard
   */
  public sendBrowserNotification(
    title: string,
    options?: NotificationOptions & { playSound?: boolean }
  ): Notification | null {
    if (options?.playSound !== false) {
      const prefs = storageService.getNotificationPreferences();
      if (prefs.soundEnabled) {
        this.playReminderChime();
      }
    }

    if (!this.isSupported() || Notification.permission !== 'granted') {
      return null;
    }

    try {
      const notification = new Notification(title, {
        badge: '/favicon.ico',
        icon: '/favicon.ico',
        requireInteraction: true, // Keep notification visible on desktop until dismissed or clicked
        silent: false,
        ...options
      });

      notification.onclick = () => {
        window.focus();
        this.navigateListeners.forEach(cb => cb());
        notification.close();
      };

      return notification;
    } catch (e) {
      console.warn('Could not display system notification:', e);
      return null;
    }
  }

  /**
   * Start the global app-level medication scheduler
   * Runs continuously regardless of which tab is active, and listens to visibility changes
   */
  public startGlobalScheduler(): void {
    if (this.isSchedulerRunning) return;
    this.isSchedulerRunning = true;

    // Run immediate check
    this.checkScheduleAndNotify();

    // Check periodically (every 10 seconds)
    if (typeof window !== 'undefined') {
      this.schedulerInterval = window.setInterval(() => {
        this.checkScheduleAndNotify();
      }, 10000);

      document.addEventListener('visibilitychange', this.handleVisibilityChange);
      window.addEventListener('focus', this.handleWindowFocus);
    }
  }

  /**
   * Stop the global scheduler
   */
  public stopGlobalScheduler(): void {
    if (this.schedulerInterval !== null) {
      clearInterval(this.schedulerInterval);
      this.schedulerInterval = null;
    }
    if (typeof window !== 'undefined') {
      document.removeEventListener('visibilitychange', this.handleVisibilityChange);
      window.removeEventListener('focus', this.handleWindowFocus);
    }
    this.isSchedulerRunning = false;
  }

  private handleVisibilityChange = (): void => {
    if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
      this.checkScheduleAndNotify();
    }
  };

  private handleWindowFocus = (): void => {
    this.checkScheduleAndNotify();
  };

  /**
   * Check medication schedule against current time and trigger notifications
   */
  public checkScheduleAndNotify(): void {
    try {
      const schedule = storageService.getMedicationSchedule();
      const activeItems = schedule.filter(s => s.active && s.times.length > 0);
      if (activeItems.length === 0) return;

      const now = new Date();
      const currentHours = now.getHours();
      const currentMinutes = now.getMinutes();
      const currentTotalMinutes = currentHours * 60 + currentMinutes;
      const todayStr = now.toISOString().split('T')[0];

      // 1. Process snoozed alerts
      const nowMs = Date.now();
      const remainingSnoozed: Array<{ alert: DueDoseAlert; wakeTimeMs: number }> = [];
      for (const snoozed of this.snoozedAlerts) {
        if (nowMs >= snoozed.wakeTimeMs) {
          this.triggerDoseAlert(snoozed.alert, true);
        } else {
          remainingSnoozed.push(snoozed);
        }
      }
      this.snoozedAlerts = remainingSnoozed;

      // 2. Check scheduled times
      activeItems.forEach(item => {
        item.times.forEach(t => {
          const [hStr, mStr] = t.split(':');
          const h = parseInt(hStr, 10);
          const m = parseInt(mStr, 10);
          if (isNaN(h) || isNaN(m)) return;
          const doseTotalMinutes = h * 60 + m;

          // Check if dose falls in trigger window:
          // Between exact dose time and up to 20 minutes past scheduled time
          const diffMinutes = currentTotalMinutes - doseTotalMinutes;
          const isDue = diffMinutes >= 0 && diffMinutes <= 20;

          if (isDue) {
            const alertKey = `${item.id}_${t}_${todayStr}`;
            if (this.notifiedSlots.has(alertKey)) return;

            // Check if already taken today
            const alreadyTaken = storageService.isDoseTakenToday(item.id, t);
            if (alreadyTaken) return;

            // Mark slot as notified today so we don't spam repeated notifications
            this.notifiedSlots.add(alertKey);

            const alert: DueDoseAlert = {
              id: alertKey,
              item,
              scheduledTime: t,
              formattedTime: this.formatTime12h(t),
              triggeredAt: new Date()
            };

            this.triggerDoseAlert(alert, false);
          }
        });
      });
    } catch (err) {
      console.warn('Error checking medication schedule:', err);
    }
  }

  /**
   * Dispatches both a system-level Web Notification and an in-app alert event
   */
  public triggerDoseAlert(alert: DueDoseAlert, isSnoozed = false): void {
    const prefs = storageService.getNotificationPreferences();

    // Play reminder sound chime if enabled
    if (prefs.soundEnabled) {
      this.playReminderChime();
    }

    // Trigger system-level Web Notification (prompts user even when looking elsewhere)
    if (this.isSupported() && Notification.permission === 'granted') {
      const title = isSnoozed
        ? `⏰ Reminder: Take ${alert.item.medicineName} (${alert.item.dosage})`
        : `⏰ Medication Due: ${alert.item.medicineName} (${alert.item.dosage})`;

      const body = `Scheduled: ${alert.formattedTime} • ${alert.item.timing}. ${
        alert.item.instructions || 'Click to view prescription details and mark as taken.'
      }`;

      try {
        const notif = new Notification(title, {
          body,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: `medassist-alert-${alert.id}`,
          requireInteraction: true, // Remains on user's OS desktop until dismissed or clicked
          silent: false
        });

        notif.onclick = () => {
          window.focus();
          this.navigateListeners.forEach(cb => cb());
          notif.close();
        };
      } catch (e) {
        console.warn('Failed to send browser notification:', e);
      }
    }

    // Notify registered in-app listeners (displays banner across all tabs)
    this.alertListeners.forEach(listener => {
      try {
        listener(alert);
      } catch (e) {
        console.error('Error in alert listener:', e);
      }
    });
  }

  /**
   * Snooze an alert for a specified duration in minutes
   */
  public snoozeAlert(alert: DueDoseAlert, minutes = 10): void {
    const wakeTimeMs = Date.now() + minutes * 60 * 1000;
    this.snoozedAlerts.push({ alert, wakeTimeMs });

    // Schedule direct timer as well
    if (typeof window !== 'undefined') {
      window.setTimeout(() => {
        this.checkScheduleAndNotify();
      }, minutes * 60 * 1000);
    }
  }

  /**
   * Clear notified slot when dose is taken
   */
  public clearAlertSlot(scheduleId: string, scheduledTime: string): void {
    const todayStr = new Date().toISOString().split('T')[0];
    const alertKey = `${scheduleId}_${scheduledTime}_${todayStr}`;
    this.notifiedSlots.delete(alertKey);
    this.snoozedAlerts = this.snoozedAlerts.filter(s => s.alert.id !== alertKey);
  }

  /**
   * Subscribe to in-app dose alerts
   */
  public onAlert(listener: (alert: DueDoseAlert) => void): () => void {
    this.alertListeners.add(listener);
    return () => this.alertListeners.delete(listener);
  }

  /**
   * Subscribe to navigate to dashboard requests (e.g. from notification click)
   */
  public onNavigateToDashboard(listener: () => void): () => void {
    this.navigateListeners.add(listener);
    return () => this.navigateListeners.delete(listener);
  }

  /**
   * Send a test medication reminder notification
   */
  public async sendTestReminder(medicineName = 'Amoxicillin 500mg'): Promise<{
    browserNotificationSent: boolean;
    permission: string;
  }> {
    let perm = this.getPermissionStatus();
    if (perm === 'default') {
      perm = await this.requestPermission();
    }

    const testItem: MedicationScheduleItem = {
      id: 'test-med-demo',
      medicineId: 'amoxicillin',
      medicineName,
      dosage: '500mg (1 Capsule)',
      times: ['Now'],
      timing: 'After meals',
      instructions: 'Take with a full glass of water. Complete complete 7-day course.',
      active: true,
      prescribedBy: 'Dr. Sarah Mitchell, MD'
    };

    const testAlert: DueDoseAlert = {
      id: `test-${Date.now()}`,
      item: testItem,
      scheduledTime: 'Now',
      formattedTime: 'Now',
      triggeredAt: new Date(),
      isTest: true
    };

    this.triggerDoseAlert(testAlert, false);

    return {
      browserNotificationSent: perm === 'granted',
      permission: perm
    };
  }

  /**
   * Format "HH:mm" 24-hour time to "12:00 PM" format
   */
  public formatTime12h(time24: string): string {
    if (!time24) return '';
    const [hoursStr, minutesStr] = time24.split(':');
    const hours = parseInt(hoursStr, 10);
    const minutes = parseInt(minutesStr || '0', 10);
    if (isNaN(hours)) return time24;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const h12 = hours % 12 || 12;
    const mStr = minutes < 10 ? `0${minutes}` : `${minutes}`;
    return `${h12}:${mStr} ${ampm}`;
  }

  /**
   * Enhanced next dose information including seconds and overdue status
   */
  public getNextDoseDetailed(
    schedule: MedicationScheduleItem[],
    logsToday: DoseLog[]
  ): {
    item: MedicationScheduleItem;
    time: string;
    formattedTime: string;
    targetDate: Date;
    isToday: boolean;
    isOverdue: boolean;
    isDueNow: boolean;
    secondsUntil: number;
    minutesUntil: number;
    hours: number;
    minutes: number;
    seconds: number;
    todayTimeline: Array<{
      item: MedicationScheduleItem;
      time: string;
      formattedTime: string;
      isTaken: boolean;
      isNext: boolean;
      isOverdue: boolean;
    }>;
  } | null {
    const activeItems = schedule.filter(s => s.active && s.times.length > 0);
    if (activeItems.length === 0) return null;

    const now = new Date();
    const currentTotalSec = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();

    interface SlotCandidate {
      item: MedicationScheduleItem;
      time: string;
      doseTotalSec: number;
      isTaken: boolean;
      targetDate: Date;
      isToday: boolean;
      isOverdue: boolean;
      isDueNow: boolean;
      diffSec: number;
    }

    const todaySlots: SlotCandidate[] = [];
    const tomorrowSlots: SlotCandidate[] = [];

    activeItems.forEach(item => {
      item.times.forEach(t => {
        const [h, m] = t.split(':').map(Number);
        const doseTotalSec = h * 3600 + m * 60;
        const isTaken = logsToday.some(
          l => l.scheduleId === item.id && l.scheduledTime === t && l.status === 'taken'
        );

        const doseDateToday = new Date(now);
        doseDateToday.setHours(h, m, 0, 0);

        const diffSecToday = Math.floor((doseDateToday.getTime() - now.getTime()) / 1000);

        if (!isTaken) {
          if (diffSecToday < -60) {
            todaySlots.push({
              item,
              time: t,
              doseTotalSec,
              isTaken: false,
              targetDate: doseDateToday,
              isToday: true,
              isOverdue: true,
              isDueNow: diffSecToday >= -900,
              diffSec: diffSecToday
            });
          } else {
            todaySlots.push({
              item,
              time: t,
              doseTotalSec,
              isTaken: false,
              targetDate: doseDateToday,
              isToday: true,
              isOverdue: false,
              isDueNow: Math.abs(diffSecToday) <= 300,
              diffSec: diffSecToday
            });
          }
        } else {
          const doseDateTomorrow = new Date(now);
          doseDateTomorrow.setDate(doseDateTomorrow.getDate() + 1);
          doseDateTomorrow.setHours(h, m, 0, 0);
          const diffSecTomorrow = Math.floor((doseDateTomorrow.getTime() - now.getTime()) / 1000);

          tomorrowSlots.push({
            item,
            time: t,
            doseTotalSec,
            isTaken: true,
            targetDate: doseDateTomorrow,
            isToday: false,
            isOverdue: false,
            isDueNow: false,
            diffSec: diffSecTomorrow
          });
        }
      });
    });

    let selected: SlotCandidate | null = null;

    const overdueToday = todaySlots
      .filter(s => s.isOverdue)
      .sort((a, b) => a.doseTotalSec - b.doseTotalSec);

    const upcomingToday = todaySlots
      .filter(s => !s.isOverdue)
      .sort((a, b) => a.diffSec - b.diffSec);

    if (overdueToday.length > 0) {
      selected = overdueToday[0];
    } else if (upcomingToday.length > 0) {
      selected = upcomingToday[0];
    } else if (tomorrowSlots.length > 0) {
      tomorrowSlots.sort((a, b) => a.diffSec - b.diffSec);
      selected = tomorrowSlots[0];
    }

    if (!selected) return null;

    const absSec = Math.max(0, selected.diffSec);
    const hours = Math.floor(absSec / 3600);
    const minutes = Math.floor((absSec % 3600) / 60);
    const seconds = absSec % 60;

    const todayTimeline: Array<{
      item: MedicationScheduleItem;
      time: string;
      formattedTime: string;
      isTaken: boolean;
      isNext: boolean;
      isOverdue: boolean;
    }> = [];

    activeItems.forEach(item => {
      item.times.forEach(t => {
        const isTaken = logsToday.some(
          l => l.scheduleId === item.id && l.scheduledTime === t && l.status === 'taken'
        );
        const [h, m] = t.split(':').map(Number);
        const secDiff = h * 3600 + m * 60 - currentTotalSec;
        const isOverdue = !isTaken && secDiff < -60;
        const isNext = selected?.item.id === item.id && selected?.time === t;

        todayTimeline.push({
          item,
          time: t,
          formattedTime: this.formatTime12h(t),
          isTaken,
          isNext,
          isOverdue
        });
      });
    });

    todayTimeline.sort((a, b) => a.time.localeCompare(b.time));

    return {
      item: selected.item,
      time: selected.time,
      formattedTime: this.formatTime12h(selected.time),
      targetDate: selected.targetDate,
      isToday: selected.isToday,
      isOverdue: selected.isOverdue,
      isDueNow: selected.isDueNow,
      secondsUntil: selected.diffSec,
      minutesUntil: Math.round(selected.diffSec / 60),
      hours,
      minutes,
      seconds,
      todayTimeline
    };
  }

  /**
   * Get the next upcoming dose across all active medications
   */
  public getNextDose(
    schedule: MedicationScheduleItem[],
    logsToday: DoseLog[]
  ): {
    item: MedicationScheduleItem;
    time: string;
    isToday: boolean;
    minutesUntil: number;
    formattedTime: string;
  } | null {
    const detailed = this.getNextDoseDetailed(schedule, logsToday);
    if (!detailed) return null;
    return {
      item: detailed.item,
      time: detailed.time,
      isToday: detailed.isToday,
      minutesUntil: detailed.minutesUntil,
      formattedTime: detailed.formattedTime
    };
  }
}

export const notificationService = new NotificationService();
