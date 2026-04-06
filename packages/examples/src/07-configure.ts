/**
 * 07-configure: Custom stream, throttle, and disabled mode
 *
 * Demonstrates configure() options — writing to stdout instead of stderr,
 * a slower render throttle, and force-disabling when not needed.
 */
import abar from 'abar'

// Write bars to stdout, render at most every 100ms
abar.configure({
  stream: process.stdout,
  renderThrottle: 100,
  discardStdin: false,
})

abar.start()

const bar = abar.add({ text: 'Processing...' })

let n = 0
const t = setInterval(() => {
  n++
  bar.update(`Processing... ${n * 10}%`)
  if (n >= 10) {
    clearInterval(t)
    bar.finish('✔ Processing complete')
    abar.stop()
  }
}, 120)
