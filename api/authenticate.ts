import { VercelRequest, VercelResponse } from "@vercel/node";
import { serialize } from "cookie";

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
  redirect_uri: "https://spotify-discover-always.vercel.app/api/persist",
});

export default async (req: VercelRequest, res: VercelResponse) => {
  const state = generateRandomString(16);
  const cookie = serialize("spotify_auth_state", state);
  console.log(createResponseParams().scope);
  res.setHeader("Set-Cookie", [cookie]);
  const params = res.redirect(
    "https://accounts.spotify.com/authorize?" +
      new URLSearchParams({ ...createResponseParams(), state }).toString()
  );
};
