/**
 * Filter scores based on the beatmap information found in `data/index.csv`
 * If possible, filtering in here is preferred, since it will prevent the beatmap && score from being parsed.
 */
import { DifficultyAttributes, Score } from 'osu-classes'
import { StandardBeatmap } from 'osu-standard-stable'
import { ScoreInformation } from './types'

export function filterScoreInfo (info: ScoreInformation) {
  return info.mods !== '0' &&
      parseInt(info['beatmap-HitObjects']) > 50 &&
      info.playerName.length > 0 &&
      info['performance-Misses'] === '0' &&
      !['osu!', 'osu!lazer', 'Guest'].includes(info.playerName)
}

/**
 * Filter scores based on the parsed beatmap & computed difficulty
 * @param beatmap
 * @param difficulty
 */
export function filterBeatmap (beatmap: StandardBeatmap, difficulty: DifficultyAttributes) {
  return difficulty.starRating > 4 && difficulty.starRating < 7.5
}

/**
 * Filter scores based on the parsed score & replay
 * @param score
 */
export function filterScore (score: Score) {
  return true
}
