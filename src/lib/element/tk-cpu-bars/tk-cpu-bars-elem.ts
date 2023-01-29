
import tk from 'terminal-kit';

import { TERM_FILL_ATTR, TkElement, TkElementOpts } from '../tk-element';
import { FILTERED_TERM_COLOR_CODES } from '../term-color';
import { getHorizontalBrailleBar } from '../../charts/horizontal-bar';
import { Logger } from '../../../util/logger';

const logger = Logger.init();

type TkCpuBarsElemOpts = {

} & TkElementOpts;

type CpuBarDrawItem = {
  load: number;
  label: string;
  color: number;
};

export class TkCpuBarsElem extends TkElement {

  private cpuBarVals: number[];

  constructor(opts: TkCpuBarsElemOpts) {
    super(opts);
    this.cpuBarVals = [];
  }

  setBarData(cpuBarVals: number[]) {
    this.cpuBarVals = cpuBarVals;
  }

  initScreenBuffer(opts: TkCpuBarsElemOpts): tk.ScreenBuffer  {
    let screenBuffer: tk.ScreenBuffer;
    let defaultCpuBarsHeight: number;
    // defaultCpuBarsHeight = Math.floor(this.dst.height / 3);
    defaultCpuBarsHeight = this.dst.height;
    screenBuffer = new tk.ScreenBuffer({
      dst: this.dst,
      x: 0,
      y: 0,
      height: opts.height ?? defaultCpuBarsHeight
    });
    return screenBuffer;
  }

  fill() {
    this.screenBuffer.fill({
      attr: TERM_FILL_ATTR,
    });
  }

  draw() {
    let cpuBarDrawItems: CpuBarDrawItem[];
    let startY: number, cpuLabelWidth: number;
    let cpuPercentFixedDecimals: number, cpuPercentWidth: number;

    cpuPercentFixedDecimals = 1;
    cpuPercentWidth = 4 + cpuPercentFixedDecimals; // '100' + '.' + <fixedDecimals>

    if(
      Array.isArray(this.cpuBarVals)
      && (this.cpuBarVals.length > 0)
    ) {
      cpuBarDrawItems = this.cpuBarVals.map((cpuBarVal, cpuIdx) => {
        let cpuBarColorIdx: number, cpuBarColor: number;
        // colorIdx = Math.floor(cpuBoxColors.length / opts.numCpus) * idx;
        cpuBarColorIdx = Math.floor(FILTERED_TERM_COLOR_CODES.length / this.cpuBarVals.length) * cpuIdx;
        cpuBarColor = FILTERED_TERM_COLOR_CODES[cpuBarColorIdx];
        return {
          load: cpuBarVal,
          label: `${cpuIdx + 1}`,
          color: cpuBarColor,
        };
      });

      cpuLabelWidth = -Infinity;

      cpuBarDrawItems.forEach((cpuBarDrawItem) => {
        if(cpuBarDrawItem.label.length > cpuLabelWidth) {
          cpuLabelWidth = cpuBarDrawItem.label.length;
        }
      });

      cpuBarDrawItems.forEach((cpuBarDrawItem, cpuIdx) => {
        let startX: number;
        let barWidth: number, currLoadPercent: number;
        let barChartStr: string, cpuBarString: string;
        let loadPercentFixedStr: string, loadPercentStr: string, cpuLabel: string;
        startX = this.screenBuffer.x + 1;
        // barWidth = 16;
        currLoadPercent = cpuBarDrawItem.load / 100;
        cpuLabel = (cpuBarDrawItem.label.length < cpuLabelWidth)
          ? `${' '.repeat(cpuLabelWidth - cpuBarDrawItem.label.length)}${cpuBarDrawItem.label}`
          : cpuBarDrawItem.label
        ;
        barWidth = (this.screenBuffer.width - (cpuLabelWidth + cpuPercentWidth)) - 3;
        barChartStr = getHorizontalBrailleBar(barWidth * 2, currLoadPercent);
        // barChartStr = '';
        loadPercentFixedStr = cpuBarDrawItem.load.toFixed(cpuPercentFixedDecimals);
        loadPercentStr = (loadPercentFixedStr.length < cpuPercentWidth)
          ? `${' '.repeat(cpuPercentWidth - loadPercentFixedStr.length)}${loadPercentFixedStr}`
          : loadPercentFixedStr
        ;

        cpuBarString = `${cpuLabel} ${barChartStr} ${loadPercentStr}`;
        startY = this.screenBuffer.y + 1;
        this.screenBuffer.put({
          x: startX,
          y: startY + cpuIdx,
          dx: 1,
          dy: 0,
          attr: {
            color: cpuBarDrawItem.color,
            bold: true,
          },
          wrap: false,
        }, cpuBarString);
      });
    }
    this.screenBuffer.draw({
      delta: true,
    });
  }
}
