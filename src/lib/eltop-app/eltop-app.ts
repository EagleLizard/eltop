
import tk from 'terminal-kit';

import { Logger } from '../../util/logger';
import { TkElement } from '../element/tk-element';
import { TkScreenElem } from '../element/tk-screen-elem';
import { TkContainerElem } from '../element/tk-container-elem';
import { TkCpuBarsElem } from '../element/tk-cpu-bars/tk-cpu-bars-elem';
import { CpuMonitor, CpuSampleInfo } from '../monitor/cpu-monitor';

const logger = Logger.init();

export type EltopAppOpts = {
  term: tk.Terminal,
};

export async function eltopApp(opts: EltopAppOpts) {
  let term: tk.Terminal, screen: TkScreenElem;
  let cpuMonitor: CpuMonitor;

  term = opts.term;

  term.on('resize', termResizeHandler);

  cpuMonitor = await CpuMonitor.init();

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
    let cpuBarsElem: TkCpuBarsElem;
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

    cpuBarsElem = new TkCpuBarsElem({
      dst: leftContainer.screenBuffer,
      x: 0,
      y: 0,
      width: leftContainer.screenBuffer.width,
      height: Math.floor(leftContainer.screenBuffer.height / 3),
    });

    screen.children.push(leftContainer);
    screen.children.push(rightContainer);

    leftContainer.children.push(cpuBarsElem);
  }

  function $drawElems() {
    let cpuSampleMap: Record<number, CpuSampleInfo>;
    cpuSampleMap = cpuMonitor.getSamples();
    
    screen.render();
  }
}
