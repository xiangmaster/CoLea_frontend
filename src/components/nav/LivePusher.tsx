import { useEffect, useRef } from 'react';
import { useNotificationStore } from '@/store/notificationStore';
import { useActivityStore } from '@/store/activityStore';
import { useToastStore } from '@/store/toastStore';

/**
 * 假"WebSocket 推送"：进入应用后每 15~25 秒推送一条新通知 / 活动，
 * 让仪表盘的"实时动态"和顶栏 Bell 看起来在持续接收事件。
 */
export function LivePusher() {
  const pushN = useNotificationStore((s) => s.pushRandom);
  const pushA = useActivityStore((s) => s.pushRandom);
  const toast = useToastStore((s) => s.push);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    let cancelled = false;
    let pushedSinceMount = 0;

    const tick = () => {
      if (cancelled) return;
      const r = Math.random();
      if (r < 0.45) {
        const n = pushN();
        if (n && pushedSinceMount > 0) {
          toast('info', `🔔 ${n.title}`, 3200);
        }
      } else if (r < 0.85) {
        pushA();
      } else {
        const n = pushN();
        pushA();
        if (n && pushedSinceMount > 0) toast('info', `🔔 ${n.title}`, 3200);
      }
      pushedSinceMount++;
      const delay = 14000 + Math.random() * 12000;
      window.setTimeout(tick, delay);
    };

    // 首次延迟，避免登录后立即弹
    window.setTimeout(tick, 10000);

    return () => {
      cancelled = true;
    };
  }, [pushN, pushA, toast]);

  return null;
}
