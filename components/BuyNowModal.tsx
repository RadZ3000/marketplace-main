import { ComponentProps, FC, useContext, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { constants } from 'ethers'
import { useSigner } from 'wagmi'
import { SWRResponse } from 'swr'
import { HiX } from 'react-icons/hi'
import { useRouter } from 'next/router'
import Toast from './Toast'
import { SWRInfiniteResponse } from 'swr/infinite/dist/infinite'
import { BuyListingState, Token } from 'lib/types'
import useCollection from 'hooks/useCollection'
import useReservoirClient from 'hooks/useReservoirClient'
import { paths } from '@reservoir0x/reservoir-kit-client'
import { GlobalContext } from 'context/GlobalState'
import { Organization } from 'context/config'
import { CgSpinner } from 'react-icons/cg'
import { ImSpinner8 } from 'react-icons/im'
import { BsCheck } from 'react-icons/bs'
import FormatPrice from './FormatPrice'
import { BsCheckCircleFill } from 'react-icons/bs'
import { FaTwitter } from 'react-icons/fa'
import { FiExternalLink } from 'react-icons/fi'
import TokenMedia from './token/TokenMedia'
import SnagButton from "components/SnagButton"
import _ from 'lodash'
import Balance from 'components/Balance'

const LoadingIcon: FC<{
  organization: Organization
}> = ({ organization }) => {
  return (
    <ImSpinner8 style={{ fill: organization.primaryColorHex }} className="h-10 w-10 animate-spin" />
  );
}

const SuccessIcon = () => {
  return (
    <BsCheck className="h-10 w-10 p-1.5 fill-[#FFFFFF] bg-[#4CAF50] rounded-full" />
  );
}

const StepOneIcon: FC<{
  state: BuyListingState,
  organization: Organization,
}> = ({
  state,
  organization,
}) => {
  if (state === BuyListingState.Created) {
    return (
      <LoadingIcon organization={organization} />
    );
  }

  return (
    <SuccessIcon />
  );
}

const LoadingState: FC<{
  state: BuyListingState,
  organization: Organization,
}> = ({
  state,
  organization,
}) => {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-row gap-6 items-center">
        <StepOneIcon state={state} organization={organization} />
        <div
          style={{
            color: organization.primaryFontColorHex || "#000000",
          }}
          className="flex flex-col justify-between">
          <div className="text-xl	font-semibold">
            Confirm Purchase
          </div>
          <div className="text-sm">
            Waiting for your transaction confirmation in your wallet.
          </div>
        </div>
      </div>
    </div>
  );
}

const BuyNowSuccess: FC<{
  organization: Organization
  tokenListing: Token
  buyTxHash?: string | undefined,
  collection: ReturnType<typeof useCollection>
  onOpenChange: (open: boolean) => void
}> = ({
  organization,
  tokenListing,
  buyTxHash,
  collection,
  onOpenChange,
}) => {
  const router = useRouter()

  return (
    <div className="flex flex-col px-32 py-16 gap-10 items-center">
      <div
        style={{
          color: organization.primaryFontColorHex || "#000000",
        }}
        className="text-2xl font-semibold">
        Your purchase succeeded!
      </div>
      <div className="relative">
        <div
          style={{ borderColor: organization.positiveColorHex || "#4CAF50", borderRadius: organization.borderRadius || "12px" }}
          className="border-4">
          <TokenMedia
            token={tokenListing}
            organization={organization}
            collectionName={collection.data?.collection?.name || ""}
            collectionImage={
              collection.data?.collection?.metadata?.imageUrl as string
            }
            size={256}
          />
        </div>
        <BsCheckCircleFill
          size={44}
          className="bg-white rounded-full absolute bottom-0 inset-x-1/2 translate-y-1/2 -translate-x-1/2 fill-[#4CAF50]"
        />
      </div>
      <div className="flex flex-col items-center gap-6">
        <div className="flex flex-row gap-3">
          <SnagButton
            classType="Link"
            organization={organization}
            className="px-8 py-2 text-lg"
            onClick={() => {
              onOpenChange(false)
            }}
          >
            Close
          </SnagButton>

          {organization.tweet && (
            <SnagButton
              classType="Link"
              organization={organization}
              backgroundColorOverride="#34A2F2"
              className="px-6 py-2 text-lg"
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(organization.tweet)}&url=${organization.url + router.asPath}`}
              externalLink
              isPrimary
            >
              <div className="flex flex-row items-center gap-2">
                <FaTwitter size={20} />
                <div>
                  Share
                </div>
              </div>
            </SnagButton>
          )}
        </div>
        {buyTxHash && (
          <a
            href={`https://${organization.testnetNetwork ? 'goerli.' : ''}etherscan.io/tx/${buyTxHash}`}
            target="_blank"
            style={{
              color: organization.primaryFontColorHex || "#000000",
            }}
            className="flex flex-row gap-2 items-center">
            <div className="font-semibold">
              View on Etherscan
            </div>
            <FiExternalLink />
          </a>
        )}
      </div>
    </div>
  )
}

