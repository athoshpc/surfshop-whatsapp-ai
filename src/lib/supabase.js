const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const storageBucket = process.env.SUPABASE_STORAGE_BUCKET || "board-photos";

function getSupabaseClient() {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}

function getPublicFileUrl(storagePath) {
  if (!supabaseUrl || !storageBucket || !storagePath) {
    return null;
  }

  return `${supabaseUrl}/storage/v1/object/public/${storageBucket}/${storagePath}`;
}

async function uploadBufferToStorage(storagePath, buffer, contentType) {
  const supabase = getSupabaseClient();

  if (!supabase) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
  }

  const { error } = await supabase.storage
    .from(storageBucket)
    .upload(storagePath, buffer, {
      contentType,
      upsert: true
    });

  if (error) {
    throw new Error(`upload failed for ${storagePath}: ${error.message}`);
  }

  return getPublicFileUrl(storagePath);
}

module.exports = {
  getSupabaseClient,
  getPublicFileUrl,
  storageBucket,
  uploadBufferToStorage
};
