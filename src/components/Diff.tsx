import { useEffect, useRef } from "react"
import { Diff2HtmlUI } from "diff2html/lib/ui/js/diff2html-ui-slim"
import type { Diff2HtmlUIConfig } from "diff2html/lib/ui/js/diff2html-ui-base"
import { createPatch } from "diff"

import "diff2html/bundles/css/diff2html.min.css"

export type Props = {
  title: string
  left: string
  right: string
  config?: Diff2HtmlUIConfig
}

export default function Diff({ title, left, right, config }: Props) {
  const targetRef = useRef(null)
  const diffUiRef = useRef<Diff2HtmlUI | null>(null)

  useEffect(() => {
    const diff = createPatch(title, left, right)

    if (targetRef.current) {
      const ui = (diffUiRef.current = new Diff2HtmlUI(
        targetRef.current,
        diff,
        config
      ))

      ui.draw()
    }
  }, [title, left, right, config])

  return <div ref={targetRef} />
}
