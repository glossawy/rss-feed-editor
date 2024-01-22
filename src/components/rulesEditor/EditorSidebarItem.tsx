import { ButtonGroup, Card, Grid, IconButton, Typography } from "@mui/joy"

import * as Icons from "@mui/icons-material"

import { stopPropagation } from "../../utils/events"

type Props = {
  label: string
  isSelected?: boolean
  isFirst: boolean
  isLast: boolean
  onClick: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  onDelete: () => void
}

export default function EditorSidebarItem({
  label,
  isSelected,
  isFirst,
  isLast,
  onClick,
  onDelete,
  onMoveDown,
  onMoveUp,
}: Props) {
  return (
    <Card
      onClick={onClick}
      color={isSelected ? "primary" : "neutral"}
      variant="soft"
    >
      <Grid container alignItems={"center"}>
        <Grid xs={10}>
          <Typography>{label}</Typography>
        </Grid>
        <Grid xs={2} container justifyContent={"end"}>
          <ButtonGroup size="sm">
            <IconButton
              variant="plain"
              disabled={isFirst}
              onClick={stopPropagation(onMoveUp)}
            >
              <Icons.ArrowUpward />
            </IconButton>
            <IconButton
              variant="plain"
              disabled={isLast}
              onClick={stopPropagation(onMoveDown)}
            >
              <Icons.ArrowDownward />
            </IconButton>
            <IconButton
              variant="plain"
              color="danger"
              onClick={stopPropagation(onDelete)}
            >
              <Icons.DeleteForever />
            </IconButton>
          </ButtonGroup>
        </Grid>
      </Grid>
    </Card>
  )
}
