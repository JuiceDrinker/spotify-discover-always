import { VercelRequest, VercelResponse } from "@vercel/node";

export default async (req: VercelRequest, res: VercelResponse) => {
  const scope = "user-read-private user-read-email";
  const params = {
    response_type: "code",
    client_id: process.env.CLIENT_ID || "dummyClientId",
    scope: scope,
    redirect_uri: "https://spotify-discover-always.vercel.app/api/authenticate",
    state: generateRandomString(16),
  };
  res.redirect(
    "https://accounts.spotify.com/authorize?" +
      new URLSearchParams(params).toString()
  );
};

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
