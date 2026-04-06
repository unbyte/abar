export class BarHandle {
  readonly createdAt = Date.now()
  updatedAt = this.createdAt

  constructor(
    public readonly id: string,
    public text: string | undefined,
    private readonly hooks?: {
      update: () => void
      finish: () => void
    },
  ) {}

  update(text: string) {
    if (this.hooks === undefined) return
    this.text = text
    this.updatedAt = Date.now()
    this.hooks.update()
  }

  /**
   * Permanently removes the bar from the bar area.
   *
   * - If `text` is omitted or `undefined`, the bar is removed and its current text is written to the stream.
   * - If `text` is `null`, the bar is removed silently without writing anything to the stream.
   * - If `text` is a string, the bar is removed and that text is written to the stream.
   */
  finish(text?: string | null): void {
    if (this.hooks === undefined) return
    if (text === null) {
      // do not log to the stream after removed from bar area
      this.text = undefined
    } else if (text !== undefined) {
      this.text = text
    }
    this.hooks.finish()
  }
}
