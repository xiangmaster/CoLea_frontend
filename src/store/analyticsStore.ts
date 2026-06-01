import { create } from 'zustand';
import { persist, persistOptions } from '@/lib/persist';
import {
  SEED_DISTRIBUTION,
  SEED_GROUP_RISKS,
  SEED_HEATMAP,
  SEED_KPI,
  SEED_RADAR,
  type GroupRiskMetrics,
  type HeatmapCell,
  type KpiSet,
  type RadarPoint,
  type TaskDistribution,
} from '@/mocks/analytics';

interface AnalyticsState {
  kpi: KpiSet;
  heatmap: HeatmapCell[];
  radar: RadarPoint[];
  distribution: TaskDistribution;
  risks: GroupRiskMetrics[];
  reset: () => void;
}

export const useAnalyticsStore = create<AnalyticsState>()(
  persist(
    (set) => ({
      kpi: SEED_KPI,
      heatmap: SEED_HEATMAP,
      radar: SEED_RADAR,
      distribution: SEED_DISTRIBUTION,
      risks: SEED_GROUP_RISKS,
      reset: () => set({ kpi: SEED_KPI, heatmap: SEED_HEATMAP, radar: SEED_RADAR, distribution: SEED_DISTRIBUTION, risks: SEED_GROUP_RISKS }),
    }),
    persistOptions<AnalyticsState>('analytics'),
  ),
);
