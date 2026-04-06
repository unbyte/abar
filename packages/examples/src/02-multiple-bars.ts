/**
 * 02-multiple-bars: Multiple concurrent bars
 */
import abar from 'abar'

abar.start()

const tasks = [
  { label: 'Compiling', ms: 800 },
  { label: 'Bundling', ms: 1200 },
  { label: 'Uploading', ms: 1600 },
]

const handles = tasks.map(({ label }) => abar.add({ text: `${label}...` }))

console.log('Starting build pipeline')

tasks.forEach(({ label, ms }, i) => {
  setTimeout(() => {
    handles[i].finish(`✔ ${label} complete`)
    if (i === tasks.length - 1) abar.stop()
  }, ms)
})
