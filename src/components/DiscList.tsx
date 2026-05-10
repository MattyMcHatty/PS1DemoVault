import React, { useRef, useMemo, useState } from 'react';
import { FlatList, ListRenderItemInfo, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ALL_REGIONS, COLLECTION_OPTIONS, REGION_OPTIONS } from '../constants';
import demos from '../data/demos.json';
import { useCollected } from '../hooks/useCollected';
import { CollectionFilter, Disc } from '../types';
import { DiscItem } from './DiscItem';
import { Dropdown } from './Dropdown';
import { styles } from './DiscList.styles';
import { colors } from '../styles/colors';

type Props = {
  onSelect: (disc: Disc) => void;
};

export function DiscList({ onSelect }: Props) {
  const insets = useSafeAreaInsets();
  const [selectedRegion, setSelectedRegion] = useState('UK');
  const [collectionFilter, setCollectionFilter] = useState<CollectionFilter>('all');
  const { collected, toggle } = useCollected();
  const listRef = useRef<FlatList<Disc>>(null);

  const scrollToTop = () => listRef.current?.scrollToOffset({ offset: 0, animated: true });

  const filtered = useMemo(() => {
    let result = demos as Disc[];
    if (selectedRegion !== ALL_REGIONS) {
      result = result.filter(d => d.region === selectedRegion || d.region === null);
    }
    if (collectionFilter === 'collected') {
      result = result.filter(d => collected.has(d.id));
    } else if (collectionFilter === 'not-collected') {
      result = result.filter(d => !collected.has(d.id));
    }
    return result;
  }, [selectedRegion, collectionFilter, collected]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <TouchableOpacity style={styles.header} onPress={scrollToTop} activeOpacity={0.7}>
        <Text style={styles.logo}>PS1</Text>
        <Text style={styles.logoSub}>DEMO VAULT</Text>
      </TouchableOpacity>
      <View style={styles.filterBar}>
        <Dropdown
          options={REGION_OPTIONS}
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
