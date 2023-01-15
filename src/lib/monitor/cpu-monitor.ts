
import si, { cpu } from 'systeminformation';

import { Logger } from '../../util/logger';
import { sleep } from '../../util/sleep';

const logger = Logger.init();

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

  addCpuLoadSamples(cpuLoadSamples: CpuLoadSample[]) {
    for(let i = 0; i < cpuLoadSamples.length; ++i) {
      let currCpuLoadSample: CpuLoadSample;
      currCpuLoadSample = cpuLoadSamples[i];
      if(this.cpuSampleMap[i] === undefined) {
        this.cpuSampleMap[i] = {
          loadSamples: [],
        };
      }

      this.cpuSampleMap[i].loadSamples.push(currCpuLoadSample);
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
      logger.log(getCpuSampleInfo(res));
      return sleep(500).then(() => {
        return si.currentLoad();
      });
    });

    initialCpuSamples = getCpuSampleInfo(initialLoadData);

    cpuMonitor.addCpuLoadSamples(initialCpuSamples);
    Object.keys(cpuMonitor.cpuSampleMap).forEach(cpuSampleInfoKey => {
      logger.log(cpuMonitor.cpuSampleMap[+cpuSampleInfoKey].loadSamples);
    });

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
