import MintFeature from '@/components/mint/mint-feature';

export default function Page({
  searchParams,
}: {
  searchParams: { solution: string };
}) {
  return <MintFeature searchParams={searchParams} />;
}
