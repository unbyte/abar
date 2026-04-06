/**
 * 05-transformer-pin: Pin one bar to the bottom, cap others at 4
 *
 * Demonstrates transformers: reorder entries and inject a synthetic summary.
 */
import abar from 'abar'

const STATUS_ID = 'status'

abar.configure({
  transformers: [
    (entries) => {
      const pinned = entries.find((e) => e.id === STATUS_ID)
      const rest = entries.filter((e) => e.id !== STATUS_ID).slice(-4)
      return pinned ? [...rest, pinned] : rest
    },
  ],
})

abar.start()

const status = abar.add({ id: STATUS_ID, text: 'Workers: 0 active' })

let activeCount = 0

function spawnWorker(name: string, ms: number) {
  activeCount++
  status.update(`Workers: ${activeCount} active`)

  const h = abar.add({ text: `[${name}] starting...` })

  setTimeout(() => {
    h.update(`[${name}] working...`)
  }, ms * 0.4)

  setTimeout(() => {
    h.finish(`✔ [${name}] done`)
    activeCount--
    status.update(`Workers: ${activeCount} active`)
    if (activeCount === 0) {
      status.finish('✔ All workers finished')
      abar.stop()
    }
  }, ms)
}

spawnWorker('alpha', 1000)
spawnWorker('beta', 1400)
spawnWorker('gamma', 800)
spawnWorker('delta', 1800)
spawnWorker('epsilon', 600)
spawnWorker('zeta', 1200)
