import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

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

export const createAuthHeader = (token: string) => ({
  Authorization: `Bearer ${token}`,
});

export const encrypt = (string: string) => {
  if (!process.env.KEY || !process.env.IV) {
    throw new Error("Encryption failed");
  }
  const cipher = createCipheriv(
    "aes-256-gcm",
    Buffer.from(process.env.KEY, "hex"),
    Buffer.from(process.env.IV, "hex")
  );
  const encrypted = cipher.update(string, "utf-8", "hex") + cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");
  return { encrypted, authTag };
};

export const decrypt = (string: string, auth_tag: string) => {
  if (!process.env.KEY || !process.env.IV) {
    throw new Error("Decryption failed");
  }
  const cipher = createDecipheriv(
    "aes-256-gcm",
    Buffer.from(process.env.KEY, "hex"),
    Buffer.from(process.env.IV, "hex")
  );
  cipher.setAuthTag(Buffer.from(auth_tag, "hex"));
  return cipher.update(string, "hex", "utf-8") + cipher.final("utf-8");
};
