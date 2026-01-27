import { ArrowLeft, Radio as RadioIcon, Clock, MapPin, ExternalLink, Facebook, Twitter, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface RadioProps {
  onBack: () => void
}

interface RadioStation {
  name: string
  frequency: string
  schedule: string
  websiteUrl?: string
}

const nigeriaStations: RadioStation[] = [
  { name: "DARLING FM, OWERRI", frequency: "107.3", schedule: "SUN 9AM – 9:30AM", websiteUrl: "https://www.darlingfm.ng/" },
  { name: "RHYTHM FM, BAYELSA", frequency: "94.7", schedule: "SUN 8:30AM – 9AM", websiteUrl: "https://onlineradiobox.com/ng/rhythm947/" },
  { name: "BROTHERS FM, MAKURDI", frequency: "90.5", schedule: "WED 10:30AM – 11AM" },
  { name: "TOAST FM, OWERRI", frequency: "90.3", schedule: "SUN 7AM – 7:30AM", websiteUrl: "https://www.facebook.com/903toastfm/" },
  { name: "BLAZE FM, ANAMBRA", frequency: "91.5", schedule: "SUN 5:45PM – 6:15PM", websiteUrl: "https://www.facebook.com/blaze915fm/" },
  { name: "JOY FM, MAKURDI", frequency: "96.5", schedule: "SUN 5:30PM – 6PM", websiteUrl: "https://www.facebook.com/Joyfm96.5/" },
  { name: "VISION FM, KADUNA", frequency: "92.5", schedule: "SUN 4:30PM – 5PM", websiteUrl: "https://onlineradiobox.com/ng/visionfmkaduna/" },
  { name: "JATTO FM, KOGI", frequency: "102.7", schedule: "FRI 7:30PM – 8PM", websiteUrl: "https://www.facebook.com/jattofmradio/" },
  { name: "EBSU FM, EBONYI", frequency: "93.3", schedule: "TUES 10AM – 10:30AM", websiteUrl: "https://www.facebook.com/ebsu.edu.ng/" },
  { name: "HIT FM, CALABAR", frequency: "95.9", schedule: "WED 7:30PM – 8PM", websiteUrl: "https://hitfmcalabar.com/" },
  { name: "PEOPLES FM, BAYELSA", frequency: "93.1", schedule: "MON 4:30PM – 5PM", websiteUrl: "https://radio.org.ng/people-s-93-1-fm/" },
  { name: "CARITAS FM, ENUGU", frequency: "98.7", schedule: "FRI 8:20PM – 8:40PM", websiteUrl: "https://www.facebook.com/caritasfm987/" },
  { name: "SPEED FM, BENIN", frequency: "96.9", schedule: "FRI 11:05AM – 11:35AM", websiteUrl: "https://x.com/speedfm969" },
  { name: "SUPER FM, BENIN", frequency: "88.1", schedule: "SUN 3:30PM – 4PM", websiteUrl: "https://superfm.online/ph/" },
  { name: "INVICTA FM, KADUNA", frequency: "98.9", schedule: "SUN 5:30PM – 6PM", websiteUrl: "https://onlineradiobox.com/ng/invictafm/" },
  { name: "SUPER FM, IJEBU", frequency: "96.3", schedule: "SUN 9:30AM – 10AM", websiteUrl: "https://www.superfm963.com/" },
  { name: "DIAMOND FM, OSUN", frequency: "88.5", schedule: "WED 5:30PM – 6PM", websiteUrl: "https://www.facebook.com/Diamond885fm/" },
  { name: "DIAMOND FM, KWARA", frequency: "88.7", schedule: "SUN 9:30AM – 10AM", websiteUrl: "https://www.facebook.com/Diamond887FM/" },
  { name: "XL FM, AKWA IBOM", frequency: "106.9", schedule: "TUES 9:15PM – 9:45PM", websiteUrl: "https://www.facebook.com/xl1069fm/" },
  { name: "ROYAL FM, ILORIN", frequency: "95.1", schedule: "WED 6:30PM – 7PM", websiteUrl: "http://www.royalfm.net" },
  { name: "ROYAL FM, KADUNA", frequency: "93.3", schedule: "WED 6:30PM – 7PM", websiteUrl: "https://royalfm933.net.ng/" },
  { name: "HERITAGE FM, AKWA IBOM", frequency: "104.9", schedule: "FRI 6:30PM – 7PM", websiteUrl: "https://www.facebook.com/HeritageRadio104.9/" },
  { name: "INSPIRATION FM, UYO", frequency: "105.9", schedule: "SUN 4PM – 4:30PM", websiteUrl: "https://inspirationfm.ng/" },
  { name: "SPARKLING FM, CALABAR", frequency: "92.3", schedule: "SUN 9AM – 9:30AM", websiteUrl: "https://sparkling923fm.com/" },
  { name: "SUPER FM, PORTHARCOURT", frequency: "93.3", schedule: "SUN 10AM – 10:30AM", websiteUrl: "https://superfm.online/station/?id=superfm933" },
  { name: "HARVEST FM, MAKURDI", frequency: "103.5", schedule: "TUES 10AM – 10:30AM", websiteUrl: "https://twitter.com/harvest1035fm" },
]

const ghanaStations: RadioStation[] = [
  { name: "ATL FM, CAPE COAST", frequency: "100.5", schedule: "TUES 12:30PM – 1PM", websiteUrl: "https://atlfmnews.com/" },
  { name: "BISHARA FM, RAMALE", frequency: "97.7", schedule: "WED 9AM – 9:30AM", websiteUrl: "https://www.facebook.com/BisharaRadio/" },
  { name: "CLASSIC FM, TECHIMAN", frequency: "91.9", schedule: "SUN 10AM – 10:30AM", websiteUrl: "https://www.facebook.com/classic91.9fmtechiman/" },
  { name: "SWEET MELODIES FM, ACCRA", frequency: "94.3", schedule: "SAT 7:30AM – 8AM", websiteUrl: "https://www.sweetmelodiesfm.com/" },
  { name: "GREENA, SUNYANI", frequency: "95.9", schedule: "FRI 7PM – 7:30PM", websiteUrl: "https://www.facebook.com/Greena95.9fm/" },
  { name: "LOVE FM, KUMASI", frequency: "99.5", schedule: "TUES 5:15AM – 5:45AM", websiteUrl: "https://onlineradiobox.com/gh/luv/" },
  { name: "SWISS FM, HO", frequency: "93.7", schedule: "WED 12:30PM – 1PM", websiteUrl: "https://www.facebook.com/swiss93.7fm/" },
  { name: "WORD FM, BOLGATANGA", frequency: "88.3", schedule: "TUES 7PM – 7:30PM", websiteUrl: "https://www.facebook.com/wordfm88.3/" },
  { name: "FOX FM, KUMASI", frequency: "97.6", schedule: "SUN 5PM – 5:30PM", websiteUrl: "https://zeno.fm/radio/fox-97-9-fm/" },
  { name: "HITZ FM, KUMASI", frequency: "97.9", schedule: "WED 4:30AM – 5AM", websiteUrl: "https://ghana-radio.com/12-hitz-fm.html" },
  { name: "ANGEL FM, KWARA", frequency: "96.1", schedule: "SAT 8:20PM – 8:50PM", websiteUrl: "https://thenonstopradio.com/radio/angel_fm_96_1_gh" },
]

const getLinkInfo = (url: string) => {
  if (url.includes('facebook.com')) {
    return { icon: Facebook, label: 'Facebook' }
  }
  if (url.includes('twitter.com') || url.includes('x.com')) {
    return { icon: Twitter, label: 'Twitter/X' }
  }
  return { icon: Globe, label: 'Website' }
}

const StationCard = ({ station, variant }: { station: RadioStation; variant: 'nigeria' | 'ghana' }) => {
  const linkInfo = station.websiteUrl ? getLinkInfo(station.websiteUrl) : null
  const LinkIcon = linkInfo?.icon
  
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardContent className="p-0">
        <div className={`px-4 py-3 ${
          variant === 'nigeria' 
            ? 'bg-gradient-to-r from-amber-500 to-orange-500' 
            : 'bg-gradient-to-r from-emerald-500 to-teal-500'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-white font-bold text-lg">{station.frequency} FM</span>
            <RadioIcon className="h-5 w-5 text-white" />
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <MapPin className={`h-4 w-4 ${variant === 'nigeria' ? 'text-amber-600' : 'text-emerald-600'}`} />
            {station.name}
          </h3>
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
  )
}

const CountrySection = ({ 
  country, 
  stations, 
  flagEmoji,
  variant
}: { 
  country: string
  stations: RadioStation[]
  flagEmoji: string
  variant: 'nigeria' | 'ghana'
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
        {stations.map((station, index) => (
          <StationCard key={index} station={station} variant={variant} />
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
          variant="nigeria"
        />
        <CountrySection 
          country="Ghana" 
          stations={ghanaStations} 
          flagEmoji="🇬🇭"
          variant="ghana"
        />
      </div>
    </div>
  )
}

export default Radio
