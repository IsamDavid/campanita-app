export const STORAGE_BUCKETS = {
  stoolPhotos: "stool-photos",
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
