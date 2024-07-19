'use client';
import { useEffect } from 'react';
import { AppHero } from '../ui/ui-layout';
import { levels } from '@/lib/levels';
import LevelsView from './levels-view';
import useContext from '@/components/context/hook';

const PlayFeature = () => {
  const { loadLevel } = useContext();
  useEffect(() => {
    loadLevel(levels[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div>
      <AppHero title="Play" subtitle="Choose a level to get started">
        <LevelsView levels={levels} />
      </AppHero>
    </div>
  );
};

export default PlayFeature;
