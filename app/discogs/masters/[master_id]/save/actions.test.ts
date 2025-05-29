import { ReleaseDb } from "@/types/ReleaseDb";
import { mergeTracks } from "./actions";

describe("mergeTracks", () => {
    it("should return empty array when both inputs are undefined", () => {
        expect(mergeTracks(undefined, undefined)).toEqual([]);
    });

    it("should return updatedTracks when originalTracks is undefined", () => {
        const updatedTracks = [{ title: "Track 1" }];
        expect(mergeTracks(undefined, updatedTracks)).toEqual(updatedTracks);
    });

    it("should return originalTracks when updatedTracks is undefined", () => {
        const originalTracks = [{ title: "Track 1" }];
        expect(mergeTracks(originalTracks, undefined)).toEqual(originalTracks);
    });

    it("should merge tracks and mark new tracks as extra_track", () => {
        const originalTracks = [
            { title: "Track 1", extraartists: [] },
            { title: "Track 2", extraartists: [] },
        ];
        const updatedTracks = [
            { title: "Track 2", extraartists: [] },
            { title: "Track 3", extraartists: [] },
        ];

        const expected = [
            { title: "Track 1", extraartists: [] },
            { title: "Track 2", extraartists: [] },
            { title: "Track 3", extraartists: [], extra_track: true },
        ];

        expect(mergeTracks(originalTracks, updatedTracks)).toEqual(expected);
    });

    it("should update existing track if updated track has more extra artists", () => {
        const originalTracks = [
            { title: "Track 1", extraartists: [] },
        ];
        const updatedTracks = [
            { title: "Track 1", extraartists: [{ name: "Artist 1" }] },
        ];

        const expected = [
            { title: "Track 1", extraartists: [{ name: "Artist 1" }] },
        ];

        expect(mergeTracks(originalTracks, updatedTracks)).toEqual(expected);
    });

    it("should keep original track if it has more or equal extra artists", () => {
        const originalTracks = [
            {
                title: "Track 1",
                extraartists: [{ name: "Artist 1" }, { name: "Artist 2" }],
            },
        ];
        const updatedTracks = [
            { title: "Track 1", extraartists: [{ name: "Artist 3" }] },
        ];

        expect(mergeTracks(originalTracks, updatedTracks)).toEqual(
            originalTracks,
        );
    });
});
