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

  finish(text?: string): void {
    if (this.hooks === undefined) return
    if (text !== undefined) {
      this.text = text
    }
    this.hooks.finish()
  }
}
