/**
 * 01-basic: Single bar, update, finish
 */
import abar from '@abar/abar'

abar.start()

const bar = abar.add({ text: 'Loading...' })

setTimeout(() => {
  bar.update('Loading... 50%')
}, 500)

setTimeout(() => {
  bar.finish('✔ Done')
  abar.stop()
}, 1000)
