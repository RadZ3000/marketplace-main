import type {
  GetServerSideProps,
  InferGetServerSidePropsType,
  NextPage,
} from 'next'
import { useRouter } from 'next/router'
import Layout from 'components/Layout'
import AttributesFlex from 'components/AttributesFlex'
import { FC, useState, useEffect } from 'react'
import useCollection from 'hooks/useCollection'
import useCollectionStats from 'hooks/useCollectionStats'
import useTokens from 'hooks/useTokens'
import { useAccount, useSigner, useNetwork } from 'wagmi'
import useCollectionAttributes from 'hooks/useCollectionAttributes'
import useCollectionSourceStats from 'hooks/useCollectionSourceStats'
import ListTokenModal from 'components/ListTokenModal'
import TabsTrigger from 'components/TabsTrigger'
import { setToast } from 'components/token/setToast'
import { paths, setParams } from '@reservoir0x/reservoir-kit-client'
import Hero from 'components/Hero'
import { formatNumber } from 'lib/numbers'
import Sidebar from 'components/Sidebar'
import MobileSidebar from 'components/MobileSidebar'
import { FiRefreshCcw } from 'react-icons/fi'
import TitleBar from 'components/TitleBar'
import TokensGrid from 'components/TokensGrid'
import Head from 'next/head'
import useAttributes from 'hooks/useAttributes'
import * as Tabs from '@radix-ui/react-tabs'
import { getOrganizationFromHostname, Organization } from 'context/config'
import CollectionActivityTable from 'components/tables/CollectionActivityTable'
import Moment from 'react-moment';
import { ethers } from 'ethers'
import { BsGrid } from 'react-icons/bs';
import { RiPulseLine } from 'react-icons/ri';
import { getReservoirApiBase, getChainId } from 'lib/chain'
import { getBaseDomain } from 'lib/domain'
import TokenInfo from 'components/token/TokenInfo'

// OPTIONAL
const RESERVOIR_API_KEY = process.env.RESERVOIR_API_KEY

const envBannerImage = process.env.NEXT_PUBLIC_BANNER_IMAGE

const metaTitle = process.env.NEXT_PUBLIC_META_TITLE
const metaDescription = process.env.NEXT_PUBLIC_META_DESCRIPTION
const metaImage = process.env.NEXT_PUBLIC_META_OG_IMAGE

type Props = InferGetServerSidePropsType<typeof getServerSideProps>

