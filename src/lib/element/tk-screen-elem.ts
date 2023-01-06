
import tk from 'terminal-kit';

import { TERM_FILL_ATTR, TkElement, TkElementOpts } from './tk-element';

type TkScreenElemOpts = {
  etc?: boolean;
} & TkElementOpts;

export class TkScreenElem extends TkElement {
  constructor(opts: TkScreenElemOpts) {
    super(opts);
  }

  initScreenBuffer(opts: TkScreenElemOpts): tk.ScreenBuffer {
    let screenBuffer: tk.ScreenBuffer;
    screenBuffer = new tk.ScreenBuffer({
      dst: this.dst,
      x: 0,
      y: 0,
      width: this.dst.width,
      height: this.dst.height,
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
