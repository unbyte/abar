/**
 * 04-stop-resume: Stop and resume the bar area without losing handles
 */
import abar from '@abar/abar'

abar.start()

const bar = abar.add({ text: 'Phase 1: running...' })

setTimeout(() => {
  // Stop the bar area — bar handle stays active
  abar.stop()
  console.log('--- paused for interactive prompt ---')

  setTimeout(() => {
    // Resume — bar reappears with its current text
    abar.start()
    bar.update('Phase 2: running...')

    setTimeout(() => {
      bar.finish('✔ All phases complete')
      abar.stop()
    }, 800)
  }, 600)
}, 800)
