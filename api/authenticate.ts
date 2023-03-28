import { VercelRequest, VercelResponse } from "@vercel/node";
import { SPOTIFY_BASE_URI } from "../config";

export default async (req: VercelRequest, res: VercelResponse) => {
  const {
    query: { code = null, state = null },
    cookies,
  } = req;
  const storedState: unknown = JSON.parse(cookies["spotify_auth"]);
  if (state !== storedState) {
    res.status(403).json({ message: "Forbidden" });
  }

  res.json({ message: "Hey" });
};

const createAuthOptions = (code: string) => ({
  url: `${SPOTIFY_BASE_URI}/api/token`,
  form: {
    code: code,
    redirect_uri: "https://spotify-discover-always.vercel.app/api/authenticate",
    grant_type: "authorization_code",
  },
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
