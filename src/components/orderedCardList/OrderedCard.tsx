import { ButtonGroup, Card, Grid, IconButton } from "@mui/joy"
import * as Icons from "@mui/icons-material"
import { PropsWithChildren } from "react"
import { stopPropagation } from "../../utils/events"

type Props = {
  isFirst: boolean
  isLast: boolean
  isSelected: boolean
  moveable?: boolean
  deletable?: boolean
  onClick?: () => void
  onMoveUp?: () => void
  onMoveDown?: () => void
  onDelete?: () => void
}

export default function OrderedCard({
  isFirst,
  isLast,
  isSelected,
  moveable,
  deletable,
  onClick,
  onMoveDown,
  onMoveUp,
  onDelete,
  children,
}: PropsWithChildren<Props>) {
  return (
    <Card
      onClick={onClick}
      color={isSelected ? "primary" : "neutral"}
      variant="soft"
    >
      <Grid container alignItems={"start"}>
        <Grid xs={10}>{children}</Grid>
        <Grid xs={2} container justifyContent={"end"}>
          <ButtonGroup size="sm">
            {moveable && (
              <>
                <IconButton
                  variant="plain"
                  disabled={isFirst || !moveable}
                  onClick={onMoveUp && stopPropagation(onMoveUp)}
                >
                  <Icons.ArrowUpward />
                </IconButton>
                <IconButton
                  variant="plain"
                  disabled={isLast || !moveable}
                  onClick={onMoveDown && stopPropagation(onMoveDown)}
                >
                  <Icons.ArrowDownward />
                </IconButton>
              </>
            )}
            {deletable && (
              <IconButton
                variant="plain"
                color="danger"
                onClick={onDelete && stopPropagation(onDelete)}
                disabled={!deletable}
              >
                <Icons.DeleteForever />
              </IconButton>
            )}
          </ButtonGroup>
        </Grid>
      </Grid>
    </Card>
  )
}
