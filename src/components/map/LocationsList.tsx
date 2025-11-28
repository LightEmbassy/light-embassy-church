import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Navigation, Clock, Phone } from "lucide-react"
import { Location } from "@/types/location"

interface LocationsListProps {
  locations: Location[]
  userLocation?: [number, number] | null
  selectedLocation?: Location | null
  onLocationSelect?: (location: Location) => void
}

export function LocationsList({ 
  locations, 
  userLocation, 
  selectedLocation,
  onLocationSelect 
}: LocationsListProps) {
  
  const sortedLocations = userLocation 
    ? [...locations].sort((a, b) => (a.distance || 0) - (b.distance || 0))
    : locations

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-foreground">
        {userLocation ? 'Nearest Locations' : 'All Locations'}
      </h3>
      
      {sortedLocations.map((location) => (
        <Card 
          key={location.id}
          className={`cursor-pointer transition-all hover:shadow-md ${
            selectedLocation?.id === location.id 
              ? 'ring-2 ring-primary bg-primary/5' 
              : 'hover:bg-muted/30'
          }`}
          onClick={() => onLocationSelect?.(location)}
        >
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground text-sm">
                    {location.name}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    {location.address}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {location.city}, {location.country}
                  </p>
                </div>
                
                {location.distance && (
                  <Badge variant="outline" className="text-xs">
                    {location.distance.toFixed(1)} km
                  </Badge>
                )}
              </div>

              {location.phone && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Phone className="h-3 w-3" />
                  <a 
                    href={`tel:${location.phone}`}
                    className="text-primary hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {location.phone}
                  </a>
                </div>
              )}

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>Next Service:</span>
                </div>
                {location.services.slice(0, 1).map((service, index) => (
                  <div key={index} className="text-xs">
                    <span className="font-medium">{service.name}</span>
                    <span className="text-muted-foreground ml-2">
                      {service.day} {service.time}
                    </span>
                  </div>
                ))}
                {location.services.length > 1 && (
                  <p className="text-xs text-muted-foreground">
                    +{location.services.length - 1} more services
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      
      {locations.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-foreground mb-2">No Locations Found</h3>
            <p className="text-sm text-muted-foreground">
              We're expanding to new locations. Check back soon!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}