const Home: NextPage<Props> = ({ fallback, organization, collectionId }) => {
  const router = useRouter()
  const account = useAccount()
  const { data: signer } = useSigner()
  const { chain: activeChain } = useNetwork()

  const chainId = getChainId(organization)
  const [refreshLoading, setRefreshLoading] = useState(false)
  const [lastUpdatedAt, setLastUpdatedAt] = useState(new Date());
  const [buyNow, setBuyNow] = useState<boolean>();
  const [minPrice, setMinPrice] = useState<string>();
  const [maxPrice, setMaxPrice] = useState<string>();

  const collection = useCollection(fallback.collection, collectionId)

  const stats = useCollectionStats(router, collectionId)
  const collectionSourceStats = useCollectionSourceStats(collectionId)
  const sourceStats = collectionSourceStats?.data?.sources?.find((source: any) => source.sourceDomain === getBaseDomain())
  
  useEffect(() => {
    const buyNowVal = organization.disableAggregation ?
    router.query["buyNow"]?.toString()?.toLowerCase() !== "false"
      : router.query["buyNow"]?.toString()?.toLowerCase() === "true"
    setBuyNow(buyNowVal)
  }, [router.query])

  const { tokens, ref: refTokens } = useTokens(
    collectionId,
    fallback.tokens,
    router,
    buyNow,
  )

  // The below should not be necessary, but there's a bug where
  // if you toggle attribute selector quickly on/off it returns the wrong cached
  // set
  useEffect(() => {
    tokens.mutate && tokens.mutate()
  }, [router.query])

  useEffect(() => {
    setMinPrice(router.query["price[gte]"]?.toString() || "")
    setMaxPrice(router.query["price[lte]"]?.toString() || "")
  }, [router.query])

  const { collectionAttributes, ref: refCollectionAttributes } =
    useCollectionAttributes(router, collectionId)

  const attributes = useAttributes(collectionId)

  if (!chainId) return null

  if (tokens.error) {
    return <div>There was an error</div>
  }

  let tokenCount = stats?.data?.stats?.tokenCount ?? 0
  if (buyNow) {
    // if aggregation is disabled, we fetch onSaleAmount from Collection Stats
    const onSaleCount = sourceStats?.onSaleCount ?? 0
    tokenCount = organization.disableAggregation ? onSaleCount : stats?.data?.stats?.onSaleCount
    // check if filter is applied
    for(const key in router.query) {
      if(key.includes("attributes")) {
        tokenCount = tokens?.data?.map(tokens => tokens.tokens)?.flat().length ?? 0
        break;
      }
    }
  }

  const preFilteredToken = tokens?.data?.map(tokens => tokens.tokens)?.flat() ?? []

  // yes, this is terrible and duplicates logic inside TokensGrid.
  // We do this so we can apply min/max filter and get token count here too.
  const minPriceEth = minPrice ? ethers.utils.parseEther(minPrice) : null
  const maxPriceEth = maxPrice ? ethers.utils.parseEther(maxPrice) : null
  const filteredTokens = preFilteredToken.filter((token) => {
    const priceEth = token.price?.amount?.raw ? ethers.utils.parseEther(token.price?.amount?.raw) : null
    if (priceEth === null) return (minPriceEth === null && maxPriceEth === null)

    return (minPriceEth === null || priceEth.gte(minPriceEth)) && (maxPriceEth === null || priceEth.lte(maxPriceEth))
  })
  if (filteredTokens.length === 0) {
    tokenCount = 0
  }

  async function refreshCollection(collectionId: string | undefined) {
    function handleError(message?: string) {
      setToast({
        kind: 'error',
        message: message || 'Request to refresh collection was rejected.',
        title: 'Refresh collection failed',
      })

      setRefreshLoading(false)
    }

    try {
      if (!collectionId) throw new Error('No collection ID')

      const data = {
        collection: collectionId,
      }

      const pathname = `/api/reservoir/collections/refresh/v1`

      setRefreshLoading(true)

      const res = await fetch(pathname, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const json = await res.json()
        handleError(json?.message)
        return
      }

      setToast({
        kind: 'success',
        message: 'Request to refresh collection was accepted.',
        title: 'Refresh collection',
      })
      setLastUpdatedAt(new Date());
    } catch (err) {
      handleError()
      console.error(err)
      return
    }

    setRefreshLoading(false)
  }

  const title = metaTitle ? (
    <title>{metaTitle}</title>
  ) : (
    <title>{organization.groupName || collection.data?.collection?.name}</title>
  )
  const description = metaDescription ? (
    <meta name="description" content={metaDescription} />
  ) : (
    <meta
      name="description"
      content={collection.data?.collection?.metadata?.description as string}
    />
  )

  const bannerImage = (envBannerImage ||
    collection?.data?.collection?.metadata?.bannerImageUrl) as string

  const image = metaImage ? (
    <>
      <meta name="twitter:image" content={metaImage} />
      <meta name="og:image" content={metaImage} />
    </>
  ) : (
    <>
      <meta name="twitter:image" content={bannerImage} />
      <meta property="og:image" content={bannerImage} />
    </>
  )

  const tabs = [
    { name: 'Items', id: 'items', icon: BsGrid },
    { name: 'Activity', id: 'activity', icon: RiPulseLine },
  ]

  const refreshData = () => {
    router.replace(router.asPath);
  }

  const isInTheWrongNetwork = Boolean(signer && activeChain?.id !== +chainId)
  return (
    <Layout organization={organization} >
      <Head>
        <link rel="shortcut icon" href={organization.aggregateIcon || organization.listingIcon} />
        {title}
        {description}
        {image}
      </Head>
      <TitleBar
        organization={organization}
        collectionId={collectionId}
        refreshData={refreshData}
      />
      <Hero
        collectionId={collectionId}
        organization={organization}
        fallback={fallback}
      />
      <Tabs.Root
        value={router.query?.tab?.toString() || 'items'}
        className="col-span-full grid grid-cols-4 gap-x-12 md:grid-cols-8 lg:grid-cols-12 m-4 md:m-10"
      >
        <Sidebar attributes={attributes} setTokensSize={tokens.setSize} organization={organization} />
        <div className="col-span-full md:col-start-4">
          <Tabs.List
            style={{ borderColor: organization.secondaryOutlineColorHex || "#CFD8DC" }}
            className="flex justify-left border-b">
            {tabs.map(({ name, id, icon }) => (
              <TabsTrigger
                key={id}
                id={id}
                router={router}
                name={name}
                Icon={icon}
                organization={organization}
              />
            ))}
          </Tabs.List>
          <Tabs.Content value="items" asChild>
            <div className="col-span-full col-start-5 pt-4">
              <MobileSidebar attributes={attributes} setTokensSize={tokens.setSize} organization={organization} />
                <div className="items-center justify-between flex mt-2 mb-6 md:mb-8">
                  <div className="flex items-center gap-2">
                    <div
                      style={{
                        color: organization.primaryFontColorHex || "#000000",
                      }}
                    >{formatNumber(tokenCount || 0)} items</div>
                    <button
                      style={{ color: organization.secondaryFontColorHex || "#959DA6"}}
                      className="flex items-center gap-1.5 font-semibold text-xs dark:text-white dark:ring-primary-900 dark:focus:ring-4"
                      title="Refresh collection"
                      disabled={refreshLoading}
                      onClick={() => refreshCollection(collectionId)}
                    >
                      <FiRefreshCcw
                        className={`h-3 w-3 ${
                          refreshLoading ? 'animate-spin-reverse' : ''
                        }`}
                      />
                      <Moment date={lastUpdatedAt} interval={5000} fromNow />
                    </button>
                  </div>
                </div>
              <AttributesFlex organization={organization} className="mb-6 md:mb-8 flex flex-wrap gap-2 items-center" />
              {filteredTokens.length > 0 || tokens.isValidating ? (
                <TokensGrid
                  tokens={tokens}
                  organization={organization}
                  viewRef={refTokens}
                  collectionName={collection.data?.collection?.name || ""}
                  collectionImage={
                    collection.data?.collection?.metadata?.imageUrl as string
                  }
                  includeExchangeIcon
                />
              ) : (
                <div className="my-10 flex w-full flex-col items-center">
                  <img
                    src="/cloud-glass.svg"
                    className="h-[59px]"
                    alt="Magnifying Glass"
                  />
                  <div
                    style={{
                      color: organization.primaryFontColorHex || "#000000",
                    }}
                    className="mt-5 mb-1 text-center font-semibold"
                  >
                    No listings
                  </div>
                  <div
                    style={{
                      color: organization.primaryFontColorHex || "#000000",
                    }}
                    className="text-center text-xs">
                    There are no listings for this collection.
                  </div>
                  <div className="w-fit mt-4">
                    <ListTokenModal
                      collectionId={collectionId}
                      isInTheWrongNetwork={isInTheWrongNetwork}
                      maker={account?.address}
                      setToast={setToast}
                      signer={signer}
                      organization={organization}
                      show={Boolean(collectionId)}
                      refreshData={refreshData}
                    />
                  </div>
                </div>
              )}
            </div>
          </Tabs.Content>
          <Tabs.Content
            value="activity"
            className="col-span-full grid"
          >
            <CollectionActivityTable id={collectionId} collection={collection.data?.collection} organization={organization} />
          </Tabs.Content>
        </div>
      </Tabs.Root>
      <div className="col-span-full mt-10 lg:col-start-2 px-2 lg:col-span-10 lg:px-0 justify-center bottom-0">
        <TokenInfo organization={organization} />
      </div>
    </Layout>
  )
}

