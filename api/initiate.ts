import { VercelRequest, VercelResponse } from "@vercel/node";
import { serialize } from "cookie";
import { SPOTIFY_BASE_URI } from "../config";
const authScope = {
  GET_PLAYLIST_ITEMS: "playlist-read-private",
  MODIFY_PLAYLISTS: "playlist-modify-private",
} as const;

const generateRandomString = (length: number) => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    result += chars.charAt(randomIndex);
  }

  return result;
};

const createResponseParams = () => ({
  response_type: "code",
  client_id: process.env.CLIENT_ID || "dummyClientId",
  scope: `${authScope.GET_PLAYLIST_ITEMS} ${authScope.MODIFY_PLAYLISTS}`,
  redirect_uri: "https://spotify-discover-always.vercel.app/api/authenticate",
});

export default async (req: VercelRequest, res: VercelResponse) => {
  const state = generateRandomString(16);
  console.log("here");
  const cookie = serialize("spotify_auth_state", state);
  res.setHeader("Set-Cookie", [cookie]);
  res.redirect(
    "https://accounts.spotify.com/authorize?" +
      new URLSearchParams({ ...createResponseParams(), state }).toString()
  );
};
