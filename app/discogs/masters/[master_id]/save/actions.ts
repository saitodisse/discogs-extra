"use server";

import { createClient } from "@/utils/supabase/server";
import { Client, MasterRelease, Release } from "disconnect";
import { ReleaseDb } from "../../../../../types/ReleaseDb";
import { v4 as uuid } from "uuid";

// Helper functions for merging data
const mergeJsonIfLarger = (original: any, updated: any) => {
  if (!original) return updated;
  if (!updated) return original;

  const originalStr = JSON.stringify(original);
  const updatedStr = JSON.stringify(updated);

  return updatedStr.length > originalStr.length ? updated : original;
};

const mergeTracks = (originalTracks: any[] = [], updatedTracks: any[] = []) => {
  if (!originalTracks) return updatedTracks || [];
  if (!updatedTracks) return originalTracks;

  const mergedTracks = [...originalTracks];

  updatedTracks.forEach((updatedTrack) => {
    const existingIndex = mergedTracks.findIndex(
      (track) => track.title === updatedTrack.title,
    );

    if (existingIndex === -1) {
      // New track, add it
      mergedTracks.push({ updatedTrack, extra_track: true });
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

// Function to merge extra artists data
export const mergeExtraArtistsData = async (
  master: ReleaseDb,
  releases: Release[],
) => {
  const extraArtistsMap = new Map<number, ReleaseDb["extraartists_json"][0]>();

  // Initialize from master's existing extraartists_json if any
  if (master.extraartists_json) {
    for (const artist of master.extraartists_json) {
      if (artist.id !== undefined) {
        extraArtistsMap.set(artist.id, {
          ...artist,
          roles: [...artist.roles],
        });
      }
    }
  }

  function addOrUpdateCredit(
    artistId: number,
    artistName: string,
    artistAnv: string | undefined,
    artistResourceUrl: string | undefined,
    role: string,
    trackInfo?: string,
  ) {
    if (!role) return;

    const newRoleDetail: ReleaseDb["extraartists_json"][0]["roles"][0] = {
      role,
    };
    if (trackInfo?.trim()) {
      newRoleDetail.tracks = trackInfo.trim();
    }

    let existingArtist = extraArtistsMap.get(artistId);

    if (existingArtist) {
      // Artist exists, check if this role/track combination is new
      const roleExists = existingArtist.roles.some(
        (r) =>
          r.role === newRoleDetail.role && r.tracks === newRoleDetail.tracks,
      );
      if (!roleExists) {
        existingArtist.roles.push(newRoleDetail);
      }
      // Update if new data is more complete
      if (!existingArtist.name && artistName) existingArtist.name = artistName;
      if (!existingArtist.anv && artistAnv) existingArtist.anv = artistAnv;
      if (!existingArtist.resource_url && artistResourceUrl) {
        existingArtist.resource_url = artistResourceUrl;
      }
    } else {
      // New artist
      existingArtist = {
        id: artistId,
        name: artistName,
        anv: artistAnv,
        resource_url: artistResourceUrl,
        roles: [newRoleDetail],
      };
      extraArtistsMap.set(artistId, existingArtist);
    }
  }

  for (const release of releases) {
    if (!release) continue;

    // Process release-level extraartists
    if (release.extraartists) {
      for (const extraArtist of release.extraartists) {
        if (extraArtist.id) {
          addOrUpdateCredit(
            extraArtist.id,
            extraArtist.name,
            extraArtist.anv,
            extraArtist.resource_url,
            extraArtist.role || "",
            extraArtist.tracks,
          );
        }
      }
    }

    // Process track-level extraartists
    if (release.tracklist) {
      for (const track of release.tracklist) {
        if (track.extraartists) {
          for (const trackArtist of track.extraartists) {
            if (trackArtist.id) {
              const trackIdentifier = track.position || track.title;
              addOrUpdateCredit(
                trackArtist.id,
                trackArtist.name,
                trackArtist.anv,
                trackArtist.resource_url,
                trackArtist.role || "",
                trackIdentifier,
              );
            }
          }
        }
      }
    }
  }

  // Sort artists and their roles
  const sortedArtists = Array.from(extraArtistsMap.values());
  sortedArtists.sort((a, b) => a.name.localeCompare(b.name));
  sortedArtists.forEach((artist) => {
    if (artist.roles) {
      artist.roles.sort((a, b) => {
        if (a.role === b.role) {
          return (a.tracks || "").localeCompare(b.tracks || "");
        }
        return a.role.localeCompare(b.role);
      });
    }
  });

  return {
    ...master,
    extraartists_json: sortedArtists,
  };
};

// Function to merge release data
export const mergeTracksData = async (
  master: ReleaseDb,
  newRelease: Release,
): Promise<ReleaseDb> => {
  // Get existing release IDs or initialize empty array
  const releases_ids = master?.releases_ids || [];

  // Check if this release is already included
  if (!releases_ids.some((r) => r === newRelease.id)) {
    releases_ids.push(newRelease.id);
  }

  return {
    ...master,
    releases_ids,
    tracklist_json: mergeTracks(
      master?.tracklist_json || [],
      newRelease.tracklist || [],
    ),
  };
};

export const db_getReleasesByMasterId = async (masterId: number) => {
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

export const db_saveMasterAction = async ({
  releaseIdDb, // This is the ID of the release in your database, if you are updating an existing one
  master,
}: {
  releaseIdDb: string; // ID of the release in your database, used for updates
  master?: ReleaseDb; // Optional, can be used for additional data if needed
}) => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("User must be authenticated to save a master");
  }

  if (!master) {
    throw new Error("Master release data is required");
  }

  // Try to get existing data first
  const { data: existingData } = await supabase
    .from("releases")
    .select("*")
    .eq("id", releaseIdDb)
    .single();

  const { error } = await supabase
    .from("releases")
    .upsert({
      ...master,
    }, { onConflict: "id" });

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

export const db_getReleaseByMasterId = async (
  master: MasterRelease,
): Promise<ReleaseDb> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("releases")
    .select("*")
    .eq("master_id", master.id)
    .single();

  if (error && error?.code !== "PGRST116") {
    throw new Error(
      "Error fetching release by master ID:" + JSON.stringify(error) + "," +
        " data: " + JSON.stringify(data),
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("User must be authenticated to save a master");
  }

  if (!data) {
    // create a new
    return {
      id: uuid(),
      owner_id: user.id,
      owner_email: user.email || "",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      master_id: master.id,
      releases_ids: master?.main_release ? [master.main_release] : [],
      artists_id: master.artists.map((artist) => artist.id),
      artists_name: master.artists.map((artist) => artist.name),
      title: master.title,
      // status: undefined, // status is not provided in the master release
      data_quality: master.data_quality,
      // country: undefined, // country is not provided in the master release
      year_of_release: master.year,
      // notes: undefined, // notes are not provided in the master release
      companies_json: [],
      extraartists_json: [],
      formats_json: [],
      genres: master.genres || [],
      styles: master.styles || [],
      identifiers_json: [],
      images_json: master.images || [],
      series_json: [],
      videos_json: master.videos || [],
      tracklist_json: master.tracklist || [],
    };
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

export const discogs_getReleaseById = async (releaseId: number) => {
  if (!releaseId) {
    throw new Error("Release ID is required");
  }

  const client = new Client({
    method: "discogs",
    consumerKey: process.env.DISCOGS_CONSUMER_KEY,
    consumerSecret: process.env.DISCOGS_CONSUMER_SECRET,
  });
  const release = await client.database().getRelease(releaseId);

  return release;
};

export const debug_saveJsonToTmp = async ({
  data,
  filename,
  lastPath,
}: {
  data: any; // The JSON data to save
  filename: string; // The filename to save the data as
  lastPath?: string; // Optional path to save the file, defaults to 'tmp'
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
    lastPath || "",
  );

  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, { recursive: true });
  }
  if (!filename) {
    console.error("[saveJsonToTmp] Filename is required to save JSON data");
    return;
  }
  if (!data) {
    console.error("[saveJsonToTmp] Data is required to save JSON data");
    return;
  }
  if (typeof data !== "object") {
    console.error("[saveJsonToTmp] Data must be an object to save as JSON");
    return;
  }
  if (typeof filename !== "string") {
    console.error("[saveJsonToTmp] Filename must be a string");
    return;
  }

  const filePath = path.join(tmpDir, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");

  console.log(`Saved '${filePath}'`);
};
