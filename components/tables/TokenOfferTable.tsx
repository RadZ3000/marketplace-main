import FormatPrice from 'components/FormatPrice'
import { optimizeImage } from 'lib/optmizeImage'
import { truncateAddress } from 'lib/truncateText'
import { abbreviateDateTimeString } from 'lib/dateTime'
import { DateTime } from 'luxon'
import Link from 'next/link'
import { useAccount, useSigner } from 'wagmi'
import { FC, useEffect, useState } from 'react'
import { Collection } from 'types/reservoir'
import LoadingIcon from 'components/LoadingIcon'
import CancelOffer from 'components/CancelOffer'
import AcceptOffer from 'components/AcceptOffer'
import { Organization } from "context/config"
import { setToast } from 'components/token/setToast'
import { getBaseDomain } from 'lib/domain'
import { paths } from '@reservoir0x/reservoir-kit-client'
import { SWRInfiniteResponse } from 'swr/infinite/dist/infinite'
import { Token } from 'lib/types'
import { RiLoader5Line } from 'react-icons/ri'

type InfiniteOffersType = paths['/orders/bids/v4']['get']['responses']['200']['schema']
type Props = {
  collectionId: string | undefined
  tokenId: string | undefined
  tokenListing: Token
  collection: Collection
  organization: Organization
  signer: ReturnType<typeof useSigner>['data']
  account: ReturnType<typeof useAccount>
  isInTheWrongNetwork: boolean
  offersSWRInfiniteRef: (node?: Element | null | undefined) => void
  pendingOffers: SWRInfiniteResponse<InfiniteOffersType>
  refreshOffersData: () => any
}

