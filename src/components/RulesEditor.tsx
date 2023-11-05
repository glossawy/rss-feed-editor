import { useRef, MutableRefObject, useEffect, useState } from "react"

import {
  JSONEditor as SvelteJSONEditor,
  Mode,
  Content,
  RenderValueProps,
  RenderValueComponentDescription,
  renderValue,
  createAjvValidator,
  JSONEditorSelection,
  SelectionType,
  MenuItem,
} from "svelte-jsoneditor"
import useEffectOnce from "../utils/useEffectOnce"

import { feedTransformSchema } from "../utils/rules"

declare type JSONPrimitive = string | number | boolean | null
declare type JSONValue =
  | {
      [key: string]: JSONValue
    }
  | JSONValue[]
  | JSONPrimitive
declare type JSONObject = {
  [key: string]: JSONValue
}

export type Action =
  | {
      type: "rule"
    }
  | {
      type: "condition"
      index: number
    }
  | {
      type: "mutation"
      index: number
    }

declare type EditorProps = {
  value: JSONObject
  readOnly?: boolean
  readOnlyKeys?: Array<string>
  onChange?: (json: JSONValue) => void
  onAction?: (action: Action) => void
}

const feedTransformValidator = createAjvValidator({
  schema: feedTransformSchema,
})

export default function RulesEditor(props: EditorProps) {
  const refContainer: MutableRefObject<HTMLDivElement | null> = useRef(null)
  const refEditorInstance: MutableRefObject<SvelteJSONEditor | null> =
    useRef(null)

  const [currentPath, setCurrentPath] = useState<string[]>([])

  const isRulesSelected = currentPath.includes("rules")

  useEffectOnce(() => {
    if (refContainer.current == null) {
      throw new Error("Editor container was not initialized")
    }

    refEditorInstance.current = new SvelteJSONEditor({
      target: refContainer.current,
      props: {
        mode: "tree" as Mode,
        validator: feedTransformValidator,
        mainMenuBar: true,
      },
    })

    return () => {
      if (refEditorInstance.current) {
        refEditorInstance.current.destroy()
        refEditorInstance.current = null
      }
    }
  })

  useEffect(() => {
    const onChange = props.onChange || (() => {})

    function onJsonChange(content: Content) {
      if ("json" in content) {
        if (feedTransformValidator(content.json || "").length === 0)
          onChange(content.json || "")
      } else {
        try {
          onChange(JSON.parse(content.text))
        } catch (e) {
          // Do nothing intentionally
        }
      }
    }

    function onSelect(selection: JSONEditorSelection): void {
      switch (selection.type) {
        case SelectionType.after:
          setCurrentPath(selection.path.slice(0, -1))
          break
        case SelectionType.key:
        case SelectionType.value:
        case SelectionType.inside:
          setCurrentPath(selection.path)
          break
        default:
          setCurrentPath([])
          break
      }
    }

    const emitAction = (action: Action) => () =>
      (props.onAction || (() => {}))(action)

    function onRenderMenu(items: MenuItem[]): MenuItem[] {
      const finalItems = [...items]
      if (isRulesSelected) {
        finalItems.push({
          onClick: emitAction({ type: "rule" }),
          type: "button",
          text: "+ Rule",
          title: "Add Rule",
        })

        if (currentPath.length > 1) {
          const itemIndex = parseInt(currentPath[1])
          finalItems.push(
            {
              onClick: emitAction({ type: "condition", index: itemIndex }),
              type: "button",
              text: "+ Condition",
              title: "Add Condition",
            },
            {
              onClick: emitAction({ type: "mutation", index: itemIndex }),
              type: "button",
              text: "+ Mutation",
              title: "Add Mutation",
            }
          )
        }
      }

      return finalItems
    }

    function onRenderValue(
      renderProps: RenderValueProps
    ): RenderValueComponentDescription[] {
      if (
        (props.readOnlyKeys || []).find((v) => renderProps.path.join(".") === v)
      )
        renderProps.readOnly = true

      return renderValue(renderProps)
    }

    if (refEditorInstance.current) {
      const newProps = {
        ...props,
        onChange: onJsonChange,
        onRenderValue,
        onRenderMenu,
        onSelect,
      }
      delete newProps["readOnlyKeys"]

      refEditorInstance.current.updateProps(newProps)
    }
  }, [props, currentPath, isRulesSelected])

  useEffect(() => {
    if (refEditorInstance.current)
      refEditorInstance.current.update({ json: props.value })
  }, [props.value])

  return <div className="jsoneditor" ref={refContainer}></div>
}
