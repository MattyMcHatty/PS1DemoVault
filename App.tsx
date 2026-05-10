import React, { useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DetailScreen } from './src/components/DetailScreen';
import { DiscList } from './src/components/DiscList';
import { Disc } from './src/types';

function Root() {
  const [selectedDisc, setSelectedDisc] = useState<Disc | null>(null);

  if (selectedDisc) {
    return <DetailScreen disc={selectedDisc} onBack={() => setSelectedDisc(null)} />;
  }
  return <DiscList onSelect={setSelectedDisc} />;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <Root />
    </SafeAreaProvider>
  );
}
