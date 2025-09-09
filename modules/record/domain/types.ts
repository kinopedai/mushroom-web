import type { Coordinates } from '@/common/types/common';

export interface MushroomRecord {
  id: string;
  name: string;
  location: string;
  date: string; // YYYY-MM-DD
  count: number;
  toxicityLevel: number; // 0.0〜1.0
  memo: string;
  coordinates?: Coordinates;
  timestamp: number;
}
