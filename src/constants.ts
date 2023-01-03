
import path from 'path';

export const BASE_DIR = path.resolve(__dirname, '..');

const LOG_DIRNAME = 'logs';
export const LOG_DIR_PATH = [
  BASE_DIR,
  LOG_DIRNAME,
].join(path.sep);
export const STDOUT_LOG_FILE_NAME = 'stdout.log';
export const STDERR_LOG_FILE_NAME = 'stderr.log';
