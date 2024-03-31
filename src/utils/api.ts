import { useQuery } from "react-query"

import { useFeedData } from "@app/hooks/feedData"

import type { FeedTransform } from "./rules"

type ApiDetails = Readonly<{
  hostname: string
  port: string
  host: string
  path: string
  url: string
}>

function getApiDetails(): ApiDetails {
  const { DEV: isDev, VITE_API_PATH, VITE_API_PORT } = import.meta.env

  const devApiPort = VITE_API_PORT || ""
  const devApiPath = VITE_API_PATH || ""

  const { hostname, port: locationPort, protocol } = window.location

  const port = isDev ? devApiPort : locationPort
  const path = isDev ? devApiPath : "/api"

  const host = port === "" ? hostname : `${hostname}:${port}`

  return {
    hostname,
    port,
    host,
    path,
    url: `${protocol}//${host}${path}`,
  }
}

export const API_DETAILS = getApiDetails()

export function apiUrl(endpoint: string, queryParams?: Record<string, string>) {
  const q = Object.entries(queryParams || {})
    .map(([name, value]) => `${name}=${encodeURIComponent(value)}`)
    .join("&")

  let path = endpoint

  if (!path.startsWith("/")) path = `/${path}`

  if (path.endsWith("/")) path = path.slice(0, -1)

  const url = `${API_DETAILS.url}${path}`

  if (q !== "") return `${url}?${q}`
  else return url
}

function textFromResponse(response: Response) {
  if (response.ok) return response.text()
  else throw new Error("Failed to fetch")
}

export function encodeRules(rules: FeedTransform) {
  return fetch(apiUrl("/rewrite/url"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(rules),
  }).then(textFromResponse)
}

export function toRewriteUrl(encodedRules: string) {
  return apiUrl("/rewrite", { r: encodedRules })
}

export function getTransformedFeed(encodedRules: string) {
  return fetch(toRewriteUrl(encodedRules)).then(textFromResponse)
}

export function useEncodedRules() {
  const { feedUrl, rules: rulesWithIds } = useFeedData()
  const rules = rulesWithIds.map((r) => r.rule)

  const { data } = useQuery({
    queryKey: ["encodedRules", feedUrl, rules],
    queryFn: () => encodeRules({ feed_url: feedUrl, rules: rules }),
    // Extremely unlikely to change so keep data for 10 minutes
    staleTime: 10 * 60 * 1000,
    cacheTime: 15 * 60 * 1000,
    // When we do refetch, dont null out the data while fetching
    keepPreviousData: true,
  })

  if (feedUrl === "") return ""

  return data
}
