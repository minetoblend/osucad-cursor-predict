import { Replay, ReplayFrame } from "osu-classes";
import { StandardBeatmap } from "osu-standard-stable";
import { FRAME_RATE } from './main'

export function createScoreFrames (
    beatmap: StandardBeatmap,
    replay: Replay,
    chunkLength: number,
): number[][][] {
  const startTime =
      beatmap.hitObjects[0].startTime - beatmap.hitObjects[0].timePreempt;

  let chunks: number[][][] = [];

  let frames: [x: number, y: number][] = [];

  for (let time = startTime; time < beatmap.length; time += 1000 / FRAME_RATE) {
    const frame = createReplayFrame(replay, time);

    frames.push([
      +(frame.x - 0.5).toPrecision(6),
      +(frame.y - 0.5).toPrecision(6),
    ]);

    if (frames.length === chunkLength) {
      chunks.push(frames);
      frames = [];
    }
  }

  return chunks;
}

function findReplayFrameIndex (
    frames: ReplayFrame[],
    time: number,
): { found: boolean; index: number } {
  let index = 0;
  let left = 0;
  let right = frames.length - 1;
  while (left <= right) {
    index = left + ((right - left) >> 1);
    let hitObjectTime = frames[index].startTime - frames[index].interval;
    if (hitObjectTime == time) return { found: true, index };
    else if (hitObjectTime < time) left = index + 1;
    else right = index - 1;
  }
  index = left;
  return { found: false, index };
}

export function createReplayFrame (replay: Replay, time: number) {
  let { index, found } = findReplayFrameIndex(replay.frames, time);
  if (!found && index > 0) index--;

  const frame = replay.frames[index];

  return {
    x: clamp(frame.mouseX / 512, 0, 1),
    y: clamp(frame.mouseY / 384, 0, 1),
  };
}

export function clamp (value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
