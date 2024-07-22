import { NextRequest, NextResponse } from 'next/server';
import { Input, Cells } from '@/lib/types';
import { AnchorProvider, Wallet } from '@coral-xyz/anchor';
import { Connection, Keypair } from '@solana/web3.js';
import { getMinterProgram } from '@sokolana/anchor';
import {
  getFloorPositions,
  getWallsPositions,
  duration,
  playerPositions,
  boxPositions,
  keyTimes,
} from '@/components/ui/level-svg';
import {
  LevelState,
  loadLevel,
  getCellsPositions,
  accountToLevelData,
} from '@/components/context/level-state';
import { levels } from '@/lib/levels';

const levelSvg = ({
  level,
  zoom = 10,
  solution = [],
}: {
  level: LevelState;
  zoom?: number;
  solution?: Input[];
}) => `
<svg
  width="${level.width * 5 * zoom}"
  height="${level.height * 5 * zoom}"
  viewBox="0 0 ${level.width * 5} ${level.height * 5}"
  xmlns="http://www.w3.org/2000/svg"
>
  <defs>
    <g id="floor">
      <rect width="5" height="5" fill="#377390" />
      <rect width="2" height="1" x="2" y="2" fill="#4085A5" />
      <rect width="2" height="1" x="1" y="3" fill="#4085A5" />
    </g>
    <g id="plain-wall">
      <rect width="5" height="5" fill="#222222" />
    </g>
    <g id="wall">
      <rect width="5" height="2" fill="#222222" />
      <rect width="5" height="3" y="2" fill="#333333" />
    </g>
    <g id="player">
      <rect width="3" height="1" x="1" fill="#303030" />
      <rect width="1" height="1" x="1" y="1" fill="lightgreen" />
      <rect width="1" height="1" x="2" y="1" fill="darkgreen" />
      <rect width="1" height="1" x="3" y="1" fill="lightgreen" />
      <rect width="1" height="1" y="2" fill="#454545" />
      <rect width="3" height="1" x="1" y="2" fill="#303030" />
      <rect width="1" height="1" x="4" y="2" fill="#454545" />
      <rect width="1" height="1" y="3" fill="#303030" />
      <rect width="3" height="1" x="1" y="3" fill="#202020" />
      <rect width="1" height="1" x="4" y="3" fill="#303030" />
      <rect width="1" height="1" x="1" y="4" fill="303030" />
      <rect width="1" height="1" x="3" y="4" fill="303030" />
    </g>
    <g id="box">
      <rect width="5" height="2" fill="#B67D28" />
      <rect width="1" height="2" x="2" fill="#A17028" />
      <rect width="5" height="3" y="2" fill="#CB9A45" />
      <rect width="1" height="1" x="2" y="2" fill="#B67D28" />
    </g>
    <g id="box-on-goal">
      <rect width="5" height="2" fill="chartreuse" />
      <rect width="1" height="2" x="2" fill="limegreen" />
      <rect width="5" height="3" y="2" fill="greenyellow" />
      <rect width="1" height="1" x="2" y="2" fill="chartreuse" />
    </g>
    <g id="goal">
      <rect width="5" height="5" fill="#377390" />
      <rect width="3" height="3" x="1" y="1" fill="darkgreen" />
      <rect width="1" height="1" x="2" y="2" fill="chartreuse" />
    </g>
  </defs>
  ${getFloorPositions(level)
    .map(
      ({ x, y }) =>
        `<use key="floor-${x}-${y}" href="#floor" x="${x * 5}" y="${y * 5}" />`
    )
    .join('')}
  ${getWallsPositions(level)
    .plainWallsPositions.map(
      ({ x, y }) =>
        `<use
        key="plain-wall-${x}-${y}"
        href="#plain-wall"
        x="${x * 5}"
        y="${y * 5}"
      />`
    )
    .join('')}
    ${getWallsPositions(level).wallsPositions.map(
      ({ x, y }) =>
        `<use key="wall-${x}-${y}" href="#wall" x="${x * 5}" y="${y * 5}" />`
    )}
    ${getCellsPositions(level, Cells.GOAL).map(
      ({ x, y }) =>
        `<use key="goal-${x}-${y}" href="#goal" x="${x * 5}" y="${y * 5}" />`
    )}
    ${getCellsPositions(level, Cells.PLAYER)
      .map(
        ({ x, y }) =>
          `<use key="player-${x}-${y}" href="#player" x="${x * 5}" y="${y * 5}">
        ${
          solution.length > 0
            ? `<animate
                attributeName="x"
                dur="${duration(solution)}"
                repeatCount="indefinite"
                values="${playerPositions({ x, y }, solution)
                  .map(({ x }) => x * 5)
                  .join(';')}"
                keyTimes="${keyTimes(solution)}"
              />
              <animate
                attributeName="y"
                dur="${duration(solution)}"
                repeatCount="indefinite"
                values="${playerPositions({ x, y }, solution)
                  .map(({ y }) => y * 5)
                  .join(';')}"
                keyTimes="${keyTimes(solution)}"
              />`
            : ''
        }
      </use>`
      )
      .join('')}
    ${getCellsPositions(level, Cells.BOX)
      .map(
        ({ x, y }) =>
          `<use key="box-${x}-${y}" href="#box" x="${x * 5}" y="${y * 5}">
        ${
          solution.length > 0
            ? `<animate
                attributeName="x"
                dur="${duration(solution)}"
                repeatCount="indefinite"
                values="${boxPositions({ x, y }, level, solution)
                  .map(({ x }) => x * 5)
                  .join(';')}"
                keyTimes="${keyTimes(solution)}"
              />
              <animate
                attributeName="y"
                dur="${duration(solution)}"
                repeatCount="indefinite"
                values="${boxPositions({ x, y }, level, solution)
                  .map(({ y }) => y * 5)
                  .join(';')}"
                keyTimes="${keyTimes(solution)}"
              />`
            : ''
        }
      </use>`
      )
      .join('')}
</svg>
`;

export const GET = async (request: NextRequest) => {
  const id = request.nextUrl.searchParams.get('id') as string;
  const connection = new Connection('http://localhost:8899');
  const provider = new AnchorProvider(
    connection,
    new Wallet(Keypair.generate()),
    {
      commitment: 'confirmed',
    }
  );
  const program = getMinterProgram(provider);
  const nftAccounts = await program.account.nftAccount.all();
  const nftAccount = nftAccounts.find(
    ({ account }) => account.id === Number(id)
  );
  const levelData = nftAccount
    ? accountToLevelData(nftAccount.account)
    : levels[Number(id) - 1];
  const solution = request.nextUrl.searchParams.get('solution') as string;
  const zoom = request.nextUrl.searchParams.get('zoom');
  const svg = levelSvg({
    level: loadLevel(id, levelData),
    zoom: Number(zoom || '10'),
    solution: solution.split('') as Input[],
  });
  return new NextResponse(svg, {
    headers: { 'Content-Type': 'image/svg+xml' },
  });
};
