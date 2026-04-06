export class RenderScheduler {
  private timer: ReturnType<typeof setTimeout> | undefined

  constructor(
    private readonly throttle: number,
    private readonly onFlush: () => void,
  ) {}

  schedule() {
    if (this.timer !== undefined) return
    this.timer = setTimeout(() => {
      this.timer = undefined
      this.onFlush()
    }, this.throttle)
  }

  dispose() {
    if (this.timer !== undefined) {
      clearTimeout(this.timer)
      this.timer = undefined
    }
  }
}
