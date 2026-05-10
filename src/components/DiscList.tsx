import React, { useRef, useMemo, useState, useEffect } from 'react';
import { FlatList, ListRenderItemInfo, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ALL_REGIONS, COLLECTION_OPTIONS, DISC_COLLECTIONS, REGION_FLAGS } from '../constants';
import demos from '../data/demos.json';
import opmSpecials from '../data/opm-specials.json';
import { useCollected } from '../hooks/useCollected';
import { CollectionFilter, Disc, DiscCollection } from '../types';
import { DiscItem } from './DiscItem';
import { Dropdown } from './Dropdown';
import { MenuDrawer } from './MenuDrawer';
import { styles } from './DiscList.styles';
import { colors } from '../styles/colors';

const COLLECTION_DATA: Record<string, Disc[]> = {
  'opm':          demos as Disc[],
  'opm-specials': opmSpecials as Disc[],
};

type Props = {
  onSelect: (disc: Disc) => void;
  onReady: () => void;
};

export function DiscList({ onSelect, onReady }: Props) {
  const insets = useSafeAreaInsets();
  const [activeCollection, setActiveCollection] = useState<DiscCollection>(DISC_COLLECTIONS[0]);
  const [selectedRegion, setSelectedRegion] = useState('UK');
  const [collectionFilter, setCollectionFilter] = useState<CollectionFilter>('all');
  const [menuOpen, setMenuOpen] = useState(false);
  const { collected, toggle, ready } = useCollected();

  useEffect(() => {
    if (ready) onReady();
  }, [ready, onReady]);
  const listRef = useRef<FlatList<Disc>>(null);

  const scrollToTop = () => listRef.current?.scrollToOffset({ offset: 0, animated: true });

  const activeData = COLLECTION_DATA[activeCollection.id] ?? (demos as Disc[]);

  const regionOptions = useMemo(() => {
    const regions = [ALL_REGIONS, ...Array.from(
      new Set(activeData.map(d => d.region).filter((r): r is string => r !== null))
    ).sort()];
    return regions.map(r => ({ value: r, label: r, icon: REGION_FLAGS[r] ?? '🏳️' }));
  }, [activeData]);

  const filtered = useMemo(() => {
    let result = activeData;
    if (selectedRegion !== ALL_REGIONS) {
      result = result.filter(d => d.region === selectedRegion || d.region === null);
    }
    if (collectionFilter === 'collected') {
      result = result.filter(d => collected.has(d.id));
    } else if (collectionFilter === 'not-collected') {
      result = result.filter(d => !collected.has(d.id));
    }
    return result;
  }, [activeData, selectedRegion, collectionFilter, collected]);

  const handleCollectionSelect = (collection: DiscCollection) => {
    const newData = COLLECTION_DATA[collection.id] ?? (demos as Disc[]);
    const regionExists = selectedRegion === ALL_REGIONS ||
      newData.some(d => d.region === selectedRegion);
    if (!regionExists) setSelectedRegion(ALL_REGIONS);
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
        <View style={styles.menuButton} />
      </View>
      <MenuDrawer
        visible={menuOpen}
        activeCollection={activeCollection.id}
        onSelect={handleCollectionSelect}
        onClose={() => setMenuOpen(false)}
      />
      <View style={styles.filterBar}>
        <Dropdown
          options={regionOptions}
          selected={selectedRegion}
          onSelect={setSelectedRegion}
          modalTitle="Filter by Region"
        />
        <Dropdown
          options={COLLECTION_OPTIONS}
          selected={collectionFilter}
          onSelect={v => setCollectionFilter(v as CollectionFilter)}
          modalTitle="Filter by Collection"
        />
      </View>
      <FlatList
        ref={listRef}
        data={filtered}
        keyExtractor={(item: Disc) => String(item.id)}
        renderItem={({ item }: ListRenderItemInfo<Disc>) => (
          <DiscItem
            item={item}
            collected={collected.has(item.id)}
            onToggle={() => toggle(item.id)}
            onImagePress={() => onSelect(item)}
          />
        )}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 16 }]}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
}
