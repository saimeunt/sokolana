/* import * as dotenv from 'dotenv';
dotenv.config();

import { levels } from '/home/troy/Solana/sokolana/web/lib/levels';

export let levelData: Buffer[] = [];
const width = 8;
const height = 8;

export function initLevel() {

    for (let i = 0; i < levels.length; i++) {
        console.log("longeur string", levels[i].length);
        levelData.push(convertLevelToUintArray(levels[i]));
    }
}

function convertLevelToUintArray(level: string): Buffer {

    console.log("longueur", level.length)
    const charToUintMap: { [key: string]: number } = {
      ' ': 0,
      '#': 1,
      '@': 2,
      '$': 3,
      '.': 4,
      '*': 5,
      '+': 6
    };

    const uintArray: number[] = [];
    for (const char of level) {
        if (charToUintMap.hasOwnProperty(char)) {
            uintArray.push(charToUintMap[char]);
        }
    }
    console.log("nouvelle longeur ", Buffer.from(uintArray).length);
    return Buffer.from( uintArray);
}


function displayMapData(mapData:ArrayBuffer) {
  console.log("Map data:");
  for (let i = 0; i < height; i++) {
    let line = "";
    for (let j = 0; j < width; j++) {
      line += mapData[i * width + j] + " ";
    }
    console.log(line.trim());
  }

}

async function main() {

   initLevel();

   for(let i=0; i< levelData.length; i++)
   {
      console.log("Level", i);
      displayMapData(levelData[i]);
      console.log(" ");
   }

}

main().catch(err => {
    console.error(err);
  });

*/
