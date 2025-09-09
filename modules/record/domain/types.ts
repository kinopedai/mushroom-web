import type { Coordinates } from '@/common/types/common';

export interface MushroomRecord {
  id: string;
  name: string; // キノコ名
  location: string; // 採取場所
  date: string; // 採取日（YYYY-MM-DD）
  count: number; // 採取個数
  toxicityLevel: number; // 毒性レベル（0.0〜1.0）
  memo: string; // メモ
  coordinates?: Coordinates; // GPS座標
  timestamp: number;
}
