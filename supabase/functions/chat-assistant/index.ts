import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Pre-scraped content from lightembassy.org
const LIGHT_EMBASSY_KNOWLEDGE = `
# Light Embassy Church Information

## About Light Embassy
Christ in You and Through You Incorporated (CITY Inc.), also known as Light Embassy, is a full Gospel Church with a vision from the Lord Jesus to raise up Spiritual Giants in these last days. Our mission is to empower believers to champion the furtherance of the Gospel, primarily across Europe and beyond. We are dedicated to revealing the Glory and virtues of God in the name of the Lord Jesus, impacting the world with His light, love, and truth.

Mission: "Revealing the Bible, discovering the truth, living the best life!"

## What We Believe

### The Deity of Jesus
We believe that Jesus was God manifested in the flesh "And without controversy great is the mystery of godliness: God was manifest in the flesh, justified in the Spirit, seen of angels, preached unto the Gentiles, believed on in the world, received up into glory..." 1 Timothy 3:16

### The Trinity
We believe in the Trinity as taught by the Bible. We believe that the Godhead exists as one God in three dimensions: each co-equally and co-eternally one God in God the Father dimension, God the Word dimension revealed in the Lord Jesus Christ and God the Holy Spirit dimension and that these three are One Sovereign in creation, providence and redemption (Romans 1:20; Colossians 2:9; John 1:1-5; 1 Corinthians 8:6).

### The Saviour
We believe that the Lord Jesus Christ is the only way to God the Father and that salvation is found only in Him. We believe in the proper deity of the Lord Jesus, His real and complete humanity, in His virgin birth, substitutionary crucifixion, resurrection and ascension. We believe that man is saved only by believing in the vicarious death of the Lord Jesus, His Resurrection and acknowledging and confessing Him as Lord of all. (Acts 4:12)

### The Holy Spirit
We believe in the Deity of the Holy Spirit, that He is a person and not a force or wind. We believe in His giftings, power and abilities that He graciously manifest in and through us. We believe in His work of convicting the world of sins, the Christian of righteousness and of the judgement of satan. We believe in His indwelling presence in the Christian. (1 Corinthians 12; John 16:8)

### The Ordinances
We believe in the baptism of believers by immersion in water in obedience to the command of Christ and in the commemoration of Christ's death by the observance of communion until His return (Matthew 28:18-20; 1 Corinthians 11:23-26).

### The Coming King
We believe in the visible and physical return of the Lord Jesus to reign on this Earth in power and glory. (Acts 1:11, Mark 14:62)

### The Commission
We believe that every Christian has been instructed by the Lord Jesus to reconcile the world unto God and that this forms one of the primary reasons of being in this World. (2 Corinthians 5:19)

## Leadership at Light Embassy
- Apostle Alex Adusei Agyemang - President
- Benedict Oppong Asamoah - Vice President, Bible Study and Foundational Class Teacher
- Joy Nakawesi - Secretary
- Charity Oppong Asamoah - Worship Leader
- Alberta Agyemang - Logistics Department Head

## Location & Contact Information

### Light Embassy Church in Europe (Sweden)
Address: Sunnanväg 18L, 222 26 Lund, Sweden
Phone: +46 72-308 20 19
General Phone: +46 760 336 606
Email: info@lightembassy.org

### Service Schedule
- Bible Study: Tuesdays 6PM - 7:30PM
- Online Prayer Connect: Wednesdays 5:30PM - 6:00PM
- Prayer Meeting: Fridays 7PM - 8:15PM
- Sunday Service: Sundays 11AM - 1:15PM

## Social Media
- Facebook: facebook.com/Light-Embassy-Church-422150485056117
- Twitter/X: twitter.com/Light_Embassy
- Instagram: instagram.com/light.embassy.church.sweden/
- YouTube: youtube.com/channel/UC72Dphhm_d-W3zvu87yzr5Q

## Media & Resources
- YouTube Channel: Watch videos filled with the pure word of God's grace
- Podcast: Listen to the Light Embassy Podcast - "Revealing the Bible, discovering the truth, living the best life!"
- Prayer Requests: Available for prayer support

## Ways to Connect
- CONNECT: How to connect with us & others
- SUBSCRIBE: Stay up-to-date with what's happening in the life of the church
- DISCOVER MORE: A safe place for questions
- PRAYER: Request prayer for yourself or others

## Church Reviews (5.0 stars based on 7 reviews)
Testimonials highlight:
- Word-based teachings that edify, strengthen and grow your faith
- A family where love is showcased everyday
- Amazing support system
- Practice what they preach
- Good teachings and counseling
- Love of God expressed in words and actions
`;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, conversation = [] } = await req.json();

    if (!message) {
      throw new Error('Message is required');
    }

    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // System prompt with Light Embassy knowledge
    const systemPrompt = `You are the official assistant for Light Embassy Church. You help people with questions about the church, its beliefs, services, and community.

IMPORTANT: You ONLY answer questions based on the official Light Embassy Church information provided below. If someone asks about something not covered in this information, politely let them know you can only help with Light Embassy Church related questions and suggest they contact the church directly at info@lightembassy.org or +46 760 336 606.

Be warm, encouraging, and biblically grounded in your responses. Keep answers concise but helpful.

${LIGHT_EMBASSY_KNOWLEDGE}`;

    // Prepare conversation history
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversation.slice(-10), // Keep last 10 messages for context
      { role: 'user', content: message }
    ];

    console.log('Calling Lovable AI Gateway...');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: messages,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.error('Rate limit exceeded');
        return new Response(
          JSON.stringify({ 
            error: 'Rate limit exceeded. Please try again in a moment.',
            response: 'I\'m receiving too many requests right now. Please try again in a moment.'
          }),
          { 
            status: 429,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      if (response.status === 402) {
        console.error('Payment required');
        return new Response(
          JSON.stringify({ 
            error: 'Service temporarily unavailable.',
            response: 'I\'m temporarily unavailable. Please try again later.'
          }),
          { 
            status: 402,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const assistantResponse = data.choices[0].message.content;

    console.log('Successfully received AI response');

    return new Response(
      JSON.stringify({ response: assistantResponse }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Chat assistant error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An unexpected error occurred',
        response: 'I apologize, but I\'m having trouble responding right now. Please try again in a moment.'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
