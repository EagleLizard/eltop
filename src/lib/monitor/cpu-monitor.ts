
import si from 'systeminformation';

import { Logger } from '../../util/logger';
import { sleep } from '../../util/sleep';

const logger = Logger.init();

const MAX_CPU_LOAD_SAMPLES = 1e5;
// const MAX_CPU_LOAD_SAMPLES = 1e4;

const CPU_SAMPLE_PRUNE_MIN = 1e3;

export type CpuLoadSample = {
  timestamp: number;
  load: number;
}

export type CpuSampleInfo = {
  loadSamples: CpuLoadSample[];
};

export class CpuMonitor {
  private cpuSampleMap: Record<number, CpuSampleInfo>;
  private constructor() {
    this.cpuSampleMap = {};
  }

  getNumSamples(): number {
    return this.cpuSampleMap['0'].loadSamples.length;
  }

  async sample() {
    let loadData: si.Systeminformation.CurrentLoadData;
    let cpuSamples: CpuLoadSample[];
    loadData = await si.currentLoad();
    cpuSamples = getCpuSampleInfo(loadData);
    this.insertCpuLoadSamples(cpuSamples);
  }

  insertCpuLoadSamples(cpuLoadSamples: CpuLoadSample[]) {
    let pruneN: number;
    for(let i = 0; i < cpuLoadSamples.length; ++i) {
      let currCpuLoadSample: CpuLoadSample;
      let currCpuSampleInfo: CpuSampleInfo;
      currCpuLoadSample = cpuLoadSamples[i];
      if(this.cpuSampleMap[i] === undefined) {
        this.cpuSampleMap[i] = {
          loadSamples: [],
        };
      }
      currCpuSampleInfo = this.cpuSampleMap[i];
      if(currCpuSampleInfo.loadSamples.length >= MAX_CPU_LOAD_SAMPLES) {

        pruneN = Math.ceil(MAX_CPU_LOAD_SAMPLES / 32);
        if(pruneN < CPU_SAMPLE_PRUNE_MIN) {
          pruneN = CPU_SAMPLE_PRUNE_MIN;
        }
        currCpuSampleInfo.loadSamples.splice(0, pruneN);
      }
      currCpuSampleInfo.loadSamples.push(currCpuLoadSample);
    }
  }

  getSamples(startTimeMs?: number): Record<number, CpuSampleInfo> {
    let currCpuSampleMap: Record<number, CpuSampleInfo>;

    currCpuSampleMap = Object.keys(this.cpuSampleMap).reduce((acc, curr) => {
      let currCpuKey: number, currSamples: CpuLoadSample[],
        nextSamples: CpuLoadSample[];
      let startTimeSampleIdx: number;
      currCpuKey = +curr;
      currSamples = this.cpuSampleMap[currCpuKey].loadSamples;
      startTimeSampleIdx = -1;
      /*
        if the startTime is undefined, just return the most recent sample
      */
      if(startTimeMs === undefined) {
        startTimeSampleIdx = currSamples.length - 1;
      } else {
        for(let i = currSamples.length - 1; i >= 0; --i) {
          if(currSamples[i].timestamp < startTimeMs) {
            startTimeSampleIdx = i + 1;
            break;
          }
        }
        if(startTimeSampleIdx === -1) {
          startTimeSampleIdx = 0;
        }
      }
      nextSamples = currSamples.slice(startTimeSampleIdx);
      acc[currCpuKey] = {
        loadSamples: nextSamples,
      };
      return acc;
    }, {} as Record<number, CpuSampleInfo>);
    return currCpuSampleMap;
  }

  static async init(): Promise<CpuMonitor> {
    let cpuMonitor: CpuMonitor;
    let initialLoadData: si.Systeminformation.CurrentLoadData;
    let initialCpuSamples: CpuLoadSample[];

    cpuMonitor = new CpuMonitor();

    initialLoadData = await si.currentLoad().then((res) => {
      // logger.log(getCpuSampleInfo(res));
      return sleep(500).then(() => {
        return si.currentLoad();
      });
    });

    initialCpuSamples = getCpuSampleInfo(initialLoadData);

    cpuMonitor.insertCpuLoadSamples(initialCpuSamples);
    // Object.keys(cpuMonitor.cpuSampleMap).forEach(cpuSampleInfoKey => {
    //   logger.log(cpuMonitor.cpuSampleMap[+cpuSampleInfoKey].loadSamples);
    // });

    return cpuMonitor;
  }
}

function getCpuSampleInfo(loadData: si.Systeminformation.CurrentLoadData): CpuLoadSample[] {
  let timestamp: number;
  let cpuLoadSamples: CpuLoadSample[];
  timestamp = Date.now();
  cpuLoadSamples = loadData.cpus.map(cpuLoadData => {
    return {
      timestamp,
      load: cpuLoadData.load,
    };
  });

  return cpuLoadSamples;
}
