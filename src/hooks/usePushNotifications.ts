import { useEffect, useState } from "react"
import { PushNotifications, Token } from "@capacitor/push-notifications"
import { LocalNotifications } from "@capacitor/local-notifications"
import { useToast } from "@/hooks/use-toast"
import { isNative } from "@/lib/native"

/**
 * Registers the device for native push notifications and surfaces foreground
 * notifications via a toast + a local notification. Safe to call on web — it
 * becomes a no-op.
 *
 * To actually deliver pushes from your backend, send the returned `token` to
 * your server and use APNs (iOS) / FCM (Android).
 */
export function usePushNotifications(options: { enabled?: boolean } = {}) {
  const { enabled = true } = options
  const { toast } = useToast()
  const [token, setToken] = useState<string | null>(null)
  const [permission, setPermission] = useState<"granted" | "denied" | "prompt" | "unknown">("unknown")

  useEffect(() => {
    if (!enabled || !isNative()) return

    let cleanup = () => {}

    ;(async () => {
      try {
        let perm = await PushNotifications.checkPermissions()
        if (perm.receive === "prompt" || perm.receive === "prompt-with-rationale") {
          perm = await PushNotifications.requestPermissions()
        }
        setPermission(perm.receive === "granted" ? "granted" : "denied")
        if (perm.receive !== "granted") return

        await LocalNotifications.requestPermissions()
        await PushNotifications.register()

        const regHandle = await PushNotifications.addListener("registration", (t: Token) => {
          setToken(t.value)
          console.log("[push] device token:", t.value)
        })
        const errHandle = await PushNotifications.addListener("registrationError", (err) => {
          console.error("[push] registration error:", err)
        })
        const recvHandle = await PushNotifications.addListener("pushNotificationReceived", (notif) => {
          toast({
            title: notif.title || "Notification",
            description: notif.body || "",
          })
          LocalNotifications.schedule({
            notifications: [
              {
                id: Date.now() % 100000,
                title: notif.title || "Light Embassy",
                body: notif.body || "",
              },
            ],
          })
        })
        const actHandle = await PushNotifications.addListener("pushNotificationActionPerformed", (action) => {
          console.log("[push] action:", action)
        })

        cleanup = () => {
          regHandle.remove()
          errHandle.remove()
          recvHandle.remove()
          actHandle.remove()
        }
      } catch (e) {
        console.error("[push] setup failed:", e)
      }
    })()

    return () => cleanup()
  }, [enabled, toast])

  return { token, permission, isNative: isNative() }
}
