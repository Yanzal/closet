import { uid } from '@/lib/id';
import type { ClothingItem, Collection } from '@/lib/types';

function daysAgo(n: number): string {
  return new Date(Date.now() - n * 86_400_000).toISOString();
}

/**
 * A small sample wardrobe so the UI isn't empty on first launch.
 * Items have no photo (photoUri: '') and render as tasteful placeholder tiles;
 * real items the user adds will carry their actual photo.
 */
export function makeSeed(): { items: ClothingItem[]; collections: Collection[] } {
  const raw: Omit<ClothingItem, 'id'>[] = [
    { name: 'White Cotton Tee', photoUri: '', category: 'Tops', brand: 'Uniqlo', colors: ['White'], seasons: ['Spring', 'Summer'], price: 15, wearCount: 7, dateAdded: daysAgo(40), lastWornAt: daysAgo(2) },
    { name: 'Striped Long Sleeve', photoUri: '', category: 'Tops', brand: 'No Brand', colors: ['Navy', 'White'], seasons: ['Spring', 'Fall'], price: 0, wearCount: 3, dateAdded: daysAgo(1), lastWornAt: daysAgo(6) },
    { name: 'Blue Oxford Shirt', photoUri: '', category: 'Tops', brand: 'GAP', colors: ['Blue'], seasons: ['Spring', 'Fall'], price: 50, wearCount: 5, dateAdded: daysAgo(28), lastWornAt: daysAgo(9) },
    { name: 'Black Knit Crop Top', photoUri: '', category: 'Tops', brand: 'ZARA', colors: ['Black'], seasons: ['Fall', 'Winter'], price: 30, wearCount: 9, dateAdded: daysAgo(60), lastWornAt: daysAgo(1) },
    { name: 'Beige Cable Knit', photoUri: '', category: 'Tops', brand: 'COS', colors: ['Beige'], seasons: ['Fall', 'Winter'], price: 90, wearCount: 4, dateAdded: daysAgo(55), lastWornAt: daysAgo(12) },
    { name: 'Cream Shearling Jacket', photoUri: '', category: 'Outerwear', brand: '8seconds', colors: ['Cream'], seasons: ['Winter'], price: 180, wearCount: 2, dateAdded: daysAgo(70), lastWornAt: daysAgo(20) },
    { name: 'Black Leather Jacket', photoUri: '', category: 'Outerwear', brand: 'AllSaints', colors: ['Black'], seasons: ['Fall', 'Winter'], price: 300, wearCount: 6, dateAdded: daysAgo(120), lastWornAt: daysAgo(4) },
    { name: 'Black Tailored Trousers', photoUri: '', category: 'Bottoms', brand: 'COS', colors: ['Black'], seasons: ['Spring', 'Fall', 'Winter'], price: 80, wearCount: 8, dateAdded: daysAgo(45), lastWornAt: daysAgo(3) },
    { name: 'Denim Midi Skirt', photoUri: '', category: 'Bottoms', brand: 'ZARA', colors: ['Blue'], seasons: ['Spring', 'Summer', 'Fall'], price: 45, wearCount: 5, dateAdded: daysAgo(33), lastWornAt: daysAgo(8) },
    { name: 'Cream Chelsea Boots', photoUri: '', category: 'Shoes', brand: 'Inthemood', colors: ['Cream'], seasons: ['Fall', 'Winter'], price: 120, wearCount: 10, dateAdded: daysAgo(80), lastWornAt: daysAgo(1) },
    { name: 'Brown Birkenstocks', photoUri: '', category: 'Shoes', brand: 'Birkenstock', colors: ['Brown'], seasons: ['Summer'], price: 100, wearCount: 12, dateAdded: daysAgo(200), lastWornAt: daysAgo(30) },
    { name: 'Black Hobo Bag', photoUri: '', category: 'Bags', brand: 'Mango', colors: ['Black'], seasons: ['Spring', 'Summer', 'Fall', 'Winter'], price: 90, wearCount: 6, dateAdded: daysAgo(50), lastWornAt: daysAgo(5) },
  ];

  const items: ClothingItem[] = raw.map((r) => ({ ...r, id: uid('it_') }));

  const winterNames = new Set([
    'Cream Shearling Jacket',
    'Black Leather Jacket',
    'Black Knit Crop Top',
    'Beige Cable Knit',
    'Cream Chelsea Boots',
  ]);
  const winter = items.filter((i) => winterNames.has(i.name));

  const collections: Collection[] = [
    { id: uid('col_'), name: 'Winter items', itemIds: winter.map((i) => i.id) },
  ];

  return { items, collections };
}
