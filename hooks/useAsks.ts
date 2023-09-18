import { paths } from '@reservoir0x/reservoir-kit-client'
import fetcher from 'lib/fetcher'
import setParams from 'lib/params'
import useSWR from 'swr'

const PROXY_API_BASE = process.env.NEXT_PUBLIC_PROXY_API_BASE

type Asks = paths['/orders/asks/v3']['get']['responses']['200']['schema']

export default function useAsks(
  fallbackData: Asks | undefined,
  // tokenKind: string | undefined,
  token: string | undefined,
  maker: string | undefined
) {
  function getUrl() {
    // if (tokenKind !== 'erc1155') return undefined

    if (!maker && !token) return fallbackData

    const pathname = `${PROXY_API_BASE}/orders/asks/v3`

    let query: paths['/orders/asks/v3']['get']['parameters']['query'] = {
      // sortBy: 'price',
      limit: 1000,
    }

    if (token) query.token = token
    if (maker) query.maker = maker

    const href = setParams(pathname, query)

    return href
  }

  const href = getUrl()

  const asks = useSWR<Asks>(href, fetcher, {
    fallbackData,
  })

  return asks
}
