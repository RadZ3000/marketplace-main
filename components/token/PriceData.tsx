import AcceptOffer from 'components/AcceptOffer'
import BuyNowModal from 'components/BuyNowModal'
import CancelListing from 'components/CancelListing'
import CancelOffer from 'components/CancelOffer'
import FormatPrice from 'components/FormatPrice'
import ListTokenModal from 'components/ListTokenModal'
import TokenOfferModal from 'components/TokenOfferModal'
import useCollection from 'hooks/useCollection'
import React, { FC, ReactNode } from 'react'
import { useAccount, useSigner } from 'wagmi'
import { setToast } from './setToast'
import Moment from 'react-moment'
import { Organization } from 'context/config'
import { Token } from 'lib/types'
import { getChainId } from 'lib/chain'
import { ChainId } from 'lib/types'

type Props = {
  collection: ReturnType<typeof useCollection>
  collectionId: string
  organization: Organization
  tokenListing: Token
  signer: ReturnType<typeof useSigner>['data']
  account: ReturnType<typeof useAccount>
  isInTheWrongNetwork: boolean
  refreshData: () => any
  refreshOffersData: () => any
}

const PriceData: FC<Props> = ({
  collection,
  collectionId,
  organization,
  tokenListing,
  signer,
  account,
  isInTheWrongNetwork,
  refreshData,
  refreshOffersData,
}) => {
  const chainId = getChainId(organization)

  if (!chainId) return null

  // we only care if user is an owner on our smart contracts
  const isOwner = tokenListing?.ownerAddress?.toLowerCase() === account?.address?.toLowerCase() && tokenListing?.ownerAddress !== undefined

  const isListed = (organization.disableAggregation ? tokenListing.reservoirListing?.isLocalListing === true : tokenListing.reservoirListing !== null)
  
  const price = isListed ? tokenListing?.price : null
  const listEndTime = tokenListing?.reservoirListing?.duration?.endTimeInSeconds

  const itemNotListed = () => {
    return (!tokenListing?.reservoirListing) || !Boolean(price)
  }

  return (
    <div className="col-span-full md:col-span-4 lg:col-span-5 lg:col-start-2">
      <article
        style={{
          backgroundColor: organization.secondaryBackgroundColorHex || "#F8F9FA",
          borderColor: organization.secondaryOutlineColorHex || "#CFD8DC",
          borderRadius: organization.borderRadius || "12px"
        }}
        className="col-span-full border p-7">
        <div className="flex flex-col gap-6">

        {!itemNotListed() && (
          <div className="flex flex-col space-y-5">
            <div className="text-3xl font-semibold">
              <div className="flex flex-row items-baseline justify-between flex-wrap">
                <FormatPrice
                  price={price as any}
                  logoWidth={24}
                  organization={organization}
                  showAmountDollars
                />
                {listEndTime && (
                  <div className="text-primary-font text-base font-normal">
                    Time left: <Moment date={listEndTime * 1000} interval={1000} fromNow ago/>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

          <div className="col-span-2 flex flex-row flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-row flex-wrap gap-4 items-center">
              <ListTokenModal
                collectionId={collectionId}
                isInTheWrongNetwork={isInTheWrongNetwork}
                maker={account?.address}
                setToast={setToast}
                signer={signer}
                organization={organization}
                show={isOwner}
                token={tokenListing}
                tokenListing={tokenListing}
                refreshData={refreshData}
              />
              {/* <div><AcceptOffer
                data={{
                  collection: collection.data,
                  details,
                }}
                isInTheWrongNetwork={isInTheWrongNetwork}
                setToast={setToast}
                // show={isOwner}
                show={false}
                signer={signer}
                organization={organization}
              /></div> */}
              <CancelListing
                data={{
                  collection: collection.data,
                }}
                maker={account?.address?.toLowerCase()}
                signer={signer}
                show={isOwner && isListed}
                tokenListing={tokenListing}
                isInTheWrongNetwork={isInTheWrongNetwork}
                setToast={setToast}
                organization={organization}
                refreshData={refreshData}
              />
              <BuyNowModal
                collectionId={collectionId}
                tokenListing={tokenListing}
                isInTheWrongNetwork={isInTheWrongNetwork}
                maker={account?.address}
                setToast={setToast}
                signer={signer}
                organization={organization}
                show={!isOwner && isListed}
                refreshData={refreshData}
              />
              <TokenOfferModal
                organization={organization}
                maker={account?.address}
                signer={signer}
                tokenListing={tokenListing}
                data={{
                  collection: collection.data,
                }}
                royalties={{
                  bps: collection.data?.collection?.royalties?.bps,
                  recipient: collection.data?.collection?.royalties?.recipient,
                }}
                env={{
                  chainId: +chainId as ChainId,
                }}
                setToast={setToast}
                show={!isOwner}
                refreshData={refreshOffersData}
              />
              {Boolean(itemNotListed() && isOwner) && !organization.combineFeesInUI && (
                <div
                  style={{ borderColor: organization.secondaryOutlineColorHex || "#CFD8DC" }}
                  className="flex flex-row gap-2 items-center rounded-lg border-[1px] text-[#4CAF50] font-semibold py-3 px-4">
                  <img
                    src="/icons/coupon.svg"
                  />
                  <div
                    style={{
                      color: organization.primaryFontColorHex || "#000000",
                    }}
                    className="text-sm"
                  >
                    Save on fees and list for only {organization.serviceFee * 100}% service fee
                  </div>
                </div>
              )}
            </div>
            <div>
              {itemNotListed() && !isOwner && (
                <div
                  style={{
                    color: organization.secondaryFontColorHex || "#959DA6"
                  }}
                  className="text-lg"
                >
                  Unlisted
                </div>
              )}
            </div>
          </div>
        </div>
      </article>
    </div>
  )
}

export default PriceData
