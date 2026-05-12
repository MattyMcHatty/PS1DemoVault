import React, { useEffect } from 'react';
import { BackHandler, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../styles/colors';

type Props = { onBack: () => void };

export function AboutScreen({ onBack }: Props) {
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      onBack();
      return true;
    });
    return () => sub.remove();
  }, [onBack]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton} activeOpacity={0.7}>
          <Text style={styles.backArrow}>‹</Text>
          <Text style={styles.backLabel}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.heading}>ABOUT</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 32 }]}>
        <Text style={styles.appName}>PS1 Demo Vault</Text>
        <Text style={styles.tagline}>The complete PlayStation 1 demo disc catalogue</Text>

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>WHAT IS THIS?</Text>
        <Text style={styles.body}>
          PS1 Demo Vault is a catalogue and collection tracker for PlayStation 1 demo discs. It covers official magazine cover discs, retailer samplers, registered user discs, and more — spanning releases from across Europe, the UK, Australia, and beyond.
        </Text>

        <Text style={styles.sectionTitle}>WHY DOES IT EXIST?</Text>
        <Text style={styles.body}>
          Demo discs from the original PlayStation era are a forgotten corner of gaming history. They were bundled with magazines, given away at events, and mailed to registered console owners — each one a snapshot of what was coming to the platform. PS1 Demo Vault exists to document them, preserve knowledge of their existence, and give collectors a way to track what they own.
        </Text>

        <Text style={styles.sectionTitle}>HOW TO USE IT</Text>
        <Text style={styles.body}>
          Browse any collection using the menu, filter by region, and tap a disc to see its full contents. Tap the checkbox next to any disc — or tap its title — to mark it as collected. Your collection is saved locally on your device.
        </Text>

        <Text style={styles.sectionTitle}>COLLECTIONS</Text>
        <Text style={styles.body}>
          {'• Official PlayStation Magazine (OPM) — monthly cover discs\n'}
          {'• OPM Specials — themed and bonus OPM releases\n'}
          {'• Essential PlayStation — budget label demo discs\n'}
          {'• Demo One — the disc bundled with the original console\n'}
          {'• Registered Users Demo — sent to registered PS1 owners\n'}
          {'• Station Magazine — European gaming magazine discs\n'}
          {'• Other Samplers — retailer and promotional discs\n'}
          {'• Dedicated Demos — standalone single-game demo releases'}
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    width: 70,
  },
  backArrow: {
    fontSize: 28,
    color: colors.accent,
    lineHeight: 32,
    fontWeight: '300',
  },
  backLabel: {
    fontSize: 16,
    color: colors.accent,
    fontWeight: '500',
  },
  heading: {
    flex: 1,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 3,
  },
  headerSpacer: {
    width: 70,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 28,
    gap: 12,
  },
  appName: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.text,
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 8,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 3,
    marginTop: 16,
    marginBottom: 6,
  },
  body: {
    fontSize: 14,
    color: colors.textSubdued,
    lineHeight: 22,
  },
});
