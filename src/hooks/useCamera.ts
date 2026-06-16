import { useState } from "react"
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera"
import { useToast } from "@/hooks/use-toast"
import { isNative } from "@/lib/native"

export interface CapturedPhoto {
  dataUrl: string
  format: string
}

export function useCamera() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const pickFromWeb = (accept = "image/*"): Promise<CapturedPhoto | null> =>
    new Promise((resolve) => {
      const input = document.createElement("input")
      input.type = "file"
      input.accept = accept
      input.onchange = () => {
        const file = input.files?.[0]
        if (!file) return resolve(null)
        const reader = new FileReader()
        reader.onload = () =>
          resolve({
            dataUrl: String(reader.result),
            format: file.type.split("/")[1] || "jpeg",
          })
        reader.readAsDataURL(file)
      }
      input.click()
    })

  const takePhoto = async (source: "camera" | "gallery" = "camera"): Promise<CapturedPhoto | null> => {
    setLoading(true)
    try {
      if (!isNative()) {
        return await pickFromWeb()
      }
      const photo = await Camera.getPhoto({
        quality: 85,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: source === "camera" ? CameraSource.Camera : CameraSource.Photos,
      })
      return {
        dataUrl: photo.dataUrl || "",
        format: photo.format,
      }
    } catch (err: any) {
      if (err?.message && !/cancel/i.test(err.message)) {
        toast({
          title: "Camera error",
          description: err.message,
          variant: "destructive",
        })
      }
      return null
    } finally {
      setLoading(false)
    }
  }

  return { takePhoto, loading }
}
