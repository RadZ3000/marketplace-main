import Layout from 'components/Layout'
import setParams from 'lib/params'
import { GetServerSideProps, NextPage } from 'next'
import { useRouter } from 'next/router'
import TokenAttributes from 'components/TokenAttributes'
import Head from 'next/head'
import useCollection from 'hooks/useCollection'
import useUserTokens from 'hooks/useUserTokens'
import useAsks from 'hooks/useAsks'
import useBids from 'hooks/useBids'
import useTokens from 'hooks/useTokens'
import { useAccount, useNetwork, useSigner } from 'wagmi'
import { paths } from '@reservoir0x/reservoir-kit-client'
import { BiArrowBack } from 'react-icons/bi'
import TokenInfo from 'components/token/TokenInfo'
import Owner from 'components/token/Owner'
import PriceData from 'components/token/PriceData'
import TokenMedia from 'components/token/TokenMedia'
import TokenOfferTable from 'components/tables/TokenOfferTable'
import { useEffect, useState } from 'react'
import TitleBar from 'components/TitleBar'
import { getOrganizationFromHostname, Organization } from 'context/config'
import TokenActivityTable from 'components/tables/TokenActivityTable'
import { getBaseDomain } from 'lib/domain'
import { getReservoirApiBase, getChainId } from 'lib/chain'

// Environment variables
// For more information about these variables
// refer to the README.md file on this repository
// Reference: https://nextjs.org/docs/basic-features/environment-variables#exposing-environment-variables-to-the-browser
// REQUIRED
const RESERVOIR_API_KEY = process.env.RESERVOIR_API_KEY

// OPTIONAL
const META_TITLE = process.env.NEXT_PUBLIC_META_TITLE
const META_DESCRIPTION = process.env.NEXT_PUBLIC_META_DESCRIPTION
const META_OG_IMAGE = process.env.NEXT_PUBLIC_META_OG_IMAGE

type Props = {
  collectionId: string
  tokenId: string
  organization: Organization
  fallbackData: paths['/tokens/v5']['get']['responses']['200']['schema']
}

const metadata = {
  title: (title: string) => (
    <>
      <title>{title}</title>
      <meta property="twitter:title" content={title} />
      <meta property="og:title" content={title} />
    </>
  ),
  description: (description: string) => (
    <meta name="description" content={description} />
  ),
  image: (image: string) => (
    <>
      <meta name="twitter:image" content={image} />
      <meta property="og:image" content={image} />
    </>
  ),
  tagline: (tagline: string | undefined) => (
    <>{tagline || 'Discover, buy and sell NFTs'}</>
  ),
}

