import { paths } from '@reservoir0x/reservoir-kit-client'
import fetcher from 'lib/fetcher'
import setParams from 'lib/params'
import { NextRouter } from 'next/router'
import useSWR from 'swr'

const PROXY_API_BASE = process.env.NEXT_PUBLIC_PROXY_API_BASE

export default function useCollectionSourceStats(
  collectionId: string | undefined
) {
  function getUrl() {
    if (!collectionId) return undefined

    const pathname = `${PROXY_API_BASE}/collections/sources/v1`

    const query: paths['/stats/v1']['get']['parameters']['query'] = {
      collection: collectionId,
    }

    const href = setParams(pathname, query)

    return href
  }

  const href = getUrl()

  const stats = useSWR(
    href,
    fetcher
  )

  return stats
}
