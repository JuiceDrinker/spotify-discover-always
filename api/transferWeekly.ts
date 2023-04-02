import { VercelRequest, VercelResponse } from "@vercel/node";
import mysql from "mysql2/promise";
import axios from "axios";
import { createAuthHeader, decrypt } from "../utils";
import { addTracksToPlaylist } from "../spotifyWebAPI";

export default async (req: VercelRequest, res: VercelResponse) => {
  try {
    const dbConn = await mysql.createConnection(process.env.DATABASE_URL ?? "");
    const query = `SELECT * FROM users;`;
    const [rows, _] = await dbConn.execute(query);
    if (Array.isArray(rows)) {
      rows.map(
        //@ts-expect-error
        async ({
          id,
          refresh_token,
          discoverAlwaysId,
          discoverWeeklyId,
          auth_tag,
        }: {
          id: string;
          refresh_token: string;
          discoverWeeklyId: string;
          discoverAlwaysId: string;
          auth_tag: string;
        }) => {
          const decryptedRefreshToken = decrypt(refresh_token, auth_tag);
          const reAuth = await axios.post(
            "https://accounts.spotify.com/api/token",
            {
              grant_type: "refresh_token",
              refresh_token: decryptedRefreshToken,
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
          const token = reAuth.data.access_token;
          const discoverWeeklyTracks = await axios.get(
            `https://api.spotify.com/v1/playlists/${discoverWeeklyId}/tracks`,
            {
              headers: createAuthHeader(token),
            }
          );
          await addTracksToPlaylist(
            token,
            discoverAlwaysId,
            discoverWeeklyTracks.data.items
          );
        }
      );
      dbConn.end();
      return res.status(201).json({ message: "Copied over tracks" });
    }
    res.status(503).json({ message: "Internal Server Error" });
  } catch (er) {
    console.error(er);
  }
};
