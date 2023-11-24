import type { FeedTransform } from "./rules"

const IS_FLASK_DEV =
  window.location.hostname === "localhost" && window.location.port === "5000"
const API_HOSTNAME = window.location.hostname
const API_PORT = window.location.port

const API_HOST = API_PORT === "" ? API_HOSTNAME : `${API_HOSTNAME}:${API_PORT}`
const API_PATH = IS_FLASK_DEV ? "" : "/api"

const API_BASE = `${window.location.protocol}//${API_HOST}${API_PATH}`

function textFromResponse(response: Response) {
  if (response.ok) return response.text()
  else throw new Error("Failed to fetch")
}

export function proxyUrl(url: string) {
  return fetch(`${API_BASE}/_proxy/?url=${encodeURIComponent(url)}`).then(
    textFromResponse
  )
}

export function encodeRules(rules: FeedTransform) {
  return fetch(`${API_BASE}/rewrite/url`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(rules),
  }).then(textFromResponse)
}

export function getTransformedFeed(encodedRules: string) {
  return fetch(`${API_BASE}/rewrite/?r=${encodedRules}`).then(textFromResponse)
}
