/**
 * Minimal static file server for Playwright E2E tests.
 * Serves the package root so dist/ and tests/ are both accessible.
 */
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '../..')
const MIME = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.mjs': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.map': 'application/json',
}

http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost')
  const filePath = path.join(root, decodeURIComponent(url.pathname))
  const ext = path.extname(filePath)
  try {
    const data = fs.readFileSync(filePath)
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' })
    res.end(data)
  } catch {
    res.writeHead(404)
    res.end('Not found')
  }
}).listen(3456, () => console.log('Test server on http://localhost:3456'))
