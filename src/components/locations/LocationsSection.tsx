import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LocationsList } from "@/components/map/LocationsList"
import { Location } from "@/types/location"

import { 
  MapPin, 
  Navigation, 
  Clock, 
  Phone, 
  ExternalLink,
  Calendar,
  Users,
  ArrowLeft,
  Search,
  X

} from "lucide-react"

interface LocationsSectionProps {
  onBack?: () => void
}

export function LocationsSection({ onBack }: LocationsSectionProps) {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const [locations] = useState<Location[]>([
    {
      id: "lund-sweden",
      name: "Light Embassy Church",
      address: "Sunnanväg 18L",
      city: "222 26 Lund",
      country: "Sweden",
      coordinates: [13.1936, 55.7047], // Lund, Sweden coordinates
      phone: "+46 72-308 20 19",
      services: [
        {
          name: "Bible Study",
          day: "Tuesdays",
          time: "6:00 PM - 7:30 PM"
        },
        {
          name: "Online Prayer Connect",
          day: "Wednesdays",
          time: "5:30 PM - 6:00 PM"
        },
        {
          name: "Prayer Meeting",
          day: "Fridays",
          time: "7:00 PM - 8:15 PM"
        },
        {
          name: "Sunday Service",
          day: "Sundays",
          time: "11:00 AM - 1:15 PM"
        }
      ],
      description: "Light Embassy Church gathers throughout the week at our church in Sweden. Join us for powerful times of worship, Bible study, fellowship, and prayer as we come together in Jesus' name to grow in faith and strengthen one another.",
      googleMapsUrl: "https://maps.google.com/?cid=18091411015424419418"
    }
    // Add more locations as they become available
  ])

  const [query, setQuery] = useState("")
  const [country, setCountry] = useState("all")
  const [serviceType, setServiceType] = useState("all")

  const countries = useMemo(
    () => Array.from(new Set(locations.map((l) => l.country))).sort(),
    [locations]
  )

  const serviceTypes = useMemo(
    () => Array.from(new Set(locations.flatMap((l) => l.services.map((s) => s.name)))).sort(),
    [locations]
  )

  const filteredLocations = useMemo(() => {
    const q = query.trim().toLowerCase()
    return locations.filter((l) => {
      const matchesQuery =
        !q ||
        [l.name, l.city, l.country, l.address].some((f) => f.toLowerCase().includes(q)) ||
        l.services.some((s) => s.name.toLowerCase().includes(q))
      const matchesCountry = country === "all" || l.country === country
      const matchesService =
        serviceType === "all" || l.services.some((s) => s.name === serviceType)
      return matchesQuery && matchesCountry && matchesService
    })
  }, [locations, query, country, serviceType])

  const hasFilters = query !== "" || country !== "all" || serviceType !== "all"

  const clearFilters = () => {
    setQuery("")
    setCountry("all")
    setServiceType("all")
  }

  const requestLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords: [number, number] = [
            position.coords.longitude,
            position.coords.latitude
          ]
          setUserLocation(coords)
          calculateDistances(coords)
        },
        (error) => {
          console.error("Error getting location:", error)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        }
      )
    }
  }

  const calculateDistances = (userCoords: [number, number]) => {
    // Calculate distances using Haversine formula
    locations.forEach(location => {
      const distance = calculateDistance(
        userCoords[1], userCoords[0],
        location.coordinates[1], location.coordinates[0]
      )
      location.distance = distance
    })
  }

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371 // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  const openInMaps = (location: Location) => {
    const lat = location.coordinates[1]
    const lng = location.coordinates[0]
    
    // Try to open in native app first, fallback to web
    const mapsUrl = `https://maps.google.com/maps?q=${lat},${lng}&z=15`
    const appleUrl = `maps://maps.google.com/maps?q=${lat},${lng}&z=15`
    
    // Check if on iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    
    if (isIOS) {
      window.location.href = appleUrl
      // Fallback to Google Maps if Apple Maps doesn't open
      setTimeout(() => {
        window.open(mapsUrl, '_blank')
      }, 1000)
    } else {
      window.open(mapsUrl, '_blank')
    }
  }

  useEffect(() => {
    // Auto-request location on component mount
    requestLocation()
  }, [])

  return (
    <div className="min-h-screen bg-background pb-20 pt-16">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        {onBack && (
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="mb-4 gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        )}
        <div className="text-center mb-8">
          <h1 className="font-playfair text-4xl font-bold mb-4 text-primary">
            Find Us
          </h1>
          <p className="text-muted-foreground text-lg mb-6">
            Discover Light Embassy Church locations and services near you
          </p>
          
          {!userLocation && (
            <Button onClick={requestLocation} className="mb-6">
              <Navigation className="h-4 w-4 mr-2" />
              Find Nearby Locations
            </Button>
          )}
        </div>

        {/* Search & Filters */}
        <div className="mb-6 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by church, city or country"
              aria-label="Search locations by church, city or country"
              className="pl-9"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Select value={country} onValueChange={setCountry}>
              <SelectTrigger className="sm:w-56" aria-label="Filter by country">
                <SelectValue placeholder="All countries" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All countries</SelectItem>
                {countries.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={serviceType} onValueChange={setServiceType}>
              <SelectTrigger className="sm:w-56" aria-label="Filter by service type">
                <SelectValue placeholder="All service types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All service types</SelectItem>
                {serviceTypes.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {hasFilters && (
              <Button variant="ghost" onClick={clearFilters} className="gap-2">
                <X className="h-4 w-4" />
                Clear filters
              </Button>
            )}
          </div>

          <p className="text-sm text-muted-foreground">
            Showing {filteredLocations.length} of {locations.length} location{locations.length === 1 ? "" : "s"}
          </p>
        </div>

        {/* Locations Section */}
        <div className="space-y-4 mb-8">
          <LocationsList
            locations={filteredLocations}
            userLocation={userLocation}
            selectedLocation={selectedLocation}
            onLocationSelect={setSelectedLocation}
          />
        </div>


        {/* Selected Location Details */}
        {selectedLocation && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                {selectedLocation.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Address
                  </h3>
                  <p className="text-muted-foreground mb-2">
                    {selectedLocation.address}
                  </p>
                  <p className="text-muted-foreground mb-4">
                    {selectedLocation.city}, {selectedLocation.country}
                  </p>
                  
                  {selectedLocation.phone && (
                    <div className="mb-4">
                      <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Contact
                      </h3>
                      <a 
                        href={`tel:${selectedLocation.phone}`}
                        className="text-primary hover:underline"
                      >
                        {selectedLocation.phone}
                      </a>
                    </div>
                  )}

                  {selectedLocation.distance && (
                    <Badge variant="outline" className="mb-4">
                      {selectedLocation.distance.toFixed(1)} km away
                    </Badge>
                  )}

                  <div className="flex gap-2">
                    <Button 
                      onClick={() => openInMaps(selectedLocation)}
                      className="flex-1"
                    >
                      <Navigation className="h-4 w-4 mr-2" />
                      Get Directions
                    </Button>
                    
                    {selectedLocation.googleMapsUrl && (
                      <Button 
                        variant="outline"
                        onClick={() => window.open(selectedLocation.googleMapsUrl, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View on Google
                      </Button>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Service Times
                  </h3>
                  <div className="space-y-3">
                    {selectedLocation.services.map((service, index) => (
                      <div key={index} className="bg-muted/50 p-3 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium">{service.name}</span>
                          <Badge variant="secondary">{service.day}</Badge>
                        </div>
                        <span className="text-sm text-muted-foreground">{service.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {selectedLocation.description && (
                <div className="mt-6 p-4 bg-muted/30 rounded-lg">
                  <p className="text-muted-foreground">{selectedLocation.description}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Quick Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6 text-center">
              <Users className="h-8 w-8 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Join Our Community</h3>
              <p className="text-sm text-muted-foreground">
                Experience powerful worship, Bible study, and fellowship
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Calendar className="h-8 w-8 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Weekly Services</h3>
              <p className="text-sm text-muted-foreground">
                Multiple services throughout the week for spiritual growth
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <MapPin className="h-8 w-8 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Find Your Location</h3>
              <p className="text-sm text-muted-foreground">
                Use our map to find the nearest Light Embassy Church
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}