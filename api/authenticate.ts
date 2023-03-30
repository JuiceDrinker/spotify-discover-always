import { VercelRequest, VercelResponse } from "@vercel/node";
import axios from "axios";
import {
  addTracksToPlaylist,
  createPlaylist,
  getMe,
  getMePlaylists,
} from "../spotifyWebAPI";
import { createAuthHeader, getRedirectUri } from "../utils";
export default async (req: VercelRequest, res: VercelResponse) => {
  try {
    const {
      query: { code = null, state = null },
    } = req;

    if (state !== req.cookies["spotify_auth_state"]) {
      res.status(403).json({ message: "Forbidden" });
    }

    const authResponse = await axios.post(
      `https://accounts.spotify.com/api/token`,
      {
        code,
        redirect_uri: getRedirectUri(),
        grant_type: "authorization_code",
      },
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/x-www-form-urlencoded",
        },
        auth: {
          username: process.env.CLIENT_ID || "dummyId",
          password: process.env.CLIENT_SECRET || "dummySecret",
        },
      }
    );

    if (authResponse.status !== 200) {
      res.status(403).json({ message: "Auth failed" });
    }

    const me = await getMe(authResponse.data.access_token);

    const playlists = await getMePlaylists(authResponse.data.access_token);

    const discoverWeekly = playlists.data.items.find(
      (item: { name: string }) => item.name === "Discover Weekly"
    );

    if (!discoverWeekly) {
      res.json({ message: "Cannot find Discover Weekly playlist" });
    }

    const discoverWeeklyTracks: {
      data: { items: { track: { uri: string } }[] };
    } = await axios.get(discoverWeekly.tracks.href, {
      headers: createAuthHeader(authResponse.data.access_token),
    });

    const discoverAlways = await createPlaylist(
      authResponse.data.access_token,
      me.data.id
    );

    await addTracksToPlaylist(
      authResponse.data.access_token,
      discoverAlways.data.id,
      discoverWeeklyTracks.data.items
    );

    res.json({ message: "Hey" });
  } catch (e) {
    console.error(e);
  }
};
