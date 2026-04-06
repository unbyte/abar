/**
 * 08-deploy: Fancy deployment pipeline with parallel stages
 *
 * Stages run in parallel. Each bar spans two lines:
 *   line 1 — spinner + name + block progress bar
 *   line 2 — dim detail/log message
 * A pinned footer shows elapsed time and overall progress.
 */
import abar from '@abar/abar'

// ── ANSI helpers ──────────────────────────────────────────────────────────────
const dim = (s: string) => `\x1b[2m${s}\x1b[0m`
const green = (s: string) => `\x1b[32m${s}\x1b[0m`
const cyan = (s: string) => `\x1b[36m${s}\x1b[0m`
const bold = (s: string) => `\x1b[1m${s}\x1b[0m`
const yellow = (s: string) => `\x1b[33m${s}\x1b[0m`

const SPINNER = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']
let spinnerFrame = 0
const spinnerInterval = setInterval(() => {
  spinnerFrame = (spinnerFrame + 1) % SPINNER.length
}, 80)
spinnerInterval.unref()
const spin = () => cyan(SPINNER[spinnerFrame])

const progressBar = (done: number, total: number, width = 14) => {
  const filled = Math.round((done / total) * width)
  return dim('[') + green('█'.repeat(filled)) + dim('░'.repeat(width - filled)) + dim(']')
}

// ── Footer transformer: always render footer last ─────────────────────────────
const FOOTER_ID = '__footer__'

abar.configure({
  transformers: [
    (entries) => {
      const footer = entries.find((e) => e.id === FOOTER_ID)
      const rest = entries.filter((e) => e.id !== FOOTER_ID)
      return footer ? [...rest, { id: FOOTER_ID, text: dim('  ─────────────────────────────────') }, footer] : rest
    },
  ],
})

abar.start()

// ── Shared state ──────────────────────────────────────────────────────────────
let completedStages = 0
const totalStages = 4
const startTime = Date.now()

const footer = abar.add({ id: FOOTER_ID, text: '' })

function refreshFooter(done = false) {
  const elapsed = `${((Date.now() - startTime) / 1000).toFixed(1)}s`
  if (done) {
    footer.update(`  ${green('✔')} ${bold('all done')}  ${dim(elapsed)}`)
  } else {
    const pct = Math.round((completedStages / totalStages) * 100)
    footer.update(
      `  ${yellow('⟳')} ${dim(`${completedStages}/${totalStages} complete`)}  ${progressBar(completedStages, totalStages, 20)}  ${dim(`${pct}%`)}  ${dim(elapsed)}`,
    )
  }
}

refreshFooter()

// ── Stage runner ──────────────────────────────────────────────────────────────
const LOG_LINES: Record<string, string[]> = {
  build: [
    'resolving modules…',
    'transpiling src/',
    'tree-shaking…',
    'minifying…',
    'writing dist/',
    'generating sourcemaps…',
    'optimizing chunks…',
    'done',
  ],
  test: ['loading fixtures…', 'unit tests…', 'integration tests…', 'coverage report…', 'all green'],
  'push image': ['authenticating…', 'layer 1/3…', 'layer 2/3…', 'layer 3/3…', 'digest verified'],
  deploy: ['scaling down…', 'rolling update…', 'health checks…', 'traffic shifted'],
}

function runStage(icon: string, name: string, stepMs: number): Promise<void> {
  const logs = LOG_LINES[name] ?? []
  const steps = logs.length

  return new Promise((resolve) => {
    const line1 = () => `${spin()} ${icon} ${bold(name)}  ${progressBar(step, steps)} ${dim(`${step}/${steps}`)}`
    const line2 = () => `     ${dim(logs[Math.min(step, steps - 1)] ?? '')}`

    let step = 0
    const h = abar.add({ text: `${line1()}\n${line2()}` })

    const footerTick = setInterval(refreshFooter, 120)

    const stepTick = setInterval(() => {
      step++
      if (step >= steps) {
        clearInterval(stepTick)
        clearInterval(footerTick)
        completedStages++
        h.finish(`${green('✔')} ${icon} ${bold(name)}  ${green('complete')}`)
        refreshFooter(completedStages === totalStages)
        resolve()
      } else {
        h.update(`${line1()}\n${line2()}`)
      }
    }, stepMs)
  })
}

// ── Pipeline ──────────────────────────────────────────────────────────────────

console.log(`${bold('  🚀 deploying')}  ${dim('v1.4.2 → production')}`)

await Promise.all([runStage('📦', 'build', 130), runStage('🧪', 'test', 180)])
await runStage('🐳', 'push image', 220)
await runStage('☁️ ', 'deploy', 280)

abar.stop()
