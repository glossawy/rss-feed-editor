import {
  useRef,
  MutableRefObject,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react"

import {
  JSONEditor as SvelteJSONEditor,
  Mode,
  Content,
  RenderValueProps,
  RenderValueComponentDescription,
  renderValue,
  JSONEditorSelection,
  SelectionType,
  MenuItem,
} from "svelte-jsoneditor"
import useEffectOnce from "../utils/useEffectOnce"

import { Condition, FeedTransform, Mutation, Rule } from "../utils/rules"
import createZodValidator from "../utils/createZodValidator"
import { Stack } from "@mui/joy"
import RuleActions, { RuleAction } from "./RuleActions"

export type JSONPrimitive = string | number | boolean | null
export type JSONValue =
  | {
      [key: string]: JSONValue
    }
  | JSONValue[]
  | JSONPrimitive
export type JSONObject = {
  [key: string]: JSONValue
}

export type Action =
  | { type: "rule"; rule: Rule }
  | {
      type: "condition"
      index: number
      condition: Condition
    }
  | {
      type: "mutation"
      index: number
      mutation: Mutation
    }

declare type EditorProps = {
  value: JSONObject
  readOnly?: boolean
  readOnlyKeys?: Array<string>
  onChange?: (json: JSONValue) => void
  onAction?: (action: Action) => void
}

const feedTransformValidator = createZodValidator(FeedTransform)

export default function RulesEditor(props: EditorProps) {
  const refContainer: MutableRefObject<HTMLDivElement | null> = useRef(null)
  const refEditorInstance: MutableRefObject<SvelteJSONEditor | null> =
    useRef(null)

  const [currentPath, setCurrentPath] = useState<string[]>([])

  const onAction = useMemo(() => props.onAction || (() => {}), [props.onAction])

  const onRuleAction = useCallback(
    (action: RuleAction) => {
      const itemIndex = parseInt(currentPath[1])
      switch (action.type) {
        case "addCondition":
          onAction({
            type: "condition",
            index: itemIndex,
            condition: action.condition,
          })
          break
        case "addMutation":
          onAction({
            type: "mutation",
            index: itemIndex,
            mutation: action.mutation,
          })
          break
        case "addRule":
          onAction({
            type: "rule",
            rule: action.rule,
          })
      }
    },
    [onAction, currentPath]
  )

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
      let value: JSONValue

      if ("json" in content) {
        value = content.json || {}
      } else {
        try {
          value = JSON.parse(content.text)
        } catch (e) {
          // Do nothing intentionally
          return
        }
      }

      if (feedTransformValidator(value).length === 0) onChange(value)
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
        onSelect,
      }
      delete newProps["readOnlyKeys"]

      refEditorInstance.current.updateProps(newProps)
    }
  }, [props, currentPath])

  useEffect(() => {
    if (refEditorInstance.current)
      refEditorInstance.current.update({ json: props.value })
  }, [props.value])

  return (
    <Stack spacing={1}>
      <RuleActions
        onRuleAction={onRuleAction}
        ruleOnly={currentPath.length < 2}
        disabled={props.readOnly}
      />
      <div className="jsoneditor" ref={refContainer}></div>
    </Stack>
  )
}
