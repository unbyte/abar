const name = process.argv[2]
if (!name) {
  console.error('Usage: go <name>')
  process.exit(1)
}

await import(new URL(`../src/${name}.ts`, import.meta.url).href)
