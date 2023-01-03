
import tk from 'terminal-kit';

import { Logger } from '../util/logger';
import { isNumber, isString } from '../util/validate-primitives';

const logger = Logger.init();

export async function eltopMain() {
  let doRedraw: boolean;
  let term: tk.Terminal;

  doRedraw = true;

  logger.log('!'.repeat(50));
  logger.log('start');
  logger.log('!'.repeat(50));

  term = setupTermKit({
    onDestroy: termDestroyHandler,
    onResize: termResizeHandler,
    onKey: handleKey,
  });

  function termResizeHandler(opts: TkOnResizeCbParams) {
    logger.log('onResize:');
    logger.log(opts);
  }

  function handleKey(keyName: string, matches: string[]) {
    switch(keyName) {
      case 'q':
      case 'CTRL_C':
        termDestroyHandler({
          killCode: 0,
        });
        break;
      case 'p':
        printStats();
        break;
      default:
        logger.log('keyPress:');
        logger.log(keyName);
        logger.log(matches);
    }
  }

  function printStats() {
    logger.log('print stats');
  }

  function termDestroyHandler(opts: TkOnDestroyCbParams) {
    let exitCode: number, killSignal: NodeJS.Signals | undefined;
    exitCode = (isNumber(opts?.killCode))
      ? opts.killCode
      : 0
    ;
    killSignal = (isString(opts.killCode))
      ? opts.killCode
      : undefined
    ;
    if(killSignal !== undefined) {
      logger.log(`${opts.killCode} kill code...`);
      $destroy(0);
      process.kill(process.pid, opts.killCode);
    } else {
      logger.log(`exit with code: ${opts.killCode}`);
      $destroy(exitCode);
    }
  }

  function $destroy(exitCode: number) {
    doRedraw = false;
    term.hideCursor(false);
    term.styleReset();
    term.resetScrollingRegion();
    term.moveTo(term.width, term.height);
    term('\n');
    term.processExit(exitCode);
  }
}

type TkOnDestroyCbParams = {
  killCode: NodeJS.Signals | number;
};

type TkOnResizeCbParams = {
  width: number;
  height: number;
};

type SetupTkOpts = {
  onDestroy: (params: TkOnDestroyCbParams) => void;
  onResize: (params: TkOnResizeCbParams) => void;
  onKey: (keyName: string, matches: string[]) => void;
};

function setupTermKit(opts: SetupTkOpts): tk.Terminal {
  let term: tk.Terminal;
  term = tk.terminal;
  term.grabInput(true);
  term.hideCursor(true);

  logger.log(`term width: ${term.width}`);
  logger.log(`term height: ${term.height}`);

  term.on('resize', (width: number, height: number) => {
    opts.onResize({
      width,
      height,
    });
  });
  term.on('key', (keyName: string, matches: string[]) => {
    opts.onKey(keyName, matches);
  });

  process.on('exit', (code) => {
    opts.onDestroy({
      killCode: code,
    });
  });
  process.once('SIGUSR2', () => {
    opts.onDestroy({
      killCode: 'SIGUSR2',
    });
  });
  process.on('SIGINT', () => {
    opts.onDestroy({
      killCode: 'SIGINT',
    });
  });

  return term;
}
