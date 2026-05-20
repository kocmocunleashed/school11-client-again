import { adminClient } from "@/lib/supabase/admin";

export const getPublicUrl = (bucket: string, path: string) => {
  const { data } = adminClient.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
};

export const uploadFile = async (bucket: string, path: string, file: File) => {
  const { data, error } = await adminClient.storage.from(bucket).upload(path, file, {
    upsert: true,
  });

  if (error) throw error;
  return getPublicUrl(bucket, data.path);
};
