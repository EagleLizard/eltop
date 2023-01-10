
import tk from 'terminal-kit';

import { TERM_FILL_ATTR, TkElement, TkElementOpts } from '../tk-element';

type TkCpuBarsElemOpts = {

} & TkElementOpts;

export class TkCpuBarsElem extends TkElement {
  constructor(opts: TkCpuBarsElemOpts) {
    super(opts);
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
    this.screenBuffer.draw({
      delta: true,
    });
  }
}
