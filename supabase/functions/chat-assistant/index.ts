import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // System prompt for Light Embassy Church assistant
    const systemPrompt = `You are a helpful assistant for Light Embassy Church. You help people with questions about:

- Faith and Christian living
- Bible study and interpretation
- Light Embassy Church services, programs, and activities
- Prayer requests and spiritual guidance
- Church community and fellowship

Key information about Light Embassy Church:
- Location: Sunnanväg 18L, 222 26 Lund, Sweden
- Phone: +46 72-308 20 19
- Services: Bible Study (Tuesdays 6-7:30 PM), Online Prayer Connect (Wednesdays 5:30-6 PM), Prayer Meeting (Fridays 7-8:15 PM), Sunday Service (Sundays 11 AM-1:15 PM)
- Mission: "Revealing the Bible, discovering the truth, living the best life!"
- Focus: Powerful worship, Bible study, fellowship, and prayer in Jesus' name

Be warm, encouraging, and biblically grounded in your responses. If someone asks about topics outside your expertise, politely redirect them to appropriate resources or suggest they speak with church leadership.`;

    // Prepare conversation history
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversation.slice(-10), // Keep last 10 messages for context
      { role: 'user', content: message }
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: messages,
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to get AI response');
    }

    const data = await response.json();
    const assistantResponse = data.choices[0].message.content;

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