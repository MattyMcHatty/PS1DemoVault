export type Game = { title: string; category: string };

export type Disc = {
  id: number;
  productCode: string;
  region: string | null;
  title: string;
  imageUrl: string | null;
  games: Game[];
};

export type CollectionFilter = 'all' | 'collected' | 'not-collected';

export type DropdownOption = { value: string; label: string; icon: string };
