// Maximum file size: 400MB
const MAX_FILE_SIZE = 400 * 1024 * 1024;

export async function onRequest(context) {
  const url = new URL(context.request.url);
  const method = context.request.method;
  const pathname = url.pathname;

  // Handle CORS preflight
  if (method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  // POST /api/upload/video - Upload video to R2
  if (method === "POST" && pathname.endsWith("/video")) {
    return handleVideoUpload(context);
  }

  // POST /api/upload/thumbnail - Upload thumbnail to R2
  if (method === "POST" && pathname.endsWith("/thumbnail")) {
    return handleThumbnailUpload(context);
  }

  // GET /api/upload/media/:key - Get media from R2
  if (method === "GET" && pathname.includes("/media/")) {
    return handleMediaGet(context);
  }

  return new Response("Method not allowed", { status: 405 });
}

async function handleVideoUpload(context) {
  try {
    const bucket = context.env.MEDIA_BUCKET;
    
    if (!bucket) {
      return Response.json(
        { error: "R2 bucket not configured. Please configure MEDIA_BUCKET in wrangler.toml" },
        { status: 500, headers: corsHeaders() }
      );
    }

    const contentType = context.request.headers.get("content-type") || "";
    
    // Check if it's a multipart form upload
    if (contentType.includes("multipart/form-data")) {
      const formData = await context.request.formData();
      const file = formData.get("file");
      
      if (!file) {
        return Response.json(
          { error: "No file provided" },
          { status: 400, headers: corsHeaders() }
        );
      }

      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        return Response.json(
          { error: `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB` },
          { status: 400, headers: corsHeaders() }
        );
      }

      // Generate unique filename
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 15);
      const extension = getExtension(file.name) || "mp4";
      const key = `videos/${timestamp}-${randomId}.${extension}`;

      // Upload to R2
      await bucket.put(key, file.stream(), {
        httpMetadata: {
          contentType: file.type || "video/mp4",
        },
        customMetadata: {
          originalName: file.name,
          uploadedAt: new Date().toISOString(),
        },
      });

      const videoUrl = `/api/upload/media/${key}`;

      return Response.json(
        { success: true, url: videoUrl, key },
        { headers: corsHeaders() }
      );
    }

    return Response.json(
      { error: "Invalid content type. Use multipart/form-data" },
      { status: 400, headers: corsHeaders() }
    );
  } catch (err) {
    console.error("Video upload error:", err);
    return Response.json(
      { error: err.message },
      { status: 500, headers: corsHeaders() }
    );
  }
}

async function handleThumbnailUpload(context) {
  try {
    const bucket = context.env.MEDIA_BUCKET;
    
    if (!bucket) {
      return Response.json(
        { error: "R2 bucket not configured" },
        { status: 500, headers: corsHeaders() }
      );
    }

    const contentType = context.request.headers.get("content-type") || "";
    
    if (contentType.includes("multipart/form-data")) {
      const formData = await context.request.formData();
      const file = formData.get("file");
      
      if (!file) {
        return Response.json(
          { error: "No file provided" },
          { status: 400, headers: corsHeaders() }
        );
      }

      // Thumbnails should be much smaller - limit to 10MB
      const maxThumbnailSize = 10 * 1024 * 1024;
      if (file.size > maxThumbnailSize) {
        return Response.json(
          { error: "Thumbnail too large. Maximum size is 10MB" },
          { status: 400, headers: corsHeaders() }
        );
      }

      // Generate unique filename
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 15);
      const extension = getExtension(file.name) || "jpg";
      const key = `thumbnails/${timestamp}-${randomId}.${extension}`;

      // Upload to R2
      await bucket.put(key, file.stream(), {
        httpMetadata: {
          contentType: file.type || "image/jpeg",
        },
        customMetadata: {
          originalName: file.name,
          uploadedAt: new Date().toISOString(),
        },
      });

      const thumbnailUrl = `/api/upload/media/${key}`;

      return Response.json(
        { success: true, url: thumbnailUrl, key },
        { headers: corsHeaders() }
      );
    }

    // Handle base64 data URL
    if (contentType.includes("application/json")) {
      const { dataUrl } = await context.request.json();
      
      if (!dataUrl || !dataUrl.startsWith("data:")) {
        return Response.json(
          { error: "Invalid data URL" },
          { status: 400, headers: corsHeaders() }
        );
      }

      // Parse data URL
      const matches = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
      if (!matches) {
        return Response.json(
          { error: "Invalid data URL format" },
          { status: 400, headers: corsHeaders() }
        );
      }

      const mimeType = matches[1];
      const base64Data = matches[2];
      const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

      // Generate unique filename
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 15);
      const extension = mimeType.split("/")[1] || "jpg";
      const key = `thumbnails/${timestamp}-${randomId}.${extension}`;

      // Upload to R2
      await bucket.put(key, binaryData, {
        httpMetadata: {
          contentType: mimeType,
        },
        customMetadata: {
          uploadedAt: new Date().toISOString(),
        },
      });

      const thumbnailUrl = `/api/upload/media/${key}`;

      return Response.json(
        { success: true, url: thumbnailUrl, key },
        { headers: corsHeaders() }
      );
    }

    return Response.json(
      { error: "Invalid content type" },
      { status: 400, headers: corsHeaders() }
    );
  } catch (err) {
    console.error("Thumbnail upload error:", err);
    return Response.json(
      { error: err.message },
      { status: 500, headers: corsHeaders() }
    );
  }
}

async function handleMediaGet(context) {
  try {
    const bucket = context.env.MEDIA_BUCKET;
    
    if (!bucket) {
      return new Response("R2 bucket not configured", { status: 500 });
    }

    const url = new URL(context.request.url);
    const pathname = url.pathname;
    
    // Extract the key from the path (everything after /api/upload/media/)
    const key = pathname.replace("/api/upload/media/", "");
    
    if (!key) {
      return new Response("No key provided", { status: 400 });
    }

    const object = await bucket.get(key);
    
    if (!object) {
      return new Response("File not found", { status: 404 });
    }

    const headers = new Headers();
    headers.set("Content-Type", object.httpMetadata?.contentType || "application/octet-stream");
    headers.set("Cache-Control", "public, max-age=31536000");
    
    // Support range requests for video streaming
    const range = context.request.headers.get("range");
    if (range && object.size) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : object.size - 1;
      const chunkSize = end - start + 1;
      
      headers.set("Content-Range", `bytes ${start}-${end}/${object.size}`);
      headers.set("Accept-Ranges", "bytes");
      headers.set("Content-Length", chunkSize.toString());
      
      // For range requests, we need to slice the body
      const body = await object.arrayBuffer();
      const slicedBody = body.slice(start, end + 1);
      
      return new Response(slicedBody, {
        status: 206,
        headers,
      });
    }

    headers.set("Content-Length", object.size?.toString() || "0");
    
    return new Response(object.body, { headers });
  } catch (err) {
    console.error("Media get error:", err);
    return new Response("Error retrieving file: " + err.message, { status: 500 });
  }
}

function getExtension(filename) {
  if (!filename) return null;
  const parts = filename.split(".");
  return parts.length > 1 ? parts.pop().toLowerCase() : null;
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}
