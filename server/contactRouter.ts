/**
 * Contact Form Router
 * - Saves submission to Supabase contact_submissions table
 * - Sends owner notification via Manus notification service
 * - Sends email notification via Supabase (configured separately)
 */
import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import { notifyOwner } from "./_core/notification";
import { ENV } from "./_core/env";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Please enter a valid email address"),
  company: z.string().max(100).optional(),
  subject: z.string().min(3, "Subject must be at least 3 characters").max(200),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(5000),
});

async function saveToSupabase(data: {
  name: string;
  email: string;
  company?: string;
  subject: string;
  message: string;
}) {
  if (!ENV.supabaseUrl || !ENV.supabaseServiceKey) {
    throw new Error(
      "Missing required environment variable(s): SUPABASE_URL and/or SUPABASE_SERVICE_KEY. " +
        "Set both (see .env.example) before contact submissions can be saved to Supabase."
    );
  }

  const response = await fetch(
    `${ENV.supabaseUrl}/rest/v1/contact_submissions`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: ENV.supabaseServiceKey,
        Authorization: `Bearer ${ENV.supabaseServiceKey}`,
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        name: data.name,
        email: data.email,
        company: data.company || null,
        subject: data.subject,
        message: data.message,
        status: "new",
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text().catch(() => "Unknown error");
    console.error(
      "[Contact] Supabase insert failed:",
      response.status,
      errorText
    );
    throw new Error(`Failed to save contact submission: ${response.status}`);
  }

  const result = await response.json();
  return result[0] || result;
}

export const contactRouter = router({
  submit: publicProcedure.input(contactSchema).mutation(async ({ input }) => {
    // 1. Save to Supabase
    let submissionId: string | undefined;
    try {
      const saved = await saveToSupabase(input);
      submissionId = saved?.id;
      console.log("[Contact] Saved to Supabase, id:", submissionId);
    } catch (err) {
      console.error("[Contact] Failed to save to Supabase:", err);
      // Don't fail the whole request if DB save fails — still send notification
    }

    // 2. Send owner notification via Manus notification service
    const notificationContent = `
**New Contact Form Submission**

**From:** ${input.name} (${input.email})
**Company:** ${input.company || "Not provided"}
**Subject:** ${input.subject}
**Submission ID:** ${submissionId || "N/A"}

**Message:**
${input.message}

---
Reply to: ${input.email}
To: contact@safecodeg.com
      `.trim();

    try {
      await notifyOwner({
        title: `New Contact: ${input.subject} — from ${input.name}`,
        content: notificationContent,
      });
      console.log("[Contact] Owner notification sent");
    } catch (err) {
      console.warn("[Contact] Failed to send owner notification:", err);
      // Don't fail the request — submission was already saved
    }

    return {
      success: true,
      message:
        "Thank you for reaching out. Our team at contact@safecodeg.com will respond within 1–2 business days.",
      submissionId,
    };
  }),
});
