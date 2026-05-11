import demos from '../data/demos.json';
import { Disc, DiscCollection, DropdownOption } from '../types';

export const ALL_REGIONS = 'All';
export const NULL_REGION = '__no_region__';
export const STORAGE_KEY = 'collected_discs';

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

export const REGIONS: string[] = [
  ALL_REGIONS,
  ...Array.from(
    new Set((demos as Disc[]).map(d => d.region).filter((r): r is string => r !== null))
  ).sort(),
];

export const COLLECTION_OPTIONS: DropdownOption[] = [
  { value: 'all',           label: 'All Discs',    icon: '📋' },
  { value: 'collected',     label: 'Collected',     icon: '✅' },
  { value: 'not-collected', label: 'Not Collected', icon: '⬜' },
];

export const REGION_OPTIONS: DropdownOption[] = REGIONS.map(r => ({
  value: r,
  label: r,
  icon: REGION_FLAGS[r] ?? '🏳️',
}));

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
