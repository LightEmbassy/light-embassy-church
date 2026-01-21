import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { videoTitle, videoId } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Create varied visual styles for different thumbnails
    const visualStyles = [
      "dramatic sunset with golden rays piercing through clouds over mountains",
      "serene ocean waves at dawn with soft pink and purple sky",
      "majestic forest with light beams streaming through tall trees",
      "peaceful meadow with wildflowers under a starlit night sky",
      "abstract ethereal light patterns with deep blues and golds",
      "silhouette of a person with arms raised against a vibrant sunrise",
      "calm lake reflecting a colorful aurora in the night sky",
      "rolling hills covered in morning mist with warm sunlight",
      "dramatic storm clouds with a single ray of light breaking through",
      "ancient olive tree on a hillside at golden hour",
      "minimalist cross silhouette against a fiery orange sunset",
      "crystal clear waterfall in a lush green paradise",
      "desert landscape with dramatic rock formations at twilight",
      "snow-capped mountains with dramatic cloud formations",
      "vineyard rows leading to a distant horizon at sunset",
      "lighthouse beam cutting through fog over dark waters",
      "field of wheat swaying in golden afternoon light",
      "canyon walls glowing red and orange at sunset",
      "tropical beach with palm trees silhouetted against pastel sky",
      "northern lights dancing over a frozen landscape"
    ];
    
    // Use video ID to deterministically pick a style (consistent for same video)
    const styleIndex = videoId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % visualStyles.length;
    const selectedStyle = visualStyles[styleIndex];

    const prompt = `Create a stunning, unique thumbnail image. 
    Scene: ${selectedStyle}
    Theme inspiration from: "${videoTitle}"
    Style: Cinematic, high contrast, emotionally evocative, professional photography quality.
    Mood: Inspiring, peaceful, hopeful, spiritual.
    No text, no words, no letters in the image.
    Aspect ratio: 16:9 landscape.
    Ultra high resolution, 4K quality.`;

    console.log(`Generating thumbnail for video: ${videoId} - ${videoTitle}`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image-preview",
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        modalities: ["image", "text"]
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!imageUrl) {
      console.error("No image generated", JSON.stringify(data));
      throw new Error("No image was generated");
    }

    console.log(`Successfully generated thumbnail for video: ${videoId}`);

    return new Response(JSON.stringify({ 
      videoId,
      thumbnailUrl: imageUrl 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error generating thumbnail:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
