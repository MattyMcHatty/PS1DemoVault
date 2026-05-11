import React, { useEffect, useMemo } from 'react';
import {
  BackHandler,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ALL_REGIONS, COLLECTION_DATA, DISC_COLLECTIONS, REGION_FLAGS } from '../constants';
import { useCollected } from '../hooks/useCollected';
import { colors } from '../styles/colors';
import { DropdownOption } from '../types';
import { Dropdown } from './Dropdown';
import { styles } from './StatsScreen.styles';

// All unique regions across every collection, computed once at module level.
const ALL_REGION_OPTIONS: DropdownOption[] = [
  { value: ALL_REGIONS, label: 'All Regions', icon: REGION_FLAGS['All'] ?? '🌍' },
  ...Array.from(
    new Set(
      Object.values(COLLECTION_DATA)
        .flat()
        .map(d => d.region)
        .filter((r): r is string => r !== null)
    )
  )
    .sort()
    .map(r => ({ value: r, label: r, icon: REGION_FLAGS[r] ?? '🏳️' })),
];

type RegionStat = { region: string; total: number; collectedCount: number };
type CollectionStat = {
  id: string;
  label: string;
  total: number;
  collectedCount: number;
  regions: RegionStat[];
};

type Props = { onBack: () => void; selectedRegion: string; onRegionChange: (region: string) => void };

export function StatsScreen({ onBack, selectedRegion, onRegionChange }: Props) {
  const insets = useSafeAreaInsets();
  const { collected } = useCollected();

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      onBack();
      return true;
    });
    return () => sub.remove();
  }, [onBack]);

  const stats = useMemo((): CollectionStat[] => {
    return DISC_COLLECTIONS.filter(c => c.id !== 'master').map(col => {
      const allDiscs = COLLECTION_DATA[col.id] ?? [];
      const discs = selectedRegion === ALL_REGIONS
        ? allDiscs
        : allDiscs.filter(d => d.region === selectedRegion);

      const total = discs.length;
      const collectedCount = discs.filter(d => collected.has(d.id)).length;

      const regionMap = new Map<string, { total: number; collectedCount: number }>();
      for (const disc of discs) {
        const key = disc.region ?? 'No Region';
        if (!regionMap.has(key)) regionMap.set(key, { total: 0, collectedCount: 0 });
        const entry = regionMap.get(key)!;
        entry.total++;
        if (collected.has(disc.id)) entry.collectedCount++;
      }

      const regions: RegionStat[] = [...regionMap.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([region, counts]) => ({ region, ...counts }));

      return { id: col.id, label: col.label, total, collectedCount, regions };
    });
  }, [collected, selectedRegion]);

  // Only show collections that have discs in the selected region.
  const visibleStats = stats.filter(s => s.total > 0);

  const grandTotal = visibleStats.reduce((n, s) => n + s.total, 0);
  const grandCollected = visibleStats.reduce((n, s) => n + s.collectedCount, 0);
  const grandPct = grandTotal ? Math.round((grandCollected / grandTotal) * 100) : 0;

  const showRegionBreakdown = selectedRegion === ALL_REGIONS;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton} activeOpacity={0.7}>
          <Text style={styles.backArrow}>‹</Text>
          <Text style={styles.backLabel}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.heading}>STATISTICS</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.filterBar}>
        <Dropdown
          options={ALL_REGION_OPTIONS}
          selected={selectedRegion}
          onSelect={onRegionChange}
          modalTitle="Filter by Region"
        />
      </View>

      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]}>

        <View style={styles.grandTotal}>
          <Text style={styles.grandTotalLabel}>TOTAL COLLECTED</Text>
          <Text style={styles.grandTotalCount}>
            {grandCollected} / {grandTotal}
            {grandCollected === grandTotal && grandTotal > 0 ? '  🥇' : ''}
          </Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, grandCollected === grandTotal && grandTotal > 0 && styles.progressFillGold, { width: `${grandPct}%` }]} />
          </View>
          <Text style={styles.sectionPct}>{grandPct}%</Text>
        </View>

        {visibleStats.map((s, i) => {
          const pct = s.total ? Math.round((s.collectedCount / s.total) * 100) : 0;
          const complete = s.total > 0 && s.collectedCount === s.total;
          return (
            <View key={s.id}>
              {i > 0 && <View style={styles.divider} />}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>{s.label}</Text>
                <View style={styles.sectionRow}>
                  <Text style={styles.sectionCount}>
                    {s.collectedCount} / {s.total}{complete ? '  🥇' : ''}
                  </Text>
                  <Text style={styles.sectionPct}>{pct}%</Text>
                </View>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, complete && styles.progressFillGold, { width: `${pct}%` }]} />
                </View>

                {showRegionBreakdown && (
                  <View style={styles.regions}>
                    {s.regions.map(r => (
                      <View key={r.region} style={styles.regionRow}>
                        <Text style={styles.regionFlag}>
                          {REGION_FLAGS[r.region] ?? '🌐'}
                        </Text>
                        <Text style={styles.regionName}>{r.region}</Text>
                        <Text style={styles.regionCount}>{r.collectedCount} / {r.total}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}
