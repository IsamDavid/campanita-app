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