const Index: NextPage<Props> = ({ collectionId, tokenId, organization, fallbackData }) => {  
  const [tokenOpenSea, setTokenOpenSea] = useState<any>({
    animation_url: null,
    extension: null,
  })
  const [bannedOnOpenSea, setBannedOnOpenSea] = useState(false)
  const router = useRouter()

  const collection = useCollection(undefined, collectionId)

  const { tokens } = useTokens(
    collectionId,
    fallbackData,
    router,
    false,
    [
      `${collectionId}:${router.query?.tokenId?.toString()}`,
    ],
    true,
  )

  const chainId = getChainId(organization)
  const account = useAccount()
  const { data: signer } = useSigner()
  const { chain: activeChain } = useNetwork()
  const ownerAsks = useAsks(undefined, `${collectionId}:${router.query?.tokenId?.toString()}`, account?.address)
  const asks = useAsks(undefined, `${collectionId}:${router.query?.tokenId?.toString()}`, undefined)
  const userTokens: ReturnType<typeof useUserTokens> = useUserTokens(account?.address, collectionId, undefined)
  const { tokens: userOwnedTokens, ref } = userTokens
  const { data } = userOwnedTokens

  const { orders: pendingOffers, ref: offersSWRInfiniteRef } = useBids([], `${collectionId}:${tokenId}`, organization.disableAggregation)

  useEffect(() => {
    async function getOpenSeaData(url: URL) {
      let result: any = { animation_url: null, extension: null }
      try {
        const res = await fetch(url.href)
        const json = await res.json()

        setBannedOnOpenSea(!json?.supports_wyvern)

        const animation_url = json?.animation_url
        // Get the last section of the URL
        // lastPartOfUrl = '874f68834bdf5f05982d01067776acc2.wav' when input is
        // 'https://storage.opensea.io/files/874f68834bdf5f05982d01067776acc2.wav'
        const lastPartOfUrl = animation_url?.split('/')?.pop()
        // Extract the file extension from `lastPartOfUrl`, example: 'wav'
        let extension = null
        if (lastPartOfUrl) {
          const ext = /(?:\.([^.]+))?$/.exec(lastPartOfUrl)?.[1]
          // This makes a strong assumption and it's not reliable
          if (ext?.length && ext.length > 10) {
            extension = 'other'
          } else {
            extension = ext
          }
        }

        result = { animation_url, extension }
      } catch (err) {
        console.error(err)
      }

      setTokenOpenSea(result)
    }

    getOpenSeaData(urlOpenSea)
  }, [])

  if (!chainId) return null

  const isInTheWrongNetwork = Boolean(signer && activeChain?.id !== +chainId)

  if (tokens.error) {
    return <div>There was an error</div>
  }

  const token = tokens.data?.[0].tokens?.[0]
  const isOwner = Boolean(data?.[0].tokens?.find(token => token.tokenId === router.query?.tokenId?.toString()))  
  if (!token) {
    return <div>There was an error</div>
  }

  let ownerOrders = organization.disableAggregation ? (ownerAsks?.data?.orders?.filter((order) => (order.source?.domain as string)?.toLowerCase()?.includes(getBaseDomain())) || []) : []
  let orders = organization.disableAggregation ? (asks?.data?.orders?.filter((order) => (order.source?.domain as string)?.toLowerCase()?.includes(getBaseDomain())) || []) : []
  if (isOwner && organization.disableAggregation) {
    token.ownerAddress = account.address || null
    token.price = null
    token.reservoirListing = null

    orders = ownerOrders
  }

  orders = orders?.sort((a, b) => ((a.price?.amount?.native ?? 0) > (b.price?.amount?.native ?? 0)) ? 1 : -1)  
  if (orders?.[0]) {
    const order = orders?.[0]
    token.ownerAddress = order.maker.toLowerCase()

    token.price = order.price as any
    token.reservoirListing = {
      orderId: order.id,
      source: (order.source?.name as string) || null,
      sourceLink: (order.source?.url as string) || null,
      price: order.price as any,
      isLocalListing: (order.source?.domain as string)?.toLowerCase()?.includes(getBaseDomain()),
      duration: order ? {
        startTimeInSeconds: order.validFrom,
        endTimeInSeconds: order.validUntil || null,
      } : null,
    }
  }

  const openSeaBaseUrl =
    organization.testnetNetwork
      ? 'https://testnets-api.opensea.io/'
      : 'https://api.opensea.io/'

  const urlOpenSea = new URL(
    `/api/v1/asset/${collectionId}/${tokenId}`,
    openSeaBaseUrl
  )

  // META
  const title = META_TITLE
    ? metadata.title(`${token.name} - ${META_TITLE}`)
    : metadata.title(`${token.name} - 
    ${organization.groupName || organization.name}`)

  const description = META_DESCRIPTION
    ? metadata.description(META_DESCRIPTION)
    : metadata.description(
        `${collection.data?.collection?.metadata?.description as string}`
      )

  const image = META_OG_IMAGE
    ? metadata.image(META_OG_IMAGE)
    : token.image
    ? metadata.image(token.image)
    : null

  const refreshData = () => {
    tokens?.mutate()
    router.replace(router.asPath);
  }

  const refreshOffersData = () => {
    pendingOffers.mutate()
    tokens?.mutate()
  }

  return (
    <Layout organization={organization} >
      <Head>
        <link rel="shortcut icon" href={organization.aggregateIcon || organization.listingIcon} />
        {title}
        {description}
        {image}
      </Head>
      <TitleBar
        collectionId={collectionId}
        organization={organization}
        refreshData={refreshData}
      />
      <div
        style={{
          color: organization.primaryFontColorHex || "#000000",
        }}
        className="col-span-full px-2 mt-10 lg:col-start-2 lg:px-0 flex flex-row gap-1 text-base items-center cursor-pointer w-fit"
        onClick={() => {
          router.back()
        }}
      >
        <BiArrowBack size={16} />
        Back
      </div>
      <div className="col-span-full content-start space-y-8 px-2 pt-3 pb-10 md:col-span-3 lg:col-span-4 lg:col-start-2 lg:px-0">
        <div
          style={{ borderRadius: organization.borderRadius || "12px" }}
          className="overflow-hidden">
          <TokenMedia
            token={token}
            organization={organization}
            collectionName={collection.data?.collection?.name || ""}
            collectionImage={
              collection.data?.collection?.metadata?.imageUrl as string
            }
            size={440}
            includeExchangeIcon
          />
        </div>
        <div className="hidden space-y-4 md:block">
          <TokenAttributes
            organization={organization}
            token={token}
            collection={collection.data?.collection}
          />
        </div>
      </div>
      <div className="col-span-full mb-4 space-y-8 px-2 pt-3 pb-10 md:col-span-5 md:col-start-4 lg:col-span-6 lg:col-start-6 lg:px-0">
        <Owner
          organization={organization}
          collectionId={collectionId}
          tokenId={tokenId}
          bannedOnOpenSea={bannedOnOpenSea}
          tokenListing={token}
        />
        <PriceData
          collection={collection}
          collectionId={collectionId}
          organization={organization}
          isInTheWrongNetwork={isInTheWrongNetwork}
          signer={signer}
          account={account}
          tokenListing={token}
          refreshData={refreshData}
          refreshOffersData={refreshOffersData}
        />
        {/* <Listings asks={asks} /> */}
        <TokenOfferTable
          organization={organization}
          collectionId={collectionId}
          tokenId={token.tokenId}
          collection={collection.data?.collection}
          pendingOffers={pendingOffers}
          offersSWRInfiniteRef={offersSWRInfiniteRef}
          isInTheWrongNetwork={isInTheWrongNetwork}
          signer={signer}
          tokenListing={token}
          account={account}
          refreshOffersData={refreshOffersData}
        />
        <TokenActivityTable
          collectionId={collectionId}
          tokenId={token?.tokenId}
          collection={collection.data?.collection}
          organization={organization}
        />
      </div>
      <div className="col-span-full mt-10 lg:col-start-2 px-2 lg:col-span-10 lg:px-0">
        <TokenInfo organization={organization} tokenListing={token} />
      </div>
    </Layout>
  )
}

