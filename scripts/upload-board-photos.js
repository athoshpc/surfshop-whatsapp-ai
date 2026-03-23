require("dotenv").config();

const fs = require("fs");
const path = require("path");
const { getBoards } = require("../data/boards");
const { getSupabaseClient, storageBucket } = require("../src/lib/supabase");

const contentTypes = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp"
};

function getContentType(filePath) {
  return contentTypes[path.extname(filePath).toLowerCase()] || "application/octet-stream";
}

async function main() {
  const supabase = getSupabaseClient();

  if (!supabase) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
  }

  for (const board of getBoards()) {
    for (const photo of board.photos || []) {
      const absolutePath = path.resolve(photo.localFile);

      if (!fs.existsSync(absolutePath)) {
        console.log(`skip ${board.id} ${photo.label}: file not found -> ${absolutePath}`);
        continue;
      }

      const fileBuffer = fs.readFileSync(absolutePath);
      const contentType = getContentType(absolutePath);

      const { error } = await supabase.storage
        .from(storageBucket)
        .upload(photo.storagePath, fileBuffer, {
          contentType,
          upsert: true
        });

      if (error) {
        throw new Error(`upload failed for ${photo.storagePath}: ${error.message}`);
      }

      console.log(`uploaded ${board.id} ${photo.label} -> ${photo.storagePath}`);
    }
  }

  console.log("done");
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});

