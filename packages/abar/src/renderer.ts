import * as readline from 'node:readline'
import { stripVTControlCharacters } from 'node:util'
import type { BarEntry } from './types'

const SYNCHRONIZED_OUTPUT_ENABLE = '\u001B[?2026h'
const SYNCHRONIZED_OUTPUT_DISABLE = '\u001B[?2026l'

export class Renderer {
  private linesToClear = 0

  constructor(private readonly stream: NodeJS.WriteStream) {}

  private measureLines(text: string) {
    const columns = this.stream.columns ?? 80
    let count = 0
    for (const line of stripVTControlCharacters(text).split('\n')) {
      count += Math.max(1, Math.ceil(line.length / columns))
    }
    return count
  }

  clear() {
    if (this.linesToClear === 0) return
    readline.moveCursor(this.stream, 0, -(this.linesToClear - 1))
    readline.cursorTo(this.stream, 0)
    readline.clearScreenDown(this.stream)
    this.linesToClear = 0
  }

  render(entries: BarEntry[]) {
    if (entries.length === 0) return
    const isTTY = this.stream.isTTY
    let shouldDisable = false
    try {
      if (isTTY) {
        this.stream.write(SYNCHRONIZED_OUTPUT_ENABLE)
        shouldDisable = true
      }
      const text = `${entries.map((e) => e.text).join('\n')}\n`
      this.linesToClear = this.measureLines(text)
      this.stream.write(text)
    } finally {
      if (shouldDisable) {
        this.stream.write(SYNCHRONIZED_OUTPUT_DISABLE)
      }
    }
  }
}
