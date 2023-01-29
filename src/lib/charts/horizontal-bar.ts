
import { BrailleCanvas } from '../braille/braille';
import { Logger } from '../../util/logger';

const logger = Logger.init();

const HORIZONTAL_BAR_MAP: Record<number, string> = {
  1: '▏',
  2: '▎',
  3: '▍',
  4: '▌',
  5: '▋',
  6: '▊',
  7: '▉',
  8: '█',
};

export function getHorizontalBar(width: number, percent: number): string {
  let baseLen: number, remainder: number;
  let baseStr: string, remainderStr: string;
  let widthVal: number;
  let resultStr: string;
  if(
    (width < 1)
    || ((width % 8) !== 0)
  ) {
    throw new Error('Horizontal bar width must be divisible by 8');
  }
  widthVal = width * percent;
  baseLen = Math.floor(widthVal / 8);
  remainder = Math.ceil(widthVal - (baseLen * 8));

  baseStr = HORIZONTAL_BAR_MAP[8].repeat(baseLen);
  remainderStr = HORIZONTAL_BAR_MAP[remainder];

  if(remainderStr === undefined) {
    if(remainder === 0) {
      remainderStr = '';
    } else {
      logger.log(`remainder: ${remainder}`);
    }
  }

  resultStr = `${baseStr}${remainderStr}`;

  return resultStr;
}

export function getHorizontalBrailleBar(width: number, percent: number): string {
  let brailleCanvas: BrailleCanvas, brailleBarMatrix: string[][];
  let widthVal: number, baseHeight: number;
  let resultStr: string;
  if(
    (width < 1)
    || ((width % 2) !== 0)
  ) {
    throw new Error(`Horizontal braille bar width must be divisible by 2, received: ${width}`);
  }
  widthVal = width * percent;
  baseHeight = 4;

  brailleCanvas = new BrailleCanvas(width, baseHeight);
  for(let x = 0; x < brailleCanvas.width; ++x) {
    if(x < widthVal) {
      for(let y = 0; y < baseHeight; ++y) {
        brailleCanvas.set(x, y);
      }
    }
  }
  brailleBarMatrix = brailleCanvas.getStrMatrix();
  resultStr = brailleBarMatrix[0].join('');
  return resultStr;
}
