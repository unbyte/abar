import { copyFileSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const packageDir = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(packageDir, '../..')

const pkg = JSON.parse(readFileSync(resolve(packageDir, 'package.json'), 'utf8'))

// "git+https://github.com/unbyte/abar.git" -> "unbyte/abar"
const slug = pkg.repository.url
  .replace(/^git\+/, '')
  .replace(/^https:\/\/github\.com\//, '')
  .replace(/\.git$/, '')

const branch = 'main'
const rawBase = `https://raw.githubusercontent.com/${slug}/${branch}`
const blobBase = `https://github.com/${slug}/blob/${branch}`

// Match markdown links and images with a repo-relative target: `[text](./path)`
// or `![alt](./path)`. Images resolve to raw.githubusercontent.com, other links
// to the repo's blob view (GitHub redirects to /tree for directories).
const rewriteLinks = (md: string): string =>
  md.replace(
    /(!?)\[([^\]]*)\]\(\.\/([^)\s]+)\)/g,
    (_, bang: string, text: string, path: string) => `${bang}[${text}](${bang ? rawBase : blobBase}/${path})`,
  )

const readme = readFileSync(resolve(repoRoot, 'README.md'), 'utf8')
writeFileSync(resolve(packageDir, 'README.md'), rewriteLinks(readme))
copyFileSync(resolve(repoRoot, 'LICENSE'), resolve(packageDir, 'LICENSE'))

console.log('prepack: generated README.md and LICENSE')
