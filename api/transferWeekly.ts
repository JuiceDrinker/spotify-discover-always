import { VercelRequest, VercelResponse } from "@vercel/node";
import mysql from "mysql";
import axios from "axios";
import { createAuthHeader, decrypt } from "../utils";
import { addTracksToPlaylist } from "../spotifyWebAPI";

export default async (req: VercelRequest, res: VercelResponse) => {
  const dbConn = mysql.createConnection(process.env.DATABASE_URL ?? "");
  const query = `SELECT * FROM users;`;
  return dbConn.query(
    query,
    async (
      err: any,
      results: {
        id: number;
        auth_tag: string;
        refresh_token: string;
        discoverWeeklyId: string;
        discoverAlwaysId: string;
        username: string;
      }[]
    ) => {
      if (err) {
        console.error(err);
        throw err;
      }
      const data = await Promise.allSettled(
        results.map(
          async ({
            discoverWeeklyId,
            discoverAlwaysId,
            auth_tag,
            refresh_token,
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
        )
      );

      dbConn.end();
      return res.status(201).json({ message: results });
    }
  );
};
