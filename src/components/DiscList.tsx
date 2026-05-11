import React, { useRef, useMemo, useState, useEffect } from 'react';
import { FlatList, Image, ListRenderItemInfo, StatusBar, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ALL_REGIONS, COLLECTION_OPTIONS, DISC_COLLECTIONS, NULL_REGION, REGION_FLAGS } from '../constants';
import demos from '../data/demos.json';
import opmSpecials from '../data/opm-specials.json';
import essential from '../data/essential.json';
import demo1 from '../data/demo1.json';
import registered from '../data/registered.json';
import station from '../data/station.json';
import samplers from '../data/samplers.json';
import dedicated from '../data/dedicated.json';
import { useCollected } from '../hooks/useCollected';
import { CollectionFilter, Disc, DiscCollection } from '../types';
import { DiscGridItem } from './DiscGridItem';
import { DiscItem } from './DiscItem';
import { Dropdown } from './Dropdown';
import { MenuDrawer } from './MenuDrawer';
import { styles } from './DiscList.styles';
import { colors } from '../styles/colors';

const EUROPEAN_REGIONS = new Set([
  'Benelux', 'Denmark', 'Finland', 'France', 'Germany',
  'Ireland', 'Italy', 'Poland', 'Spain', 'UK',
]);

const COLLECTION_DATA: Record<string, Disc[]> = {
  'opm':          demos as Disc[],
  'opm-specials': opmSpecials as Disc[],
  'essential':    essential as Disc[],
  'demo1':        demo1 as Disc[],
  'registered':   registered as Disc[],
  'station':      station as Disc[],
  'samplers':     samplers as Disc[],
  'dedicated':    dedicated as Disc[],
};

// Master list: all collections merged with offset IDs to avoid collisions.
// Each collection gets a block of 100 000 IDs (colIndex * 100000 + original id).
const MASTER_DATA: Disc[] = Object.values(COLLECTION_DATA).flatMap(
  (discs, i) => discs.map(d => ({ ...d, id: (i + 1) * 100000 + d.id }))
);

type SearchDisc = Disc & { collectionLabel: string };
const SEARCH_DATA: SearchDisc[] = Object.entries(COLLECTION_DATA).flatMap(
  ([colId, discs]) => {
    const label = DISC_COLLECTIONS.find(c => c.id === colId)?.label ?? colId;
    return discs.map(d => ({ ...d, collectionLabel: label }));
  }
);

type Props = {
  onSelect: (disc: Disc) => void;
  onReady: () => void;
  onShowStats: () => void;
  selectedRegion: string;
  onRegionChange: (region: string) => void;
};

