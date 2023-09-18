import { FC, useEffect, useState, ComponentProps, useRef } from 'react'
import { paths } from '@reservoir0x/reservoir-kit-client'
import Toast from 'components/Toast'
import toast from 'react-hot-toast'
import useCollection from 'hooks/useCollection'
import useCollectionSourceStats from 'hooks/useCollectionSourceStats'
import { useRouter } from 'next/router'
import HeroStats from 'components/hero/HeroStats'
import CommunityDropdown from 'components/CommunityDropdown'
import { Organization } from 'context/config'
import { Token } from 'lib/types'
import { getBaseDomain } from 'lib/domain'

const setToast = (data: ComponentProps<typeof Toast>['data']) => {
  toast.custom((t) => <Toast t={t} toast={toast} data={data} />)
}

type Props = {
  collectionId: string | undefined
  organization: Organization
  fallback: {
    tokens: paths['/tokens/v5']['get']['responses']['200']['schema']
    collection: paths['/collection/v2']['get']['responses']['200']['schema']
  }
}

const Hero: FC<Props> = ({ fallback, organization, collectionId }) => {
  const collection = useCollection(fallback.collection, collectionId)
  const collectionSourceStats = useCollectionSourceStats(collectionId)
  const router = useRouter()

  useEffect(() => {
    const keys = Object.keys(router.query)
    const attributesSelected = keys.filter(
      (key) =>
        key.startsWith('attributes[') &&
        key.endsWith(']') &&
        router.query[key] !== ''
    )

    // Only enable the attribute modal if one attribute is selected
    if (attributesSelected.length !== 1) {
      return
    }

  }, [router.query])

  const sourceStats = collectionSourceStats?.data?.sources?.find((source: any) => source.sourceDomain === getBaseDomain())
  const floor = collection.data?.collection?.floorAsk?.price
  const statsObj = {
    ownerCount: Number(collection.data?.collection?.ownerCount ?? 0),
    onSaleCount: (organization.disableAggregation ? (collectionSourceStats.isValidating ? null : sourceStats?.onSaleCount ?? 0) : Number(collection.data?.collection?.onSaleCount ?? 0)),
    count: Number(collection.data?.collection?.tokenCount ?? 0),
    topOffer: collection.data?.collection?.topBid?.value,
    floor: (organization.disableAggregation ? (collectionSourceStats.isValidating ? null : sourceStats?.floorAskPrice ?? 0) : floor),
    allTime: collection.data?.collection?.volume?.allTime,
    todayVolume: collection.data?.collection?.volume?.['1day'],
    volumeChange: (Number(collection.data?.collection?.volumeChange?.['1day'] ?? 0) - 1) * 100,
    floorChange: collection.data?.collection?.floorSaleChange?.['1day'],
  }

  return (
    <div className="flex flex-row gap-5 sm:gap-10 h-18 items-center col-span-full px-4 md:px-10 pt-4 md:pt-10 flex-wrap">
      <div className="flex flex-row gap-3 items-center flex-wrap">
        <img
          className="w-21 h-21 rounded-full"
          width={84}
          height={84}
          src={organization.listingIcon}
        />
        <div className="flex flex-col gap-3">
          <div
            style={{
              color: organization.primaryFontColorHex || "#000000",
            }}
            className="font-semibold text-2xl"
          >
            {organization.name}
          </div>
          {organization.collections.length > 1 && (
            <CommunityDropdown
              organization={organization}
            />
          )}
        </div>
      </div>
      <HeroStats stats={statsObj} organization={organization} />
    </div>
  )
}

export default Hero
