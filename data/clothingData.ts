export type ClothingType = 'shirt' | 'pants' | 'jacket' | 'dress';

export interface ClothingItem {
  id: string;
  name: string;
  brand: string;
  icon: string;
  color: string;
  type: ClothingType;
}

export const CLOTHING_CATALOG: ClothingItem[] = [
  { id: '1', name: 'Classic Tee', brand: 'Uniqlo', icon: '👕', color: '#E8E8E8', type: 'shirt' },
  { id: '2', name: 'Oxford Shirt', brand: 'Ralph Lauren', icon: '👔', color: '#3A7BC8', type: 'shirt' },
  { id: '3', name: 'Slim Jacket', brand: 'Zara', icon: '🧥', color: '#1A1A1A', type: 'jacket' },
  { id: '4', name: 'Chino Pants', brand: 'H&M', icon: '👖', color: '#C4A882', type: 'pants' },
  { id: '5', name: 'Puffer Jacket', brand: 'North Face', icon: '🧥', color: '#C0392B', type: 'jacket' },
];

export function getSizeRecommendation(chestCm: number): string {
  if (chestCm < 88) return 'XS';
  if (chestCm < 96) return 'S';
  if (chestCm < 104) return 'M';
  if (chestCm < 112) return 'L';
  if (chestCm < 120) return 'XL';
  return 'XXL';
}
