import type { Category } from '@/common/types/common';

export interface MushroomRef {
  id: string;
  name: string;
  toxicityLevel: number;
  season: string;
  limit: string;
  category: Category;
}
