import { useRef } from 'react';
import { useEventListener } from 'usehooks-ts';

import useContext from '@/components/context/hook';
import { Directions } from '../../lib/types';
import { canMove, canPush, isFinished } from '@/components/context/level-state';

const KeyboardHandler = () => {
  const {
    state: { level },
    move,
    push,
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
          } else if (canPush(level, Directions.RIGHT)) {
            push(Directions.RIGHT);
          }
          break;
        }
        case 'ArrowLeft':
        case 'Left': {
          if (canMove(level, Directions.LEFT)) {
            move(Directions.LEFT);
          } else if (canPush(level, Directions.LEFT)) {
            push(Directions.LEFT);
          }
          break;
        }
        case 'ArrowUp':
        case 'Up': {
          if (canMove(level, Directions.UP)) {
            move(Directions.UP);
          } else if (canPush(level, Directions.UP)) {
            push(Directions.UP);
          }
          break;
        }
        case 'ArrowDown':
        case 'Down': {
          if (canMove(level, Directions.DOWN)) {
            move(Directions.DOWN);
          } else if (canPush(level, Directions.DOWN)) {
            push(Directions.DOWN);
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
