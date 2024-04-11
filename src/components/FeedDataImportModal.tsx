import { WarningOutlined } from "@mui/icons-material"
import {
  Button,
  ButtonGroup,
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
  Modal,
  Sheet,
  Stack,
} from "@mui/joy"
import { useForm } from "react-hook-form"

import { useAlerts } from "@app/hooks/alerts"
import { useFeedTransformDispatch } from "@app/hooks/feedTransform"
import { decodeTransform, extractFromRewriteUrl } from "@app/utils/api"

type Props = {
  show?: boolean
  onClose: () => void
}

type FormData = {
  url: string
}

export default function FeedDataImportModal({ show = false, onClose }: Props) {
  const { register, handleSubmit, formState, reset, setError } =
    useForm<FormData>()
  const { commands: alerts } = useAlerts()
  const dispatch = useFeedTransformDispatch()

  const onSubmit = async (data: FormData) => {
    const encodedValue = extractFromRewriteUrl(data.url)

    // Validation ensures value is present but we'll return just in case
    if (encodedValue == null) return

    try {
      const transform = await decodeTransform(decodeURIComponent(encodedValue))

      dispatch({
        type: "set",
        feedUrl: transform.feed_url,
        rules: transform.rules,
      })

      alerts.success("Imported rules successfully!")
      reset()
      onClose()
    } catch (err) {
      console.error(err)
      setError("url", { message: "An error occurred while decoding" })
    }
  }

  const onCancel = () => {
    onClose()
    reset({}, { keepErrors: false })
  }

  const {
    errors: { url: urlError },
  } = formState

  return (
    <Modal
      open={show}
      onClose={onClose}
      sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
    >
      <Sheet
        sx={{
          minWidth: "70vw",
          maxWidth: "70vw",
          borderRadius: "md",
          p: 3,
          boxShadow: "lg",
        }}
      >
        <form id="rss-extract-encoded" onSubmit={handleSubmit(onSubmit)}>
          <FormControl error={urlError != null}>
            <FormLabel>Feed URL to Import</FormLabel>
            <Input
              {...register("url", {
                required: {
                  value: true,
                  message: "Please enter a URL",
                },
                pattern: {
                  value: /\?r=.+?$/,
                  message: "No encoded 'r' value found at end of URL",
                },
              })}
              type="url"
            />
            {urlError && (
              <FormHelperText>
                <WarningOutlined />
                {urlError.message}
              </FormHelperText>
            )}
          </FormControl>
          <Stack direction="row-reverse" sx={{ mt: 2 }}>
            <ButtonGroup>
              <Button onClick={onCancel} color="neutral">
                Cancel
              </Button>
              <Button type="submit" color="primary">
                Submit
              </Button>
            </ButtonGroup>
          </Stack>
        </form>
      </Sheet>
    </Modal>
  )
}
