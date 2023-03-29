import { VercelRequest, VercelResponse } from "@vercel/node";
import axios from "axios";
import { getRedirectUri } from "../utils";
export default async (req: VercelRequest, res: VercelResponse) => {
  const {
    query: { code = null, state = null },
  } = req;

  if (state !== req.cookies["spotify_auth_state"]) {
    console.log("here");
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

  const me = await axios.get(`https://api.spotify.com/v1/me/playlists`, {
    headers: { Authorization: "Bearer " + authResponse.data.access_token },
  });
  // console.log(me);
  const discoverWeekly = me.data.items.map(
    (item: { name: string }) => item.name === "Discover Weekly"
  );
  if (!discoverWeekly) {
    res.json({ message: "Cannot find Discover Weekly playlist" });
  }

  // console.log(discoverWeekly);
  res.json({ message: "Hey" });
};

const createAuthOptions = (code: string) => ({
  json: true,
});
