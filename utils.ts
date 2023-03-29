export const generateRandomString = (length: number) => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    result += chars.charAt(randomIndex);
  }

  return result;
};

export const getRedirectUri = () =>
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000/authenticate"
    : "https://spotify-discover-always.vercel.app/api/authenticate";
