import * as Icons from "@mui/icons-material"
import { Box, IconButton, Input, Stack, Typography } from "@mui/joy"
import { useState } from "react"

type Props = {
  label: string
  onChange: (name: string) => void
}

export default function EditableLabel({ label, onChange }: Props) {
  const [text, setText] = useState(label)
  const [editing, setEditing] = useState(false)

  const toggleEditing = () => {
    if (editing) {
      onChange(text)
    }

    setEditing(!editing)
  }

  const onSubmit = (evt: React.FormEvent<HTMLFormElement>) => {
    onChange(text)
    setEditing(false)
    evt.preventDefault()
  }

  return (
    <Stack direction={"row"} alignItems={"center"}>
      <Box
        sx={{ display: "flex", flexDirection: "row", alignItems: "center" }}
        onClick={(e) => e.stopPropagation()}
      >
        <IconButton
          onClick={toggleEditing}
          color={editing ? "primary" : "neutral"}
        >
          {editing ? <Icons.Save /> : <Icons.Edit />}
        </IconButton>
        {editing ? (
          <form onSubmit={onSubmit}>
            <Input value={text} onChange={(e) => setText(e.target.value)} />
          </form>
        ) : (
          <Typography>{text}</Typography>
        )}
      </Box>
    </Stack>
  )
}
