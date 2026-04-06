import type { Writable } from 'node:stream'

type WriteFn = Writable['write']

export class StreamHook {
  private hooked = new Map<Writable, WriteFn>()
  private paused = false
  private drainHandler: (() => void) | undefined

  constructor(
    private readonly streams: Writable[],
    private readonly hooks: {
      beforeWrite: () => void
      afterWrite: () => void
    },
  ) {}

  install() {
    for (const stream of this.streams) {
      if (!stream || this.hooked.has(stream) || typeof stream.write !== 'function') continue
      const original = stream.write.bind(stream) as WriteFn
      this.hooked.set(stream, original)

      stream.write = ((chunk: unknown, _encoding?: unknown, _callback?: unknown) => {
        const { callback, encoding } = (
          typeof _encoding === 'function' ? { callback: _encoding, encoding: undefined } : { callback: _callback, encoding: _encoding }
        ) as {
          callback: () => void
          encoding: BufferEncoding
        }
        if (this.paused) {
          return original(chunk, encoding, callback)
        }
        // avoid recursive calls
        this.escape(() => this.hooks.beforeWrite())
        const canContinue = original(chunk, encoding, callback)
        if (canContinue === false) {
          this.drainHandler = () => {
            this.drainHandler = undefined
            this.escape(() => this.hooks.afterWrite())
          }
          stream.once('drain', this.drainHandler)
        } else {
          this.escape(() => this.hooks.afterWrite())
        }
        return canContinue
      }) as WriteFn
    }
  }

  uninstall() {
    for (const [stream, original] of this.hooked) {
      stream.write = original
      if (this.drainHandler) {
        stream.removeListener('drain', this.drainHandler)
      }
    }
    this.drainHandler = undefined
    this.hooked.clear()
  }

  pause() {
    this.paused = true
  }

  resume() {
    this.paused = false
  }

  escape(fn: () => void) {
    const original = this.paused
    this.paused = true
    fn()
    this.paused = original
  }
}
