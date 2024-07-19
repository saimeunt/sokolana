'use client';
import Link from 'next/link';
import { useRef, useState } from 'react';
import { useLocalStorage, useEventListener, useIsClient } from 'usehooks-ts';
import LevelSvg from '../ui/level-svg';
import { AppHero } from '../ui/ui-layout';
import {
  loadLevel,
  isTestable,
  isMintable,
} from '@/components/context/level-state';
import { MintUiModal } from './mint-ui';
import { defaultEditorLevel } from '@/lib/levels';
import { Input } from '@/lib/types';

export default function MintFeature({
  searchParams,
}: {
  searchParams: { solution: string };
}) {
  const [solution, setSolution] = useState<Input[]>(
    searchParams.solution ? (searchParams.solution.split('') as Input[]) : []
  );
  const [showModal, setShowModal] = useState(false);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const [levelData, setLevelData] = useLocalStorage(
    'editor-level',
    defaultEditorLevel
  );
  useEventListener(
    'keypress',
    (event) => {
      if (![' ', '#', '@', '+', '$', '*', '.', 'Enter'].includes(event.key)) {
        event.preventDefault();
      }
    },
    textAreaRef
  );
  const isClient = useIsClient();
  if (!isClient) {
    return null;
  }
  const level = loadLevel(levelData);
  return (
    <div>
      <AppHero title="Mint" subtitle="Mint your own Sokolana levels">
        <div className="flex flex-col items-center space-y-4">
          <LevelSvg level={level} zoom={4} solution={solution} />
          <textarea
            ref={textAreaRef}
            className="font-mono"
            rows={8}
            onChange={(event) => {
              setLevelData(event.target.value);
              setSolution([]);
            }}
            value={levelData}
          />
          <div className="space-x-6">
            <Link href="/play/editor">
              <button
                className="btn btn-secondary"
                disabled={!isTestable(level)}
              >
                Test
              </button>
            </Link>
            <button
              className="btn btn-primary"
              onClick={() => setShowModal(true)}
              disabled={!isMintable(level, solution)}
            >
              Mint
            </button>
          </div>
          <div className="flex justify-center space-x-4">
            <div className="text-left">
              <p>
                <strong className="font-extrabold font-mono pr-4">SPACE</strong>
                <span className="text-white">FLOOR</span>
              </p>
              <p>
                <strong className="font-extrabold font-mono pr-4">
                  #&nbsp;&nbsp;&nbsp;&nbsp;
                </strong>
                <span className="text-black">WALL</span>
              </p>
              <p>
                <strong className="font-extrabold font-mono pr-4">
                  @&nbsp;&nbsp;&nbsp;&nbsp;
                </strong>
                <span className="text-red-500">PLAYER</span>
              </p>
              <p>
                <strong className="font-extrabold font-mono pr-4">
                  +&nbsp;&nbsp;&nbsp;&nbsp;
                </strong>
                <span className="text-violet-500">PLAYER ON GOAL</span>
              </p>
            </div>
            <div className="text-left">
              <p>
                <strong className="font-extrabold font-mono pr-4">$</strong>
                <span className="text-yellow-500">BOX</span>
              </p>
              <p>
                <strong className="font-extrabold font-mono pr-4">*</strong>
                <span className="text-green-500">BOX ON GOAL</span>
              </p>
              <p>
                <strong className="font-extrabold font-mono pr-4">.</strong>
                <span className="text-blue-500">GOAL</span>
              </p>
            </div>
          </div>
        </div>
        <MintUiModal show={showModal} hideModal={() => setShowModal(false)} />
      </AppHero>
    </div>
  );
}
