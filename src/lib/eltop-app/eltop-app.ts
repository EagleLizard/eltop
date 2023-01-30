
import tk from 'terminal-kit';

import { Logger } from '../../util/logger';
import { TkScreenElem } from '../element/tk-screen-elem';
import { TkContainerElem } from '../element/tk-container-elem';
import { TkCpuBarsElem } from '../element/tk-cpu-bars/tk-cpu-bars-elem';
import { CpuLoadSample, CpuMonitor, CpuSampleInfo } from '../monitor/cpu-monitor';
import { sleep } from '../../util/sleep';
import { Timer } from '../../util/timer';
import { getIntuitiveTimeString } from '../../util/print-util';

const logger = Logger.init();

const DRAW_FPS = 12;

// const DRAW_INTERVAL_MS = 150;
const DRAW_INTERVAL_MS = Math.round(1000 / DRAW_FPS);

// const CPU_MONITOR_SAMPLE_MS = Math.round(DRAW_INTERVAL_MS / 4);
const CPU_MONITOR_SAMPLE_MS = Math.round(DRAW_INTERVAL_MS / 1.5);
// const CPU_MONITOR_SAMPLE_MS = 5;
// const CPU_MONITOR_SAMPLE_MS = 1;
// const CPU_MONITOR_SAMPLE_MS = 0;

// const CPU_MONITOR_SAMPLE_MS = Math.round(DRAW_INTERVAL_MS * 1.5);

export type EltopAppOpts = {
  term: tk.Terminal,
};

export async function eltopApp(opts: EltopAppOpts) {
  let term: tk.Terminal, screen: TkScreenElem;
  let cpuBarsElem: TkCpuBarsElem;
  let cpuMonitor: CpuMonitor;
  let drawTimer: Timer, cpuMonitorSampleTimer: Timer;
  let printTimer: Timer, eltopAppTimer: Timer;

  logger.log(`DRAW_INTERVAL_MS: ${DRAW_INTERVAL_MS}`);
  logger.log(`CPU_MONITOR_SAMPLE_MS: ${CPU_MONITOR_SAMPLE_MS}`);

  term = opts.term;

  term.on('resize', termResizeHandler);

  cpuMonitor = await CpuMonitor.init();

  drawTimer = Timer.start();
  cpuMonitorSampleTimer = Timer.start();
  printTimer = Timer.start();
  eltopAppTimer = Timer.start();

  $initElems();

  (async () => {
    for(;;) {
      let sampleSleepMs: number, currCpuSampleMs: number;
      currCpuSampleMs = cpuMonitorSampleTimer.currentMs();
      await cpuMonitor.sample();
      sampleSleepMs = Math.round(CPU_MONITOR_SAMPLE_MS - currCpuSampleMs);
      await sleep(sampleSleepMs);
      cpuMonitorSampleTimer.reset();
    }
  })();

  for(;;) {
    let drawSleepMs: number;
    if(printTimer.currentMs() >= 1000) {
      printStats();
      printTimer.reset();
    }
    drawTimer.reset();
    $drawElems();
    drawSleepMs = Math.round(DRAW_INTERVAL_MS - drawTimer.currentMs());
    await sleep(drawSleepMs);
    // logger.log(`drawSleepMs: ${drawSleepMs}`);
  }

  function printStats() {
    let eltopAppCurrMs: number;
    eltopAppCurrMs = eltopAppTimer.currentMs();
    logger.log('~'.repeat(40));
    logger.log(`${getIntuitiveTimeString(eltopAppCurrMs)}`);
    logger.log(`cpuSample count: ${cpuMonitor.getNumSamples().toLocaleString()}`);
  }

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
    let cpuBarVals: number[];
    let nowMs: number, cpuLookbackMs: number, cpuMonitorStartMs: number;

    nowMs = Date.now();
    // cpuLookbackMs = 375;
    // cpuLookbackMs = 750;
    cpuLookbackMs = 500;
    cpuMonitorStartMs = nowMs - cpuLookbackMs;

    cpuSampleMap = cpuMonitor.getSamples(cpuMonitorStartMs);
    // logger.log(cpuSampleMap[0].loadSamples.length);
    cpuBarVals = getCpuBarVals(cpuSampleMap);
    cpuBarsElem.setBarData(cpuBarVals);

    screen.render();
  }
}

function getCpuBarVals(cpuSampleMap: Record<number, CpuSampleInfo>): number[] {
  let cpuSampleKeys: number[], cpuBarVals: number[];
  cpuSampleKeys = Object.keys(cpuSampleMap).map(cpuSampleKey => +cpuSampleKey);
  cpuSampleKeys.sort((a, b) => {
    if(a > b) {
      return 1;
    } else if(a < b) {
      return -1;
    } else {
      return 0;
    }
  });
  cpuBarVals = cpuSampleKeys.map(cpuSampleKey => {
    let currCpuLoadSamples: CpuLoadSample[];
    let sum: number, avg: number;
    /*
      get the average of the current load values per cpu
    */
    currCpuLoadSamples = cpuSampleMap[cpuSampleKey].loadSamples;
    sum = currCpuLoadSamples.reduce((acc, curr) => {
      return acc + curr.load;
    }, 0);
    avg = sum / currCpuLoadSamples.length;
    return avg;
  });
  return cpuBarVals;
}
