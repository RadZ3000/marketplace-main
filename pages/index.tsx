import type {
  GetServerSideProps,
  InferGetServerSidePropsType,
  NextPage,
} from 'next'
import { useRouter } from 'next/router'
import Layout from 'components/Layout'
import { useState } from 'react'
import useCollection from 'hooks/useCollection'
import useCollectionStats from 'hooks/useCollectionStats'
import useCollectionAttributes from 'hooks/useCollectionAttributes'
import { setToast } from 'components/token/setToast'
import { paths } from '@reservoir0x/reservoir-kit-client'
import TabsTrigger from 'components/TabsTrigger'
import { formatNumber } from 'lib/numbers'
import { FiRefreshCcw } from 'react-icons/fi'
import Head from 'next/head'
import useAttributes from 'hooks/useAttributes'
import * as Tabs from '@radix-ui/react-tabs'
import { getOrganizationFromHostname, Organization } from 'context/config'
import CollectionActivityTable from 'components/tables/CollectionActivityTable'
import Moment from 'react-moment';
import { BsGrid } from 'react-icons/bs';
import { RiPulseLine } from 'react-icons/ri';

// OPTIONAL
const envBannerImage = process.env.NEXT_PUBLIC_BANNER_IMAGE

const PROXY_API_BASE = process.env.NEXT_PUBLIC_PROXY_API_BASE

const metaTitle = process.env.NEXT_PUBLIC_META_TITLE
const metaDescription = process.env.NEXT_PUBLIC_META_DESCRIPTION
const metaImage = process.env.NEXT_PUBLIC_META_OG_IMAGE

type Props = InferGetServerSidePropsType<typeof getServerSideProps>

const Home: NextPage<Props> = ({ fallback, id, organization }) => {
  const router = useRouter()
  const [localListings, setLocalListings] = useState(false)
  const [refreshLoading, setRefreshLoading] = useState(false)
  const [lastUpdatedAt, setLastUpdatedAt] = useState(new Date());

  const collection = useCollection(fallback.collection, id)

  const stats = useCollectionStats(router, id)

  const { collectionAttributes, ref: refCollectionAttributes } =
    useCollectionAttributes(router, id)

  const attributes = useAttributes(id)

  const tokenCount = stats?.data?.stats?.tokenCount ?? 0

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

      const pathname = `${PROXY_API_BASE}/collections/refresh/v1`

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
    <title>{collection.data?.collection?.name}</title>
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

  return (
    <Layout organization={organization} >
      <>
        <Head>
          {title}
          {description}
          {image}
        </Head>
        <Tabs.Root
          value={router.query?.tab?.toString() || 'items'}
          className="col-span-full grid grid-cols-4 gap-x-12 md:grid-cols-8 lg:grid-cols-12 m-4 md:m-10"
        >
          <div className="col-span-full md:col-start-4">
            <Tabs.List
              className="flex justify-left border-b border-[#D4D4D4]"
            >
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
                  <div className="mb-8 hidden items-center justify-between md:flex">
                    <div className="flex items-center gap-2">
                      {tokenCount > 0 && (
                        <>
                          <div
                            style={{
                              color: organization.primaryFontColorHex || "#000000",
                            }}
                          >{formatNumber(tokenCount)} items</div>
                          <button
                            className="flex items-center gap-1.5 font-semibold text-gray-400 text-xs dark:text-white dark:ring-primary-900 dark:focus:ring-4"
                            title="Refresh collection"
                            disabled={refreshLoading}
                            onClick={() => refreshCollection(id)}
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
                </div>
              </>
            </Tabs.Content>
            <Tabs.Content
              value="activity"
              className="col-span-full grid"
            >
              <CollectionActivityTable id={id} collection={collection.data?.collection} organization={organization} />
            </Tabs.Content>
          </div>
        </Tabs.Root>
      </>
    </Layout>
  )
}

export default Home

export const getServerSideProps: GetServerSideProps<{
  fallback: {
    collection: paths['/collection/v2']['get']['responses']['200']['schema']
    tokens: paths['/tokens/v4']['get']['responses']['200']['schema']
  }
  id?: string
  organization: Organization
}> = async ({ req }) => {
  const organization = getOrganizationFromHostname(req?.headers.host)
  if (!organization) {
    return {
      notFound: true,
    }
  }

  return {
    redirect: {
      destination: `/collections/${organization.contractId}`,
      permanent: false,
    },
  }
}
