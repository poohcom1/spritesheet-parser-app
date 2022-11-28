import type { VercelRequest, VercelResponse } from "@vercel/node";
import axios from "axios";

export default async (request: VercelRequest, response: VercelResponse) => {
  try {
    const { url } = request.query;

    const res = await axios.get(url as string, {
      responseType: "arraybuffer",
    });
    const buffer = Buffer.from(res.data).toString("base64");

    response.status(200).json(<LoadImageResponse>{ buffer });
  } catch (e) {
    console.error(e);
    response.status(500).json({ message: JSON.stringify(e) });
  }
};
