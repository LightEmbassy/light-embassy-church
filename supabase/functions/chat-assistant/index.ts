import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Pre-scraped content from lightembassy.org
const LIGHT_EMBASSY_KNOWLEDGE = `
# Light Embassy Church Official Information

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

## Social Media & Online Presence
- Facebook: facebook.com/Light-Embassy-Church-422150485056117
- Twitter/X: twitter.com/Light_Embassy
- Instagram: instagram.com/light.embassy.church.sweden/
- YouTube Channel: youtube.com/@lightembassychurchlundswed41

## Watch - Video Resources
The Light Embassy Church YouTube Channel brings you the unfiltered Word of God's grace, designed to build you up and deliver an inheritance among the saints. Explore free teaching resources and life-transforming messages that strengthen your faith.

## Podcast
Listen to the Light Embassy Podcast - "Revealing the Bible, discovering the truth, living the best life!" Available on Podbean and other podcast platforms.

## Prayer Ministry
At Light Embassy Church, our welcoming community embraces everyone with love and acceptance. We are here to support you in all times and seasons, offering prayer and exhortation through our dedicated prayer ministry. Prayer requests are sent directly to our Prayer Team, who will pray with you in faith and understanding.

Website: lightembassy.org/prayer-request/

## Newsletter Subscription
Subscribe to stay connected with Light Embassy Church. Get all the latest news, prayer points, and reasons to praise! Stay updated on upcoming events, church activities, and inspiring stories of faith.

Website: lightembassy.org/sign-up/

## Discover - Steps to Salvation

### Step 1: God loves you and has a purpose for your life
The Bible says, "For God so loved the world that He gave His only begotten Son (Jesus Christ), that whosoever believeth in Him should not perish, but have everlasting life" (John 3:16 KJV).
Jesus said, "The thief cometh not, but for to steal, and to kill, and to destroy: I am come that they might have life, and that they might have it more abundantly" (John 10:10 KJV).
God loves you, Jesus died so you may have life.

### Step 2: Problem identified
Man sinned and got separated from God. Every human being has done, thought or said bad things and that is called "sin". The Bible says, "For all have sinned, and come short of the glory of God" (Romans 3:23 KJV).
The consequence was death and spiritual separation from God. "For the wages of sin is death; but the gift of God is eternal life through Jesus Christ our Lord" (Romans 6:23 KJV).

### Step 3: God sent His Son to die for your sins!
Jesus died so we could have fellowship with God and be with Him forever. "But God commendeth his love toward us, in that, while we were yet sinners, Christ died for us. Much more then, being now justified by his blood, we shall be saved from wrath through him" (Romans 5:8-9 KJV).
Jesus was raised up from the dead on the third day and still lives. "Christ died for our sins according to the Scriptures, and that He was buried, and that He arose again the third day according to the Scriptures" (1 Corinthians 15:3-4 KJV).
Jesus said, "I am the Way, the Truth, and the Life; no man cometh unto the Father, but by Me" (John 14:6 KJV).

### Step 4: Receive salvation
The remission of sins and salvation cannot be earned or bought. They are graciously given to anyone who will believe in the death and resurrection of Jesus Christ, accepting and confessing Him as Lord of your life.

Prayer of Salvation:
"Dear God, I sincerely believe that you loved me so much to send Jesus to die in my place. He went to the cross on my behalf and you raised Him up from the dead on my behalf. I accept Jesus as my savior and from this day confess Him the Lord of my life. Guide my life and help me to do your will. I pray this in the name of Jesus, Amen"

## Connect - Volunteer Teams

At Light Embassy Church, we are focused on helping people belong, grow, connect, and experience true freedom in God. There are many ways to get involved:

### Online Teams:
- Online Prayer Team – Intercede for prayer requests submitted through the website, church services, or social media
- Online Cell Group – For those interested in developing their understanding in the Word of God
- Online Outreach Team – Reach out to new online visitors, welcome them, and offer prayer, support, and connection

### Offline Teams:
- Worship Team – Lead the congregation in worship during in-person services
- Prayer Team – Serve by praying for the needs of the church, community, and individuals
- Children's Ministry Team – Teaching, guiding, and nurturing the spiritual growth of children
- Usher and Greeter Team – Welcome and assist attendees during services
- Outreach and Community Service Team – Engage in local community outreach programs and charity events
- Hospitality Team – Provide refreshments and assist with fellowship events
- Event Planning and Coordination Team – Organize church events, conferences, and special services
- Technical Support Team – Handle sound, lighting, and video production
- Welcome and New Member Team – Help newcomers integrate into the church community
- Discipleship and Mentorship Team – Lead small group Bible studies and one-on-one mentorship

To join a team, visit: lightembassy.org/connect/

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
    const systemPrompt = `You are the official assistant for Light Embassy Church. You help people with questions about the church, its beliefs, services, programs, volunteer opportunities, and community.

IMPORTANT RULES:
1. You ONLY answer questions based on the official Light Embassy Church information provided below.
2. If someone asks about something not covered in this information, politely let them know you can only help with Light Embassy Church related questions and suggest they contact the church directly at info@lightembassy.org or +46 760 336 606.
3. Be warm, encouraging, and biblically grounded in your responses.
4. Keep answers concise but helpful.
5. When appropriate, guide people to relevant pages on the website (lightembassy.org).
6. If someone asks about salvation or how to become a Christian, share the 4 steps from the Discover section.
7. If someone wants to get involved, tell them about the volunteer teams and direct them to lightembassy.org/connect/

${LIGHT_EMBASSY_KNOWLEDGE}`;

    // Prepare conversation history
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversation.slice(-10),
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
