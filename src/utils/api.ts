import { useQuery } from "react-query"

import { useAlerts } from "@app/hooks/alerts"
import { useDebouncedValue } from "@app/hooks/debouncedValue"
import { useFeedTransform } from "@app/hooks/feedTransform"
import { FeedTransform } from "@app/utils/rules"

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

export async function encodeTransform(rules: FeedTransform) {
  const response = await fetch(apiUrl("/rewrite/url"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(rules),
  })

  if (response.ok) return await response.text()
  else throw new Error(`Failed to encode rules: ${response.status}`)
}

export async function decodeTransform(
  encodedRules: string
): Promise<FeedTransform> {
  const response = await fetch(apiUrl("/rewrite/rules", { r: encodedRules }))

  if (response.ok) return await response.json()
  else throw new Error(`Failed to decode rules: ${response.status}`)
}

export function toRewriteUrl(encodedRules: string) {
  return apiUrl("/rewrite", { r: encodedRules })
}

export function extractFromRewriteUrl(rewriteUrl: string) {
  const requiredPrefix = toRewriteUrl("")
  const extractionPattern = /\/rewrite\/?\?r=(?<encoded>.+?)$/

  if (rewriteUrl.startsWith(requiredPrefix)) {
    const results = extractionPattern.exec(rewriteUrl)

    if (results) return results.groups!["encoded"]
  }
}

export async function getTransformedFeed(encodedRules: string) {
  const response = await fetch(toRewriteUrl(encodedRules))

  if (response.ok) return await response.text()
  else throw new Error(`Failed to fetch transformed feed: ${response.status}`)
}

export function useEncodedRules() {
  const rawFeedTransform = useFeedTransform()
  const [feedTransform] = useDebouncedValue(rawFeedTransform, 500)

  const alerts = useAlerts()

  const { data } = useQuery({
    queryKey: [
      "encodedRules",
      feedTransform.version,
      feedTransform.feed_url,
      feedTransform.rules,
    ],
    queryFn: () => encodeTransform(feedTransform),
    onError: (err) => {
      console.error(err)
      alerts.commands.error("Error occurred encoding rules to feed URL.")
    },
    retry: false,
    // Extremely unlikely to change so keep data for 10 minutes
    staleTime: 10 * 60 * 1000,
    cacheTime: 15 * 60 * 1000,
    // When we do refetch, dont null out the data while fetching
    keepPreviousData: true,
  })

  if (feedTransform.feed_url === "") return ""

  return data
}
