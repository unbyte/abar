import { readdir } from 'node:fs/promises'

const arg = process.argv[2]
if (!arg) {
  console.error('Usage: go <id|name>')
  process.exit(1)
}

const files = await readdir(new URL('../src', import.meta.url))
const match = files.find((f) => f.startsWith(arg) && f.endsWith('.ts'))

if (!match) {
  console.error(`No example found for: ${arg}`)
  process.exit(1)
}

await import(new URL(`../src/${match}`, import.meta.url).href)
