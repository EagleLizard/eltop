
import tk from 'terminal-kit';

import { TERM_FILL_ATTR, TkElement, TkElementOpts } from './tk-element';

type TkContainerElemOpts = {

} & TkElementOpts;

export class TkContainerElem extends TkElement {
  constructor(opts: TkContainerElemOpts) {
    super(opts);
  }

  initScreenBuffer(opts: TkContainerElemOpts): tk.ScreenBuffer {
    let screenBuffer: tk.ScreenBuffer;
    screenBuffer = new tk.ScreenBuffer({
      dst: this.dst,
      x: opts.x,
      y: opts.y,
      width: opts.width,
      height: opts.height,
    });
    return screenBuffer;
  }

  fill() {
    this.screenBuffer.fill({
      attr: TERM_FILL_ATTR,
    });
  }

  draw() {
    // this.screenBuffer.put({
    //   x: 1,
    //   y: 1,
    //   dx: 1,
    //   dy: 0,
    //   attr: {},
    //   wrap: true,
    // }, 'container');
    this.screenBuffer.draw({
      delta: true,
    });
  }
}
