import { useContext } from 'react';

import Context from '.';
import { Direction } from '@/lib/types';

const Hook = () => {
  const { state, dispatch } = useContext(Context);
  const loadLevel = (levelData: string) =>
    dispatch({ type: 'LOAD_LEVEL', payload: { levelData } });
  const move = (direction: Direction) =>
    dispatch({ type: 'MOVE', payload: { direction } });
  const push = (direction: Direction) =>
    dispatch({ type: 'PUSH', payload: { direction } });
  const undo = () => dispatch({ type: 'UNDO' });
  const redo = () => dispatch({ type: 'REDO' });
  return {
    state,
    loadLevel,
    move,
    push,
    undo,
    redo,
  };
};

export default Hook;
