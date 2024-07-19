import PlayLevelFeature from '@/components/play-level/play-level-feature';

export default function Page({ params: { id } }: { params: { id: string } }) {
  return <PlayLevelFeature id={id} />;
}