export default Index

export const getServerSideProps: GetServerSideProps<{
  collectionId: string
  organization: Organization
  fallbackData: paths['/tokens/v5']['get']['responses']['200']['schema']
}> = async ({ req, params }) => {
  const organization = getOrganizationFromHostname(req?.headers.host, params?.collectionId?.toString())
  if (!organization) {
    return {
      notFound: true,
    }
  }

  const collectionId = params?.collectionId?.toString().toLowerCase()
  if (collectionId !== organization.contractId.toLocaleLowerCase()) {
    return {
      notFound: true,
    }
  }

  const tokenId = params?.tokenId?.toString()
  const options: RequestInit | undefined = {}

  if (!tokenId) {
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

  if (RESERVOIR_API_KEY) {
    options.headers = {
      'x-api-key': RESERVOIR_API_KEY,
    }
  }

  const url = new URL('/tokens/v5', apiBase)
  const source = req.headers?.host?.replace(".localhost:3000", "")
  const query: paths['/tokens/v5']['get']['parameters']['query'] = {
    tokens: [`${collectionId}:${tokenId}`],
    includeTopBid: true,
    includeAttributes: true,
  }

  const href = setParams(url, query)
  const res = await fetch(href, options)
  const fallbackData =
    (await res.json()) as paths['/tokens/v5']['get']['responses']['200']['schema']

  if (!fallbackData.tokens?.[0]?.token?.collection?.id) {
    return {
      notFound: true,
    }
  }

  return {
    props: {
      collectionId,
      tokenId,
      organization,
      fallbackData,
    },
  }
}
