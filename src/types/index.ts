export type Game = { title: string; category: string };

export type Disc = {
  id: number;
  productCode: string;
  region: string | null;
  title: string;
  imageUrls: string[];
  games: Game[];
};

export type CollectionFilter = 'all' | 'collected' | 'not-collected';

export type DropdownOption = { value: string; label: string; icon: string };

export type DiscCollection = { id: string; label: string };
