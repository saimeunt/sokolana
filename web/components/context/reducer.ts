import { produce, enablePatches, Patch, applyPatches } from 'immer';
enablePatches();

import { Direction } from '@/lib/types';
import {
  LevelState,
  defaultLevelState,
  loadLevel,
  move,
  push,
} from './level-state';

export type Action =
  | { type: 'LOAD_LEVEL'; payload: { id: string; levelData: string } }
  | { type: 'MOVE'; payload: { direction: Direction } }
  | { type: 'PUSH'; payload: { direction: Direction } }
  | { type: 'UNDO' }
  | { type: 'REDO' };

type Patches = {
  patches: Patch[];
  inversePatches: Patch[];
};

export type State = {
  level: LevelState;
  currentPatch: number;
  patches: Patches[];
};

export const defaultState = (): State => ({
  level: defaultLevelState(),
  currentPatch: -1,
  patches: [],
});

export const reducer = produce((draft: State, action: Action) => {
  switch (action.type) {
    case 'LOAD_LEVEL': {
      draft.level = loadLevel(action.payload.id, action.payload.levelData);
      draft.currentPatch = -1;
      draft.patches = [];
      break;
    }
    case 'MOVE': {
      const [levelState, patches, inversePatches] = move(
        draft.level,
        action.payload.direction
      );
      draft.level = levelState;
      draft.currentPatch++;
      draft.patches[draft.currentPatch] = { patches, inversePatches };
      break;
    }
    case 'PUSH': {
      const [levelState, patches, inversePatches] = push(
        draft.level,
        action.payload.direction
      );
      draft.level = levelState;
      draft.currentPatch++;
      draft.patches[draft.currentPatch] = { patches, inversePatches };
      break;
    }
    case 'UNDO': {
      if (draft.currentPatch < 0) {
        break;
      }
      const undoPatches = draft.patches[draft.currentPatch];
      draft.currentPatch--;
      draft.level = applyPatches(draft.level, undoPatches.inversePatches);
      break;
    }
    case 'REDO': {
      if (draft.currentPatch === draft.patches.length - 1) {
        break;
      }
      draft.currentPatch++;
      const redoPatches = draft.patches[draft.currentPatch];
      draft.level = applyPatches(draft.level, redoPatches.patches);
      break;
    }
  }
});
