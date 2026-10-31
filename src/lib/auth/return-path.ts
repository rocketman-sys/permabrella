/** Keep post-sign-in navigation on this site, including its query and fragment. */
export function safeReturnPath(value: string | null | undefined): string {
  if (!value?.startsWith("/") || value.startsWith("//")) return "/";
  try {
    const decoded = decodeURIComponent(value);
    if (decoded.startsWith("//") || /[\\\u0000-\u001f\u007f]/.test(decoded)) return "/";
    const url = new URL(value, "https://www.permabrella.org");
    if (url.origin !== "https://www.permabrella.org") return "/";
    const pathname = decodeURIComponent(url.pathname);
    if (pathname.startsWith("//") || /^\/(login|register)(\/|$)/.test(pathname)) return "/";
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return "/";
  }
}

export function authPageHref(page: "login" | "register", returnPath: string): string {
  const path = safeReturnPath(returnPath);
  return path === "/" ? `/${page}` : `/${page}?${new URLSearchParams({ callbackUrl: path })}`;
}
