"use server";

import { createClient } from "@/utils/supabase/server";
import { Client, MasterRelease } from "disconnect";

// Helper functions for merging data
const mergeJsonIfLarger = (original: any, updated: any) => {
  if (!original) return updated;
  if (!updated) return original;

  const originalStr = JSON.stringify(original);
  const updatedStr = JSON.stringify(updated);

  return updatedStr.length > originalStr.length ? updated : original;
};

const mergeTracks = (originalTracks: any[], updatedTracks: any[]) => {
  const mergedTracks = [...originalTracks];

  updatedTracks.forEach((updatedTrack) => {
    const existingIndex = mergedTracks.findIndex(
      (track) => track.title === updatedTrack.title,
    );

    if (existingIndex === -1) {
      // New track, add it
      mergedTracks.push(updatedTrack);
    } else {
      // Existing track, check if we should update it
      const existingTrack = mergedTracks[existingIndex];
      const hasMoreExtraArtists = (track: any) =>
        (track.extraartists?.length || 0) >
          (existingTrack.extraartists?.length || 0);

      if (hasMoreExtraArtists(updatedTrack)) {
        mergedTracks[existingIndex] = updatedTrack;
      }
    }
  });

  return mergedTracks;
};

export const getReleasesByMasterId = async (masterId: number) => {
  if (!masterId) {
    throw new Error("Master ID is required");
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("releases")
    .select("*")
    .eq("master_id", masterId)
    .single();

  if (error) {
    console.error(error.code + " " + error.message);
    throw new Error("Error fetching release");
  }

  return data;
};

export const saveMasterAction = async ({
  releaseIdDb, // This is the ID of the release in your database, if you are updating an existing one
  master,
}: {
  releaseIdDb: string; // ID of the release in your database, used for updates
  master?: MasterRelease; // Optional, can be used for additional data if needed
}) => {
  if (!master?.id) {
    throw new Error("Master ID is required");
  }

  const supabase = await createClient();
  if (isNaN(master.id)) {
    throw new Error("Invalid Master ID");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("User must be authenticated to save a master");
  }

  if (!master) {
    throw new Error("Master release data is required");
  }

  // Transform artists array into separate ID and name arrays
  const artists_id = master.artists.map((artist) => artist.id);
  const artists_name = master.artists.map((artist) => artist.name);

  // Try to get existing data first
  const { data: existingData } = await supabase
    .from("releases")
    .select("*")
    .eq("id", releaseIdDb)
    .single();

  // Merge data if it exists
  const mergedData = {
    id: releaseIdDb,
    master_id: master.id,
    owner_id: user.id,
    owner_email: user.email,

    title: master.title,
    year_of_release: master.year,
    data_quality: master.data_quality,
    artists_id,
    artists_name,
    genres: master.genres,
    styles: master.styles || [],

    // Merge JSON fields if they exist
    images_json: mergeJsonIfLarger(existingData?.images_json, master.images),
    videos_json: mergeJsonIfLarger(existingData?.videos_json, master.videos),
    tracklist_json: existingData?.tracklist_json
      ? mergeTracks(existingData.tracklist_json, master.tracklist)
      : master.tracklist,
  };

  const { error } = await supabase
    .from("releases")
    .upsert(mergedData, { onConflict: "id" });

  if (error) {
    console.error(error.code + " " + error.message);
    return {
      error: "Failed to save master release: " + error.message,
      status: "error",
    };
  } else {
    return {
      message: "Master saved successfully!",
      status: "success",
    };
  }
};

export const getReleaseByMasterId = async (masterId: number) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("releases")
    .select("*")
    .eq("master_id", masterId)
    .single();

  if (error) {
    console.error("Error fetching release by master ID:", error);
    return null;
  }

  return data;
};

export const discogs_getAllReleasesByMasterId = async (masterId: number) => {
  if (!masterId) {
    throw new Error("Master ID is required");
  }

  const client = new Client({
    method: "discogs",
    consumerKey: process.env.DISCOGS_CONSUMER_KEY,
    consumerSecret: process.env.DISCOGS_CONSUMER_SECRET,
  });
  const releases = await client.database().getMasterVersions(
    masterId,
    { page: 1, per_page: 10 },
  );

  return releases;
};

export const saveJsonToTmp = async ({
  data,
  filename,
}: {
  data: any; // The JSON data to save
  filename: string; // The filename to save the data as
  path?: string; // Optional path to save the file, defaults to 'tmp'
}) => {
  const fs = require("fs");
  const path = require("path");

  const tmpDir = path.join(
    process.cwd(),
    "app",
    "discogs",
    "masters",
    "[master_id]",
    "save",
    "tmp",
  );
  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, { recursive: true });
  }
  if (!filename) {
    throw new Error("Filename is required to save JSON data");
  }
  if (!data) {
    throw new Error("Data is required to save JSON data");
  }
  if (typeof data !== "object") {
    throw new Error("Data must be an object to save as JSON");
  }
  if (typeof filename !== "string") {
    throw new Error("Filename must be a string");
  }

  const filePath = path.join(tmpDir, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");

  console.log(`Saved JSON data to ${filePath}`);
};
