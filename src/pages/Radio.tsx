import { useState } from "react"
import { ArrowLeft, Radio as RadioIcon, Clock, MapPin, Facebook, Twitter, Globe, Filter, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

interface RadioProps {
  onBack: () => void
}

interface RadioStation {
  name: string
  frequency: string
  schedule: string
  description: string
  websiteUrl?: string
}

const nigeriaStations: RadioStation[] = [
  { name: "DARLING FM, OWERRI", frequency: "107.3", schedule: "SUN 9AM – 9:30AM", description: "Edu-attainment station focusing on Christian lifestyle, urban contemporary music, and intelligent talk shows.", websiteUrl: "https://www.darlingfm.ng/" },
  { name: "RHYTHM FM, BAYELSA", frequency: "94.7", schedule: "SUN 8:30AM – 9AM", description: "Urban contemporary station with steady music rotation including Reggae, Gospel, Jazz and educational programs.", websiteUrl: "https://onlineradiobox.com/ng/rhythm947/" },
  { name: "BROTHERS FM, MAKURDI", frequency: "90.5", schedule: "WED 10:30AM – 11AM", description: "Community-focused station serving Benue State with local news, talk shows, and family programming." },
  { name: "TOAST FM, OWERRI", frequency: "90.3", schedule: "SUN 7AM – 7:30AM", description: "Popular Owerri station offering a blend of news, entertainment, and community-focused programming.", websiteUrl: "https://www.facebook.com/903toastfm/" },
  { name: "BLAZE FM, ANAMBRA", frequency: "91.5", schedule: "SUN 5:45PM – 6:15PM", description: "Dynamic station serving Anambra with contemporary music, news, and youth-oriented content.", websiteUrl: "https://www.facebook.com/blaze915fm/" },
  { name: "JOY FM, MAKURDI", frequency: "96.5", schedule: "SUN 5:30PM – 6PM", description: "Benue State's beloved station featuring uplifting content, local news, and family entertainment.", websiteUrl: "https://www.facebook.com/Joyfm96.5/" },
  { name: "VISION FM, KADUNA", frequency: "92.5", schedule: "SUN 4:30PM – 5PM", description: "Multi-city network focusing on authoritative news, talk shows, and community-centric discussions.", websiteUrl: "https://onlineradiobox.com/ng/visionfmkaduna/" },
  { name: "JATTO FM, KOGI", frequency: "102.7", schedule: "FRI 7:30PM – 8PM", description: "Kogi State's community station delivering local news, cultural programming, and entertainment.", websiteUrl: "https://www.facebook.com/jattofmradio/" },
  { name: "EBSU FM, EBONYI", frequency: "93.3", schedule: "TUES 10AM – 10:30AM", description: "University-based station providing educational content, news, and cultural programming for Ebonyi.", websiteUrl: "https://www.facebook.com/ebsu.edu.ng/" },
  { name: "HIT FM, CALABAR", frequency: "95.9", schedule: "WED 7:30PM – 8PM", description: "Cross River's first private urban music station focusing on lifestyle, hit music, and youth entertainment.", websiteUrl: "https://hitfmcalabar.com/" },
  { name: "PEOPLES FM, BAYELSA", frequency: "93.1", schedule: "MON 4:30PM – 5PM", description: "Voice of the Niger Delta with hourly news, current affairs, and regional developmental discourse.", websiteUrl: "https://radio.org.ng/people-s-93-1-fm/" },
  { name: "CARITAS FM, ENUGU", frequency: "98.7", schedule: "FRI 8:20PM – 8:40PM", description: "Catholic-owned station promoting faith, family values, and community development in Enugu.", websiteUrl: "https://www.facebook.com/caritasfm987/" },
  { name: "SPEED FM, BENIN", frequency: "96.9", schedule: "FRI 11:05AM – 11:35AM", description: "Grassroots station broadcasting in Pidgin English, covering news and social justice issues.", websiteUrl: "https://x.com/speedfm969" },
  { name: "SUPER FM, BENIN", frequency: "88.1", schedule: "SUN 3:30PM – 4PM", description: "Family-oriented station promoting programs that inform, inspire, and foster positive family values.", websiteUrl: "https://superfm.online/ph/" },
  { name: "INVICTA FM, KADUNA", frequency: "98.9", schedule: "SUN 5:30PM – 6PM", description: "Kaduna's premier station offering balanced news, current affairs, and entertainment programming.", websiteUrl: "https://onlineradiobox.com/ng/invictafm/" },
  { name: "SUPER FM, IJEBU", frequency: "96.3", schedule: "SUN 9:30AM – 10AM", description: "Community station serving Ijebu with family programs, local news, and inspirational content.", websiteUrl: "https://www.superfm963.com/" },
  { name: "DIAMOND FM, OSUN", frequency: "88.5", schedule: "WED 5:30PM – 6PM", description: "Urban contemporary station excelling in news dissemination, nation-building, and arts/culture.", websiteUrl: "https://www.facebook.com/Diamond885fm/" },
  { name: "DIAMOND FM, KWARA", frequency: "88.7", schedule: "SUN 9:30AM – 10AM", description: "Contemporary station focusing on quality news, community discourse, and cultural programming.", websiteUrl: "https://www.facebook.com/Diamond887FM/" },
  { name: "XL FM, AKWA IBOM", frequency: "106.9", schedule: "TUES 9:15PM – 9:45PM", description: "Akwa Ibom's vibrant station with urban music, entertainment news, and youth-focused content.", websiteUrl: "https://www.facebook.com/xl1069fm/" },
  { name: "ROYAL FM, ILORIN", frequency: "95.1", schedule: "WED 6:30PM – 7PM", description: "General interest station providing news, talk, and music as a primary voice in Kwara region.", websiteUrl: "http://www.royalfm.net" },
  { name: "ROYAL FM, KADUNA", frequency: "93.3", schedule: "WED 6:30PM – 7PM", description: "Kaduna-based station offering diverse programming including news, talk shows, and entertainment.", websiteUrl: "https://royalfm933.net.ng/" },
  { name: "HERITAGE FM, AKWA IBOM", frequency: "104.9", schedule: "FRI 6:30PM – 7PM", description: "Cultural heritage station celebrating Akwa Ibom traditions while delivering news and entertainment.", websiteUrl: "https://www.facebook.com/HeritageRadio104.9/" },
  { name: "INSPIRATION FM, UYO", frequency: "105.9", schedule: "SUN 4PM – 4:30PM", description: "Family-focused station dedicated to positive, uplifting content, gospel music, and lifestyle talk.", websiteUrl: "https://inspirationfm.ng/" },
  { name: "SPARKLING FM, CALABAR", frequency: "92.3", schedule: "SUN 9AM – 9:30AM", description: "Urban contemporary music and entertainment news station serving the Calabar metropolis.", websiteUrl: "https://sparkling923fm.com/" },
  { name: "SUPER FM, PORTHARCOURT", frequency: "93.3", schedule: "SUN 10AM – 10:30AM", description: "Port Harcourt's family station promoting positive values through informative and inspiring programs.", websiteUrl: "https://superfm.online/station/?id=superfm933" },
  { name: "HARVEST FM, MAKURDI", frequency: "103.5", schedule: "TUES 10AM – 10:30AM", description: "Agricultural and community station focusing on farming, rural development, and local news.", websiteUrl: "https://twitter.com/harvest1035fm" },
]

const ghanaStations: RadioStation[] = [
  { name: "ATL FM, CAPE COAST", frequency: "100.5", schedule: "TUES 12:30PM – 1PM", description: "University of Cape Coast's official voice providing scholarly broadcasting, authentic news, and educational talks.", websiteUrl: "https://atlfmnews.com/" },
  { name: "BISHARA FM, RAMALE", frequency: "97.7", schedule: "WED 9AM – 9:30AM", description: "Northern region station focusing on community development, local news, and diverse cultural programming.", websiteUrl: "https://www.facebook.com/BisharaRadio/" },
  { name: "CLASSIC FM, TECHIMAN", frequency: "91.9", schedule: "SUN 10AM – 10:30AM", description: "Prominent Bono East region station focusing on news, agriculture, and local commerce.", websiteUrl: "https://www.facebook.com/classic91.9fmtechiman/" },
  { name: "SWEET MELODIES FM, ACCRA", frequency: "94.3", schedule: "SAT 7:30AM – 8AM", description: "Christian-themed station focusing on uplifting gospel music, sermons, and spiritual growth programs.", websiteUrl: "https://www.sweetmelodiesfm.com/" },
  { name: "GREENA, SUNYANI", frequency: "95.9", schedule: "FRI 7PM – 7:30PM", description: "Commercial station focusing on news, sports, and entertainment for the Sunyani municipality.", websiteUrl: "https://www.facebook.com/Greena95.9fm/" },
  { name: "LOVE FM, KUMASI", frequency: "99.5", schedule: "TUES 5:15AM – 5:45AM", description: "Multimedia Group station with adult contemporary music, social issues, and family-oriented talk shows.", websiteUrl: "https://onlineradiobox.com/gh/luv/" },
  { name: "SWISS FM, HO", frequency: "93.7", schedule: "WED 12:30PM – 1PM", description: "Volta Region's community station delivering local news, cultural programs, and entertainment.", websiteUrl: "https://www.facebook.com/swiss93.7fm/" },
  { name: "WORD FM, BOLGATANGA", frequency: "88.3", schedule: "TUES 7PM – 7:30PM", description: "Upper East Region station promoting faith-based content, community news, and local development.", websiteUrl: "https://www.facebook.com/wordfm88.3/" },
  { name: "FOX FM, KUMASI", frequency: "97.6", schedule: "SUN 5PM – 5:30PM", description: "Popular commercial station known for robust news coverage, sports, and high-energy morning shows.", websiteUrl: "https://zeno.fm/radio/fox-97-9-fm/" },
  { name: "HITZ FM, KUMASI", frequency: "97.9", schedule: "WED 4:30AM – 5AM", description: "Youth-centric station focusing on the latest hits, entertainment news, and pop culture.", websiteUrl: "https://ghana-radio.com/12-hitz-fm.html" },
  { name: "ANGEL FM, KUMASI", frequency: "96.1", schedule: "SAT 8:20PM – 8:50PM", description: "High-impact commercial station focusing on socio-political talk, local news, and diverse entertainment.", websiteUrl: "https://thenonstopradio.com/radio/angel_fm_96_1_gh" },
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
  const [showOnlyWithLinks, setShowOnlyWithLinks] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

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
              Radio in Your Area
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
        <CountrySection 
          country="Nigeria" 
          stations={filteredNigeriaStations} 
          flagEmoji="🇳🇬"
          variant="nigeria"
        />
        <CountrySection 
          country="Ghana" 
          stations={filteredGhanaStations} 
          flagEmoji="🇬🇭"
          variant="ghana"
        />
      </div>
    </div>
  )
}

export default Radio
