import { AppHero } from '../ui/ui-layout';
import { levels } from '@/lib/levels';
import LevelsView from './levels-view';

const PlayFeature = () => (
  <div>
    <AppHero title="Play" subtitle="Choose a level to get started">
      <LevelsView levels={levels} />
    </AppHero>
  </div>
);

export default PlayFeature;
