import { headers } from "next/headers";

export type AppCookieOptions = {
  httpOnly: true;
  secure: boolean;
  sameSite: "lax" | "none";
  path: "/";
  partitioned?: boolean;
};

/**
 * Returns cookie attributes compatible with both cross-site HTTPS iframes
 * (e.g. AI Studio preview) and local HTTP development.
 *
 * Cross-site iframes require `SameSite=None; Secure` (plus `Partitioned`
 * where supported) so browsers retain and send cookies on fetch requests.
 */
export async function getAppCookieOptions(
  request?: Request
): Promise<AppCookieOptions> {
  const headerStore = request ? request.headers : await headers();

  const forwardedProto =
    headerStore.get("x-forwarded-proto")?.split(",")[0]?.trim().toLowerCase() ??
    "";
  const origin = headerStore.get("origin")?.toLowerCase() ?? "";
  const referer = headerStore.get("referer")?.toLowerCase() ?? "";
  const host = (
    headerStore.get("x-forwarded-host") ??
    headerStore.get("host") ??
    ""
  ).toLowerCase();

  const isHttps =
    process.env.NODE_ENV === "production" ||
    forwardedProto === "https" ||
    origin.startsWith("https://") ||
    referer.startsWith("https://") ||
    host.endsWith(".run.app");

  if (isHttps) {
    return {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
      partitioned: true,
    };
  }

  return {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    path: "/",
  };
}

export async function getExpiredCookieOptions(request?: Request) {
  const base = await getAppCookieOptions(request);

  return {
    ...base,
    expires: new Date(0),
    maxAge: 0,
  };
}
