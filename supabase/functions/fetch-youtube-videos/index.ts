import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Light Embassy Church YouTube channel ID
const CHANNEL_ID = 'UC5PXpZsZQQZxR0qv9QH_BdA';

// YouTube playlist IDs for different categories
const PLAYLISTS = {
  podcast: 'PLqEHLUKupSnCw8WAJHCscE9f0lmFhzB_Z',
  devotional: 'PLqEHLUKupSnAOEp8ZSfuhu7H2CuKkRZKU',
  teaching: 'PLqEHLUKupSnB1GZiueI895TJJ9v6oRJoa',
};

interface VideoItem {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  publishedAt: string;
  duration: string;
  views: string;
  embedId: string;
}

function decodeHTMLEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 1) return 'Today';
  if (diffDays === 1) return '1 day ago';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}

// Parse YouTube RSS feed
async function parseYouTubeRSS(url: string): Promise<VideoItem[]> {
  try {
    console.log(`Fetching RSS: ${url}`);
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`RSS fetch failed: ${response.status}`);
      return [];
    }
    
    const xml = await response.text();
    const videos: VideoItem[] = [];
    
    // Simple XML parsing for YouTube RSS
    const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
    let match;
    
    while ((match = entryRegex.exec(xml)) !== null) {
      const entry = match[1];
      
      const videoId = entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1] || '';
      const title = entry.match(/<title>([^<]+)<\/title>/)?.[1] || '';
      const published = entry.match(/<published>([^<]+)<\/published>/)?.[1] || '';
      
      // Get description from media:description or media:group
      let description = '';
      const mediaGroup = entry.match(/<media:group>([\s\S]*?)<\/media:group>/)?.[1] || '';
      if (mediaGroup) {
        const descMatch = mediaGroup.match(/<media:description>([\s\S]*?)<\/media:description>/);
        description = descMatch ? descMatch[1] : '';
      }
      
      // Get view count from media:community
      let views = 'New';
      const communityMatch = entry.match(/<media:community>([\s\S]*?)<\/media:community>/);
      if (communityMatch) {
        const viewsMatch = communityMatch[1].match(/views="(\d+)"/);
        if (viewsMatch) {
          const count = parseInt(viewsMatch[1]);
          if (count >= 1000000) {
            views = `${(count / 1000000).toFixed(1)}M views`;
          } else if (count >= 1000) {
            views = `${(count / 1000).toFixed(1)}K views`;
          } else {
            views = `${count} views`;
          }
        }
      }
      
      const thumbnail = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
      
      if (videoId) {
        videos.push({
          id: videoId,
          title: decodeHTMLEntities(title),
          description: decodeHTMLEntities(description).substring(0, 200),
          thumbnail,
          publishedAt: formatDate(published),
          duration: '',
          views,
          embedId: videoId,
        });
      }
    }
    
    console.log(`Parsed ${videos.length} videos from RSS`);
    return videos;
  } catch (error) {
    console.error('Error parsing RSS:', error);
    return [];
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { category = 'featured', maxResults = 10 } = await req.json().catch(() => ({}));
    
    console.log(`Fetching YouTube videos - category: ${category}, maxResults: ${maxResults}`);
    
    let videos: VideoItem[] = [];
    
    if (category === 'featured') {
      // Fetch from channel RSS feed
      const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;
      videos = await parseYouTubeRSS(rssUrl);
    } else if (PLAYLISTS[category as keyof typeof PLAYLISTS]) {
      // Fetch from playlist RSS feed
      const playlistId = PLAYLISTS[category as keyof typeof PLAYLISTS];
      const rssUrl = `https://www.youtube.com/feeds/videos.xml?playlist_id=${playlistId}`;
      videos = await parseYouTubeRSS(rssUrl);
    }
    
    // Limit results
    videos = videos.slice(0, maxResults);
    
    console.log(`Returning ${videos.length} videos`);

    return new Response(JSON.stringify({ videos }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in fetch-youtube-videos:', error);
    return new Response(
      JSON.stringify({ error: error.message, videos: [] }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
