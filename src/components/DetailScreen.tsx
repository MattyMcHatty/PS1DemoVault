import React, { useEffect, useMemo } from 'react';
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
        <Text style={styles.productCode}>{disc.productCode}</Text>

        <View style={styles.imageContainer}>
          {disc.imageUrls.length > 0 ? (
            disc.imageUrls.map((url, i) => (
              <Image key={i} source={{ uri: url }} style={styles.image} resizeMode="contain" />
            ))
          ) : (
            <View style={[styles.image, styles.imagePlaceholder]} />
          )}
        </View>

        {disc.coupledGame ? (
          <View style={styles.coupledBlock}>
            <Text style={styles.coupledLabel}>COUPLED WITH</Text>
            <Text style={styles.coupledGame}>{disc.coupledGame}</Text>
          </View>
        ) : null}

        {disc.notes ? (
          <View style={styles.notesBlock}>
            <Text style={styles.notesLabel}>NOTES</Text>
            <Text style={styles.notesText}>{disc.notes}</Text>
          </View>
        ) : null}

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
