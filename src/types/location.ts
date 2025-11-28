export interface Location {
  id: string
  name: string
  address: string
  city: string
  country: string
  coordinates: [number, number] // [longitude, latitude]
  phone?: string
  services: {
    name: string
    day: string
    time: string
  }[]
  description?: string
  googleMapsUrl?: string
  distance?: number
}