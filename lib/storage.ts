export const STORAGE_BUCKETS = {
  stoolPhotos: "stool-photos",
  symptomPhotos: "symptom-photos",
  documents: "documents",
  petMedia: "pet-media",
  prescriptions: "prescriptions"
} as const;

export function buildStoragePath({
  householdId,
  petId,
  category,
  fileName
}: {
  householdId: string;
  petId: string;
  category: string;
  fileName: string;
}) {
  const normalized = fileName.replace(/[^a-zA-Z0-9._-]/g, "-");
  return `${householdId}/${petId}/${category}/${Date.now()}-${normalized}`;
}

export function isRemoteAsset(path: string | null | undefined) {
  return Boolean(path && /^https?:\/\//.test(path));
}

function loadImageFromFile(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("No se pudo procesar la imagen."));
    };

    image.src = url;
  });
}

export async function createImageThumbnail(file: File, maxSize = 400) {
  const image = await loadImageFromFile(file);
  const scale = Math.min(1, maxSize / Math.max(image.naturalWidth, image.naturalHeight));
  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("No se pudo preparar la miniatura.");
  }

  context.drawImage(image, 0, 0, width, height);

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/webp", 0.82);
  });

  if (!blob) {
    throw new Error("No se pudo crear la miniatura.");
  }

  return new File([blob], `${file.name.replace(/\.[^.]+$/, "") || "foto"}-thumb.webp`, {
    type: "image/webp"
  });
}

export async function createOptimizedImage(file: File, maxSize = 1200) {
  const image = await loadImageFromFile(file);
  const scale = Math.min(1, maxSize / Math.max(image.naturalWidth, image.naturalHeight));
  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("No se pudo preparar la imagen optimizada.");
  }

  context.drawImage(image, 0, 0, width, height);

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/webp", 0.86);
  });

  if (!blob) {
    throw new Error("No se pudo crear la imagen optimizada.");
  }

  return new File([blob], `${file.name.replace(/\.[^.]+$/, "") || "foto"}-optimized.webp`, {
    type: "image/webp"
  });
}

type UploadClient = {
  storage: {
    from: (bucket: string) => {
      upload: (
        path: string,
        file: File,
        options?: { contentType?: string; upsert?: boolean }
      ) => Promise<{ error: { message: string } | null }>;
    };
  };
};

export type UploadedPhoto = {
  /** Path of the image to display and store. Never the untouched original. */
  photoPath: string;
  /** Small preview, only when the caller asked for one. */
  thumbnailPath: string | null;
  /**
   * True when the browser could not decode or re-encode the image and the
   * original was stored instead. Losing the photo would be worse than storing
   * a large one, so this is a fallback rather than a failure.
   */
  storedOriginal: boolean;
};

/**
 * Uploads a photo, optimized.
 *
 * Why this exists: each form used to build its own upload, and they had drifted.
 * Two of them sent the untouched camera file, and the third sent the original
 * PLUS an optimized copy PLUS a thumbnail — so the form that "optimized" stored
 * the most of all. The original was never actually replaced anywhere.
 *
 * A phone photo is 2-5 MB. The same image as WebP at 1200px is around 200 KB.
 * Storing the original costs 10-20x for detail nobody looks at on a phone.
 *
 * From here the original is never uploaded. One code path, three callers.
 */
export async function uploadPhoto({
  client,
  bucket,
  householdId,
  petId,
  category,
  file,
  withThumbnail = false,
  maxSize = 1200
}: {
  client: UploadClient;
  bucket: string;
  householdId: string;
  petId: string;
  category: string;
  file: File;
  withThumbnail?: boolean;
  /**
   * Longest edge after resizing. Photos look fine at 1200. Documents — a
   * prescription, a vet report — need more, because small handwriting has to
   * stay readable and an unreadable prescription is worth nothing.
   */
  maxSize?: number;
}): Promise<UploadedPhoto> {
  let toUpload = file;
  let storedOriginal = false;

  // A PDF is not an image and cannot go through a canvas. It is stored as it
  // is: these are documents somebody may have to read closely.
  if (!file.type.startsWith("image/")) {
    const documentPath = buildStoragePath({
      householdId,
      petId,
      category,
      fileName: file.name
    });
    const documentUpload = await client.storage
      .from(bucket)
      .upload(documentPath, file, { contentType: file.type, upsert: false });
    if (documentUpload.error) throw new Error(documentUpload.error.message);
    return { photoPath: documentPath, thumbnailPath: null, storedOriginal: true };
  }

  try {
    toUpload = await createOptimizedImage(file, maxSize);
  } catch {
    // Some formats (HEIC among them) cannot be decoded by every browser.
    // Keeping the original is the lesser evil: the point of the photo is the
    // record, and a record that failed to save is worth nothing.
    storedOriginal = true;
  }

  const photoPath = buildStoragePath({
    householdId,
    petId,
    category,
    fileName: toUpload.name
  });

  const upload = await client.storage
    .from(bucket)
    .upload(photoPath, toUpload, { contentType: toUpload.type, upsert: false });

  if (upload.error) throw new Error(upload.error.message);

  if (!withThumbnail) {
    return { photoPath, thumbnailPath: null, storedOriginal };
  }

  // A missing thumbnail is a cosmetic problem; it must never cost the photo.
  try {
    const thumbnail = await createImageThumbnail(file);
    const thumbnailPath = buildStoragePath({
      householdId,
      petId,
      category: `${category}/thumbnails`,
      fileName: thumbnail.name
    });

    const thumbnailUpload = await client.storage
      .from(bucket)
      .upload(thumbnailPath, thumbnail, {
        contentType: thumbnail.type,
        upsert: false
      });

    return {
      photoPath,
      thumbnailPath: thumbnailUpload.error ? null : thumbnailPath,
      storedOriginal
    };
  } catch {
    return { photoPath, thumbnailPath: null, storedOriginal };
  }
}
