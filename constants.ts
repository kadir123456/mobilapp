
import type { BetType } from './types';

export const BET_TYPES: { id: BetType; name: string; description: string }[] = [
  { id: 'MS', name: 'Maç Sonucu', description: '90 dakika sonunda maçın galibini tahmin et.' },
  { id: 'İY', name: 'İlk Yarı Sonucu', description: 'İlk 45 dakika sonunda maçın galibini tahmin et.' },
  { id: 'Handikap', name: 'Handikaplı Sonuç', description: 'Zayıf takıma verilen gol avansına göre sonucu tahmin et.' },
  { id: 'İY/MS', name: 'İlk Yarı / Maç Sonucu', description: 'Hem ilk yarı hem de maç sonucunu doğru tahmin et.' },
  { id: 'KG', name: 'Karşılıklı Gol', description: 'Her iki takımın da gol atıp atmayacağını tahmin et (Var/Yok).' },
  { id: 'Alt/Üst', name: 'Alt / Üst', description: 'Maçtaki toplam gol sayısını (genellikle 2.5) tahmin et.' },
];