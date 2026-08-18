import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

interface ResponseItem {
  question_id: string;
  selected_answer: number;
}

interface GradeRequest {
  responses: ResponseItem[];
  save?: boolean;
  quiz_type?: "signup" | "podcast" | "bible";
}

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = (await req.json()) as GradeRequest;

    if (!body?.responses || !Array.isArray(body.responses) || body.responses.length === 0) {
      return new Response(JSON.stringify({ error: "responses array required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (body.responses.length > 50) {
      return new Response(JSON.stringify({ error: "too many responses" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }


    // Basic validation
    for (const r of body.responses) {
      if (typeof r.question_id !== "string" || typeof r.selected_answer !== "number") {
        return new Response(JSON.stringify({ error: "invalid response entry" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    const ids = body.responses.map((r) => r.question_id);
    const { data: questions, error } = await admin
      .from("quiz_questions")
      .select("id, correct_answer, options")
      .in("id", ids);

    if (error) throw error;

    const byId = new Map(questions!.map((q) => [q.id, q]));

    let score = 0;
    const results = body.responses.map((r) => {
      const q = byId.get(r.question_id);
      const is_correct = q ? r.selected_answer === q.correct_answer : false;
      if (is_correct) score++;
      // NOTE: correct_answer is deliberately never returned to the client,
      // otherwise the full answer key could be harvested with dummy submissions.
      return {
        question_id: r.question_id,
        selected_answer: r.selected_answer,
        is_correct,
      };
    });


    // Optional save when an authenticated user is present
    if (body.save) {
      const authHeader = req.headers.get("Authorization");
      if (authHeader) {
        const userClient = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
          global: { headers: { Authorization: authHeader } },
        });
        const { data: userData } = await userClient.auth.getUser();
        const user = userData?.user;
        if (user) {
          const rows = results.map((r) => ({
            user_id: user.id,
            question_id: r.question_id,
            selected_answer: r.selected_answer,
            is_correct: r.is_correct,
          }));
          await admin.from("user_quiz_responses").insert(rows);
          await admin.from("user_quiz_completion").insert({
            user_id: user.id,
            score,
            total_questions: results.length,
          });
          if (body.quiz_type === "signup") {
            await admin.from("profiles").update({ quiz_completed: true }).eq("user_id", user.id);
          }
        }
      }
    }

    return new Response(
      JSON.stringify({ score, total: results.length, results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
    );
  } catch (e) {
    console.error("grade-quiz error", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
