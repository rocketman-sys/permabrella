/**
 * Vercel Cron: set CRON_SECRET in project env; requests include
 * Authorization: Bearer <CRON_SECRET>.
 * See https://vercel.com/docs/cron-jobs/manage-cron-jobs#securing-cron-jobs
 */
export function verifyCronRequest(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    return auth === `Bearer ${secret}`;
  }

  if (process.env.NODE_ENV === "development") {
    return true;
  }

  return request.headers.get("x-vercel-cron") === "1";
}
