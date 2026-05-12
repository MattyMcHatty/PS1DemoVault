import React from 'react';
import { Image, Pressable, Text, TouchableOpacity, View } from 'react-native';
import { REGION_FLAGS } from '../constants';
import { Disc } from '../types';
import { Checkbox } from './Checkbox';
import { styles } from './DiscItem.styles';

type Props = {
  item: Disc;
  collected: boolean;
  onToggle: () => void;
  onImagePress: () => void;
};

export function DiscItem({ item, collected, onToggle, onImagePress }: Props) {
  return (
    <View style={styles.row}>
      <Checkbox checked={collected} onPress={onToggle} />
      <Pressable style={styles.titleWrap} onPress={onToggle}>
        <Text style={[styles.title, collected && styles.titleCollected]} numberOfLines={3}>
          {item.title}
        </Text>
      </Pressable>
      <TouchableOpacity onPress={onImagePress} activeOpacity={0.8}>
        {item.imageUrls.length > 0 ? (
          <Image source={{ uri: item.imageUrls[0] }} style={styles.image} resizeMode="contain" />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]} />
        )}
        {item.region && REGION_FLAGS[item.region] && (
          <Text style={styles.flagOverlay}>{REGION_FLAGS[item.region]}</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
