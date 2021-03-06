'use strict'

const { URL } = require('url')
const got = require('got')
const emojic = require('emojic')
const Server = require('../core/server/server')
const trace = require('../core/base-service/trace')

const config = require('config').util.toObject()

function normalizeBadgeUrl(url) {
  // Provide a base URL in order to accept fragments.
  const { pathname, searchParams } = new URL(url, 'http://example.com')
  const newPath = pathname.replace('.svg', '.json')
  searchParams.set('style', '_shields_test')
  return `${newPath}?${searchParams.toString()}`
}

async function traceBadge(badgeUrl) {
  const server = new Server(config)
  await server.start()
  const { body } = await got(
    `${server.baseUrl.replace(/\/$/, '')}${badgeUrl}`,
    { json: true }
  )
  trace.logTrace('outbound', emojic.shield, 'Rendered badge', body)
  await server.stop()
}

async function main() {
  if (process.argv.length < 3) {
    console.error(`Usage: node ${__filename} badge-url`)
    process.exit(1)
  }
  const [, , url] = process.argv
  const normalized = normalizeBadgeUrl(url)
  await traceBadge(normalized)
}

;(async () => {
  try {
    await main()
  } catch (e) {
    console.error(e)
    process.exit(1)
  }
})()
