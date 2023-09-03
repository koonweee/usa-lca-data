import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import { lca_disclosures } from "@prisma/client";
import { lcaDataFormatter } from "@/pages/api/get_lca_data";


const getLcaValues = async (): Promise<lca_disclosures[]> => {
    return await prisma.lca_disclosures.findMany();
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        //if it isn't a post request, return not allowed
        res.status(405).json({ error: 'METHOD NOT ALLOWED' })
    }

    // get the LCA values
    const prismaLCAData = await getLcaValues();

    // format the LCA values
    const LCAData = prismaLCAData.map(lcaDataFormatter)

    res.status(200).json({ LCAData })
}