const TokenOfferTable: FC<Props> = ({ pendingOffers, offersSWRInfiniteRef, collection, signer, account, isInTheWrongNetwork, tokenListing, organization, refreshOffersData }) => {
  const [openCancelModal, setOpenCancelModal] = useState<boolean>(false)
  const [openAcceptModal, setOpenAcceptModal] = useState<boolean>(false)
  const [actionOfferId, setActionOfferId] = useState<string>()
  const [expectedPrice, setExpectedPrice] = useState<number>()
  
  let flatOffersData = pendingOffers?.data?.flatMap((sale) => sale.orders).filter(x => x) || []
  const noOffers = !pendingOffers.isValidating && flatOffersData.length == 0
  const collectionImage = collection?.metadata?.imageUrl as string
  const isOwner = account?.address?.toLowerCase() === tokenListing.ownerAddress?.toLowerCase()

  const data = pendingOffers.data
  const initialLoad = pendingOffers.isValidating && flatOffersData.length == 0
  const didReachEnd =
    data &&
    (data[data.length - 1]?.orders?.length === 0 ||
      data[data.length - 1]?.continuation === null)

  return (
    <div
      style={{ borderColor: organization.secondaryOutlineColorHex || "#CFD8DC", backgroundColor: organization.secondaryBackgroundColorHex || "#00000000", borderRadius: organization.borderRadius || "12px" }}
      className="text-xs sm:text-sm border dark:border-[#525252] pl-6 pt-6">
      <div
        style={{
          color: organization.primaryFontColorHex || "#000000",
        }}
        className="text-lg font-semibold">
        Offers
      </div>
      <div className="max-h-72 overflow-auto pr-6">
        <table className="w-full border-collapse">
          <tbody>
            {flatOffersData.map((offer, i) => {
              if (!offer) {
                return null
              }

              return (
                <TokenOfferTableRow
                  key={`${offer?.id}-${i}`}
                  offer={offer}
                  isOwner={isOwner}
                  collectionImage={collectionImage}
                  organization={organization}
                  account={account}
                  onClickCancelOffer={(offerId) => {
                    setActionOfferId(offerId)
                    setOpenCancelModal(true)
                  }}
                  onClickAcceptOffer={(offerId, expectedPrice) => {
                    setActionOfferId(offerId)
                    setExpectedPrice(expectedPrice)
                    setOpenAcceptModal(true)
                  }}
                />
              )
            })}
            {noOffers && (
              <div className="my-10 flex w-full flex-col justify-center">
                <img
                  src="/magnifying-glass.svg"
                  className="h-[59px]"
                  alt="Magnifying Glass"
                />
                <div
                  style={{
                    color: organization.primaryFontColorHex || "#000000",
                  }}
                  className="mt-4 mb-2 text-center dark:text-white">
                  No offers
                </div>
                <div
                  style={{
                    color: organization.primaryFontColorHex || "#000000",
                  }}
                  className="text-center text-xs font-light dark:text-white">
                  There are no current offers for this token.
                </div>
              </div>
            )}
            {!initialLoad && !didReachEnd && (
              <tr ref={offersSWRInfiniteRef}>
                <td align="center" colSpan={5}>
                  <RiLoader5Line className="h-6 w-6 m-2 animate-spin-loading" />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {initialLoad && (
        <div className="my-20 flex justify-center">
          <LoadingIcon />
        </div>
      )}
      <CancelOffer
        offerId={actionOfferId}
        maker={account?.address}
        signer={signer}
        show={true}
        isInTheWrongNetwork={isInTheWrongNetwork}
        setToast={setToast}
        open={openCancelModal}
        setOpen={setOpenCancelModal}
        organization={organization}
        refreshData={refreshOffersData}
      />
      <AcceptOffer
        offerId={actionOfferId}
        tokenListing={tokenListing}
        expectedPriceEth={expectedPrice}
        maker={account?.address}
        signer={signer}
        show={true}
        isInTheWrongNetwork={isInTheWrongNetwork}
        setToast={setToast}
        open={openAcceptModal}
        setOpen={setOpenAcceptModal}
        organization={organization}
        refreshData={refreshOffersData}
      />
    </div>
  )
}

type TokenOfferTableRowProps = {
  offer: any
  collectionImage?: string
  isOwner: boolean
  organization: Organization
  account: ReturnType<typeof useAccount>
  onClickCancelOffer: (offerId: string) => any
  onClickAcceptOffer: (offerId: string, expectedPrice: number) => any
}

const TokenOfferTableRow: FC<TokenOfferTableRowProps> = ({
  offer,
  collectionImage,
  isOwner,
  organization,
  account,
  onClickCancelOffer,
  onClickAcceptOffer,
}) => {
  const [toShortAddress, setToShortAddress] = useState(offer.to || '')
  const [fromShortAddress, setFromShortAddress] = useState(offer.maker || '')
  const [imageSrc, setImageSrc] = useState(
    offer.token?.image || collectionImage || ''
  )

  const [createdAt, setCreatedAt] = useState(offer.createdAt || '')
  const [validUntil, setValidUntil] = useState(offer.validUntil || '')

  useEffect(() => {
    setToShortAddress(truncateAddress(offer?.to || ''))
    setFromShortAddress(truncateAddress(offer?.maker || ''))
    setCreatedAt(
      offer?.createdAt
        ? abbreviateDateTimeString(DateTime.fromISO(offer.createdAt).toRelative({style: 'short'}) || '')
        : ''
    )
    setValidUntil(
      offer?.validUntil
        ? abbreviateDateTimeString(DateTime.fromSeconds(offer.validUntil).toRelative({style: 'short'}) || '')
        : ''
    )
  }, [offer])

  useEffect(() => {
    if (offer?.token?.image) {
      setImageSrc(optimizeImage(offer.token.image, 48))
    } else if (collectionImage) {
      setImageSrc(optimizeImage(collectionImage, 48))
    }
  }, [offer, collectionImage])

  if (!offer) {
    return null
  }

  let saleSourceImgSrc = undefined
  const sourceDomain = (offer as { source: { domain: string}}).source.domain.toLowerCase()
  if (sourceDomain?.includes("reservoir") || sourceDomain?.includes("snag") || sourceDomain?.includes(getBaseDomain())) {
    saleSourceImgSrc = organization.aggregateIcon || organization.listingIcon
  } else {
    saleSourceImgSrc = `https://api.reservoir.tools/redirect/logo/v1?source=${sourceDomain}`
  }

  return (
    <tr
      key={offer.id}
      className="h-[60px] border-b last:border-0"
      style={{ borderColor: organization.secondaryOutlineColorHex || "#CFD8DC" }}
    >
      <td>
        <div className="mr-2.5 flex items-center gap-3">
          <img
            className="h-5 w-5 rounded-full"
            src={saleSourceImgSrc}
            alt={`${offer.orderSource} Source`}
          />
          <FormatPrice price={offer.price} organization={organization} />
        </div>
      </td>
      <td style={{ color: organization.secondaryFontColorHex || "#959DA6"}} className="font-normal">
        by
        <Link href={`/addresses/${offer.maker}/collections/${organization.contractId}`}>
          <a
            style={{
              color: organization.primaryFontColorHex || "#000000",
            }}
            className="ml-1 font-semibold text-black">
            {fromShortAddress}
          </a>
        </Link>
      </td>
      <td>
        <div
          style={{
            color: organization.primaryFontColorHex || "#000000",
          }}
          className="flex justify-end	items-center gap-2 whitespace-nowrap text-black font-normal text-sm"
        >
          <span>{createdAt}&nbsp;ago</span>
          <div className="text-[#CFD8DC]">|</div>
          <div>
            <span style={{ color: organization.secondaryFontColorHex || "#959DA6"}}>
              Expires in&nbsp;
            </span>
            {validUntil}
          </div>
        </div>
      </td>
      {account?.address?.toLowerCase() === offer.maker.toLowerCase() ? (
        <td>
          <div className="ml-2.5 text-right">
            <div
              style={{ fontFamily: organization.font, color: organization.primaryColorHex }}
              className="text-base cursor-pointer font-semibold"
              onClick={() => {
                onClickCancelOffer(offer.id)
              }}
            >
              Cancel Offer
            </div>
          </div>
        </td>
      ) : account?.address?.toLowerCase() !== offer.maker.toLowerCase() && isOwner ? (
        <td>
          <div className="ml-2.5 text-right">
            <div
              style={{ fontFamily: organization.font, color: organization.primaryColorHex }}
              className="text-base cursor-pointer font-semibold"
              onClick={() => {
                onClickAcceptOffer(offer.id, offer.price.amount.native)
              }}
            >
              Accept Offer
            </div>
          </div>
        </td>
      ) : (
        <td>
          <div className="ml-2.5 w-24 text-right">
          </div>
        </td>
      )}
    </tr>
  )
}

export default TokenOfferTable