export function DiscList({ onSelect, onReady, onShowStats, selectedRegion, onRegionChange }: Props) {
  const insets = useSafeAreaInsets();
  const [activeCollection, setActiveCollection] = useState<DiscCollection>(DISC_COLLECTIONS[0]);
  const [collectionFilter, setCollectionFilter] = useState<CollectionFilter>('all');
  const [menuOpen, setMenuOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [reversed, setReversed] = useState(false);
  const { collected, toggle, ready } = useCollected();

  useEffect(() => {
    if (ready) onReady();
  }, [ready, onReady]);
  const listRef = useRef<FlatList<Disc>>(null);

  const scrollToTop = () => listRef.current?.scrollToOffset({ offset: 0, animated: true });

  const activeData = activeCollection.id === 'master'
    ? MASTER_DATA
    : COLLECTION_DATA[activeCollection.id] ?? (demos as Disc[]);

  const regionOptions = useMemo(() => {
    const hasNullRegion = activeData.some(d => d.region === null);
    const regions = [ALL_REGIONS, ...Array.from(
      new Set(activeData.map(d => d.region).filter((r): r is string => r !== null))
    ).sort()];
    const options = regions.map(r => ({ value: r, label: r, icon: REGION_FLAGS[r] ?? '🏳️' }));
    if (hasNullRegion) options.push({ value: NULL_REGION, label: 'No Region', icon: '🌐' });
    return options;
  }, [activeData]);

  const filtered = useMemo(() => {
    let result = activeData;
    if (selectedRegion === NULL_REGION) {
      result = result.filter(d => d.region === null);
    } else if (selectedRegion !== ALL_REGIONS) {
      if (EUROPEAN_REGIONS.has(selectedRegion)) {
        result = result.filter(d => d.region === selectedRegion || d.region === 'Europe');
      } else {
        result = result.filter(d => d.region === selectedRegion);
      }
    }
    if (collectionFilter === 'collected') {
      result = result.filter(d => collected.has(d.id));
    } else if (collectionFilter === 'not-collected') {
      result = result.filter(d => !collected.has(d.id));
    }
    return reversed ? [...result].reverse() : result;
  }, [activeData, selectedRegion, collectionFilter, collected, reversed]);

  const stats = useMemo(() => {
    let base = activeData;
    if (selectedRegion === NULL_REGION) {
      base = base.filter(d => d.region === null);
    } else if (selectedRegion !== ALL_REGIONS) {
      base = EUROPEAN_REGIONS.has(selectedRegion)
        ? base.filter(d => d.region === selectedRegion || d.region === 'Europe')
        : base.filter(d => d.region === selectedRegion);
    }
    return { total: base.length, collectedCount: base.filter(d => collected.has(d.id)).length };
  }, [activeData, selectedRegion, collected]);

  const searchResults = useMemo((): SearchDisc[] => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return SEARCH_DATA.filter(d => d.title.toLowerCase().includes(q));
  }, [searchQuery]);

  const handleCollectionSelect = (collection: DiscCollection) => {
    const newData = collection.id === 'master'
      ? MASTER_DATA
      : COLLECTION_DATA[collection.id] ?? (demos as Disc[]);
    const regionExists = selectedRegion === ALL_REGIONS ||
      newData.some(d => d.region === selectedRegion);
    if (!regionExists) onRegionChange(ALL_REGIONS);
    setActiveCollection(collection);
    scrollToTop();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuButton} onPress={() => setMenuOpen(true)} activeOpacity={0.7}>
          <View style={styles.hamburgerLine} />
          <View style={styles.hamburgerLine} />
          <View style={styles.hamburgerLine} />
        </TouchableOpacity>
        <TouchableOpacity onPress={scrollToTop} activeOpacity={0.7} style={styles.logoWrap}>
          <Text style={styles.logo}>PS1</Text>
          <Text style={styles.logoSub}>DEMO VAULT</Text>
        </TouchableOpacity>
        <View style={styles.headerRight}>
          <TouchableOpacity
            onPress={() => { setSearchOpen(s => !s); setSearchQuery(''); }}
            activeOpacity={0.7}
            style={styles.iconButton}
          >
            <Text style={[styles.searchIconText, searchOpen && styles.searchIconActive]}>⌕</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => setViewMode(m => m === 'list' ? 'grid' : 'list')}
            activeOpacity={0.7}
          >
            {viewMode === 'list' ? (
              <View style={styles.gridIcon}>
                <View style={styles.gridIconRow}>
                  <View style={styles.gridDot} /><View style={styles.gridDot} />
                </View>
                <View style={styles.gridIconRow}>
                  <View style={styles.gridDot} /><View style={styles.gridDot} />
                </View>
              </View>
            ) : (
              <View style={{ gap: 5, width: 20, alignSelf: 'center' }}>
                <View style={styles.hamburgerLine} />
                <View style={styles.hamburgerLine} />
                <View style={styles.hamburgerLine} />
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
      {searchOpen && (
        <View style={styles.searchBar}>
          <TextInput
            autoFocus
            style={styles.searchInput}
            placeholder="Search discs..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity style={styles.searchClose} onPress={() => { setSearchOpen(false); setSearchQuery(''); }} activeOpacity={0.7}>
            <Text style={styles.searchCloseText}>✕</Text>
          </TouchableOpacity>
        </View>
      )}
      <MenuDrawer
        visible={menuOpen}
        activeCollection={activeCollection.id}
        onSelect={handleCollectionSelect}
        onShowStats={() => { onShowStats(); setMenuOpen(false); }}
        onClose={() => setMenuOpen(false)}
      />
      <View style={styles.contentArea}>
        <View style={styles.filterBar}>
          <Dropdown
            options={regionOptions}
            selected={selectedRegion}
            onSelect={onRegionChange}
            modalTitle="Filter by Region"
          />
          <Dropdown
            options={COLLECTION_OPTIONS}
            selected={collectionFilter}
            onSelect={v => setCollectionFilter(v as CollectionFilter)}
            modalTitle="Filter by Collection"
          />
          <TouchableOpacity
            style={[styles.reverseButton, reversed && styles.reverseButtonActive]}
            onPress={() => setReversed(r => !r)}
            activeOpacity={0.7}
          >
            <Text style={[styles.reverseButtonText, reversed && styles.reverseButtonTextActive]}>
              {reversed ? '↓' : '↑'}
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.statsBar}>
          <Text style={styles.statsText}>
            {stats.collectedCount} / {stats.total} collected
            {stats.total > 0 && stats.collectedCount === stats.total ? '  🥇' : ''}
          </Text>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                stats.total > 0 && stats.collectedCount === stats.total && styles.progressFillGold,
                { width: `${stats.total ? (stats.collectedCount / stats.total) * 100 : 0}%` },
              ]}
            />
          </View>
        </View>
        <FlatList
          key={viewMode}
          ref={listRef}
          data={filtered}
          numColumns={viewMode === 'grid' ? 2 : 1}
          keyExtractor={(item: Disc) => String(item.id)}
          renderItem={({ item }: ListRenderItemInfo<Disc>) =>
            viewMode === 'grid' ? (
              <DiscGridItem
                item={item}
                collected={collected.has(item.id)}
                onToggle={() => toggle(item.id)}
                onPress={() => onSelect(item)}
              />
            ) : (
              <DiscItem
                item={item}
                collected={collected.has(item.id)}
                onToggle={() => toggle(item.id)}
                onImagePress={() => onSelect(item)}
              />
            )
          }
          columnWrapperStyle={viewMode === 'grid' ? styles.gridRow : undefined}
          contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 16 }]}
          ItemSeparatorComponent={viewMode === 'list' ? () => <View style={styles.separator} /> : undefined}
        />

        {searchOpen && (
          <View style={styles.searchOverlay}>
            {searchQuery.trim() ? (
              <FlatList
                data={searchResults}
                keyExtractor={item => `${item.collectionLabel}-${item.id}`}
                renderItem={({ item }: ListRenderItemInfo<SearchDisc>) => (
                  <TouchableOpacity
                    style={styles.searchResultItem}
                    onPress={() => { onSelect(item); setSearchOpen(false); setSearchQuery(''); }}
                    activeOpacity={0.7}
                  >
                    {item.imageUrls.length > 0 ? (
                      <Image source={{ uri: item.imageUrls[0] }} style={styles.searchResultImage} resizeMode="contain" />
                    ) : (
                      <View style={[styles.searchResultImage, styles.searchResultImageEmpty]} />
                    )}
                    <View style={styles.searchResultText}>
                      <Text style={styles.searchResultTitle} numberOfLines={2}>{item.title}</Text>
                      <Text style={styles.searchResultMeta}>
                        {item.collectionLabel}{item.region ? `  ·  ${REGION_FLAGS[item.region] ?? ''}  ${item.region}` : ''}
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
                keyboardShouldPersistTaps="handled"
              />
            ) : (
              <Text style={styles.searchPrompt}>Type a disc title to search all collections</Text>
            )}
          </View>
        )}
      </View>
    </View>
  );
}
