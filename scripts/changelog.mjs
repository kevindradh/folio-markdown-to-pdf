import { readFile, writeFile } from 'node:fs/promises'

const readJson = async path => JSON.parse(await readFile(new URL(path, import.meta.url), 'utf8'))
const [pkg, lock, releases] = await Promise.all([
  readJson('../package.json'), readJson('../package-lock.json'), readJson('../src/data/releases.json'),
])
if (!releases.length || releases[0].version !== pkg.version || lock.version !== pkg.version || lock.packages[''].version !== pkg.version) {
  throw new Error('Versi package, lockfile, dan changelog harus sama.')
}
for (const [i, release] of releases.entries()) {
  if (release.version !== `0.0.${releases.length - i}` || !/^\d{4}-\d{2}-\d{2}$/.test(release.date) || !release.title || !release.changes?.length || release.changes.some(change => typeof change !== 'string' || !change.trim())) {
    throw new Error(`Catatan versi tidak valid: ${release.version}`)
  }
}
const history = releases.filter(release => release.retrospective)
const intro = '# Changelog folio\n\nNomor awal dipetakan dari urutan commit pada main: commit pertama adalah v0.0.1. '
  + `v${history.at(-1).version}–v${history[0].version} merupakan rekonstruksi riwayat pengembangan, bukan klaim rilis/tag yang pernah dipublikasikan. `
  + 'Catatan disusun dari yang terbaru. Versi aplikasi menunjukkan build yang sedang digunakan, termasuk saat offline.\n\n'
const body = releases.map(release => `## v${release.version} — ${release.date}\n\n${release.title}\n\n`
  + release.changes.map(change => `- ${change}`).join('\n')
  + (release.commit ? `\n\nCommit: [${release.commit.slice(0, 7)}](https://github.com/kevindradh/folio-markdown-to-pdf/commit/${release.commit})` : '')).join('\n\n')
const markdown = intro + body + '\n'
const target = new URL('../CHANGELOG.md', import.meta.url)
if (process.argv.includes('--check')) {
  if (await readFile(target, 'utf8') !== markdown) throw new Error('CHANGELOG.md belum sinkron. Jalankan npm run changelog.')
} else {
  await writeFile(target, markdown)
}
