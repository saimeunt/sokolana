import { NextRequest, NextResponse } from 'next/server';

export const GET = (request: NextRequest) => {
  const id = request.nextUrl.searchParams.get('id') as string;
  //const level = request.nextUrl.searchParams.get('level') as string;
  const solution = request.nextUrl.searchParams.get('solution') as string;
  const solutionUrl = new URL(
    `/api/solutions?id=${id}&solution=${solution}&zoom=10`,
    'http://localhost:3000'
  );
  /*const solutionUrl = new URL(
    `/api/solutions?id=${id}&level=${encodeURIComponent(
      level
    )}&solution=${solution}`,
    // 'http://localhost:3000'
    'https://amusing-blessed-duckling.ngrok-free.app'
  );*/
  return NextResponse.json({
    name: `Solution for level ${id}`,
    symbol: `LVL-${id}`,
    description: `Solution for level ${id}: ${solution}`,
    image: solutionUrl.href,
  });
};
