import * as Icons from "@mui/icons-material"
import { Box, IconButton } from "@mui/joy"
import { useCallback, useState } from "react"

import FeedDataImportModal from "@app/components/FeedDataImportModal"

export default function FeedDataImportButton() {
  const [showModal, setShowModal] = useState(false)

  const onClose = useCallback(() => setShowModal(false), [setShowModal])

  return (
    <Box sx={{ display: "flex", alignItems: "start", justifyContent: "end" }}>
      <div>
        <IconButton
          onClick={() => setShowModal(true)}
          size="lg"
          title={`Open modal to import feed transform from saved URL`}
        >
          <Icons.Upload />
        </IconButton>
        <FeedDataImportModal show={showModal} onClose={onClose} />
      </div>
    </Box>
  )
}
