import { setParams } from '@reservoir0x/reservoir-kit-client'
import type { NextApiRequest, NextApiResponse } from 'next'

// A proxy API endpoint to redirect all requests to `/api/reservoir/*` to
// MAINNET: https://api.reservoir.tools/{endpoint}/{query-string}
// RINKEBY: https://api-rinkeby.reservoir.tools/{endpoint}/{query-string}
// and attach the `x-api-key` header to the request. This way the
// Reservoir API key is not exposed to the client.

// https://nextjs.org/docs/api-routes/dynamic-api-routes#catch-all-api-routes
export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { body, method } = req

  const url = new URL("/api", "https://api.etherscan.io")

  const query = {
    module: "stats",
    action: "ethprice",
    apikey: "E3TFKV895Y9JQX6R4RVBAZDKSU2TVG4AB8",
  }
  setParams(url, query)

  try {
    const options: RequestInit | undefined = {
      method,
    }

    const headers = new Headers()

    if (typeof body === 'object') {
      headers.set('Content-Type', 'application/json')
      options.body = JSON.stringify(body)
    }

    options.headers = headers

    const response = await fetch(url.href, options)

    let data: any

    const contentType = response.headers.get('content-type')

    if (contentType?.includes('application/json')) {
      data = (await response.json())["result"]
    } else {
      data = await response.text()
    }

    if (!response.ok) throw data

    // 200 OK
    // https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/200
    res.status(200).json(data)
  } catch (error) {
    // 400 Bad Request
    // https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/400
    res.status(400).json(error)
  }
}
