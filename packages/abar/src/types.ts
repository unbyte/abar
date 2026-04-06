/**
 * A snapshot of an active bar handle's state, passed into the transformer pipeline each render.
 * Fields are copied fresh per frame — mutating `text` only affects the current render.
 */
export interface ActiveBarEntry {
  id: string
  text: string
  /** Time of `abar.add()` call. */
  createdAt: number
  /** Time of the last `handle.update()` call. */
  updatedAt: number
}

/**
 * A synthetic entry injected by a transformer. Not backed by a real handle —
 * useful for adding separator lines or status rows that don't correspond to any managed bar.
 */
export interface SyntheticBarEntry {
  id: string
  text: string
}

/** A render entry: either a real bar snapshot or a transformer-injected synthetic row. */
export type BarEntry = ActiveBarEntry | SyntheticBarEntry

/**
 * A function in the transformer pipeline. Receives the current render entries
 * and returns the list to actually render.
 * May filter, reorder, mutate `text`, or inject `SyntheticBarEntry` objects.
 * Errors propagate uncaught and abort the render.
 */
export type Transformer = (entries: BarEntry[]) => BarEntry[]

/** Configuration for the abar singleton. */
export interface Config {
  /** Stream to render bars into. Defaults to `process.stderr`. */
  stream: NodeJS.WriteStream
  /**
   * Trailing-edge debounce window in ms. The first mutation schedules a render after this delay;
   * further mutations within the window are collapsed. Defaults to `16`.
   */
  renderThrottle: number
  /**
   * When `false`, all bar operations are no-ops and stream writes pass through unmodified.
   * Defaults to `isInteractive(stream)`.
   */
  enabled: boolean
  /** When `true`, stdin is put into raw mode while active to prevent input corrupting the bar area. */
  discardStdin: boolean
  /** Ordered transformer pipeline applied to render entries before each render. */
  transformers: Transformer[]
}
