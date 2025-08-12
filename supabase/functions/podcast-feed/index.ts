import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Episode {
  id: string
  title: string
  description: string
  artwork: string
  duration: string
  publishedAt: string
  audioUrl: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Fetching podcast RSS feed...')
    
    const feedUrl = 'https://feed.podbean.com/lightembassychurch/feed.xml'
    const response = await fetch(feedUrl)
    
    if (!response.ok) {
      throw new Error(`Failed to fetch RSS feed: ${response.status}`)
    }
    
    const xmlText = await response.text()
    console.log('RSS feed fetched successfully, parsing...')
    
    // Parse XML manually for basic RSS parsing
    const episodes: Episode[] = []
    
    // Extract items using regex (simple approach for RSS)
    const itemMatches = xmlText.match(/<item[^>]*>[\s\S]*?<\/item>/g) || []
    
    for (let i = 0; i < Math.min(itemMatches.length, 20); i++) { // Limit to 20 episodes
      const item = itemMatches[i]
      
      // Extract title
      const titleMatch = item.match(/<title[^>]*><!\[CDATA\[(.*?)\]\]><\/title>/) || 
                        item.match(/<title[^>]*>(.*?)<\/title>/)
      const title = titleMatch ? titleMatch[1].trim() : 'Untitled Episode'
      
      // Extract description - try multiple possible fields
      let description = 'No description available'
      
      // Try content:encoded first (usually has full description)
      const contentMatch = item.match(/<content:encoded[^>]*><!\[CDATA\[(.*?)\]\]><\/content:encoded>/s)
      if (contentMatch) {
        description = contentMatch[1].trim()
      } else {
        // Fallback to description field
        const descMatch = item.match(/<description[^>]*><!\[CDATA\[(.*?)\]\]><\/description>/s) || 
                         item.match(/<description[^>]*>(.*?)<\/description>/s)
        if (descMatch) {
          description = descMatch[1].trim()
        }
      }
      
      // Clean up HTML tags but preserve line breaks and basic formatting
      description = description
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/p>/gi, '\n\n')
        .replace(/<p[^>]*>/gi, '')
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .trim()
      
      // Extract enclosure URL (audio file)
      const enclosureMatch = item.match(/<enclosure[^>]*url="([^"]*)"/)
      const audioUrl = enclosureMatch ? enclosureMatch[1] : ''
      
      // Extract link
      const linkMatch = item.match(/<link[^>]*>(.*?)<\/link>/)
      const link = linkMatch ? linkMatch[1].trim() : audioUrl
      
      // Extract pubDate
      const pubDateMatch = item.match(/<pubDate[^>]*>(.*?)<\/pubDate>/)
      let publishedAt = 'Unknown date'
      if (pubDateMatch) {
        try {
          const date = new Date(pubDateMatch[1].trim())
          publishedAt = date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
          })
        } catch (e) {
          console.log('Date parsing error:', e)
        }
      }
      
      // Extract duration from iTunes tags
      const durationMatch = item.match(/<itunes:duration[^>]*>(.*?)<\/itunes:duration>/)
      const duration = durationMatch ? durationMatch[1].trim() : 'Unknown'
      
      // Extract artwork from iTunes image
      const artworkMatch = item.match(/<itunes:image[^>]*href="([^"]*)"/) ||
                          xmlText.match(/<itunes:image[^>]*href="([^"]*)"/) // fallback to channel image
      const artwork = artworkMatch ? artworkMatch[1] : "https://pbcdn1.podbean.com/imglogo/image-logo/16660439/LEC_csvbaz.jpg"
      
      episodes.push({
        id: (i + 1).toString(),
        title,
        description,
        artwork,
        duration,
        publishedAt,
        audioUrl: link || audioUrl
      })
    }
    
    console.log(`Parsed ${episodes.length} episodes successfully`)
    
    return new Response(
      JSON.stringify({ episodes }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
    
  } catch (error) {
    console.error('Error fetching podcast feed:', error)
    
    // Return fallback episode on error
    const fallbackEpisodes: Episode[] = [{
      id: "1",
      title: "Welcome to Light Embassy Church Podcast",
      description: "Revealing the Bible, discovering the truth, living the best life! Join us as we begin this journey together.",
      artwork: "https://pbcdn1.podbean.com/imglogo/image-logo/16660439/LEC_csvbaz.jpg",
      duration: "25:30",
      publishedAt: "Aug 02, 2023",
      audioUrl: "https://lightembassychurch.podbean.com/e/welcome-to-light-embassy-church-podcast/"
    }]
    
    return new Response(
      JSON.stringify({ episodes: fallbackEpisodes, error: error.message }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})