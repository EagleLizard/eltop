
import tk from 'terminal-kit';

import { TERM_FILL_ATTR, TkElement, TkElementOpts } from '../tk-element';
import { Logger } from '../../../util/logger';

const logger = Logger.init();

type TkCpuBarsElemOpts = {

} & TkElementOpts;

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
    defaultCpuBarsHeight = Math.floor(this.dst.height / 3);
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
    if(
      Array.isArray(this.cpuBarVals)
      && (this.cpuBarVals.length > 0)
    ) {
      // logger.log('Cpu Bars Elem bar vals');
      // logger.log(this.cpuBarVals);
    }
    this.screenBuffer.draw({
      delta: true,
    });
  }
}
