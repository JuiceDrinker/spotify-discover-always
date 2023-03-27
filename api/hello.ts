import { VercelRequest, VercelResponse } from "@vercel/node";

export default async (req: VercelRequest, res: VercelResponse) => {
  res.status(200).send("Hello from Vercel TypeScript Serverless Function!");
};
