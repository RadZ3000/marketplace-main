import Layout from 'components/Layout'
import {
  GetServerSideProps,
  InferGetServerSidePropsType,
  NextPage,
} from 'next'
import { BiArrowBack } from 'react-icons/bi'
import { useState } from 'react'
import { useRouter } from 'next/router'
import {
  useAccount,
  useNetwork,
  useSigner,
  useEnsName,
  useEnsAvatar,
} from 'wagmi'
import * as Tabs from '@radix-ui/react-tabs'
import TabsTrigger from 'components/TabsTrigger'
import { formatNumber } from 'lib/numbers'
import useUserTokens from 'hooks/useUserTokens'
import useAttributes from 'hooks/useAttributes'
import useCollection from 'hooks/useCollection'
import { FiRefreshCcw } from 'react-icons/fi'
import Avatar from 'components/Avatar'
import Head from 'next/head'
import { paths, setParams } from '@reservoir0x/reservoir-kit-client'
import useSearchCommunity from 'hooks/useSearchCommunity'
import { truncateAddress } from 'lib/truncateText'
import TitleBar from 'components/TitleBar'
import { FiExternalLink } from 'react-icons/fi'
import { getOrganizationFromHostname, Organization } from 'context/config'
import Moment from 'react-moment';
import TokensGrid from 'components/TokensGrid'
import SnagButton from "components/SnagButton"
import { BsGrid } from 'react-icons/bs';
import { getChainId, getReservoirApiBase } from 'lib/chain'
import TokenInfo from 'components/token/TokenInfo'

// Environment variables
// For more information about these variables
// refer to the README.md file on this repository
// Reference: https://nextjs.org/docs/basic-features/environment-variables#exposing-environment-variables-to-the-browser
// REQUIRED
const RESERVOIR_API_KEY = process.env.RESERVOIR_API_KEY

type Props = InferGetServerSidePropsType<typeof getServerSideProps>

const metadata = {
  title: (title: string) => <title>{title}</title>,
}

