import axios from "axios";
import { createAuthHeader } from "./utils";
export const getMe = (token: string) =>
  axios.get(`https://api.spotify.com/v1/me`, {
    headers: createAuthHeader(token),
  });

export const getMePlaylists = (token: string) =>
  axios.get(`https://api.spotify.com/v1/me/playlists`, {
    headers: createAuthHeader(token),
  });

export const createPlaylist = (
  token: string,
  userId: string,
  name: string = "Discover Always "
) =>
  axios.post(
    `https://api.spotify.com/v1/users/${userId}/playlists`,
    { name },
    { headers: createAuthHeader(token) }
  );

export const addTracksToPlaylist = (
  token: string,
  playlistId: string,
  itemsToAdd: { track: { uri: string } }[]
) =>
  axios.post(
    `https://api.spotify.com/v1/playlists/${playlistId}/tracks?` +
      new URLSearchParams({
        uris: itemsToAdd.reduce(
          (param, item) => (param += `${item.track.uri},`),
          ""
        ),
      }),
    {},
    {
      headers: createAuthHeader(token),
    }
  );
