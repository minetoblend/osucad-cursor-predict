import {
  catchError,
  concatMap,
  filter,
  from,
  map,
  Observable,
  take,
  toArray,
} from "rxjs";
import * as fs from "fs";
import * as csvParser from 'csv-parse'
import { StandardBeatmap, StandardRuleset } from "osu-standard-stable";
import { BeatmapDecoder, ScoreDecoder } from "osu-parsers";
import { DifficultyAttributes, Score } from "osu-classes";
import { firstValueFrom } from "rxjs/internal/firstValueFrom";
import { filterBeatmap, filterScore, filterScoreInfo } from './filter'
import { createHitobjectFrames } from "./hitobject";
import { FRAME_RATE, NUM_SCORES, SEGMENT_LENGTH } from './main'
import { createScoreFrames } from "./score";
import {ScoreInformation} from './types'

function shuffle<T> (array: T[]): T[] {
  let currentIndex = array.length,
      randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex != 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
}

export async function extractDataset () {

  const rawScoreData = await firstValueFrom(
      from(fs.promises.readFile("data/index.csv", "utf8")).pipe(
          map((textContent) => csvParser.parse(textContent, {columns: true}) as unknown as ScoreInformation[]),
          concatMap((data: ScoreInformation[]) => from(data)),
          filter((info: ScoreInformation)=> filterScoreInfo(info)),
          map(
              (data: any) => [data.beatmapHash, data.replayHash] as [string, string],
          ),
          toArray(),
      ),
  );

  const rawData = await firstValueFrom(
      getData(from(shuffle(rawScoreData)).pipe(take(NUM_SCORES))).pipe(toArray()),
  );
  const rawData$ = from(rawData);

  const chunkLength = FRAME_RATE * SEGMENT_LENGTH;

  const inputData$ = rawData$.pipe(
      concatMap(({ beatmap }) =>
          from(createHitobjectFrames(beatmap, chunkLength)),
      ),
  );

  const targetData$ = rawData$.pipe(
      concatMap(({ score, beatmap }) =>
          from(createScoreFrames(beatmap, score.replay, chunkLength)),
      ),
  );

  const [inputData, targetData] = await Promise.all([
    firstValueFrom(inputData$.pipe(toArray())),
    firstValueFrom(targetData$.pipe(toArray())),
  ]);

  return { inputData, targetData }
}

const ruleset = new StandardRuleset();

export function getData (hashes$: Observable<[string, string]>) {
  const beatmapDecoder = new BeatmapDecoder();
  const scoreDecoder = new ScoreDecoder();

  return hashes$.pipe(
      concatMap(([beatmapHash, scoreHash]) =>
          from(
              Promise.all([
                fs.promises.readFile(`data/beatmaps/${beatmapHash}.osu`),
                scoreDecoder.decodeFromPath(`data/osr/${scoreHash}.osr`),
              ]),
          ),
      ),
      catchError((err, source) => source),
      map(([beatmapData, score]: [Buffer, Score]) => {
        const beatmap = beatmapDecoder.decodeFromBuffer(beatmapData);

        const standardBeatmap = ruleset.applyToBeatmap(beatmap);
        const difficulty = ruleset
            .createDifficultyCalculator(standardBeatmap)
            .calculate();

        return { beatmap: standardBeatmap, difficulty, score };
      }),
      filter(
          ({
             beatmap,
             difficulty,
             score,
           }: {
            beatmap: StandardBeatmap;
            score: Score;
            difficulty: DifficultyAttributes;
          }) =>
              filterBeatmap(beatmap, difficulty) && filterScore(score),
      ),
  );
}
