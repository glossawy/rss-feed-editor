import * as Icons from "@mui/icons-material"
import { Button, Stack } from "@mui/joy"
import { SxProps } from "@mui/joy/styles/types"
import { useCallback, useState } from "react"

import OrderedCard from "./orderedCardList/OrderedCard"

type Props<T> = {
  items: T[]
  reorderable?: boolean
  deletable?: boolean
  addable?: boolean
  keyfn?: (elem: T) => React.Key | null | undefined
  render: (elem: T) => React.ReactNode
  onAdd?: () => void
  onSelect?: (elem: T) => void
  onMoveUp?: (elem: T) => void
  onMoveDown?: (elem: T) => void
  onDelete?: (elem: T) => void
  sx?: SxProps
}

export default function OrderedCardList<T>({
  items,
  reorderable,
  deletable,
  addable,
  keyfn,
  render,
  onAdd,
  onSelect,
  onMoveUp,
  onMoveDown,
  onDelete,
  sx,
}: Props<T>) {
  const [selectedItem, setSelectedItem] = useState<T | null>(null)

  const handleSelect = useCallback(
    (item: T) => {
      setSelectedItem(item)
      onSelect && onSelect(item)
    },
    [setSelectedItem, onSelect]
  )

  return (
    <Stack spacing={1} sx={sx}>
      {items.map((it, idx) => (
        <OrderedCard
          key={keyfn && keyfn(it)}
          isFirst={idx === 0}
          isLast={idx === items.length - 1}
          isSelected={
            !!keyfn && !!selectedItem && keyfn(selectedItem) === keyfn(it)
          }
          onClick={() => handleSelect(it)}
          onMoveUp={onMoveUp && (() => onMoveUp(it))}
          onMoveDown={onMoveDown && (() => onMoveDown(it))}
          onDelete={onDelete && (() => onDelete(it))}
          moveable={reorderable}
          deletable={deletable}
        >
          {render(it)}
        </OrderedCard>
      ))}
      {addable && (
        <Button variant="plain" startDecorator={<Icons.Add />} onClick={onAdd}>
          New
        </Button>
      )}
    </Stack>
  )
}
