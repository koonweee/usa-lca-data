import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const lcas = await prisma.lca_disclosures.findMany()
  return NextResponse.json(lcas)
}
