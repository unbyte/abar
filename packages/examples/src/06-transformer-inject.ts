/**
 * 06-transformer-inject: Inject a synthetic header entry via transformer
 *
 * Demonstrates SyntheticEntry injection — a separator line not tied to any handle.
 */
import abar from '@abar/abar'

abar.configure({
  transformers: [
    (entries) => {
      if (entries.length === 0) return entries
      return [{ id: '__header__', text: `── Active tasks (${entries.length}) ──` }, ...entries]
    },
  ],
})

abar.start()

let remaining = 3

function done() {
  remaining--
  if (remaining === 0) abar.stop()
}

function runTask(name: string, steps: number, intervalMs: number) {
  const h = abar.add({ text: `${name}: 0/${steps}` })
  let step = 0
  const t = setInterval(() => {
    step++
    if (step >= steps) {
      clearInterval(t)
      h.finish(`✔ ${name}`)
      done()
    } else {
      h.update(`${name}: ${step}/${steps}`)
    }
  }, intervalMs)
}

runTask('fetch-assets', 5, 500)
runTask('lint', 3, 500)
runTask('typecheck', 4, 500)
