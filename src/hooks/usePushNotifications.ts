import { useEffect, useState } from "react"
import { PushNotifications, Token } from "@capacitor/push-notifications"
import { LocalNotifications } from "@capacitor/local-notifications"
import { useToast } from "@/hooks/use-toast"
import { isNative, platform } from "@/lib/native"
import { supabase } from "@/integrations/supabase/client"

/**
 * Registers the device for native push notifications, stores the device token
 * in the backend (when signed in) and surfaces foreground notifications via a
 * toast + a local notification. Safe to call on web — it becomes a no-op.
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

        const regHandle = await PushNotifications.addListener("registration", async (t: Token) => {
          setToken(t.value)
          try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return
            await supabase.from("device_tokens").upsert(
              {
                user_id: user.id,
                token: t.value,
                platform: platform() as "ios" | "android" | "web",
              },
              { onConflict: "token" }
            )
          } catch (e) {
            console.error("[push] failed to store token:", e)
          }
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

        await PushNotifications.register()

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
