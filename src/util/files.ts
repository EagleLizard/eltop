
import path from 'path';
import { mkdirSync, Stats, statSync } from 'fs';
import { stat } from 'fs/promises';

export async function checkDir(dirPath: string): Promise<boolean> {
  let stats: Stats;
  try {
    stats = await stat(dirPath);
  } catch(e) {
    if(e?.code === 'ENOENT') {
      return false;
    } else {
      throw e;
    }
  }
  return stats.isDirectory();
}

export async function checkFile(filePath: string): Promise<boolean> {
  let stats: Stats;
  try {
    stats = await stat(filePath);
  } catch(e) {
    if(e?.code === 'ENOENT') {
      return false;
    } else {
      throw e;
    }
  }
  return stats.isFile();
}

export function checkFileSync(filePath: string): boolean {
  let stats: Stats;
  try {
    stats = statSync(filePath);
  } catch(e) {
    if(e?.code === 'ENOENT') {
      return false;
    } else {
      throw e;
    }
  }
  return stats.isFile();
}

export function checkDirSync(dirPath: string): boolean {
  let stats: Stats;
  try {
    stats = statSync(dirPath);
  } catch(e) {
    if(e?.code === 'ENOENT') {
      return false;
    } else {
      throw e;
    }
  }
  return stats.isDirectory();
}

export function mkdirIfNotExistRecursiveSync(dirPath: string) {
  let pathParts: string[], pathSoFar: string[];
  pathParts = path.resolve(dirPath).split(path.sep);
  pathSoFar = [];
  for(let i = 0; i < pathParts.length; ++i) {
    let currPathPart: string, currDirPath: string;
    let dirExists: boolean;
    currPathPart = pathParts[i];
    pathSoFar.push(currPathPart);
    if(
      (i === 0)
      && (currPathPart === '')
    ) {
      // skip for root path
      continue;
    }
    currDirPath = pathSoFar.join(path.sep);
    dirExists = checkDirSync(currDirPath);
    if(!dirExists) {
      console.log(currDirPath);
      mkdirSync(currDirPath);
    }
  }
}
