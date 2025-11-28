import React, { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { useToast } from '@/hooks/use-toast'
import { Location } from '@/types/location'

interface InteractiveMapProps {
  locations: Location[]
  userLocation?: [number, number] | null
  selectedLocation?: Location | null
  onLocationSelect?: (location: Location) => void
}

export function InteractiveMap({ 
  locations, 
  userLocation, 
  selectedLocation,
  onLocationSelect 
}: InteractiveMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const { toast } = useToast()
  const [mapboxToken, setMapboxToken] = useState<string>('')
  const markersRef = useRef<mapboxgl.Marker[]>([])

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return

    mapboxgl.accessToken = mapboxToken

    // Initialize map centered on first location or user location
    const center = userLocation || locations[0]?.coordinates || [13.1936, 55.7047]
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: center,
      zoom: userLocation ? 10 : 8,
    })

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: true,
      }),
      'top-right'
    )

    // Add geolocate control
    map.current.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true
        },
        trackUserLocation: true,
        showUserHeading: true
      }),
      'top-right'
    )

    return () => {
      map.current?.remove()
    }
  }, [mapboxToken, userLocation])

  // Add markers for locations
  useEffect(() => {
    if (!map.current || !mapboxToken) return

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove())
    markersRef.current = []

    // Add user location marker
    if (userLocation) {
      const userMarker = new mapboxgl.Marker({
        color: '#3b82f6',
        scale: 0.8
      })
        .setLngLat(userLocation)
        .setPopup(
          new mapboxgl.Popup({ offset: 25 })
            .setHTML('<div class="p-2"><strong>Your Location</strong></div>')
        )
        .addTo(map.current)
      
      markersRef.current.push(userMarker)
    }

    // Add location markers
    locations.forEach((location) => {
      const marker = new mapboxgl.Marker({
        color: location.id === selectedLocation?.id ? '#dc2626' : '#16a34a',
        scale: location.id === selectedLocation?.id ? 1.2 : 1
      })
        .setLngLat(location.coordinates)
        .setPopup(
          new mapboxgl.Popup({ offset: 25 })
            .setHTML(`
              <div class="p-3 min-w-48">
                <h3 class="font-semibold text-sm mb-2">${location.name}</h3>
                <p class="text-xs text-gray-600 mb-2">${location.address}</p>
                <p class="text-xs text-gray-600">${location.city}, ${location.country}</p>
              </div>
            `)
        )
        .addTo(map.current!)

      // Add click event to marker
      marker.getElement().addEventListener('click', () => {
        onLocationSelect?.(location)
      })

      markersRef.current.push(marker)
    })

    // Fit map to show all markers
    if (locations.length > 0) {
      const bounds = new mapboxgl.LngLatBounds()
      
      if (userLocation) {
        bounds.extend(userLocation)
      }
      
      locations.forEach(location => {
        bounds.extend(location.coordinates)
      })

      map.current.fitBounds(bounds, {
        padding: 50,
        maxZoom: 15
      })
    }
  }, [locations, selectedLocation, userLocation, mapboxToken])

  // Load Mapbox token from environment or prompt user
  useEffect(() => {
    // Try to get token from edge function (Supabase secrets)
    const fetchMapboxToken = async () => {
      try {
        // In a real implementation, you would call your edge function here
        // For now, we'll show an input for the user to enter their token
        if (!mapboxToken) {
          toast({
            title: "Mapbox Token Required",
            description: "Please enter your Mapbox public token to display the map.",
          })
        }
      } catch (error) {
        console.error('Error fetching Mapbox token:', error)
      }
    }

    fetchMapboxToken()
  }, [])

  if (!mapboxToken) {
    return (
      <div className="h-96 bg-muted/30 rounded-lg flex items-center justify-center p-6">
        <div className="text-center space-y-4 max-w-md">
          <h3 className="font-semibold text-foreground">Map Setup Required</h3>
          <p className="text-sm text-muted-foreground">
            To display the interactive map, please add your Mapbox public token to the Supabase Edge Function secrets.
          </p>
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Enter your Mapbox public token"
              className="w-full px-3 py-2 border rounded-md text-sm"
              onChange={(e) => setMapboxToken(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Get your token from{' '}
              <a 
                href="https://mapbox.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                mapbox.com
              </a>
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-96">
      <div ref={mapContainer} className="absolute inset-0 rounded-lg" />
      
      {/* Map overlay with instructions */}
      <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg max-w-xs">
        <p className="text-xs text-gray-600">
          Click on markers to view location details. Use controls to navigate and zoom.
        </p>
      </div>
    </div>
  )
}