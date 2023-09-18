import { NextApiResponse, NextApiRequest } from 'next'
import prisma from 'lib/prisma'

const NODE_ENV = process.env.NODE_ENV

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    const {
      tokenId,
      collectionId,
      walletAddress,
      like,
      view, // boolean
    } = req.body
    await prisma.walletTokenActivity.upsert({
      where: {
        collectionId_tokenId_walletAddress : {
          tokenId: tokenId.toString().toLowerCase(),
          collectionId: collectionId.toString().toLowerCase(),
          walletAddress: walletAddress.toString().toLowerCase(),
        },
      },
      update: {
        like,
        ...(
          view ? { views: { increment: 1 }} : {}
        ),
      },
      create: {
        tokenId: tokenId.toString().toLowerCase(),
        collectionId: collectionId.toString().toLowerCase(),
        walletAddress: walletAddress.toString().toLowerCase(),
        like: like || false,
        views: view ? 1 : 0,
      },
    })

    return res.status(200).json({})
  }

  if (req.method === 'GET') {
    const walletTokenActivity = await prisma.walletTokenActivity.findFirst({
      where: {
        tokenId: req.query.tokenId.toString(),
        collectionId: req.query.collectionId.toString(),
        walletAddress: req.query.walletAddress.toString(),
      },
    })

    const viewSum = await prisma.walletTokenActivity.aggregate({
      where: {
        tokenId: req.query.tokenId.toString(),
        collectionId: req.query.collectionId.toString(),
      },
      _count: {
        like: true,
      },
      _sum: {
        views: true,
      }
    })

    const activityCount = await prisma.walletTokenActivity.aggregate({
      where: {
        tokenId: req.query.tokenId.toString(),
        collectionId: req.query.collectionId.toString(),
        like: true,
      },
      _count: {
        walletAddress: true,
      },
    })

    return res.status(200).json({
      totalViews: Number(viewSum._sum.views),
      totalLikes: activityCount._count.walletAddress,
      walletLike: walletTokenActivity?.like || false,
    })
  }

  return res.status(404)
}
