import fetcher from 'lib/fetcher'
import setParams from 'lib/params'
import useSWR from 'swr'

type WalletTokenActivity = {
  totalViews: number,
  totalLikes: number,
  walletLike: boolean,
}

const fallbackData = {
  totalViews: 1,
  totalLikes: 0,
  walletLike: false,
}

export default function useWalletTokenActivity(
  collectionId: string,
  tokenId: string,
  walletAddress: string | undefined,
) {
  function getUrl() {
    const pathname = `/api/wallet_token_activities`

    let query = {
      collectionId: collectionId.toLowerCase(),
      tokenId: tokenId.toLowerCase(),
      walletAddress: walletAddress?.toLowerCase(),
    }

    const href = setParams(pathname, query)

    return href
  }

  const href = getUrl()

  const collection = useSWR<WalletTokenActivity>(href, fetcher, {
    fallbackData,
  })

  return collection
}
