import { paths } from '@reservoir0x/reservoir-kit-client'
import fetcher from 'lib/fetcher'
import setParams from 'lib/params'
import { useEffect } from 'react'
import { useInView } from 'react-intersection-observer'
import useSWRInfinite, { SWRInfiniteKeyLoader } from 'swr/infinite'
import { TokenInfiniteList, convertReservoirUserTokenToSnagToken } from 'lib/types'
import useReservoirClient from 'hooks/useReservoirClient'


const PROXY_API_BASE = process.env.NEXT_PUBLIC_PROXY_API_BASE

export type Tokens =
  paths['/users/{user}/tokens/v5']['get']['responses']['200']['schema']

export default function useUserTokens(
  user: string | undefined,
  collection: string,
  collectionSet: string | undefined,
) {
  const { ref, inView } = useInView()
  const reservoirClient = useReservoirClient()

  const pathname = `${PROXY_API_BASE}/users/${user}/tokens/v5`

  async function userTokenFetcher(href: string) {
    const res: Tokens = await fetcher(href)
    if (!res.tokens) return {
      tokens: [],
      continuation: undefined
    }

    return convertReservoirUserTokenToSnagToken(res, user ?? null, reservoirClient?.source)
  }

  const tokens = useSWRInfinite<TokenInfiniteList>(
    (index, previousPageData) =>
      getKey({ pathname, proxyApi: PROXY_API_BASE, collection, collectionSet }, index, previousPageData),
      userTokenFetcher,
    {
      revalidateFirstPage: false
    }
  )

  // Fetch more data when component is visible
  useEffect(() => {
    if (inView) {
      tokens.setSize(tokens.size + 1)
    }
  }, [inView])

  return { tokens, ref }
}

type InfiniteKeyLoader = (
  custom: {
    pathname: string
    proxyApi: string | undefined,
    collection: string | undefined,
    collectionSet: string | undefined
  },
  ...base: Parameters<SWRInfiniteKeyLoader>
) => ReturnType<SWRInfiniteKeyLoader>

const getKey: InfiniteKeyLoader = (
  custom: {
    pathname: string
    proxyApi: string | undefined,
    collection: string | undefined,
    collectionSet: string | undefined
  },
  index: number,
  previousPageData: paths['/users/{user}/tokens/v5']['get']['responses']['200']['schema']
) => {
  const { pathname, proxyApi } = custom
  if (!proxyApi) {
    console.debug(
      'Environment variable NEXT_PUBLIC_PROXY_API_BASE is undefined.'
    )
    return null
  }

  // Reached the end
  if (previousPageData && previousPageData?.tokens?.length === 0) return null

  let query: paths['/users/{user}/tokens/v5']['get']['parameters']['query'] = {
    limit: 20,
    offset: index * 20,
  }

  if (custom.collectionSet) {
    query.collectionsSetId = custom.collectionSet
  } else if (custom.collection) {
    query.collection = custom.collection
  }

  const href = setParams(pathname, query)

  return href
}
