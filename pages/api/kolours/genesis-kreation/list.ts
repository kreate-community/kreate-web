import { NextApiRequest, NextApiResponse } from "next";

import { fetchDiscount, lookupReferral } from "@/modules/kolours/common";
import { getAllGenesisKreations } from "@/modules/kolours/genesis-kreation";
import { GenesisKreationList } from "@/modules/kolours/types/Kolours";
import { apiCatch, ClientError } from "@/modules/next-backend/api/errors";
import { sendJson } from "@/modules/next-backend/api/helpers";
import { db } from "@/modules/next-backend/connections";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    ClientError.assert(req.method === "GET", {
      _debug: "invalid http method",
    });
    const address = req.query.address;
    ClientError.assert(!address || typeof address === "string", {
      _debug: "invalid address",
    });
    const referral = address ? lookupReferral(address) : undefined;
    const discount = referral ? await fetchDiscount(db, referral) : undefined;
    const kreations = await getAllGenesisKreations(db, discount);

    sendJson(res, { kreations, referral } satisfies GenesisKreationList);
  } catch (error) {
    apiCatch(req, res, error);
  }
}
