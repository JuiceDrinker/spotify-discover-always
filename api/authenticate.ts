import { VercelRequest, VercelResponse } from "@vercel/node";
import axios from "axios";
import { getRedirectUri } from "../utils";
export default async (req: VercelRequest, res: VercelResponse) => {
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

  const me = await axios.get(`https://api.spotify.com/v1/me`, {
    headers: { Authorization: "Bearer " + authResponse.data.access_token },
  });
  const playlists = await axios.get(`https://api.spotify.com/v1/me/playlists`, {
    headers: { Authorization: "Bearer " + authResponse.data.access_token },
  });

  const discoverWeekly = playlists.data.items.map(
    (item: { name: string }) => item.name === "Discover Weekly"
  );

  if (!discoverWeekly) {
    res.json({ message: "Cannot find Discover Weekly playlist" });
  }

  const discoverAlways = await axios.post(
    `https://api.spotify.com/v1/users/${me.data.id}/playlists`,
    { name: "Discover Always" },
    { headers: { Authorization: "Bearer " + authResponse.data.access_token } }
  );
  console.log(discoverAlways);

  res.json({ message: "Hey" });
};

const createAuthOptions = (code: string) => ({
  json: true,
});