type Props = {
  collectionId: string
  token?: Token
  isInTheWrongNetwork: boolean | undefined
  maker: string | undefined
  mutate?: SWRResponse['mutate'] | SWRInfiniteResponse['mutate']
  setToast: (data: ComponentProps<typeof Toast>['data']) => any
  signer: ReturnType<typeof useSigner>['data']
  organization: Organization
  show: boolean
  tokenListing: Token
  refreshData: () => any
}

const BuyNowModal: FC<Props> = ({
  collectionId,
  token,
  maker,
  isInTheWrongNetwork,
  signer,
  mutate,
  setToast,
  organization,
  show,
  tokenListing,
  refreshData,
}) => {
  const reservoirClient = useReservoirClient()
  const [buyListingState, setBuyListingState] = useState<BuyListingState>()

  const [buyTxHash, setBuyTxHash] = useState<string>()

  const onOpenChange = (open: boolean) => {
    setOpen(open)

    // reset all state
    if (!open) {
      setBuyListingState(undefined)
      setWaitingTx(false)
    }
  }

  // Modal
  const [waitingTx, setWaitingTx] = useState<boolean>(false)

  const { dispatch } = useContext(GlobalContext)

  const [open, setOpen] = useState(false)

  const collection = useCollection(undefined, collectionId)
  const listingPrice = tokenListing.price?.amount?.native
  const execute = async () => {
    setWaitingTx(true)

    if (!maker) throw 'maker is undefined'

    setBuyListingState(BuyListingState.Created);

    if (!signer) {
      throw 'Signer is missing'
    }
    if (!reservoirClient) {
      throw 'reservoirClient is not initialized'
    }
    if (!tokenListing?.reservoirListing) {
      throw "no token listing"
    }

    await reservoirClient.actions.buyToken({
      tokens: [
        {
          tokenId: tokenListing.tokenId,
          contract: tokenListing.collectionId,
        }
      ],
      expectedPrice: +tokenListing.reservoirListing.price?.amount?.decimal,
      options: {
        currency: tokenListing.reservoirListing.price?.currency?.contract,
      },
      signer,
      onProgress: (event) => {
        if (_.get(event, '[1].items[0].status', null) === 'complete') {
          setBuyTxHash(_.get(event, '[1].items[0].txHash', null))
        }  
      },
    })
    .then((res) => {
      setBuyListingState(BuyListingState.Success);      
      mutate && mutate()
      refreshData()
    })
    .catch((err: any) => {
      // Close modal
      onOpenChange(false)
      // Handle user rejection
      if (err?.code === 4001) {
        setToast({
          kind: 'error',
          message: 'You have canceled the transaction.',
          title: 'User canceled transaction',
        })
        return
      }
      setToast({
        kind: 'error',
        message: err?.response?.data?.message ?? 'The transaction was not completed.',
        title: 'Could not buy token',
      })
    })
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      {show && (
        <SnagButton
          classType="Dialog"
          organization={organization}
          disabled={isInTheWrongNetwork}
          className="px-6 py-2 text-base"
          isPrimary={Boolean(tokenListing || token)}
        >
          Buy Now
        </SnagButton>
      )}
      <Dialog.Portal>
        <Dialog.Overlay>
          <Dialog.Content style={{fontFamily: organization.font}} className="fixed inset-0 z-[1000] bg-[#000000b6]">
            <div className="fixed left-1/2 w-full -translate-x-1/2 transform">
              <div className="px-5 py-28 overflow-y-scroll h-screen">
                <div style={{ background: organization.backgroundCss, backgroundColor: organization.backgroundColorHex, borderColor: organization.secondaryOutlineColorHex || "#CFD8DC" }} className="mx-auto border rounded-2xl bg-white shadow-xl md:w-[600px]">
                  {buyListingState === BuyListingState.Success ? (
                    <BuyNowSuccess
                      organization={organization}
                      tokenListing={tokenListing}
                      buyTxHash={buyTxHash}
                      collection={collection}
                      onOpenChange={onOpenChange}
                    />
                  ) : (
                    <>
                      <div
                        style={{ borderColor: organization.secondaryOutlineColorHex || "#CFD8DC"}}
                        className="px-8 py-6 flex items-center justify-between border-b">
                        <div className="flex flex-row gap-3">
                          <Dialog.Title style={{ color: organization.primaryFontColorHex || "#000000" }} className="text-2xl font-semibold dark:text-white">
                            {buyListingState ? "Complete your purchase" : "Purchase an item"}
                          </Dialog.Title>
                        </div>
                        <Dialog.Close className="p-1.5">
                          <HiX style={{ color: organization.secondaryFontColorHex || "#959DA6" }} className="h-6 w-6" />
                        </Dialog.Close>
                      </div>
                      <div className="m-8">
                        {buyListingState ? (
                          <LoadingState
                            organization={organization}
                            state={buyListingState}
                          />
                        ) : (
                          <>
                            <div className="flex flex-row gap-6">
                              <div className="aspect-square rounded-xl overflow-hidden basis-1/5">
                                <TokenMedia
                                  token={tokenListing}
                                  organization={organization}
                                  collectionName={collection.data?.collection?.name || ""}
                                  collectionImage={
                                    collection.data?.collection?.metadata?.imageUrl as string
                                  }
                                  size={102}
                                />
                              </div>
                              <div className="flex flex-col justify-between justify-items-start basis-4/5 py-2">
                                <div
                                  style={{
                                    color: organization.primaryFontColorHex || "#000000",
                                  }}
                                  className="text-xl font-semibold">
                                  {tokenListing.name}
                                </div>

                                <div className="grow-0 text-2xl">
                                  <FormatPrice
                                    price={tokenListing?.price || undefined}
                                    logoWidth={16}
                                    organization={organization}
                                    showAmountDollars
                                  />
                                </div>
                              </div>
                            </div>
                            {tokenListing.reservoirListing && tokenListing.reservoirListing?.source && !tokenListing.reservoirListing?.isLocalListing && (
                              <div
                                style={{ borderColor: organization.secondaryOutlineColorHex || "#CFD8DC" }}
                                className="mt-6 pt-6 border-t-[1px]">
                                {tokenListing.reservoirListing?.sourceLink ? (
                                  <a
                                    target="_blank"
                                    rel="noreferrer"
                                    href={tokenListing.reservoirListing?.sourceLink}
                                    className="flex flex-row gap-2 items-center"
                                  >
                                    <img src={`https://api.reservoir.tools/redirect/logo/v1?source=${tokenListing.reservoirListing?.source}`} className="h-6 w-6 rounded-full" />
                                    <div
                                      style={{
                                        color: organization.primaryFontColorHex || "#000000",
                                      }}
                                    >
                                      Original listing on&nbsp;
                                      <p className="inline capitalize">
                                        {tokenListing.reservoirListing?.source}
                                      </p>
                                    </div>
                                    <FiExternalLink
                                      style={{
                                        color: organization.primaryFontColorHex || "#000000",
                                      }}
                                    />
                                  </a>
                                ) : (
                                  <div className="flex flex-row gap-2 items-center">
                                    <img src={`https://api.reservoir.tools/redirect/logo/v1?source=${tokenListing.reservoirListing?.source}`} className="h-6 w-6" />
                                    <div
                                      style={{
                                        color: organization.primaryFontColorHex || "#000000",
                                      }}
                                    >
                                      Original listing on&nbsp;
                                      <p className="inline capitalize">
                                        {tokenListing.reservoirListing?.source}
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                            <div
                              className={`mt-5 text-xs`}
                              style={{
                                color: organization.secondaryFontColorHex || "#959DA6"
                              }}
                            >
                              By connecting your wallet and using the marketplace, you agree to our technology partner, Snag Solutions,
                              <a
                                target="_blank"
                                rel="noreferrer"
                                className="underline ml-0.5 font-semibold"
                                href="https://snagsolutions.io/terms-and-conditions">
                                Terms and Conditions
                              </a>.
                            </div>
                          </>
                        )}
                      </div>
                      {!buyListingState && (
                        <div className="">
                          <div
                            style={{ borderColor: organization.secondaryOutlineColorHex || "#CFD8DC"}}
                            className="px-8 py-6 flex flex-row-reverse items-center justify-between border-t">
                            <SnagButton
                              classType="Link"
                              organization={organization}
                              disabled={waitingTx || isInTheWrongNetwork || !listingPrice || +listingPrice === 0}
                              className="px-10 py-2"
                              isPrimary
                              onClick={() => {
                                if (!signer) {
                                  dispatch({ type: 'CONNECT_WALLET', payload: true })
                                  return
                                }
                                execute()
                              }}
                            >
                              {waitingTx ? (
                                <div>
                                  <CgSpinner className="h-6 w-28 animate-spin" />
                                </div>
                              ) : (
                                <div className="w-28 text-center">Checkout</div>
                              )}
                            </SnagButton>

                            {maker && (
                              <div className="flex flex-row gap-2 items-center">
                                <div style={{ color: organization.secondaryFontColorHex || "#959DA6"}} className="uppercase text-sm font-semibold">
                                  Your Balance
                                </div>
                                <div className="text-sm font-normal">
                                  <Balance address={maker} organization={organization} currency={tokenListing?.reservoirListing?.price?.currency} />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default BuyNowModal
