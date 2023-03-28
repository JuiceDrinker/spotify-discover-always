import { VercelRequest, VercelResponse } from "@vercel/node";
import { SPOTIFY_BASE_URI } from "../config";
import axios from "axios";
export default async (req: VercelRequest, res: VercelResponse) => {
  console.log("here");
  const {
    query: { code = null, state = null },
    cookies,
  } = req;
  console.log(cookies);
  const storedState: unknown = JSON.parse(cookies["spotify_auth"]);
  if (state !== storedState) {
    res.status(403).json({ message: "Forbidden" });
  }

  const authResponse = await axios.post(`${SPOTIFY_BASE_URI}/api/token`, {
    code,
    redirect_uri: "https://spotify-discover-always.vercel.app/api/authenticate",
    grant_type: "authorization_code",
  });

  if (authResponse.status !== 200) {
    res.status(403).json({ message: "Forbidden" });
  }

  const me = await axios.get(`${SPOTIFY_BASE_URI}/v1/me`);
  console.log(me);
  res.json({ message: "Hey" });
};

const createAuthOptions = (code: string) => ({
  form: {},
  headers: {
    Authorization:
      "Basic " +
      Buffer.from(
        process.env.CLIENT_ID + ":" + process.env.CLIENT_SECRET,
        "base64"
      ),
  },
  json: true,
});
