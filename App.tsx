import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Easing, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AboutScreen } from './src/components/AboutScreen';
import { DetailScreen } from './src/components/DetailScreen';
import { DiscList } from './src/components/DiscList';
import { SplashScreen } from './src/components/SplashScreen';
import { StatsScreen } from './src/components/StatsScreen';
import { Disc } from './src/types';

const SCREEN_WIDTH = Dimensions.get('window').width;

function SlideInScreen({ children, isExiting, onExited }: { children: React.ReactNode; isExiting: boolean; onExited: () => void }) {
  const translateX = useRef(new Animated.Value(SCREEN_WIDTH)).current;

  useEffect(() => {
    Animated.timing(translateX, {
      toValue: 0,
      duration: 320,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [translateX]);

  useEffect(() => {
    if (isExiting) {
      Animated.timing(translateX, {
        toValue: SCREEN_WIDTH,
        duration: 280,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start(() => onExited());
    }
  }, [isExiting, translateX, onExited]);

  return (
    <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ translateX }] }]}>
      {children}
    </Animated.View>
  );
}

function Root({ onReady }: { onReady: () => void }) {
  const [selectedDisc, setSelectedDisc] = useState<Disc | null>(null);
  const [showStats, setShowStats] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState('UK');
  const pendingClose = useRef<(() => void) | null>(null);

  const handleBack = (closeFn: () => void) => {
    pendingClose.current = closeFn;
    setIsExiting(true);
  };

  const handleExited = useCallback(() => {
    setIsExiting(false);
    pendingClose.current?.();
    pendingClose.current = null;
  }, []);

  const overlay = selectedDisc
    ? <SlideInScreen isExiting={isExiting} onExited={handleExited}><DetailScreen disc={selectedDisc} onBack={() => handleBack(() => setSelectedDisc(null))} /></SlideInScreen>
    : showStats
    ? <SlideInScreen isExiting={isExiting} onExited={handleExited}><StatsScreen onBack={() => handleBack(() => setShowStats(false))} selectedRegion={selectedRegion} onRegionChange={setSelectedRegion} /></SlideInScreen>
    : showAbout
    ? <SlideInScreen isExiting={isExiting} onExited={handleExited}><AboutScreen onBack={() => handleBack(() => setShowAbout(false))} /></SlideInScreen>
    : null;

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <DiscList onSelect={setSelectedDisc} onReady={onReady} onShowStats={() => setShowStats(true)} onShowAbout={() => setShowAbout(true)} selectedRegion={selectedRegion} onRegionChange={setSelectedRegion} />
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
