import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing auth' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    // Validate user from JWT
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    })
    const { data: userData, error: userErr } = await userClient.auth.getUser()
    if (userErr || !userData.user) {
      return new Response(JSON.stringify({ error: 'Invalid session' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const userId = userData.user.id
    const admin = createClient(supabaseUrl, serviceKey)

    // Delete rows in all tables that reference this user
    const tables = [
      'community_posts',
      'post_likes',
      'forum_replies',
      'forum_topics',
      'favorite_verses',
      'media_history',
      'message_notifications',
      'messages',
      'prayer_requests',
      'quiz_entries',
      'signups',
      'user_achievements',
      'user_quiz_completion',
      'user_quiz_responses',
      'user_roles',
      'profiles',
    ]

    for (const table of tables) {
      const { error } = await admin.from(table).delete().eq('user_id', userId)
      if (error) console.error(`delete ${table}:`, error.message)
    }

    // Conversations: user may be participant on either side
    await admin.from('conversations').delete().or(`user_id.eq.${userId},staff_id.eq.${userId}`)

    // Finally, delete the auth user
    const { error: delErr } = await admin.auth.admin.deleteUser(userId)
    if (delErr) {
      return new Response(JSON.stringify({ error: delErr.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
