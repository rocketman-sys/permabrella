import { createHash, randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { and, eq, gt, lt, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { passwordResetLimits, passwordResetTokens, users } from "@/lib/db/schema";
import { resend } from "@/lib/email";
import { SITE_ORIGIN } from "@/lib/site";

export function resetTokenHash(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function validResetToken(token: string): boolean {
  return /^[a-f0-9]{64}$/.test(token);
}

export function validResetPassword(password: string): boolean {
  return password.length >= 8 && Buffer.byteLength(password, "utf8") <= 72;
}

export async function requestPasswordReset(email: string, ip: string) {
  if (!resend || !process.env.EMAIL_FROM) throw new Error("Password recovery email is not configured");
  const now = new Date();
  const bucket = Math.floor(now.getTime() / (15 * 60 * 1000));
  const key = resetTokenHash(`reset:${ip}:${bucket}`);
  await db.delete(passwordResetLimits).where(lt(passwordResetLimits.expiresAt, now));
  const [rate] = await db.insert(passwordResetLimits).values({ key, expiresAt: new Date((bucket + 1) * 15 * 60 * 1000) })
    .onConflictDoUpdate({ target: passwordResetLimits.key, set: { attempts: sql`${passwordResetLimits.attempts} + 1` } })
    .returning({ attempts: passwordResetLimits.attempts });
  if (rate.attempts > 5) return;
  // Older accounts may contain mixed-case email addresses. Never reveal whether an address exists.
  const [user] = await db.select({ id: users.id, email: users.email }).from(users).where(sql`lower(${users.email}) = ${email.toLowerCase()}`).limit(1);
  if (!user) return;
  const token = randomBytes(32).toString("hex");
  const tokenHash = resetTokenHash(token);
  const rows = await db.insert(passwordResetTokens).values({ userId: user.id, tokenHash, createdAt: now, expiresAt: new Date(now.getTime() + 30 * 60 * 1000) })
    .onConflictDoUpdate({ target: passwordResetTokens.userId, set: { tokenHash, createdAt: now, expiresAt: new Date(now.getTime() + 30 * 60 * 1000) }, setWhere: lt(passwordResetTokens.createdAt, new Date(now.getTime() - 60 * 1000)) })
    .returning({ userId: passwordResetTokens.userId });
  if (!rows.length) return;
  const resetUrl = `${SITE_ORIGIN}/reset-password?token=${token}`;
  try {
    const { error } = await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: "Reset your PermaBrella password",
      text: `Use this link to choose a new password: ${resetUrl}\n\nThis link expires in 30 minutes and can only be used once. If you did not request a reset, you can ignore this email.`,
      html: `<p>A password reset was requested for your PermaBrella account.</p><p><a href="${resetUrl}">Choose a new password</a></p><p>This link expires in 30 minutes and can only be used once. If you did not request it, you can ignore this email.</p>`,
    });
    if (error) throw new Error("Password recovery email delivery failed");
  } catch (error) {
    await db.delete(passwordResetTokens).where(and(eq(passwordResetTokens.userId, user.id), eq(passwordResetTokens.tokenHash, tokenHash)));
    // Keep the public response identical to the response for an unknown account.
    console.error("[password-reset] Email delivery failed; reset request removed.");
    void error;
  }
}

/** One statement consumes the token and changes the password atomically. */
export function consumeResetTokenQuery(tokenHash: string, passwordHash: string, now: Date) {
  return sql`with consumed as (
    delete from password_reset_tokens where token_hash = ${tokenHash} and expires_at > ${now.toISOString()}::timestamp returning user_id
  ) update users set password_hash = ${passwordHash}, session_version = session_version + 1, updated_at = ${now.toISOString()}::timestamp
    where id in (select user_id from consumed) returning id`;
}

export async function completePasswordReset(token: string, password: string): Promise<boolean> {
  if (!validResetToken(token) || !validResetPassword(password)) return false;
  const [valid] = await db.select({ userId: passwordResetTokens.userId }).from(passwordResetTokens)
    .where(and(eq(passwordResetTokens.tokenHash, resetTokenHash(token)), gt(passwordResetTokens.expiresAt, new Date()))).limit(1);
  if (!valid) return false;
  const passwordHash = await bcrypt.hash(password, 12);
  const result = await db.execute(consumeResetTokenQuery(resetTokenHash(token), passwordHash, new Date()));
  return result.rows.length === 1;
}
