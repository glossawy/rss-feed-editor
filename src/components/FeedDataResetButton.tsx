import * as Icons from "@mui/icons-material"
import { Box, IconButton } from "@mui/joy"

import { useFeedTransformDispatch } from "@app/hooks/feedTransform"

export default function FeedDataResetButton() {
  const dispatch = useFeedTransformDispatch()

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
