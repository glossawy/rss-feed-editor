import * as Icons from "@mui/icons-material"
import { Box, IconButton } from "@mui/joy"

import { useFeedDataDispatch } from "@app/hooks/feedData"

export default function FeedDataResetButton() {
  const dispatch = useFeedDataDispatch()

  return (
    <Box sx={{ display: "flex", alignItems: "start", justifyContent: "end" }}>
      <div>
        <IconButton
          onClick={() => dispatch({ type: "clear" })}
          size="lg"
          title={`Reset rules`}
        >
          <Icons.Restore />
        </IconButton>
      </div>
    </Box>
  )
}
