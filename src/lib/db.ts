import { db } from '@/lib/db';
import type { 
  UserRole = 'ADMIN' | 'editor' | 'viewer';
}

export type DashboardRole = 'owner' | 'editor' | 'viewer';
}
export type KPI = {
  id: string;
  name: string;
  value: number;
  previousValue?: number;
  target?: number;
  unit?: string;
  category?: string;
  color: string;
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  columnSpan?: number;
  rowSpan?: number;
  order?: number;
  vizType?: VizType;
  showPrediction?: boolean;
  prediction?: number[];
  confidence?: number;
  sparkline?: number[];
  alerts?: Alert[];
}
export type VizType = 'sparkline' | 'gauge' | 'trend' | 'progress'
    | 'bullet'
    | 'scorecard';

    | 'comparison';
}
export type FilterConfig = {
  search: string;
  categories: string[];
  dateRange: string;
  sortBy: 'name' | 'value' | 'trend';
  sortOrder: 'asc' | 'desc';
  showPredictions: boolean;
  predictionPeriods: number;
}
