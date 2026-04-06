import { randomUUID } from 'node:crypto'
import cliCursor from 'cli-cursor'
import isInteractive from 'is-interactive'
import stdinDiscarder from 'stdin-discarder'
import { BarHandle } from './handle'
import { StreamHook } from './hook'
import { Renderer } from './renderer'
import { RenderScheduler } from './scheduler'
import type { Config, Transformer } from './types'

const DEFAULT_CONFIG: Config = {
  stream: process.stderr,
  renderThrottle: 16,
  enabled: isInteractive({ stream: process.stderr }),
  discardStdin: true,
  transformers: [],
}

class Bars {
  private config: Config = DEFAULT_CONFIG
  private handles: BarHandle[] = []
  private running = false
  private scheduler!: RenderScheduler
  private hook!: StreamHook
  private renderer!: Renderer
  private sigintHandler: (() => void) | undefined
  private stopDiscarder: (() => void) | undefined

  constructor() {
    this.rebuild()
  }

  private rebuild() {
    this.scheduler = new RenderScheduler(this.config.renderThrottle, () => this.flush())
    this.renderer = new Renderer(this.config.stream)
    this.hook = new StreamHook([this.config.stream, process.stdout, process.stderr], {
      beforeWrite: () => this.renderer.clear(),
      afterWrite: () => this.scheduler.schedule(),
    })
  }

  configure(options: Partial<Config>): this {
    const stream = options.stream ?? DEFAULT_CONFIG.stream
    this.config = {
      ...DEFAULT_CONFIG,
      ...options,
      stream,
      enabled: options.enabled ?? isInteractive({ stream }),
    }
    this.rebuild()
    return this
  }

  start(): this {
    if (!this.config.enabled || this.running) return this
    this.hook.install()
    cliCursor.hide(this.config.stream)
    if (this.config.discardStdin && this.config.stream.isTTY) {
      stdinDiscarder.start()
      this.stopDiscarder = () => stdinDiscarder.stop()
    }
    this.sigintHandler = () => {
      this.renderer.clear()
      this.hook.uninstall()
      cliCursor.show(this.config.stream)
      process.exit()
    }
    process.once('SIGINT', this.sigintHandler)
    this.running = true
    this.scheduler.schedule()
    return this
  }

  stop(): this {
    if (!this.running) return this
    this.renderer.clear()
    this.hook.uninstall()
    cliCursor.show(this.config.stream)
    if (this.stopDiscarder) {
      this.stopDiscarder()
      this.stopDiscarder = undefined
    }
    if (this.sigintHandler) {
      process.removeListener('SIGINT', this.sigintHandler)
      this.sigintHandler = undefined
    }
    this.running = false
    return this
  }

  add(options: { id?: string; text?: string } = {}) {
    const id = options.id ?? randomUUID()
    if (!this.config.enabled) {
      return new BarHandle(id, options.text, undefined)
    }
    const handle = new BarHandle(id, options.text, {
      update: () => this.scheduler.schedule(),
      finish: () => {
        const idx = this.handles.indexOf(handle)
        if (idx !== -1) this.handles.splice(idx, 1)
        if (handle.text !== undefined) {
          this.config.stream.write(`${handle.text}\n`)
          // write will trigger the schedule() internally,
          // so we don't need to schedule again
        } else {
          this.scheduler.schedule()
        }
      },
    })
    this.handles.push(handle)
    // initial text will be rendered immediately
    if (handle.text !== undefined) this.scheduler.schedule()
    return handle
  }

  private flush() {
    const active = this.handles.filter((h) => h.text !== undefined).sort((a, b) => a.createdAt - b.createdAt)
    const entries = this.config.transformers.reduce(
      (entries, transformer) => transformer(entries),
      active.map((h) => ({
        id: h.id,
        // biome-ignore lint/style/noNonNullAssertion: we have filtered
        text: h.text!,
        createdAt: h.createdAt,
        updatedAt: h.updatedAt,
      })),
    )

    this.hook.pause()
    this.renderer.clear()
    this.renderer.render(entries)
    this.hook.resume()
  }
}

const abar = new Bars()
export default abar
export type { BarEntry } from './types'
export type { BarHandle, Config, Transformer }
