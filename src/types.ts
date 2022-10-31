export interface ScoreInformation {
  replayHash: string
  beatmapHash: string
  summary: string
  date: string
  playerName: string
  modsReadable: string
  mods: string
  ['performance-IsFail']: BooleanAsString
  ['performance-Accuracy']: NumberAsString
  ['performance-Score']: NumberAsString
  ['performance-300s']: NumberAsString
  ['performance-100s']: NumberAsString
  ['performance-50s']: NumberAsString
  ['performance-Misses']: NumberAsString
  ['performance-Geki']: NumberAsString
  ['performance-Katu']: NumberAsString
  ['performance-MaxCombo']: NumberAsString
  ['performance-IsFC']: BooleanAsString
  ['beatmap-Artist']: string
  ['beatmap-Title']: string
  ['beatmap-Version']: string
  ['beatmap-Id']: NumberAsString | ''
  ['beatmap-SetId']: NumberAsString | ''
  ['beatmap-BPMMin']: NumberAsString
  ['beatmap-BPMMax']: NumberAsString
  ['beatmap-HP']: NumberAsString
  ['beatmap-OD']: NumberAsString
  ['beatmap-AR']: NumberAsString
  ['beatmap-CS']: NumberAsString
  ['beatmap-MaxCombo']: NumberAsString
  ['beatmap-HitObjects']: NumberAsString
  ['beatmap-Circles']: NumberAsString
  ['beatmap-Sliders']: NumberAsString
  ['beatmap-Spinners']: NumberAsString
  ['beatmapPlay-BPMMin']: NumberAsString
  ['beatmapPlay-BPMMax']: NumberAsString
  ['beatmapPlay-HP']: NumberAsString
  ['beatmapPlay-OD']: NumberAsString
  ['beatmapPlay-AR']: NumberAsString
  ['beatmapPlay-CS']: NumberAsString
  ['osrReplayUrl']: string
}

type BooleanAsString = 'True' | 'False'
type NumberAsString = `${number}`

export const enum HitObjectType {
  None = 0,
  Circle = 1,
  Slider = 2,
  Spinner = 3,
}

export interface Frame {
  index: number;
  time: number;
}

export interface CursorFrame extends Frame {
  x: number
  y: number
  click: boolean
}

export interface HitObjectFrame extends Frame {
  x: number
  y: number
  type: HitObjectType
}

export interface CombinedFrame extends Frame{
  cursor: Omit<CursorFrame, keyof Frame>
  hitObject: Omit<HitObjectFrame, keyof Frame>
}
