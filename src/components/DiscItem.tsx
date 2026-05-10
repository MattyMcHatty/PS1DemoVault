import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
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
      <Text style={[styles.title, collected && styles.titleCollected]} numberOfLines={3}>
        {item.title}
      </Text>
      <TouchableOpacity onPress={onImagePress} activeOpacity={0.8}>
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.image} resizeMode="contain" />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]} />
        )}
      </TouchableOpacity>
    </View>
  );
}
