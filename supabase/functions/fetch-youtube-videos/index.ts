import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Light Embassy Church YouTube channel ID
const CHANNEL_ID = 'UC72Dphhm_d-W3zvu87yzr5Q';

interface VideoItem {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  publishedAt: string;
  embedId: string;
}

function decodeHTMLEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, num) => String.fromCharCode(parseInt(num)));
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
async function parseYouTubeRSS(channelId: string, maxResults: number): Promise<VideoItem[]> {
  try {
    const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
    console.log(`Fetching RSS: ${rssUrl}`);
    
    const response = await fetch(rssUrl);
    if (!response.ok) {
      console.error(`RSS fetch failed: ${response.status}`);
      return [];
    }
    
    const xml = await response.text();
    const videos: VideoItem[] = [];
    
    // Simple XML parsing for YouTube RSS
    const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
    let match;
    
    while ((match = entryRegex.exec(xml)) !== null && videos.length < maxResults) {
      const entry = match[1];
      
      const videoId = entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1] || '';
      const title = entry.match(/<title>([^<]+)<\/title>/)?.[1] || '';
      const published = entry.match(/<published>([^<]+)<\/published>/)?.[1] || '';
      
      // Get description from media:description
      let description = '';
      const mediaGroup = entry.match(/<media:group>([\s\S]*?)<\/media:group>/)?.[1] || '';
      if (mediaGroup) {
        const descMatch = mediaGroup.match(/<media:description>([\s\S]*?)<\/media:description>/);
        description = descMatch ? descMatch[1] : '';
      }
      
      // Use mqdefault which is reliably available for all videos
      const thumbnail = `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`;
      
      if (videoId) {
        videos.push({
          id: videoId,
          title: decodeHTMLEntities(title),
          description: decodeHTMLEntities(description).substring(0, 200),
          thumbnail,
          publishedAt: formatDate(published),
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
    const { maxResults = 15 } = await req.json().catch(() => ({}));
    
    console.log(`Fetching YouTube videos from channel, maxResults: ${maxResults}`);
    
    const videos = await parseYouTubeRSS(CHANNEL_ID, maxResults);
    
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
