import { VercelRequest, VercelResponse } from "@vercel/node";
import { serialize } from "cookie";
import { generateRandomString, getRedirectUri } from "../utils";
const authScope = {
  GET_PLAYLIST_ITEMS: "playlist-read-private",
  MODIFY_PLAYLISTS_PRIVATE: "playlist-modify-private",
  MODIFY_PLAYLISTS_PUBLIC: "playlist-modify-public",
} as const;

const createResponseParams = () => ({
  response_type: "code",
  client_id: process.env.CLIENT_ID || "dummyClientId",
  scope: `${authScope.GET_PLAYLIST_ITEMS} ${authScope.MODIFY_PLAYLISTS_PRIVATE} ${authScope.MODIFY_PLAYLISTS_PUBLIC}`,
  redirect_uri: getRedirectUri(),
});

export default async (req: VercelRequest, res: VercelResponse) => {
  const state = generateRandomString(16);
  const cookie = serialize("spotify_auth_state", state);
  res.setHeader("Set-Cookie", [cookie]);
  res.redirect(
    "https://accounts.spotify.com/authorize?" +
      new URLSearchParams({
        ...createResponseParams(),
        state,
      }).toString()
  );
};
