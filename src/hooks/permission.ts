import { useEffect, useState } from "react"

type PermissionType = "copy" | "paste"

function toPermissionName(
  permissionType: PermissionType
): PermissionName | null {
  switch (permissionType) {
    case "copy":
      return "clipboard-write" as PermissionName
    case "paste":
      return "clipboard-read" as PermissionName
  }
}

export default function usePermission(
  permissionType: PermissionType,
  { defaultValue = false }: { defaultValue: boolean }
) {
  const permissionName = toPermissionName(permissionType)

  const [permitted, setPermitted] = useState<boolean>(false)

  useEffect(() => {
    if (permissionName == null) return

    navigator.permissions
      .query({ name: permissionName })
      .then((permStatus) => {
        if (permStatus.state === "granted") setPermitted(true)

        permStatus.onchange = () => {
          if (permStatus.state === "granted") setPermitted(true)
          else setPermitted(false)
        }
      })
      .catch((exc) => {
        console.error(exc)

        const assumption = defaultValue
          ? "assuming allowed"
          : "assuming disallowed"

        console.log(
          `Browser does not support permission in current context: ${permissionName} (${permissionType}), ${assumption}`
        )
        setPermitted(defaultValue)
      })
  }, [permissionName, defaultValue, permissionType, setPermitted])

  return permitted
}
