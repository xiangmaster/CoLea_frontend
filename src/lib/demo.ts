import { clearAllPersisted } from './persist';
import { useAuthStore } from '@/store/authStore';
import { useCourseStore } from '@/store/courseStore';
import { useGroupStore } from '@/store/groupStore';
import { useTaskStore } from '@/store/taskStore';
import { useDocStore } from '@/store/docStore';
import { useAnalyticsStore } from '@/store/analyticsStore';
import { useNotificationStore } from '@/store/notificationStore';
import { useActivityStore } from '@/store/activityStore';
import { useAnnouncementStore } from '@/store/announcementStore';

export function resetAllDemoData() {
  useGroupStore.getState().reset();
  useCourseStore.getState().reset();
  useTaskStore.getState().reset();
  useDocStore.getState().reset();
  useAnalyticsStore.getState().reset();
  useNotificationStore.getState().reset();
  useActivityStore.getState().reset();
  useAnnouncementStore.getState().reset();
  useAuthStore.getState().logout();
  // 清掉本地 zustand 持久化（重新刷新生效）
  setTimeout(() => {
    clearAllPersisted();
    location.hash = '#/login';
    location.reload();
  }, 100);
}

export function showDemoToolbar(): boolean {
  if (import.meta.env.DEV) return true;
  const params = new URLSearchParams(location.search);
  return params.get('demo') === '1';
}
