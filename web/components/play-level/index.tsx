'use client';
import ContextProvider from './context/provider';
import PlayLevelFeature from './play-level-feature';

const PlayLevelFeatureIndex = ({ id }: { id: string }) => (
  <ContextProvider>
    <PlayLevelFeature id={id} />
  </ContextProvider>
);

export default PlayLevelFeatureIndex;
