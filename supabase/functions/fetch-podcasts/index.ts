import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PodcastEpisode {
  id: string
  title: string
  description: string
  artwork: string
  duration: string
  publishedAt: string
  audioUrl: string
}

function extractImageFromContent(content: string): string | null {
  const imgMatch = content.match(/<img[^>]+src=["']([^"']+)["']/i)
  return imgMatch ? imgMatch[1] : null
}

function parseRSSDate(dateStr: string): string {
  try {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: '2-digit' 
    })
  } catch {
    return dateStr
  }
}

function parseDuration(duration: string): string {
  if (!duration) return ''
  
  // Handle HH:MM:SS or MM:SS format
  if (duration.includes(':')) return duration
  
  // Handle seconds
  const seconds = parseInt(duration)
  if (isNaN(seconds)) return duration
  
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const RSS_FEED_URL = 'https://feed.podbean.com/lightembassychurch/feed.xml'
    
    const response = await fetch(RSS_FEED_URL)
    if (!response.ok) {
      throw new Error(`Failed to fetch RSS feed: ${response.status}`)
    }
    
    const xmlText = await response.text()
    
    // Parse XML using regex (Deno edge functions don't have DOMParser)
    const episodes: PodcastEpisode[] = []
    
    // Get channel-level image as fallback
    const channelImageMatch = xmlText.match(/<channel>[\s\S]*?<image>[\s\S]*?<url>([^<]+)<\/url>/)
    const itunesImageMatch = xmlText.match(/<itunes:image[^>]+href=["']([^"']+)["']/)
    const fallbackImage = itunesImageMatch?.[1] || channelImageMatch?.[1] || 'https://pbcdn1.podbean.com/imglogo/image-logo/16660439/LEC_csvbaz.jpg'
    
    // Extract all items
    const itemMatches = xmlText.matchAll(/<item>([\s\S]*?)<\/item>/g)
    
    for (const match of itemMatches) {
      const itemContent = match[1]
      
      // Extract title
      const titleMatch = itemContent.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/)
      const title = titleMatch ? titleMatch[1].trim() : 'Untitled Episode'
      
      // Extract description (prefer content:encoded for full description)
      const contentEncodedMatch = itemContent.match(/<content:encoded>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/content:encoded>/)
      const descriptionMatch = itemContent.match(/<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/)
      const rawDescription = contentEncodedMatch?.[1] || descriptionMatch?.[1] || ''
      
      // Strip HTML tags for clean description
      const description = rawDescription.replace(/<[^>]*>/g, '').trim().substring(0, 300)
      
      // Extract episode-specific artwork
      const episodeImageMatch = itemContent.match(/<itunes:image[^>]+href=["']([^"']+)["']/)
      const mediaImageMatch = itemContent.match(/<media:thumbnail[^>]+url=["']([^"']+)["']/)
      const contentImage = extractImageFromContent(rawDescription)
      const artwork = episodeImageMatch?.[1] || mediaImageMatch?.[1] || contentImage || fallbackImage
      
      // Extract duration
      const durationMatch = itemContent.match(/<itunes:duration>([^<]+)<\/itunes:duration>/)
      const duration = parseDuration(durationMatch?.[1] || '')
      
      // Extract publish date
      const pubDateMatch = itemContent.match(/<pubDate>([^<]+)<\/pubDate>/)
      const publishedAt = parseRSSDate(pubDateMatch?.[1] || '')
      
      // Extract audio URL
      const enclosureMatch = itemContent.match(/<enclosure[^>]+url=["']([^"']+)["']/)
      const linkMatch = itemContent.match(/<link>([^<]+)<\/link>/)
      const audioUrl = enclosureMatch?.[1] || linkMatch?.[1] || ''
      
      // Extract guid for id
      const guidMatch = itemContent.match(/<guid[^>]*>([^<]+)<\/guid>/)
      const id = guidMatch?.[1] || `episode-${episodes.length}`
      
      episodes.push({
        id,
        title,
        description: description || 'No description available',
        artwork,
        duration,
        publishedAt,
        audioUrl
      })
    }

    return new Response(JSON.stringify({ episodes, fallbackImage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error fetching podcasts:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})