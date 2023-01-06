
import tk from 'terminal-kit';

import { Logger } from '../../util/logger';
import { TkElement } from '../element/tk-element';
import { TkScreenElem } from '../element/tk-screen-elem';
import { TkContainerElem } from '../element/tk-container-elem';

const logger = Logger.init();

export type EltopAppOpts = {
  term: tk.Terminal,
};

export async function eltopApp(opts: EltopAppOpts) {
  let term: tk.Terminal, screen: TkScreenElem;

  term = opts.term;

  term.on('resize', termResizeHandler);

  $initElems();

  $drawElems();

  function termResizeHandler(width: number, height: number) {
    logger.log('onResize:');
    logger.log({
      width,
      height,
    });
  }

  function $initElems() {
    let leftContainer: TkContainerElem,
      rightContainer: TkContainerElem
    ;
    screen = new TkScreenElem({
      dst: term,
    });
    leftContainer = new TkContainerElem({
      dst: screen.screenBuffer,
      x: 0,
      y: 0,
      width: Math.floor(screen.screenBuffer.width / 2),
      height: screen.screenBuffer.height,
    });
    rightContainer = new TkContainerElem({
      dst: screen.screenBuffer,
      x: Math.floor(screen.screenBuffer.width / 2),
      y: 0,
      width: Math.floor(screen.screenBuffer.width / 2),
      height: screen.screenBuffer.height,
    });

    screen.children.push(leftContainer);
    screen.children.push(rightContainer);
  }

  function $drawElems() {
    screen.render();
  }
}
