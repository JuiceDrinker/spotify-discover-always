import { VercelRequest, VercelResponse } from "@vercel/node";
import { SPOTIFY_BASE_URI } from "../config";
import axios from "axios";
export default async (req: VercelRequest, res: VercelResponse) => {
  const {
    query: { code = null, state = null },
  } = req;

  if (state !== req.cookies["spotify_auth_state"]) {
    res.status(403).json({ message: "Forbidden" });
  }

  const authResponse = await axios.post(
    `${SPOTIFY_BASE_URI}api/token`,
    {
      code,
      redirect_uri:
        "https://spotify-discover-always.vercel.app/api/authenticate",
      // redirect_uri: "http://localhost:3000/authenticate",
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
    res.status(403).json({ message: "Forbidden" });
  }

  const me = await axios.get(`https://api.spotify.com/v1/me`, {
    headers: { Authorization: "Bearer " + authResponse.data.access_token },
  });
  console.log(me);
  res.json({ message: "Hey" });
};

const createAuthOptions = (code: string) => ({
  json: true,
});
