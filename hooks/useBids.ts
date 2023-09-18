import { paths } from '@reservoir0x/reservoir-kit-client'
import fetcher from 'lib/fetcher'
import setParams from 'lib/params'
import { useEffect } from 'react'
import { useInView } from 'react-intersection-observer'
import useSWRInfinite, { SWRInfiniteKeyLoader } from 'swr/infinite'
import { getBaseDomain } from 'lib/domain'

const PROXY_API_BASE = process.env.NEXT_PUBLIC_PROXY_API_BASE
const COMMUNITY = process.env.NEXT_PUBLIC_COMMUNITY
const COLLECTION = process.env.NEXT_PUBLIC_COLLECTION
const COLLECTION_SET_ID = process.env.NEXT_PUBLIC_COLLECTION_SET_ID

type Orders = paths['/orders/bids/v4']['get']['responses']['200']['schema']

export default function useBids(
  fallbackData: Orders[],
  tokenId: string | undefined,
  source?: boolean | undefined,
) {
  const { ref, inView } = useInView()

  const pathname = `${PROXY_API_BASE}/orders/bids/v4`

  const orders = useSWRInfinite<Orders>(
    (index, previousPageData) =>
      getKey(
        { pathname, proxyApi: PROXY_API_BASE, tokenId, source },
        index,
        previousPageData
      ),
    fetcher,
    {
      revalidateFirstPage: false,
      fallbackData,
    }
  )

  // Fetch more data when component is visible
  useEffect(() => {
    if (inView) {
      orders.setSize(orders.size + 1)
    }
  }, [inView])

  return { orders, ref }
}

type InfiniteKeyLoader = (
  custom: {
    pathname: string
    proxyApi: string | undefined
    tokenId: string | undefined
    source: boolean | undefined
  },
  ...base: Parameters<SWRInfiniteKeyLoader>
) => ReturnType<SWRInfiniteKeyLoader>

const getKey: InfiniteKeyLoader = (
  custom: {
    pathname: string
    proxyApi: string | undefined
    tokenId: string | undefined
    source: boolean | undefined,
  },
  index: number,
  previousPageData: Orders
) => {
  const { pathname, proxyApi, tokenId, source } = custom

  if (!proxyApi) {
    console.debug(
      'Environment variable NEXT_PUBLIC_PROXY_API_BASE is undefined.'
    )
    return null
  }

  // Reached the end
  if (previousPageData && !previousPageData?.continuation) return null

  let query: paths['/orders/bids/v4']['get']['parameters']['query'] = {
    token: tokenId,
    limit: 10,
    sortBy: "price",
  }

  if (source) {
    query.source = getBaseDomain()
  }

  if (COLLECTION && !COMMUNITY && !COLLECTION_SET_ID) {
    // @ts-ignore
    query.contracts = COLLECTION
  }

  if (previousPageData && index > 0) query.continuation = previousPageData.continuation

  const href = setParams(pathname, query)

  return href
}
