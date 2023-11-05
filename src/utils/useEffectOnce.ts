import { useEffect, EffectCallback } from "react"

export default function useEffectOnce(cb: EffectCallback) {
  // eslint-disable-next-line
  return useEffect(cb, [])
}
