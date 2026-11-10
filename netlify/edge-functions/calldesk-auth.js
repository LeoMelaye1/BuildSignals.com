// Password gate for the internal call desk (/calldesk).
// The password is NOT in this repo (the repo is public). It lives in the Netlify
// environment variable CALLDESK_PASSWORD. If it's missing, the page stays locked.
// The browser shows a sign-in box; any username works, the password must match.

export default async (request, context) => {
  const expected = Netlify.env.get("CALLDESK_PASSWORD");
  const header = request.headers.get("authorization") || "";
  if (expected && header.startsWith("Basic ")) {
    let decoded = "";
    try { decoded = atob(header.slice(6)); } catch { decoded = ""; }
    const password = decoded.slice(decoded.indexOf(":") + 1);
    if (password && password === expected) {
      const res = await context.next();
      res.headers.set("Cache-Control", "private, no-store");
      return res;
    }
  }
  return new Response("Password required", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Build Signals Call Desk", charset="UTF-8"',
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
};

export const config = { path: ["/calldesk", "/calldesk/*"] };
