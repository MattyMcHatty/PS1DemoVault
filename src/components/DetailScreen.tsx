import React, { useEffect, useMemo, useState } from 'react';
import {
  BackHandler,
  Image,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CATEGORY_LABELS } from '../constants';
import { colors } from '../styles/colors';
import { Disc } from '../types';
import { styles } from './DetailScreen.styles';

type Props = {
  disc: Disc;
  onBack: () => void;
};

export function DetailScreen({ disc, onBack }: Props) {
  const insets = useSafeAreaInsets();
  const [discArtFailed, setDiscArtFailed] = useState(false);

  const discArtUrl = disc.imageUrl
    ? disc.imageUrl.replace(/-1\.jpg$/, '-2.jpg')
    : null;

  useEffect(() => {
    setDiscArtFailed(false);
  }, [disc.id]);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      onBack();
      return true;
    });
    return () => sub.remove();
  }, [onBack]);

  const grouped = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const game of disc.games) {
      if (!map.has(game.category)) map.set(game.category, []);
      map.get(game.category)!.push(game.title);
    }
    return map;
  }, [disc.games]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton} activeOpacity={0.7}>
          <Text style={styles.backArrow}>‹</Text>
          <Text style={styles.backLabel}>Back</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]}>
        <Text style={styles.title}>{disc.title}</Text>

        <View style={styles.imageContainer}>
          {disc.imageUrl ? (
            <Image source={{ uri: disc.imageUrl }} style={styles.image} resizeMode="contain" />
          ) : (
            <View style={[styles.image, styles.imagePlaceholder]} />
          )}

          {discArtUrl && !discArtFailed && (
            <Image
              source={{ uri: discArtUrl }}
              style={styles.discArtImage}
              resizeMode="contain"
              onError={() => setDiscArtFailed(true)}
            />
          )}
        </View>

        <View style={styles.games}>
          {[...grouped.entries()].map(([category, titles]) => (
            <View key={category} style={styles.categoryBlock}>
              <Text style={styles.categoryLabel}>
                {CATEGORY_LABELS[category] ?? category}
              </Text>
              {titles.map((title, i) => (
                <Text key={i} style={styles.gameTitle}>• {title}</Text>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
