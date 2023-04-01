// import { VercelRequest, VercelResponse } from "@vercel/node";
// import axios from "axios";

// export default async (req: VercelRequest, res: VercelResponse) => {
//   const refreshToken = req.cookies["spotify_refresh_token"];

//   // Get refresh token, discoverweeklyid, discoverAlwaysId from DB
//   // Get new token using refreshtoken
//   // Get new discover weekly tracks
//   // Copy to discover always
//   const auth = await axios.post(`https://accounts.spotify.com/api/token`, {
//     grant_type: "refresh_token",
//     refresh_token: refreshToken(),
//   });
// };
