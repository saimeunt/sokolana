import { useRef } from 'react';
import { useEventListener } from 'usehooks-ts';

import useContext from './context/hook';
import { Directions } from '../../lib/types';
import { canMove, isFinished } from './context/level-state';

const KeyboardHandler = () => {
  const {
    state: { level },
    move,
    undo,
    redo,
  } = useContext();
  const documentRef = useRef<Document>(document);
  useEventListener(
    'keydown',
    (event) => {
      if (
        event.shiftKey ||
        event.ctrlKey ||
        event.altKey ||
        event.metaKey ||
        ![
          'ArrowRight',
          'Right',
          'ArrowLeft',
          'Left',
          'ArrowUp',
          'Up',
          'ArrowDown',
          'Down',
          'u',
          'r',
        ].includes(event.key)
      ) {
        return;
      }
      event.preventDefault();
      if (isFinished(level)) {
        return;
      }
      switch (event.key) {
        case 'ArrowRight':
        case 'Right': {
          if (canMove(level, Directions.RIGHT)) {
            move(Directions.RIGHT);
          }
          break;
        }
        case 'ArrowLeft':
        case 'Left': {
          if (canMove(level, Directions.LEFT)) {
            move(Directions.LEFT);
          }
          break;
        }
        case 'ArrowUp':
        case 'Up': {
          if (canMove(level, Directions.UP)) {
            move(Directions.UP);
          }
          break;
        }
        case 'ArrowDown':
        case 'Down': {
          if (canMove(level, Directions.DOWN)) {
            move(Directions.DOWN);
          }
          break;
        }
        case 'u': {
          undo();
          break;
        }
        case 'r': {
          redo();
          break;
        }
      }
    },
    documentRef
  );
  return null;
};

export default KeyboardHandler;
