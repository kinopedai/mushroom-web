import type { Category } from '@/common/types/common';

export interface MushroomRef {
  id: string;
  name: string; // キノコ名
  toxicityLevel: number; // 毒性レベル（0.0〜1.0）
  season: string; // 季節
  limit: string; // 採取制限
  category: Category; // キノコのカテゴリ
}
