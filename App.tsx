import React, { useCallback, useRef, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DetailScreen } from './src/components/DetailScreen';
import { DiscList } from './src/components/DiscList';
import { SplashScreen } from './src/components/SplashScreen';
import { StatsScreen } from './src/components/StatsScreen';
import { Disc } from './src/types';

function Root({ onReady }: { onReady: () => void }) {
  const [selectedDisc, setSelectedDisc] = useState<Disc | null>(null);
  const [showStats, setShowStats] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState('UK');

  const overlay = selectedDisc
    ? <DetailScreen disc={selectedDisc} onBack={() => setSelectedDisc(null)} />
    : showStats
    ? <StatsScreen onBack={() => setShowStats(false)} selectedRegion={selectedRegion} onRegionChange={setSelectedRegion} />
    : null;

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1, display: overlay ? 'none' : 'flex' }}>
        <DiscList onSelect={setSelectedDisc} onReady={onReady} onShowStats={() => setShowStats(true)} selectedRegion={selectedRegion} onRegionChange={setSelectedRegion} />
      </View>
      {overlay}
    </View>
  );
}

export default function App() {
  const splashOpacity = useRef(new Animated.Value(1)).current;
  const [splashDone, setSplashDone] = useState(false);

  const handleReady = useCallback(() => {
    Animated.timing(splashOpacity, {
      toValue: 0,
      duration: 500,
      delay: 600,
      useNativeDriver: true,
    }).start(() => setSplashDone(true));
  }, [splashOpacity]);

  return (
    <SafeAreaProvider>
      <Root onReady={handleReady} />
      {!splashDone && (
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: splashOpacity }]} pointerEvents="none">
          <SplashScreen />
        </Animated.View>
      )}
    </SafeAreaProvider>
  );
}
