import { NextApiResponse, NextApiRequest } from 'next'
import prisma from 'lib/prisma'


export type Activity = {
  collectionId: String
  tokenId: String
  type: String
  fromAddress: String
  toAddress: String
  amountText: String
  currency: String
  transactionId: String
  createdAt: String
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Activity[]>
) {

  if (req.method === 'GET') {
    // filters by: collectionId, tokenId
    const now = new Date()
    const activities = await prisma.activity.findMany({
      where: {
        ...req.query,
      }
    })

    const activitiesJson = activities.map((activity) => {
      return {
        collectionId: activity.collectionId,
        tokenId: activity.tokenId,
        type: activity.type,
        fromAddress: activity.fromAddress,
        toAddress: activity.toAddress,
        amountText: activity.amountText,
        currency: activity.currency,
        transactionId: activity.transactionId,
        createdAt: activity.createdAt.toString(),
      }
    })

    return res.status(200).json(activitiesJson)
  }
}
