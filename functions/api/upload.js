// Maximum file size: 400MB
const MAX_FILE_SIZE = 400 * 1024 * 1024;

// Chunk size for multipart uploads (50MB - well under Cloudflare's 100MB limit)
const CHUNK_SIZE = 50 * 1024 * 1024;

// Allowed video MIME types
const ALLOWED_VIDEO_TYPES = [
  "video/mp4",
  "video/webm",
  "video/ogg",
  "video/quicktime",
  "video/x-msvideo",
  "video/x-matroska",
  "video/mpeg",
  "video/3gpp",
  "video/3gpp2"
];

// Allowed image MIME types for thumbnails
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp"
];

// Generate a cryptographically secure random ID
function generateSecureId() {
  return crypto.randomUUID();
}

export async function onRequest(context) {
  const url = new URL(context.request.url);
  const method = context.request.method;
  const pathname = url.pathname;

  // Handle CORS preflight
  if (method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders(),
    });
  }

  // POST /api/upload/video - Upload video to R2 (for small files < 100MB)
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

  // === Multipart Upload Endpoints (for large files > 100MB) ===
  
  // POST /api/upload/multipart/create - Create a new multipart upload
  if (method === "POST" && pathname.endsWith("/multipart/create")) {
    return handleMultipartCreate(context);
  }

  // POST /api/upload/multipart/part - Upload a single part
  if (method === "POST" && pathname.endsWith("/multipart/part")) {
    return handleMultipartPart(context);
  }

  // POST /api/upload/multipart/complete - Complete the multipart upload
  if (method === "POST" && pathname.endsWith("/multipart/complete")) {
    return handleMultipartComplete(context);
  }

  // POST /api/upload/multipart/abort - Abort a multipart upload
  if (method === "POST" && pathname.endsWith("/multipart/abort")) {
    return handleMultipartAbort(context);
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

      // Validate file type is a video
      const fileType = file.type || "";
      if (!ALLOWED_VIDEO_TYPES.includes(fileType)) {
        return Response.json(
          { error: "Invalid file type. Only video files are allowed." },
          { status: 400, headers: corsHeaders() }
        );
      }

      // Generate unique filename using cryptographically secure random
      const timestamp = Date.now();
      const randomId = generateSecureId();
      const extension = getExtension(file.name) || "mp4";
      const key = `videos/${timestamp}-${randomId}.${extension}`;

      // Upload to R2
      await bucket.put(key, file.stream(), {
        httpMetadata: {
          contentType: fileType,
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

      // Validate file type is an image
      const fileType = file.type || "";
      if (!ALLOWED_IMAGE_TYPES.includes(fileType)) {
        return Response.json(
          { error: "Invalid file type. Only image files are allowed." },
          { status: 400, headers: corsHeaders() }
        );
      }

      // Generate unique filename using cryptographically secure random
      const timestamp = Date.now();
      const randomId = generateSecureId();
      const extension = getExtension(file.name) || "jpg";
      const key = `thumbnails/${timestamp}-${randomId}.${extension}`;

      // Upload to R2
      await bucket.put(key, file.stream(), {
        httpMetadata: {
          contentType: fileType,
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

      // Validate MIME type is an allowed image type
      if (!ALLOWED_IMAGE_TYPES.includes(mimeType)) {
        return Response.json(
          { error: "Invalid file type. Only image files are allowed." },
          { status: 400, headers: corsHeaders() }
        );
      }

      const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

      // Generate unique filename using cryptographically secure random
      const timestamp = Date.now();
      const randomId = generateSecureId();
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

    // Support range requests for video streaming using R2's native range support
    const range = context.request.headers.get("range");
    
    let object;
    let start = 0;
    let end;
    
    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      start = parseInt(parts[0], 10);
      // Note: We need to get object metadata first to know the size
      const headObject = await bucket.head(key);
      
      if (!headObject) {
        return new Response("File not found", { status: 404 });
      }
      
      end = parts[1] ? parseInt(parts[1], 10) : headObject.size - 1;
      
      // Use R2's range option to avoid loading entire file into memory
      object = await bucket.get(key, {
        range: { offset: start, length: end - start + 1 }
      });
      
      if (!object) {
        return new Response("File not found", { status: 404 });
      }
      
      const chunkSize = end - start + 1;
      
      const headers = new Headers();
      headers.set("Content-Type", object.httpMetadata?.contentType || "application/octet-stream");
      headers.set("Cache-Control", "public, max-age=31536000");
      headers.set("Content-Range", `bytes ${start}-${end}/${headObject.size}`);
      headers.set("Accept-Ranges", "bytes");
      headers.set("Content-Length", chunkSize.toString());
      
      return new Response(object.body, {
        status: 206,
        headers,
      });
    }

    // Non-range request - return full file
    object = await bucket.get(key);
    
    if (!object) {
      return new Response("File not found", { status: 404 });
    }

    const headers = new Headers();
    headers.set("Content-Type", object.httpMetadata?.contentType || "application/octet-stream");
    headers.set("Cache-Control", "public, max-age=31536000");
    headers.set("Accept-Ranges", "bytes");
    headers.set("Content-Length", object.size?.toString() || "0");
    
    return new Response(object.body, { headers });
  } catch (err) {
    console.error("Media get error:", err);
    return new Response("Error retrieving file: " + err.message, { status: 500 });
  }
}

// === Multipart Upload Handlers ===

// Create a new multipart upload
async function handleMultipartCreate(context) {
  try {
    const bucket = context.env.MEDIA_BUCKET;
    
    if (!bucket) {
      return Response.json(
        { error: "R2 bucket not configured" },
        { status: 500, headers: corsHeaders() }
      );
    }

    const { filename, contentType, fileSize } = await context.request.json();
    
    if (!filename || !contentType) {
      return Response.json(
        { error: "Missing filename or contentType" },
        { status: 400, headers: corsHeaders() }
      );
    }

    // Validate file size
    if (fileSize > MAX_FILE_SIZE) {
      return Response.json(
        { error: `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB` },
        { status: 400, headers: corsHeaders() }
      );
    }

    // Validate file type is a video
    if (!ALLOWED_VIDEO_TYPES.includes(contentType)) {
      return Response.json(
        { error: "Invalid file type. Only video files are allowed." },
        { status: 400, headers: corsHeaders() }
      );
    }

    // Generate unique key
    const timestamp = Date.now();
    const randomId = generateSecureId();
    const extension = getExtension(filename) || "mp4";
    const key = `videos/${timestamp}-${randomId}.${extension}`;

    // Create multipart upload
    const multipartUpload = await bucket.createMultipartUpload(key, {
      httpMetadata: {
        contentType: contentType,
      },
      customMetadata: {
        originalName: filename,
        uploadedAt: new Date().toISOString(),
      },
    });

    return Response.json({
      success: true,
      uploadId: multipartUpload.uploadId,
      key: key,
    }, { headers: corsHeaders() });
  } catch (err) {
    console.error("Multipart create error:", err);
    return Response.json(
      { error: err.message },
      { status: 500, headers: corsHeaders() }
    );
  }
}

// Upload a single part of a multipart upload
async function handleMultipartPart(context) {
  try {
    const bucket = context.env.MEDIA_BUCKET;
    
    if (!bucket) {
      return Response.json(
        { error: "R2 bucket not configured" },
        { status: 500, headers: corsHeaders() }
      );
    }

    const contentType = context.request.headers.get("content-type") || "";
    
    if (!contentType.includes("multipart/form-data")) {
      return Response.json(
        { error: "Invalid content type. Use multipart/form-data" },
        { status: 400, headers: corsHeaders() }
      );
    }

    const formData = await context.request.formData();
    const key = formData.get("key");
    const uploadId = formData.get("uploadId");
    const partNumber = parseInt(formData.get("partNumber"), 10);
    const chunk = formData.get("chunk");
    
    if (!key || !uploadId || !partNumber || !chunk) {
      return Response.json(
        { error: "Missing required fields: key, uploadId, partNumber, chunk" },
        { status: 400, headers: corsHeaders() }
      );
    }

    // Resume the multipart upload
    const multipartUpload = bucket.resumeMultipartUpload(key, uploadId);

    // Upload the part
    const uploadedPart = await multipartUpload.uploadPart(partNumber, chunk);

    return Response.json({
      success: true,
      partNumber: partNumber,
      etag: uploadedPart.etag,
    }, { headers: corsHeaders() });
  } catch (err) {
    console.error("Multipart part upload error:", err);
    return Response.json(
      { error: err.message },
      { status: 500, headers: corsHeaders() }
    );
  }
}

// Complete a multipart upload
async function handleMultipartComplete(context) {
  try {
    const bucket = context.env.MEDIA_BUCKET;
    
    if (!bucket) {
      return Response.json(
        { error: "R2 bucket not configured" },
        { status: 500, headers: corsHeaders() }
      );
    }

    const { key, uploadId, parts } = await context.request.json();
    
    if (!key || !uploadId || !parts || !Array.isArray(parts)) {
      return Response.json(
        { error: "Missing required fields: key, uploadId, parts" },
        { status: 400, headers: corsHeaders() }
      );
    }

    // Resume and complete the multipart upload
    const multipartUpload = bucket.resumeMultipartUpload(key, uploadId);
    
    // Validate and sort parts by partNumber before completing
    const validParts = parts.filter(p => 
      p && typeof p.partNumber === 'number' && !isNaN(p.partNumber) && p.etag
    );
    
    if (validParts.length !== parts.length) {
      return Response.json(
        { error: "Invalid parts data. Each part must have a valid partNumber and etag." },
        { status: 400, headers: corsHeaders() }
      );
    }
    
    const sortedParts = validParts.sort((a, b) => a.partNumber - b.partNumber);
    
    await multipartUpload.complete(sortedParts);

    const videoUrl = `/api/upload/media/${key}`;

    return Response.json({
      success: true,
      url: videoUrl,
      key: key,
    }, { headers: corsHeaders() });
  } catch (err) {
    console.error("Multipart complete error:", err);
    return Response.json(
      { error: err.message },
      { status: 500, headers: corsHeaders() }
    );
  }
}

// Abort a multipart upload
async function handleMultipartAbort(context) {
  try {
    const bucket = context.env.MEDIA_BUCKET;
    
    if (!bucket) {
      return Response.json(
        { error: "R2 bucket not configured" },
        { status: 500, headers: corsHeaders() }
      );
    }

    const { key, uploadId } = await context.request.json();
    
    if (!key || !uploadId) {
      return Response.json(
        { error: "Missing required fields: key, uploadId" },
        { status: 400, headers: corsHeaders() }
      );
    }

    // Resume and abort the multipart upload
    const multipartUpload = bucket.resumeMultipartUpload(key, uploadId);
    await multipartUpload.abort();

    return Response.json({
      success: true,
    }, { headers: corsHeaders() });
  } catch (err) {
    console.error("Multipart abort error:", err);
    return Response.json(
      { error: err.message },
      { status: 500, headers: corsHeaders() }
    );
  }
}

function getExtension(filename) {
  if (!filename) return null;
  const parts = filename.split(".");
  return parts.length > 1 ? parts.pop().toLowerCase() : null;
}

function corsHeaders() {
  // Restrict CORS to the specific domain
  return {
    "Access-Control-Allow-Origin": "https://renelaird.pages.dev",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}
