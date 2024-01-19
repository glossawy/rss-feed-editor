import type { FeedTransform } from "./rules"

const IS_VITE =
  window.location.hostname === "localhost" && window.location.port === "5173"
const API_HOSTNAME = window.location.hostname
const API_PORT = IS_VITE ? "5000" : window.location.port

const API_HOST = API_PORT === "" ? API_HOSTNAME : `${API_HOSTNAME}:${API_PORT}`
const API_PATH = IS_VITE ? "" : "/api"

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

export function toRewriteUrl(encodedRules: string) {
  return `${API_BASE}/rewrite/?r=${encodedRules}`
}

export function getTransformedFeed(encodedRules: string) {
  return fetch(toRewriteUrl(encodedRules)).then(textFromResponse)
}
