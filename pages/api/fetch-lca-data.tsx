import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import { lca_disclosures } from "@prisma/client";
import { lcaDataFormatter } from "./get_lca_data";


const getLcaValues = async (): Promise<lca_disclosures[]> => {
    return await prisma.lca_disclosures.findMany();
}

export async function POST(req: NextApiRequest, res: NextApiResponse) {
    // get the LCA values
    const prismaLCAData = await getLcaValues();

    // format the LCA values
    const LCAData = prismaLCAData.map(lcaDataFormatter)

    res.status(200).json({ LCAData })
}
