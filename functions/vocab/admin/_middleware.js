// HTTP Basic Authentication middleware for /vocab/admin
export async function onRequest(context) {
  const ADMIN_USERNAME = "Rene";
  const ADMIN_PASSWORD = "MischiefSisters2!";

  const authHeader = context.request.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Basic ")) {
    return new Response("Unauthorized", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Admin Area"',
      },
    });
  }

  const base64Credentials = authHeader.slice(6);
  let credentials;
  try {
    credentials = atob(base64Credentials);
  } catch {
    return new Response("Invalid credentials", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Admin Area"',
      },
    });
  }

  const colonIndex = credentials.indexOf(":");
  if (colonIndex === -1) {
    return new Response("Invalid credentials", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Admin Area"',
      },
    });
  }

  const username = credentials.slice(0, colonIndex);
  const password = credentials.slice(colonIndex + 1);

  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
    return new Response("Unauthorized", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Admin Area"',
      },
    });
  }

  return context.next();
}
