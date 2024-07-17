import PlayLevelFeature from '@/components/play-level';

export default function Page({ params: { id } }: { params: { id: string } }) {
  return <PlayLevelFeature id={id} />;
}
