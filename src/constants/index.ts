import dedicated from '../data/dedicated.json';
import demo1 from '../data/demo1.json';
import demos from '../data/demos.json';
import essential from '../data/essential.json';
import opmSpecials from '../data/opm-specials.json';
import registered from '../data/registered.json';
import samplers from '../data/samplers.json';
import station from '../data/station.json';
import { Disc, DiscCollection, DropdownOption } from '../types';

export const ALL_REGIONS = 'All';
export const NULL_REGION = '__no_region__';
export const STORAGE_KEY = 'collected_discs';

export const EUROPEAN_REGIONS = new Set([
  'Benelux', 'Denmark', 'Finland', 'France', 'Germany',
  'Ireland', 'Italy', 'Poland', 'Spain', 'UK',
]);

export const REGION_FLAGS: Record<string, string> = {
  All:         '🌍',
  Australia:   '🇦🇺',
  Benelux:     '🇧🇪',
  Denmark:     '🇩🇰',
  Europe:      '🇪🇺',
  Finland:     '🇫🇮',
  France:      '🇫🇷',
  Germany:     '🇩🇪',
  Holland:     '🇳🇱',
  Ireland:     '🇮🇪',
  Italy:       '🇮🇹',
  Poland:      '🇵🇱',
  Portugal:    '🇵🇹',
  Scandinavia: '🇸🇪',
  Spain:       '🇪🇸',
  Sweden:      '🇸🇪',
  UK:          '🇬🇧',
};

export const COLLECTION_OPTIONS: DropdownOption[] = [
  { value: 'all',           label: 'All Discs',    icon: '📋' },
  { value: 'collected',     label: 'Collected',     icon: '✅' },
  { value: 'not-collected', label: 'Not Collected', icon: '⬜' },
];

export const DISC_COLLECTIONS: DiscCollection[] = [
  { id: 'opm',          label: 'Official PlayStation Magazine' },
  { id: 'opm-specials', label: 'OPM Specials' },
  { id: 'essential',    label: 'Essential PlayStation' },
  { id: 'demo1',        label: 'Demo One' },
  { id: 'registered',   label: 'Registered Users Demo' },
  { id: 'station',      label: 'Station Magazine' },
  { id: 'samplers',     label: 'Other Samplers' },
  { id: 'dedicated',    label: 'Dedicated Demos' },
  { id: 'master',       label: 'Master List' },
];

export const CATEGORY_LABELS: Record<string, string> = {
  playable:     '🎮  Playable',
  trailer:      '🎬  Trailer',
  'net yaroze': '💻  Net Yaroze',
  other:        '📀  Other',
  saves:        '💾  Saves',
  music:        '🎵  Music',
};

// Each collection gets a unique ID block: collection at index i uses IDs (i+1)*100000 + original_id.
// This prevents cross-collection ID collisions in the collected set.
const COLLECTION_SOURCES: [string, Disc[]][] = [
  ['opm',          demos as Disc[]],
  ['opm-specials', opmSpecials as Disc[]],
  ['essential',    essential as Disc[]],
  ['demo1',        demo1 as Disc[]],
  ['registered',   registered as Disc[]],
  ['station',      station as Disc[]],
  ['samplers',     samplers as Disc[]],
  ['dedicated',    dedicated as Disc[]],
];

export const COLLECTION_DATA: Record<string, Disc[]> = Object.fromEntries(
  COLLECTION_SOURCES.map(([id, discs], i) => [
    id,
    discs.map(d => ({ ...d, id: (i + 1) * 100000 + d.id })),
  ])
);

// Flat list of every disc across all collections with globally unique IDs.
export const MASTER_DATA: Disc[] = Object.values(COLLECTION_DATA).flat();

export const REGIONS: string[] = [
  ALL_REGIONS,
  ...Array.from(
    new Set((demos as Disc[]).map(d => d.region).filter((r): r is string => r !== null))
  ).sort(),
];

export const REGION_OPTIONS: DropdownOption[] = REGIONS.map(r => ({
  value: r,
  label: r,
  icon: REGION_FLAGS[r] ?? '🏳️',
}));