export default Home

export const getServerSideProps: GetServerSideProps<{
  fallback: {
    collection: paths['/collection/v2']['get']['responses']['200']['schema']
    tokens: paths['/tokens/v5']['get']['responses']['200']['schema']
  }
  collectionId: string
  organization: Organization
}> = async ({ req, params }) => {
  const options: RequestInit | undefined = {}

  if (RESERVOIR_API_KEY) {
    options.headers = {
      'x-api-key': RESERVOIR_API_KEY,
    }
  }

  const organization = getOrganizationFromHostname(req?.headers.host, params?.collectionId?.toString())

  if (!organization) {
    return {
      notFound: true,
    }
  }

  const apiBase = getReservoirApiBase(organization)
  if (!apiBase) {
    return {
      notFound: true,
    }
  }

  const { contractId: id } = organization
  const collectionId = params?.collectionId?.toString().toLowerCase()
  if (collectionId !== id.toLowerCase()) {
    return {
      notFound: true,
    }
  }

  // COLLECTION
  const collectionUrl = new URL('/collection/v2', apiBase)

  let collectionQuery: paths['/collection/v2']['get']['parameters']['query'] = {
    id,
  }

  setParams(collectionUrl, collectionQuery)

  const collectionRes = await fetch(collectionUrl.href, options)

  const collection =
    (await collectionRes.json()) as Props['fallback']['collection']

  // TOKENS
  const tokensUrl = new URL('/tokens/v5', apiBase)

  const source = req.headers?.host?.replace(".localhost:3000", "")
  let tokensQuery: paths['/tokens/v5']['get']['parameters']['query'] = {
    collection: id,
    sortBy: 'floorAskPrice',
    limit: 20,
    ...(organization.disableAggregation && source ? {
      source,
    } : {})
  }

  setParams(tokensUrl, tokensQuery)

  const tokensRes = await fetch(tokensUrl.href, options)

  const tokens = (await tokensRes.json()) as Props['fallback']['tokens']

  return {
    props: {
      fallback: { collection, tokens },
      collectionId,
      organization,
    },
  }
}
