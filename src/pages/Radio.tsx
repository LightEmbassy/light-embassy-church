import { useState, useRef, useEffect, useMemo } from "react"
import { ArrowLeft, Radio as RadioIcon, Clock, MapPin, Facebook, Twitter, Globe, Filter, Search, MapPinned, Navigation, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { countries, calculateDistance, Country } from "@/data/countries"
import { radioStations, nigeriaStations, ghanaStations, RadioStation } from "@/data/radioStations"
import { cn } from "@/lib/utils"

interface RadioProps {
  onBack: () => void
}

const getLinkInfo = (url: string) => {
  if (url.includes('facebook.com')) {
    return { icon: Facebook, label: 'Facebook' }
  }
  if (url.includes('twitter.com') || url.includes('x.com')) {
    return { icon: Twitter, label: 'Twitter/X' }
  }
  return { icon: Globe, label: 'Website' }
}

const StationCard = ({ 
  station, 
  variant,
  isHighlighted,
  stationRef
}: { 
  station: RadioStation
  variant: 'nigeria' | 'ghana'
  isHighlighted: boolean
  stationRef?: React.RefObject<HTMLDivElement>
}) => {
  const linkInfo = station.websiteUrl ? getLinkInfo(station.websiteUrl) : null
  const LinkIcon = linkInfo?.icon
  
  return (
    <div ref={stationRef}>
      <Card className={cn(
        "overflow-hidden transition-all duration-500",
        isHighlighted 
          ? "ring-4 ring-primary shadow-2xl scale-[1.02] z-10" 
          : "hover:shadow-lg"
      )}>
        <CardContent className="p-0">
          <div className={cn(
            "px-4 py-3",
            variant === 'nigeria' 
              ? 'bg-gradient-to-r from-amber-500 to-orange-500' 
              : 'bg-gradient-to-r from-emerald-500 to-teal-500'
          )}>
            <div className="flex items-center justify-between">
              <span className="text-white font-bold text-lg">{station.frequency} FM</span>
              <div className="flex items-center gap-2">
                {isHighlighted && (
                  <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Navigation className="h-3 w-3" />
                    Closest
                  </span>
                )}
                <RadioIcon className="h-5 w-5 text-white" />
              </div>
            </div>
          </div>
          <div className={cn(
            "p-4",
            isHighlighted && "bg-primary/5"
          )}>
            <h3 className="font-semibold text-foreground mb-1 flex items-center gap-2">
              <MapPin className={`h-4 w-4 flex-shrink-0 ${variant === 'nigeria' ? 'text-amber-600' : 'text-emerald-600'}`} />
              {station.name}
            </h3>
            <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
              {station.description}
            </p>
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-3">
              <Clock className="h-4 w-4" />
              <span>{station.schedule}</span>
            </div>
            {station.websiteUrl && LinkIcon && (
              <a 
                href={station.websiteUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-1.5 text-sm font-medium transition-colors ${
                  variant === 'nigeria' 
                    ? 'text-amber-600 hover:text-amber-700' 
                    : 'text-emerald-600 hover:text-emerald-700'
                }`}
              >
                <LinkIcon className="h-3.5 w-3.5" />
                {linkInfo.label}
              </a>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

const CountrySection = ({ 
  country, 
  stations, 
  flagEmoji,
  variant,
  highlightedStationId,
  highlightedStationRef
}: { 
  country: string
  stations: RadioStation[]
  flagEmoji: string
  variant: 'nigeria' | 'ghana'
  highlightedStationId: string | null
  highlightedStationRef: React.RefObject<HTMLDivElement>
}) => (
  <div className="mb-12">
    <div className="flex items-center gap-3 mb-6">
      <span className="text-3xl">{flagEmoji}</span>
      <h2 className="font-playfair text-2xl font-bold text-foreground">{country}</h2>
      <span className={`text-sm font-medium px-3 py-1 rounded-full ${
        variant === 'nigeria' 
          ? 'bg-amber-100 text-amber-800' 
          : 'bg-emerald-100 text-emerald-800'
      }`}>
        {stations.length} station{stations.length !== 1 ? 's' : ''}
      </span>
    </div>
    {stations.length > 0 ? (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stations.map((station) => (
          <StationCard 
            key={station.id} 
            station={station} 
            variant={variant}
            isHighlighted={station.id === highlightedStationId}
            stationRef={station.id === highlightedStationId ? highlightedStationRef : undefined}
          />
        ))}
      </div>
    ) : null}
  </div>
)

const Radio = ({ onBack }: RadioProps) => {
  const [showOnlyWithLinks, setShowOnlyWithLinks] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null)
  const [open, setOpen] = useState(false)
  
  const highlightedStationRef = useRef<HTMLDivElement>(null)

  // Find closest station to selected country
  const closestStation = useMemo(() => {
    if (!selectedCountry) return null
    
    let closest: RadioStation | null = null
    let minDistance = Infinity
    
    for (const station of radioStations) {
      const distance = calculateDistance(
        selectedCountry.lat,
        selectedCountry.lng,
        station.lat,
        station.lng
      )
      if (distance < minDistance) {
        minDistance = distance
        closest = station
      }
    }
    
    return closest
  }, [selectedCountry])

  // Scroll to highlighted station when it changes
  useEffect(() => {
    if (closestStation && highlightedStationRef.current) {
      setTimeout(() => {
        highlightedStationRef.current?.scrollIntoView({ 
          behavior: "smooth", 
          block: "center" 
        })
      }, 100)
    }
  }, [closestStation])

  const filterStations = (stations: RadioStation[]) => {
    return stations.filter(s => {
      const matchesSearch = searchQuery === "" || 
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.frequency.includes(searchQuery)
      const matchesLinkFilter = !showOnlyWithLinks || s.websiteUrl
      return matchesSearch && matchesLinkFilter
    })
  }

  const filteredNigeriaStations = filterStations(nigeriaStations)
  const filteredGhanaStations = filterStations(ghanaStations)

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-orange-500 pt-4 pb-8 px-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="text-white hover:bg-white/20 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <RadioIcon className="h-8 w-8 text-white animate-pulse" />
            <h1 className="font-playfair text-2xl md:text-3xl font-bold text-white">
              Live Radio
            </h1>
            <RadioIcon className="h-8 w-8 text-white animate-pulse" />
          </div>
          <p className="text-white/90">
            Life transforming teaching broadcast live on a daily basis
          </p>
        </div>
      </div>

      {/* Introduction */}
      <div className="px-4 py-6">
        <p className="text-center text-muted-foreground max-w-2xl mx-auto">
          Listen to Light Embassy's life-transforming teaching on FM radio stations. 
          Find a station near you and tune in at the scheduled time.
        </p>
      </div>

      {/* Search and Filter */}
      <div className="px-4 pb-6 max-w-6xl mx-auto space-y-4">
        {/* Country Selector */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 bg-primary/5 border border-primary/20 rounded-lg">
          <div className="flex items-center gap-2">
            <MapPinned className="h-5 w-5 text-primary" />
            <Label className="text-sm font-medium whitespace-nowrap">Find nearest station:</Label>
          </div>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full sm:w-[300px] justify-between bg-background"
              >
                {selectedCountry ? (
                  <span className="flex items-center gap-2">
                    <span>{selectedCountry.flag}</span>
                    <span>{selectedCountry.name}</span>
                  </span>
                ) : (
                  <span className="text-muted-foreground">Select your country...</span>
                )}
                <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0 bg-background border shadow-lg z-50" align="start">
              <Command>
                <CommandInput placeholder="Search countries..." />
                <CommandList>
                  <CommandEmpty>No country found.</CommandEmpty>
                  <CommandGroup className="max-h-[300px] overflow-y-auto">
                    {countries.map((country) => (
                      <CommandItem
                        key={country.code}
                        value={country.name}
                        onSelect={() => {
                          setSelectedCountry(country)
                          setOpen(false)
                        }}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <span>{country.flag}</span>
                        <span>{country.name}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          {selectedCountry && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setSelectedCountry(null)}
              className="text-muted-foreground hover:text-foreground"
            >
              Clear
            </Button>
          )}
        </div>

        {/* Closest Station Info */}
        {selectedCountry && closestStation && (
          <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg">
            <div className="flex items-center gap-2 text-primary font-medium">
              <Navigation className="h-4 w-4" />
              <span>
                Closest station to {selectedCountry.name}: <strong>{closestStation.name}</strong> ({closestStation.frequency} FM)
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Located in {closestStation.country === 'nigeria' ? 'Nigeria 🇳🇬' : 'Ghana 🇬🇭'}
            </p>
          </div>
        )}

        {/* Search Box */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by station name, location, or frequency..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {/* Filter Toggle */}
        <div className="flex items-center justify-center gap-3 p-4 bg-muted/50 rounded-lg">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Switch
            id="streaming-filter"
            checked={showOnlyWithLinks}
            onCheckedChange={setShowOnlyWithLinks}
          />
          <Label htmlFor="streaming-filter" className="text-sm font-medium cursor-pointer">
            Show only stations with streaming links
          </Label>
        </div>
      </div>

      {/* Radio Stations by Country */}
      <div className="px-4 pb-8 max-w-6xl mx-auto">
        {filteredNigeriaStations.length === 0 && filteredGhanaStations.length === 0 ? (
          <div className="bg-muted/50 rounded-lg p-8 text-center">
            <RadioIcon className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-muted-foreground mb-4">
              No stations found matching your search criteria.
            </p>
            <a 
              href="https://lightembassychurch.podbean.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              Listen on Podbean Instead
            </a>
            <p className="text-sm text-muted-foreground mt-3">
              Access our full library of teachings and messages online
            </p>
          </div>
        ) : (
          <>
            <CountrySection 
              country="Nigeria" 
              stations={filteredNigeriaStations} 
              flagEmoji="🇳🇬"
              variant="nigeria"
              highlightedStationId={closestStation?.id || null}
              highlightedStationRef={highlightedStationRef}
            />
            <CountrySection 
              country="Ghana" 
              stations={filteredGhanaStations} 
              flagEmoji="🇬🇭"
              variant="ghana"
              highlightedStationId={closestStation?.id || null}
              highlightedStationRef={highlightedStationRef}
            />
          </>
        )}
      </div>
    </div>
  )
}

export default Radio
