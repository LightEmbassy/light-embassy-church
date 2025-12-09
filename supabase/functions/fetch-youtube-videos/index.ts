import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface YouTubeVideo {
  id: string
  title: string
  description: string
  thumbnail: string
  duration: string
  views: string
  publishedAt: string
  embedId: string
}

interface YouTubeSearchItem {
  id: { videoId?: string; playlistId?: string }
  snippet: {
    title: string
    description: string
    thumbnails: {
      high?: { url: string }
      medium?: { url: string }
      default?: { url: string }
    }
    publishedAt: string
  }
}

interface YouTubeVideoDetails {
  id: string
  contentDetails: {
    duration: string
  }
  statistics: {
    viewCount: string
  }
}

// Light Embassy Church channel ID
const CHANNEL_ID = 'UC5PXpZsZQQZxR0qv9QH_BdA'

// Playlist IDs for different categories
const PLAYLISTS = {
  podcast: 'PLqEHLUKupSnCw8WAJHCscE9f0lmFhzB_Z',
  devotional: 'PLqEHLUKupSnAOEp8ZSfuhu7H2CuKkRZKU',
  teaching: 'PLqEHLUKupSnB1GZiueI895TJJ9v6oRJoa'
}

function formatDuration(isoDuration: string): string {
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!match) return '0:00'
  
  const hours = match[1] ? parseInt(match[1]) : 0
  const minutes = match[2] ? parseInt(match[2]) : 0
  const seconds = match[3] ? parseInt(match[3]) : 0
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

function formatViews(viewCount: string): string {
  const count = parseInt(viewCount)
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M views`
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K views`
  }
  return `${count} views`
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - date.getTime())
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays < 1) return 'Today'
  if (diffDays === 1) return '1 day ago'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
  return `${Math.floor(diffDays / 365)} years ago`
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY')
    if (!YOUTUBE_API_KEY) {
      console.error('YOUTUBE_API_KEY not configured')
      throw new Error('YouTube API key not configured')
    }

    const { category = 'featured', maxResults = 10 } = await req.json().catch(() => ({}))
    console.log(`Fetching YouTube videos - category: ${category}, maxResults: ${maxResults}`)

    let videos: YouTubeVideo[] = []

    if (category === 'featured') {
      // Fetch latest videos from the channel
      const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${CHANNEL_ID}&maxResults=${maxResults}&order=date&type=video&key=${YOUTUBE_API_KEY}`
      console.log('Fetching channel videos...')
      
      const searchResponse = await fetch(searchUrl)
      if (!searchResponse.ok) {
        const errorText = await searchResponse.text()
        console.error('YouTube search API error:', searchResponse.status, errorText)
        throw new Error(`YouTube API error: ${searchResponse.status}`)
      }
      
      const searchData = await searchResponse.json()
      console.log(`Found ${searchData.items?.length || 0} videos`)
      
      if (searchData.items && searchData.items.length > 0) {
        const videoIds = searchData.items.map((item: YouTubeSearchItem) => item.id.videoId).join(',')
        
        // Get video details (duration, views)
        const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,statistics&id=${videoIds}&key=${YOUTUBE_API_KEY}`
        const detailsResponse = await fetch(detailsUrl)
        const detailsData = await detailsResponse.json()
        
        const detailsMap = new Map<string, YouTubeVideoDetails>()
        detailsData.items?.forEach((item: YouTubeVideoDetails) => {
          detailsMap.set(item.id, item)
        })
        
        videos = searchData.items.map((item: YouTubeSearchItem) => {
          const videoId = item.id.videoId || ''
          const details = detailsMap.get(videoId)
          
          return {
            id: videoId,
            title: item.snippet.title,
            description: item.snippet.description,
            thumbnail: item.snippet.thumbnails.high?.url || 
                       item.snippet.thumbnails.medium?.url || 
                       item.snippet.thumbnails.default?.url || 
                       `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
            duration: details ? formatDuration(details.contentDetails.duration) : '0:00',
            views: details ? formatViews(details.statistics.viewCount) : 'New',
            publishedAt: formatDate(item.snippet.publishedAt),
            embedId: videoId
          }
        })
      }
    } else if (PLAYLISTS[category as keyof typeof PLAYLISTS]) {
      // Fetch videos from a specific playlist
      const playlistId = PLAYLISTS[category as keyof typeof PLAYLISTS]
      const playlistUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=${maxResults}&key=${YOUTUBE_API_KEY}`
      console.log(`Fetching playlist ${playlistId}...`)
      
      const playlistResponse = await fetch(playlistUrl)
      if (!playlistResponse.ok) {
        const errorText = await playlistResponse.text()
        console.error('YouTube playlist API error:', playlistResponse.status, errorText)
        throw new Error(`YouTube API error: ${playlistResponse.status}`)
      }
      
      const playlistData = await playlistResponse.json()
      console.log(`Found ${playlistData.items?.length || 0} playlist items`)
      
      if (playlistData.items && playlistData.items.length > 0) {
        const videoIds = playlistData.items
          .map((item: any) => item.snippet.resourceId?.videoId)
          .filter(Boolean)
          .join(',')
        
        // Get video details
        const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,statistics&id=${videoIds}&key=${YOUTUBE_API_KEY}`
        const detailsResponse = await fetch(detailsUrl)
        const detailsData = await detailsResponse.json()
        
        const detailsMap = new Map<string, YouTubeVideoDetails>()
        detailsData.items?.forEach((item: YouTubeVideoDetails) => {
          detailsMap.set(item.id, item)
        })
        
        videos = playlistData.items.map((item: any) => {
          const videoId = item.snippet.resourceId?.videoId || ''
          const details = detailsMap.get(videoId)
          
          return {
            id: videoId,
            title: item.snippet.title,
            description: item.snippet.description,
            thumbnail: item.snippet.thumbnails?.high?.url || 
                       item.snippet.thumbnails?.medium?.url || 
                       item.snippet.thumbnails?.default?.url || 
                       `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
            duration: details ? formatDuration(details.contentDetails.duration) : '0:00',
            views: details ? formatViews(details.statistics.viewCount) : 'New',
            publishedAt: formatDate(item.snippet.publishedAt),
            embedId: videoId
          }
        })
      }
    }

    console.log(`Returning ${videos.length} videos`)
    return new Response(JSON.stringify({ videos }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error fetching YouTube videos:', error)
    return new Response(JSON.stringify({ error: error.message, videos: [] }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
