import React, { useCallback, useRef, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DetailScreen } from './src/components/DetailScreen';
import { DiscList } from './src/components/DiscList';
import { SplashScreen } from './src/components/SplashScreen';
import { Disc } from './src/types';

function Root({ onReady }: { onReady: () => void }) {
  const [selectedDisc, setSelectedDisc] = useState<Disc | null>(null);

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1, display: selectedDisc ? 'none' : 'flex' }}>
        <DiscList onSelect={setSelectedDisc} onReady={onReady} />
      </View>
      {selectedDisc && (
        <DetailScreen disc={selectedDisc} onBack={() => setSelectedDisc(null)} />
      )}
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
