import { paths } from '@reservoir0x/reservoir-kit-client'
import fetcher from 'lib/fetcher'
import setParams from 'lib/params'
import { NextRouter } from 'next/router'
import { useEffect } from 'react'
import { useInView } from 'react-intersection-observer'
import useSWRInfinite, { SWRInfiniteKeyLoader } from 'swr/infinite'
import { TokenInfiniteList, convertReservoirTokenToSnagToken } from 'lib/types'
import { getBaseDomain } from 'lib/domain'
import useReservoirClient from 'hooks/useReservoirClient'

const PROXY_API_BASE = process.env.NEXT_PUBLIC_PROXY_API_BASE

type Tokens = paths['/tokens/v5']['get']['responses']['200']['schema']

export default function useTokens(
  collectionId: string,
  fallbackData: Tokens,
  router: NextRouter,
  source?: boolean | undefined,
  tokens?: string[],
  includeAttributes?: boolean,
) {
  const { ref, inView } = useInView()
  const reservoirClient = useReservoirClient()

  function getUrl() {
    if (!collectionId) return undefined
    const pathname = `${PROXY_API_BASE}/tokens/v5`
    return pathname
  }

  const pathname = getUrl()

  async function tokenFetcher(href: string) {
    
    const res: Tokens = await fetcher(href)
    if (!res.tokens) return {
      tokens: [],
      continuation: undefined
    }
    return convertReservoirTokenToSnagToken(res, reservoirClient?.source)
  }
  const tokensRes = useSWRInfinite<TokenInfiniteList>(
    (index, previousPageData) =>
      getKey(pathname, collectionId, source, tokens, includeAttributes, router, index, previousPageData),
      tokenFetcher,
    {
      revalidateFirstPage: false,
      fallbackData: [convertReservoirTokenToSnagToken(fallbackData, reservoirClient?.source)],
    }
  )

  // Fetch more data when component is visible
  useEffect(() => {
    if (inView) {
      tokensRes.setSize(tokensRes.size + 1)
    }
  }, [inView])

  return { tokens: tokensRes, ref }
}

const getKey: (
  pathname: string | undefined,
  collectionId: string | undefined,
  source: boolean | undefined,
  tokens: string[] | undefined,
  includeAttributes: boolean | undefined,
  router: NextRouter,
  ...base: Parameters<SWRInfiniteKeyLoader>
) => ReturnType<SWRInfiniteKeyLoader> = (
  pathname: string | undefined,
  collectionId: string | undefined,
  source: boolean | undefined,
  tokens: string[] | undefined,
  includeAttributes: boolean | undefined,
  router: NextRouter,
  index: number,
  previousPageData: paths['/tokens/v5']['get']['responses']['200']['schema']
) => {
  // Reached the end
  if (
    previousPageData &&
    (previousPageData.tokens?.length === 0 || !previousPageData.continuation)
  )
    return null

  if (!pathname) return null

  let query: paths['/tokens/v5']['get']['parameters']['query'] = {
    limit: 20,
  }

  if (index !== 0 && previousPageData.continuation !== null) {
    query.continuation = previousPageData.continuation
  }

  if (source) {
    query.source = getBaseDomain()
  }

  if (tokens) {
    query.tokens = tokens
  } else {
    query.collection = collectionId
  }

  if (includeAttributes) {
    query.includeAttributes = includeAttributes
  }

  // Convert the client sort query into the API sort query
  if (router.query?.sort) {
    if (`${router.query?.sort}` === 'highest_offer') {
      // query.sortBy = 'topBidValue'
    }
  } else {
    query.sortBy = 'floorAskPrice'
  }

  // Extract all queries of attribute type

  const attributes = Object.keys(router.query).filter(
    (key) =>
      key.startsWith('attributes[') &&
      key.endsWith(']') &&
      router.query[key] !== ''
  )

  const query2: { [key: string]: any } = {}

  // Add all selected attributes to the query
  if (attributes.length > 0) {
    attributes.forEach((key) => {
      const value = router.query[key]
      if (value) {
        query2[key] = value
      }
    })
  }

  const href = setParams(pathname, { ...query, ...query2 })

  return href
}
