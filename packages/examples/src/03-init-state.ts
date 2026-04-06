/**
 * 03-init-state: Bar created without text, activated later
 */
import abar from 'abar'

abar.start()

// Bar starts in init state — not visible yet
const bar = abar.add()

console.log('Waiting for job to start...')

setTimeout(() => {
  // Transitions to active on first update
  bar.update('Job running: 0%')
}, 500)

let progress = 0
const interval = setInterval(() => {
  progress += 20
  if (progress >= 100) {
    clearInterval(interval)
    bar.finish('✔ Job complete')
    abar.stop()
  } else {
    bar.update(`Job running: ${progress}%`)
  }
}, 300)
