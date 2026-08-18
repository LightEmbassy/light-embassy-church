import { usePushNotifications } from "@/hooks/usePushNotifications"

/**
 * Mounts push notification registration for the whole app.
 * No-op on web; only active inside the native iOS/Android builds.
 */
export function PushNotificationsBridge() {
  usePushNotifications()
  return null
}