const Address: NextPage<Props> = ({ address, collectionId, organization, fallback }) => {
  const account = useAccount()
  const chainId = getChainId(organization)
  const [refreshLoading, setRefreshLoading] = useState(false)
  const [lastUpdatedAt, setLastUpdatedAt] = useState(new Date());

  const attributes = useAttributes(collectionId)

  const { data: ensAvatar } = useEnsAvatar({
    addressOrName: address,
  })
  const { data: ensName } = useEnsName({ address })
  const { chain: activeChain } = useNetwork()
  const router = useRouter()
  const userTokens: ReturnType<typeof useUserTokens> = useUserTokens(address, collectionId, organization.reservoirCollectionSetId)
  const { tokens, ref } = userTokens
  const { data, isValidating, size } = tokens

  const tokenCount = data?.map(tokens => tokens.tokens)?.flat().length ?? 0

  const collection = useCollection(undefined, collectionId)

  // const userActivity = useUserActivity([], address)
  const collections = useSearchCommunity()
  const isInTheWrongNetwork = activeChain?.id !== +(chainId ?? 0)
  const isOwner = address?.toLowerCase() === account?.address?.toLowerCase()

  let tabs = [
    { name: 'Items', id: 'items', icon: BsGrid },
  ]

  if (isOwner) {
    tabs = [
      { name: 'My Items', id: 'items', icon: BsGrid },
      // { name: 'Saved For Later', id: 'saved', icon: RiPulseLine },
    ]
  }

  const refreshData = () => {
    router.replace(router.asPath);
  }

  return (
    <Layout organization={organization} >
      <Head>
        <link rel="shortcut icon" href={organization.aggregateIcon || organization.listingIcon} />
        {metadata.title(`${address.toLowerCase()} Profile`)}
      </Head>
      <TitleBar
        collectionId={collectionId}
        organization={organization}
        refreshData={refreshData}
      />
      <div className="flex flex-col gap-6 col-span-full my-10 px-2 md:col-span-8 lg:col-span-10 lg:col-start-2 lg:px-0">
        <div
          style={{
            color: organization.primaryFontColorHex || "#000000",
          }}
          className="flex flex-row gap-1 text-base items-center cursor-pointer w-fit"
          onClick={() => {
            router.back()
          }}
        >
          <BiArrowBack size={16} />
          Back
        </div>
        <div className="flex gap-8 items-center">
          {address && (
            <Avatar address={address.toLowerCase()} avatar={ensAvatar} size={140} />
          )}
          <div className="flex flex-col gap-5">
            <div
              style={{
                color: organization.primaryFontColorHex || "#000000",
              }}
              className="text-3xl font-semibold">
              {ensName || truncateAddress(address.toLowerCase() as string)}
            </div>
            <div className="flex flex-row gap-5 items-center">
              <SnagButton
                classType="Link"
                organization={organization}
                className="px-6 py-2"
                href={`https://${organization.testnetNetwork ? 'goerli.' : ''}etherscan.io/address/${address}`}
                externalLink
              >
                <div
                  className="flex flex-row gap-2 items-center text-sm">
                  {ensName || truncateAddress(address.toLowerCase() as string)}
                  <FiExternalLink className="h-3 w-3" />
                </div>
              </SnagButton>
            

              {/* <div className="border-l border-[#CFD8DC] w-[1px] h-6" />
              <button className="whitespace-nowrap border border-[#CFD8DC] px-4 py-2 rounded-full text-sm text-black">
                oncyber.io/papay
              </button> */}
            </div>
          </div>
        </div>
      </div>
      <Tabs.Root
          value={router.query?.tab?.toString() || 'items'}
          className="col-span-full grid grid-cols-12 gap-x-12 px-2 md:col-span-8 lg:col-span-10 lg:col-start-2 lg:px-0"
        >
        <div className="col-span-full">
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
            <>
              <div className="col-span-full col-start-5 mt-5">
                <div className="mb-8 items-center justify-between flex">
                  <div className="flex items-center gap-2">
                    {tokenCount > 0 && (
                      <>
                        <div
                          style={{
                            color: organization.primaryFontColorHex || "#000000",
                          }}
                        >{formatNumber(tokenCount)} {tokenCount > 1 ? "items" : "item"}</div>
                        <button
                          style={{ color: organization.secondaryFontColorHex || "#959DA6"}}
                          className="flex items-center gap-1.5 font-semibold text-xs dark:text-white dark:ring-primary-900 dark:focus:ring-4"
                          title="Refresh collection"
                          disabled={refreshLoading}
                          // onClick={() => refreshCollection(collectionId)}
                        >
                          <FiRefreshCcw
                            className={`h-3 w-3 ${
                              refreshLoading ? 'animate-spin-reverse' : ''
                            }`}
                          />
                          <Moment date={lastUpdatedAt} interval={5000} fromNow />
                        </button>
                      </>
                    )}
                  </div>
                </div>
                {organization.groupName && organization.reservoirCollectionSetId && (
                  <div
                    style={{
                      color: organization.primaryFontColorHex || "#000000",
                    }}
                    className="mt-4 mb-6 text-lg font-semibold">
                    {organization.groupName} Items
                  </div>
                )}
                {tokenCount > 0 ? (
                  <TokensGrid
                    tokens={tokens}
                    organization={organization}
                    collectionName={collection.data?.collection?.name || ""}
                    viewRef={ref}
                    collectionImage={
                      collection.data?.collection?.metadata?.imageUrl as string
                    }
                    includeExchangeIcon={false}
                  />
                ) : (
                  <div className="flex flex-col gap-5 items-center py-5">
                    <div className="flex flex-col gap-5 items-center">
                      <img
                        src="/icons/ShoppingBag.svg" />
                      <div
                        style={{
                          color: organization.primaryFontColorHex || "#000000",
                        }}
                        className="max-w-[200px] text-center">
                        You don&apos;t own any {organization.name} items yet
                      </div>
                    </div>

                    <SnagButton
                      classType="Link"
                      href={`/collections/${collectionId}`}
                      organization={organization}
                      disabled={isInTheWrongNetwork}
                      className="px-6 py-3"
                    >
                      Explore listed items
                    </SnagButton>
                  </div>
                )}
              </div>
            </>
          </Tabs.Content>
          <Tabs.Content
            value="activity"
            className="col-span-full grid"
          >
            asdf
          </Tabs.Content>
        </div>
      </Tabs.Root>
      <div className="col-span-full mt-10 lg:col-start-2 px-2 lg:col-span-10 lg:px-0 justify-center bottom-0">
        <TokenInfo organization={organization} />
      </div>
    </Layout>
  )
}

export default Address

export const getServerSideProps: GetServerSideProps<{
  address: string
  collectionId: string
  organization: Organization
  fallback: {
    tokens: paths['/users/{user}/tokens/v5']['get']['responses']['200']['schema'],
  }
}> = async ({ req, params }) => {
  const organization = getOrganizationFromHostname(req?.headers.host, params?.collectionId?.toString())
  if (!organization) {
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

  const options: RequestInit | undefined = {}

  const addressId = params?.addressId?.toString()
  if (!addressId) {
    return {
      notFound: true,
    }
  }

  if (RESERVOIR_API_KEY) {
    options.headers = {
      'x-api-key': RESERVOIR_API_KEY,
    }
  }

  const apiBase = getReservoirApiBase(organization)
  if (!apiBase) {
    return {
      notFound: true,
    }
  }

  const url = new URL(`/users/${addressId}/tokens/v5`, apiBase)

  let query: paths['/users/{user}/tokens/v5']['get']['parameters']['query'] = {
    limit: 20,
    offset: 0,
  }

  if (organization.reservoirCollectionSetId) {
    query.collectionsSetId = organization.reservoirCollectionSetId
  }

  setParams(url, query)

  const res = await fetch(url.href, options)

  const tokens = (await res.json()) as Props['fallback']['tokens']

  return {
    props: {
      address: addressId,
      collectionId: organization.contractId,
      organization,
      fallback: {
        tokens,
      },
    },
  }
}
