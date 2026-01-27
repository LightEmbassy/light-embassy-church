import { ArrowLeft, Radio as RadioIcon, Clock, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface RadioProps {
  onBack: () => void
}

interface RadioStation {
  name: string
  frequency: string
  schedule: string
}

const nigeriaStations: RadioStation[] = [
  { name: "DARLING FM, OWERRI", frequency: "107.3", schedule: "SUN 9AM – 9:30AM" },
  { name: "RHYTHM FM, BAYELSA", frequency: "94.7", schedule: "SUN 8:30AM – 9AM" },
  { name: "BROTHERS FM, MAKURDI", frequency: "90.5", schedule: "WED 10:30AM – 11AM" },
  { name: "TOAST FM, OWERRI", frequency: "90.3", schedule: "SUN 7AM – 7:30AM" },
  { name: "BLAZE FM, ANAMBRA", frequency: "91.5", schedule: "SUN 5:45PM – 6:15PM" },
  { name: "JOY FM, MAKURDI", frequency: "96.5", schedule: "SUN 5:30PM – 6PM" },
  { name: "VISION FM, KADUNA", frequency: "92.5", schedule: "SUN 4:30PM – 5PM" },
  { name: "JATTO FM, KOGI", frequency: "102.7", schedule: "FRI 7:30PM – 8PM" },
  { name: "EBSU FM, EBONYI", frequency: "93.3", schedule: "TUES 10AM – 10:30AM" },
  { name: "HIT FM, CALABAR", frequency: "95.9", schedule: "WED 7:30PM – 8PM" },
  { name: "PEOPLES FM, BAYELSA", frequency: "93.1", schedule: "MON 4:30PM – 5PM" },
  { name: "CARITAS FM, ENUGU", frequency: "98.7", schedule: "FRI 8:20PM – 8:40PM" },
  { name: "SPEED FM, BENIN", frequency: "96.9", schedule: "FRI 11:05AM – 11:35AM" },
  { name: "SUPER FM, BENIN", frequency: "88.1", schedule: "SUN 3:30PM – 4PM" },
  { name: "INVICTA FM, KADUNA", frequency: "98.9", schedule: "SUN 5:30PM – 6PM" },
  { name: "SUPER FM, IJEBU", frequency: "96.3", schedule: "SUN 9:30AM – 10AM" },
  { name: "DIAMOND FM, OSUN", frequency: "88.5", schedule: "WED 5:30PM – 6PM" },
  { name: "DIAMOND FM, KWARA", frequency: "88.7", schedule: "SUN 9:30AM – 10AM" },
  { name: "XL FM, AKWA IBOM", frequency: "106.9", schedule: "TUES 9:15PM – 9:45PM" },
  { name: "ROYAL FM, ILORIN", frequency: "95.1", schedule: "WED 6:30PM – 7PM" },
  { name: "ROYAL FM, KADUNA", frequency: "93.3", schedule: "WED 6:30PM – 7PM" },
  { name: "HERITAGE FM, AKWA IBOM", frequency: "104.9", schedule: "FRI 6:30PM – 7PM" },
  { name: "INSPIRATION FM, UYO", frequency: "105.9", schedule: "SUN 4PM – 4:30PM" },
  { name: "SPARKLING FM, CALABAR", frequency: "92.3", schedule: "SUN 9AM – 9:30AM" },
  { name: "SUPER FM, PORTHARCOURT", frequency: "93.3", schedule: "SUN 10AM – 10:30AM" },
  { name: "HARVEST FM, MAKURDI", frequency: "103.5", schedule: "TUES 10AM – 10:30AM" },
]

const ghanaStations: RadioStation[] = [
  { name: "ATL FM, CAPE COAST", frequency: "100.5", schedule: "TUES 12:30PM – 1PM" },
  { name: "BISHARA FM, RAMALE", frequency: "97.7", schedule: "WED 9AM – 9:30AM" },
  { name: "CLASSIC FM, TECHIMAN", frequency: "91.9", schedule: "SUN 10AM – 10:30AM" },
  { name: "SWEET MELODIES FM, ACCRA", frequency: "94.3", schedule: "SAT 7:30AM – 8AM" },
  { name: "GREENA, SUNYANI", frequency: "95.9", schedule: "FRI 7PM – 7:30PM" },
  { name: "LOVE FM, KUMASI", frequency: "99.5", schedule: "TUES 5:15AM – 5:45AM" },
  { name: "SWISS FM, HO", frequency: "93.7", schedule: "WED 12:30PM – 1PM" },
  { name: "WORD FM, BOLGATANGA", frequency: "88.3", schedule: "TUES 7PM – 7:30PM" },
  { name: "FOX FM, KUMASI", frequency: "97.6", schedule: "SUN 5PM – 5:30PM" },
  { name: "HITZ FM, KUMASI", frequency: "97.9", schedule: "WED 4:30AM – 5AM" },
  { name: "ANGEL FM, KWARA", frequency: "96.1", schedule: "SAT 8:20PM – 8:50PM" },
]

const StationCard = ({ station }: { station: RadioStation }) => (
  <Card className="overflow-hidden hover:shadow-lg transition-shadow">
    <CardContent className="p-0">
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-3">
        <div className="flex items-center justify-between">
          <span className="text-white font-bold text-lg">{station.frequency} FM</span>
          <RadioIcon className="h-5 w-5 text-white" />
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
          <MapPin className="h-4 w-4 text-amber-600" />
          {station.name}
        </h3>
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Clock className="h-4 w-4" />
          <span>{station.schedule}</span>
        </div>
      </div>
    </CardContent>
  </Card>
)

const CountrySection = ({ 
  country, 
  stations, 
  flagEmoji 
}: { 
  country: string
  stations: RadioStation[]
  flagEmoji: string
}) => (
  <div className="mb-12">
    <div className="flex items-center gap-3 mb-6">
      <span className="text-3xl">{flagEmoji}</span>
      <h2 className="font-playfair text-2xl font-bold text-foreground">{country}</h2>
      <span className="bg-amber-100 text-amber-800 text-sm font-medium px-3 py-1 rounded-full">
        {stations.length} station{stations.length !== 1 ? 's' : ''}
      </span>
    </div>
    {stations.length > 0 ? (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stations.map((station, index) => (
          <StationCard key={index} station={station} />
        ))}
      </div>
    ) : (
      <div className="bg-muted/50 rounded-lg p-8 text-center">
        <RadioIcon className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
        <p className="text-muted-foreground">
          Coming soon! Stay tuned for radio stations in {country}.
        </p>
      </div>
    )}
  </div>
)

const Radio = ({ onBack }: RadioProps) => {
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
              Radio in Your Area
            </h1>
            <RadioIcon className="h-8 w-8 text-white animate-pulse" />
          </div>
          <p className="text-white/90">
            Tune in to Light Embassy on FM Radio
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

      {/* Radio Stations by Country */}
      <div className="px-4 pb-8 max-w-6xl mx-auto">
        <CountrySection 
          country="Nigeria" 
          stations={nigeriaStations} 
          flagEmoji="🇳🇬" 
        />
        <CountrySection 
          country="Ghana" 
          stations={ghanaStations} 
          flagEmoji="🇬🇭" 
        />
      </div>
    </div>
  )
}

export default Radio
