import React, { useState } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DetailScreen } from './src/components/DetailScreen';
import { DiscList } from './src/components/DiscList';
import { Disc } from './src/types';

function Root() {
  const [selectedDisc, setSelectedDisc] = useState<Disc | null>(null);

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1, display: selectedDisc ? 'none' : 'flex' }}>
        <DiscList onSelect={setSelectedDisc} />
      </View>
      {selectedDisc && (
        <DetailScreen disc={selectedDisc} onBack={() => setSelectedDisc(null)} />
      )}
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <Root />
    </SafeAreaProvider>
  );
}
