import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { DISC_COLLECTIONS } from '../constants';
import { colors } from '../styles/colors';
import { DiscCollection } from '../types';

const DRAWER_WIDTH = 270;

type Props = {
  visible: boolean;
  activeCollection: string;
  onSelect: (collection: DiscCollection) => void;
  onShowStats: () => void;
  onClose: () => void;
};

export function MenuDrawer({ visible, activeCollection, onSelect, onShowStats, onClose }: Props) {
  const [modalVisible, setModalVisible] = useState(false);
  const translateX = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      translateX.setValue(-DRAWER_WIDTH);
      backdropOpacity.setValue(0);
      setModalVisible(true);
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: 0,
          duration: 280,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0.5,
          duration: 280,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: -DRAWER_WIDTH,
          duration: 220,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 220,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start(() => setModalVisible(false));
    }
  }, [visible, translateX, backdropOpacity]);

  return (
    <Modal visible={modalVisible} transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.root}>
        <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, { opacity: backdropOpacity }]} />
        <View style={styles.row}>
          <Animated.View style={[styles.drawer, { transform: [{ translateX }] }]}>
            <Text style={styles.heading}>COLLECTIONS</Text>
            <View style={styles.divider} />

            {DISC_COLLECTIONS.map(collection => {
              const isActive = collection.id === activeCollection;
              return (
                <View key={collection.id}>
                  {collection.id === 'master' && <View style={styles.divider} />}
                  <TouchableOpacity
                    style={[styles.item, isActive && styles.itemActive]}
                    onPress={() => { onSelect(collection); onClose(); }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.itemIcon}>📀</Text>
                    <Text style={[styles.itemLabel, isActive && styles.itemLabelActive]}>
                      {collection.label}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })}

            <View style={styles.divider} />
            <TouchableOpacity
              style={styles.item}
              onPress={() => { onShowStats(); onClose(); }}
              activeOpacity={0.7}
            >
              <Text style={styles.itemIcon}>📊</Text>
              <Text style={styles.itemLabel}>Statistics</Text>
            </TouchableOpacity>
          </Animated.View>
          <TouchableOpacity style={styles.closeArea} onPress={onClose} activeOpacity={1} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  backdrop: {
    backgroundColor: '#000',
  },
  row: {
    flex: 1,
    flexDirection: 'row',
  },
  closeArea: {
    flex: 1,
  },
  drawer: {
    width: DRAWER_WIDTH,
    height: '100%',
    backgroundColor: colors.surface,
    borderRightWidth: 1,
    borderRightColor: colors.border,
    paddingTop: 56,
    paddingHorizontal: 16,
  },
  heading: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 3,
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: 8,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  itemActive: {
    backgroundColor: colors.accent + '22',
    borderLeftWidth: 3,
    borderLeftColor: colors.accent,
    paddingLeft: 5,
  },
  itemIcon: {
    fontSize: 16,
  },
  itemLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSubdued,
    flexShrink: 1,
  },
  itemLabelActive: {
    color: colors.text,
    fontWeight: '700',
  },
});
