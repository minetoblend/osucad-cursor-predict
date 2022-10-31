import * as fs from 'fs'
import { extractDataset } from './extractDataset'

/**
 * how many times per second the beatmap & replay will be sampled
 */
export const FRAME_RATE = 30

/**
 * how long each time window is (in seconds), at which the data will be split into a new segment
 */
export const SEGMENT_LENGTH = 6

/**
 * The maximum number of scores to process.
 * Warning: Each score will be split up into several segments (see `SEGMENT_LENGTH`), so the number of segments exported will be significantly more.`
 */
export const NUM_SCORES = 500

async function main () {
  const { inputData, targetData } = await extractDataset()

  await fs.promises.writeFile("data/input.json", JSON.stringify(inputData));
  await fs.promises.writeFile("data/target.json", JSON.stringify(targetData));

  console.assert(inputData.length === targetData.length)

  console.log(`exported ${inputData.length} segments.`)
}

main().then(() => console.log('done.'))
