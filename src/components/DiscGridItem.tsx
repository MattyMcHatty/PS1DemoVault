import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { REGION_FLAGS } from '../constants';
import { colors } from '../styles/colors';
import { Disc } from '../types';

type Props = {
  item: Disc;
  collected: boolean;
  onToggle: () => void;
  onPress: () => void;
};

export function DiscGridItem({ item, collected, onToggle, onPress }: Props) {
  return (
    <TouchableOpacity style={styles.cell} onPress={onPress} activeOpacity={0.85}>
      {item.imageUrls.length > 0 ? (
        <Image source={{ uri: item.imageUrls[0] }} style={styles.image} resizeMode="contain" />
      ) : (
        <View style={[styles.image, styles.imagePlaceholder]} />
      )}

      {item.region && REGION_FLAGS[item.region] && (
        <Text style={styles.flagOverlay}>{REGION_FLAGS[item.region]}</Text>
      )}

      <TouchableOpacity
        style={[styles.tickOverlay, collected && styles.tickOverlayChecked]}
        onPress={onToggle}
        activeOpacity={0.7}
        hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
      >
        {collected && <Text style={styles.checkmark}>✓</Text>}
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cell: {
    flex: 1,
    margin: 4,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: colors.border,
  },
  image: {
    width: '100%',
    aspectRatio: 1,
  },
  imagePlaceholder: {
    opacity: 0.4,
  },
  flagOverlay: {
    position: 'absolute',
    top: 6,
    left: 6,
    fontSize: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 4,
    paddingHorizontal: 3,
    paddingVertical: 1,
    overflow: 'hidden',
  },
  tickOverlay: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 26,
    height: 26,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tickOverlayChecked: {
    borderColor: colors.green,
    backgroundColor: colors.greenDark,
  },
  checkmark: {
    fontSize: 14,
    color: colors.green,
    fontWeight: '900',
    lineHeight: 18,
  },
});
