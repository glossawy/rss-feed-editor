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
          title={`Import rules using feed URL in clipboard`}
        >
          <Icons.Upload />
        </IconButton>
        <FeedDataImportModal show={showModal} onClose={onClose} />
      </div>
    </Box>
  )
}
