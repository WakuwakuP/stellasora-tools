import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const ROOT_DIR = path.resolve(__dirname, '..')
const DATASETS_DIR = path.join(ROOT_DIR, 'public', 'datasets')
const OUTPUT_FILE = path.join(DATASETS_DIR, 'qualities.json')

async function readJsonFile(filePath) {
  try {
    const raw = await fs.readFile(filePath, 'utf8')
    return JSON.parse(raw)
  } catch (error) {
    if (error.code === 'ENOENT') {
      return []
    }
    throw new Error(`Failed to read ${filePath}: ${error.message}`)
  }
}

async function readSection(character, section) {
  const target = path.join(DATASETS_DIR, character, section, 'data.json')
  const entries = await readJsonFile(target)
  if (!Array.isArray(entries)) {
    throw new Error(`${target} does not contain an array.`)
  }

  const publicSectionPath = path.posix.join('/datasets', character, section)

  return entries.map((entry) => {
    const { fileName = '', ...rest } = entry
    const { isTruncated: _removed, ...payload } = rest

    return {
      ...payload,
      fileName: path.posix.join(publicSectionPath, fileName),
    }
  })
}

async function buildDataset() {
  const dirents = await fs.readdir(DATASETS_DIR, { withFileTypes: true })
  const dataset = {}

  for (const dirent of dirents) {
    if (!dirent.isDirectory()) {
      continue
    }

    const character = dirent.name
    // biome-ignore lint/performance/noAwaitInLoops: This is acceptable for script.
    const mainEntries = await readSection(character, 'main')
    const subEntries = await readSection(character, 'sub')

    dataset[character] = { main: mainEntries, sub: subEntries }
  }

  return dataset
}

async function main() {
  const dataset = await buildDataset()
  const json = JSON.stringify(dataset, null, 2)
  await fs.writeFile(OUTPUT_FILE, `${json}\n`, 'utf8')
  console.log(`Merged dataset written to ${OUTPUT_FILE}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
