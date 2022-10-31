import { HitType } from "osu-classes";
import {
  Slider,
  StandardBeatmap,
  StandardHitObject,
} from "osu-standard-stable";
import { FRAME_RATE } from './main'
import { clamp } from "./score";

export function createHitobjectFrames (
    beatmap: StandardBeatmap,
    chunkLength: number,
): number[][][] {
  const startTime =
      beatmap.hitObjects[0].startTime - beatmap.hitObjects[0].timePreempt;

  const preempt = beatmap.hitObjects[0].timePreempt;

  let lastOkFrame: Readonly<BeatmapFrame> | null = null;

  let chunks: number[][][] = [];

  let frames: [
    px: number,
    py: number,
    timeLeft: number,
    isCircle: number,
    isSlider: number,
    isSpinner: number
  ][] = [];

  for (let time = startTime; time < beatmap.length; time += 1000 / FRAME_RATE) {
    let frame = createBeatmapFrame(beatmap, time);

    if (!frame) {
      if (lastOkFrame) {
        frame = { ...lastOkFrame, timeLeft: Infinity };
      } else frame = { ...defaultBeatmapFrame };
    } else lastOkFrame = frame;

    let nextFrame = createBeatmapFrame(beatmap, time + 1000 / FRAME_RATE) ?? {
      ...frame,
    };

    frame.px -= 0.5;
    frame.py -= 0.5;

    nextFrame.px -= 0.5;
    nextFrame.py -= 0.5;

    frames.push([
      +frame.px,
      +frame.py,
      clamp(1 - frame.timeLeft / preempt, 0, 1),
      frame.isCircle,
      frame.isSlider,
      frame.isSpinner,
    ]);

    if (frames.length === chunkLength) {
      chunks.push(frames);
      frames = [];
    }
  }

  return chunks;
}

function findHitobjectIndex (
    hitobjects: StandardHitObject[],
    time: number,
    preempt: number,
): { found: boolean; index: number } {
  let index = 0;
  let left = 0;
  let right = hitobjects.length - 1;
  while (left <= right) {
    index = left + ((right - left) >> 1);
    let hitObjectTime =
        (hitobjects[index]["endTime"] ?? hitobjects[index].startTime) + preempt;
    if (hitObjectTime == time) return { found: true, index };
    else if (hitObjectTime < time) left = index + 1;
    else right = index - 1;
  }
  index = left;
  return { found: false, index };
}

export function findVisibleHitObjects (
    beatmap: StandardBeatmap,
    time: number,
    count?: number,
) {
  const objects: StandardHitObject[] = [];

  const preempt = beatmap.hitObjects[0].timePreempt;

  let { index } = findHitobjectIndex(beatmap.hitObjects, time, preempt);
  index = Math.max(0, index - 6);

  while (beatmap.hitObjects[++index]) {
    const hitObject = beatmap.hitObjects[index];

    if (time > (hitObject["endTime"] ?? hitObject.startTime)) continue;
    else if (time < hitObject.startTime - preempt) break;
    else if (time < (hitObject["endTime"] ?? hitObject.startTime))
      objects.push(hitObject);

    if (count !== undefined && objects.length >= count) return objects;
  }
  return objects;
}

function hitObjectPositionAt (hitObject: StandardHitObject, time: number) {
  if ("endTime" in hitObject) {
    const duration = hitObject["endTime"] - hitObject.startTime;
    const progress = (time - hitObject.startTime) / duration;

    if ("path" in hitObject) {
      const slider = hitObject as Slider;
      const position = slider.path.curvePositionAt(progress, slider.spans);

      return {
        // slider
        x: position.x + slider.stackedStartPosition.x,
        y: position.y + slider.stackedStartPosition.y,
      };
    } else {
      // spinner

      return {
        x: 512 / 2,
        y: 384 / 2,
      };
    }
  }
  // hitcircle
  return {
    x: hitObject.stackedStartPosition.x,
    y: hitObject.stackedStartPosition.y,
  };
}

function createBeatmapFrame (
    beatmap: StandardBeatmap,
    time: number,
): BeatmapFrame | undefined {
  const visibleHitObjects = findVisibleHitObjects(beatmap, time, 1);
  if (visibleHitObjects.length > 0) {
    const hitObject = visibleHitObjects[0];
    const pos = hitObjectPositionAt(hitObject, time);
    return {
      px: pos.x / 512,
      py: pos.y / 384,
      timeLeft: hitObject.startTime - time,
      isCircle: hitObject.hitType & HitType.Normal ? 1 : 0,
      isSlider: hitObject.hitType & HitType.Slider ? 1 : 0,
      isSpinner: hitObject.hitType & HitType.Spinner ? 1 : 0,
    };
  }
  return undefined;
}

interface BeatmapFrame {
  px: number;
  py: number;
  timeLeft: number;
  isCircle: number;
  isSlider: number;
  isSpinner: number;
}

const defaultBeatmapFrame: BeatmapFrame = {
  px: 0.5,
  py: 0.5,
  timeLeft: Infinity,
  isCircle: 0,
  isSlider: 0,
  isSpinner: 0,
};
