import "server-only";
import { createHmac } from "node:crypto";
import { eq, lt } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { networkEnquiryLimits, users } from "@/lib/db/schema";
import { resend } from "@/lib/email";
import { SITE_ORIGIN } from "@/lib/site";
import { canManageEnquiries, type EnquiryInput } from "./options";
import { saveEnquiryQuery } from "./queries";

export async function requireEnquiryAdmin() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/admin/enquiries");
  const [user] = await db.select({ role: users.role }).from(users).where(eq(users.id, session.user.id)).limit(1);
  if (!canManageEnquiries(user?.role)) notFound();
}

export async function saveEnquiry(input: EnquiryInput, ip: string) {
  const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error("Enquiry configuration unavailable");
  const now = new Date();
  const hour = Math.floor(now.getTime() / 3_600_000);
  const hash = (value: string) => createHmac("sha256", secret).update(value).digest("hex");
  await db.delete(networkEnquiryLimits).where(lt(networkEnquiryLimits.expiresAt, now));
  const result = await db.execute(saveEnquiryQuery(input, {
    ip: hash(`network:ip:${ip}:${hour}`),
    email: hash(`network:email:${input.email}:${hour}`),
    submission: hash(`network:submission:${JSON.stringify(input)}:${hour}`),
  }, new Date((hour + 1) * 3_600_000)));
  const row = result.rows[0];
  return { allowed: row?.allowed === true, id: typeof row?.id === "string" ? row.id : null };
}

/** Only an inbox link is emailed. Visitor details remain behind administrator sign-in. */
export async function notifyEnquiryTeam() {
  const to = process.env.NETWORK_ENQUIRY_EMAIL;
  if (!to || !resend || !process.env.EMAIL_FROM) return;
  try {
    const { error } = await resend.emails.send({
      from: process.env.EMAIL_FROM, to,
      subject: "New PermaBrella network enquiry",
      text: `A new membership expression of interest or team enquiry is ready to review.\n\nSign in to the private inbox: ${SITE_ORIGIN}/admin/enquiries\n\nVisitor details are available only to site administrators.`,
    });
    if (error) throw new Error("Notification failed");
  } catch { console.error("[network-enquiry] Notification failed; submission remains in the private inbox."); }
}
