import { createClient } from '@supabase/supabase-js'

interface GetMapboxTokenResponse {
  token: string
}

export async function getMapboxToken(): Promise<string> {
  try {
    const response = await fetch('/api/mapbox-token')
    
    if (!response.ok) {
      throw new Error('Failed to fetch Mapbox token')
    }
    
    const data: GetMapboxTokenResponse = await response.json()
    return data.token
  } catch (error) {
    console.error('Error fetching Mapbox token:', error)
    return ''
  }
}