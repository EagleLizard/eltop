
import sourceMapSupport from 'source-map-support';
sourceMapSupport.install();

import { eltopMain } from './lib/eltop-main';

(async () => {
  try {
    await main();
  } catch(e) {
    console.error(e);
  }
})();

async function main() {
  console.log('eltop');
  setProcName();
  await eltopMain();
}

function setProcName() {
  process.title = 'eltop';
}
