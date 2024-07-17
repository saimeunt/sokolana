import { Position } from './types';

export const indexToPosition = (index: number, width: number): Position => ({
  x: index % width,
  y: Math.floor(index / width),
});

export const positionToIndex = ({ x, y }: Position, width: number) =>
  y * width + x;
