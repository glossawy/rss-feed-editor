import { FeedTransform } from "./rules"

function textFromResponse(response: Response) {
  if (response.ok) return response.text()
  else throw new Error("Failed to fetch")
}

export function proxyUrl(url: string) {
  return fetch(
    `http://localhost:5000/_proxy/?url=${encodeURIComponent(url)}`
  ).then(textFromResponse)
}

export function encodeRules(rules: FeedTransform) {
  return fetch(`http://localhost:5000/rewrite/url`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(rules),
  }).then(textFromResponse)
}

export function getTransformedFeed(encodedRules: string) {
  return fetch(`http://localhost:5000/rewrite/?r=${encodedRules}`).then(
    textFromResponse
  )
}
