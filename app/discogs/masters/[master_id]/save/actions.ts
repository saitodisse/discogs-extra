'use server'

import fs from 'fs'
import path from 'path'

export const debug_saveJsonToTmp = async ({
  data,
  filename,
  lastPath,
}: {
  data: any // The JSON data to save
  filename: string // The filename to save the data as
  lastPath?: string // Optional path to save the file, defaults to 'tmp'
}) => {
  const tmpDir = path.join(
    process.cwd(),
    'app',
    'discogs',
    'masters',
    '[master_id]',
    'save',
    'tmp',
    lastPath || ''
  )

  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, { recursive: true })
  }
  if (!filename) {
    console.error('[saveJsonToTmp] Filename is required to save JSON data')
    return
  }
  if (!data) {
    console.error('[saveJsonToTmp] Data is required to save JSON data')
    return
  }
  if (typeof data !== 'object') {
    console.error('[saveJsonToTmp] Data must be an object to save as JSON')
    return
  }
  if (typeof filename !== 'string') {
    console.error('[saveJsonToTmp] Filename must be a string')
    return
  }

  const filePath = path.join(tmpDir, filename)
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8')

  console.log(`Saved '${filePath}'`)
}
