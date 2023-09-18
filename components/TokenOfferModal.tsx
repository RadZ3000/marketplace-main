import { ComponentProps, FC, useContext, useEffect, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { BigNumber, constants, utils, ethers } from 'ethers'
import {
  useAccount,
  useBalance,
  useNetwork,
  useProvider,
  useSigner,
} from 'wagmi'
import calculateOffer from 'lib/calculateOffer'
import { DateTime, Duration } from 'luxon'
import { SWRResponse } from 'swr'
import { HiX } from 'react-icons/hi'
import { Weth } from '@reservoir0x/sdk/dist/common/helpers'
import { paths } from '@reservoir0x/reservoir-kit-client'
import Toast from './Toast'
import { ImSpinner8 } from 'react-icons/im'
import { BsCheck } from 'react-icons/bs'
import { GlobalContext } from 'context/GlobalState'
import { Organization } from 'context/config'
import TokenMedia from './token/TokenMedia'
import FormatPrice from './FormatPrice'
import useReservoirClient from 'hooks/useReservoirClient'
import { ChainId, Token, OfferState } from 'lib/types'
import { CgSpinner } from 'react-icons/cg'
import SnagButton from "components/SnagButton"
import CurrencySelector from 'components/CurrencySelector'
import ExpirationSelector from './ExpirationSelector'
import { Currency, getOffersCurrencyOptions } from 'lib/currency'
import Balance from 'components/Balance'

const ORDER_KIND = process.env.NEXT_PUBLIC_ORDER_KIND
const SOURCE_ID = process.env.NEXT_PUBLIC_SOURCE_ID
const FEE_BPS = process.env.NEXT_PUBLIC_FEE_BPS
const FEE_RECIPIENT = process.env.NEXT_PUBLIC_FEE_RECIPIENT

type Details = paths['/tokens/details/v4']['get']['responses']['200']['schema']
type Collection = paths['/collection/v2']['get']['responses']['200']['schema']

type Props = {
  env: {
    chainId: ChainId
  }
  data: {
    collection: Collection | undefined
  }
  tokenListing: Token
  royalties: {
    bps: number | undefined
    recipient: string | undefined
  }
  organization: Organization
  show: boolean
  maker: string | undefined
  signer: ReturnType<typeof useSigner>['data']
  setToast: (data: ComponentProps<typeof Toast>['data']) => any
  refreshData: () => any
}

const TokenOfferModal: FC<Props> = ({
  organization,
  env,
  show,
  maker,
  royalties,
  data,
  tokenListing,
  setToast,
  refreshData,
}) => {
  const [expiration, setExpiration] = useState<string>('threeMonths')
  const [waitingTx, setWaitingTx] = useState<boolean>(false)
  const { chain: activeChain } = useNetwork()
  const [listingPrice, setListingPrice] = useState('')
  const [offerState, setOfferState] = useState<OfferState>()

  const offersCurrencies = getOffersCurrencyOptions(organization)
  const [currency, setCurrency] = useState<Currency>(offersCurrencies[0])
  const { dispatch } = useContext(GlobalContext)
  const reservoirClient = useReservoirClient()
  const [calculations, setCalculations] = useState<
    ReturnType<typeof calculateOffer>
  >({
    fee: constants.Zero,
    total: constants.Zero,
    missingEth: constants.Zero,
    missingWeth: constants.Zero,
    error: null,
    warning: null,
  })
  const [offerPrice, setOfferPrice] = useState<string>('')
  const [weth, setWeth] = useState<{
    weth: Weth
    balance: BigNumber
  } | null>(null)
  const { data: signer } = useSigner()
  const account = useAccount()
  const { data: ethBalance, refetch } = useBalance({
    addressOrName: account?.address,
  })
  const provider = useProvider()

  function getBps(royalties: number | undefined, envBps: string | undefined) {
    let sum = 0
    if (royalties) sum += royalties
    if (envBps) sum += +envBps
    return sum
  }
  const bps = getBps(royalties.bps, FEE_BPS)
  const royaltyPercentage = royalties?.bps
    ? `${(royalties?.bps / 10000) * 100}%`
    : '0%'

  const [open, setOpen] = useState(false)
  const isInTheWrongNetwork = Boolean(signer && activeChain?.id !== env.chainId)

  useEffect(() => {
    async function loadWeth() {
      if (signer) {
        await refetch()
        // const weth = await getWeth(env.chainId as ChainId, provider, signer)
        if (weth) {
          setWeth(weth)
        }
      }
    }
    loadWeth()
  }, [signer])

  useEffect(() => {
    const userInput = utils.parseEther(offerPrice === '' ? '0' : offerPrice)
    if (weth?.balance && ethBalance?.value) {
      const calculations = calculateOffer(
        userInput,
        ethBalance.value,
        weth.balance,
        bps
      )
      setCalculations(calculations)
    }
  }, [offerPrice])

  // Data from props
  const [collection, setCollection] = useState<Collection>()
  const [details, setDetails] = useState<SWRResponse<Details, any> | Details>()

  useEffect(() => {
    if (data && open) {
      // Load data if missing
      if ('tokenId' in data) {
        // const { contract, tokenId, collectionId } = data

        // getDetails(contract, tokenId, setDetails)
        // getCollection(collectionId, setCollection)
      }
      // Load data if provided
      // if ('details' in data) {
      //   const { details, collection } = data

      //   setDetails(details)
      //   setCollection(collection)
      // }
    }
  }, [data, open])

  if (!tokenListing) {
    throw "no token"
  }

  const handleError = (err: any) => {
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
      message: 'The transaction was not completed.',
      title: 'Could not make offer',
    })
  }

  const currencyOption = organization.currencies?.find(x => x.symbol === currency.symbol)
  const royaltyFee = currencyOption?.royaltyFee || organization.royaltyFee
  const royaltyFeeRecipient = currencyOption?.royaltyFeeRecipient || organization.royaltyFeeRecipient
  const serviceFee = currencyOption?.serviceFee || organization.serviceFee
  const serviceFeeRecipient = currencyOption?.serviceFeeRecipient || organization.serviceFeeRecipient

  const execute = async () => {
    setWaitingTx(true)

    const expirationValue = expirationPresets
      .find(({ preset }) => preset === expiration)
      ?.value()

    if (!signer) {
      throw 'Signer is missing'
    }
    if (!reservoirClient) {
      throw 'reservoirClient is not initialized'
    }

    setOfferState(OfferState.Created)

    await reservoirClient.actions.placeBid({
      bids: [{
        weiPrice: ethers.utils.parseUnits(listingPrice, currency.decimals).toString(),
        orderbook: 'reservoir',
        orderKind: "seaport",
        expirationTime: expirationValue,
        token: `${tokenListing.collectionId}:${tokenListing.tokenId}`,
        automatedRoyalties: !Boolean(royaltyFeeRecipient),
        fees: [
          `${serviceFeeRecipient}:${serviceFee * 10000}`,
          ...(royaltyFeeRecipient ? [`${royaltyFeeRecipient}:${royaltyFee * 10000}`] : [])
        ],
      }],
      signer,
      onProgress: (event) => {
        if (event && event[2]?.items && event[2].items[0]?.status === 'complete') {
          setOfferState(OfferState.Submitted)
        }
      },
    })
    .then(() => {
      setTimeout(() => {
        setOfferState(OfferState.Completed)
        setTimeout(() => {
          setOfferState(OfferState.Success)
          setWaitingTx(false)
        }, 500)

        refreshData()
      }, 3000)
    })
    .catch(handleError)
  }

  const onOpenChange = (open: boolean) => {
    setOpen(open)

    // reset all state
    if (!open) {
      setExpiration('threeMonths')
      setCurrency(offersCurrencies[0])
      setListingPrice('')
      setOfferState(undefined)
      setWaitingTx(false)
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      {show && (
        <SnagButton
          classType="Dialog"
          organization={organization}
          disabled={isInTheWrongNetwork}
          className="px-6 py-2 text-base"
        >
          Make an Offer
        </SnagButton>
      )}
      <Dialog.Portal>
        <Dialog.Overlay>
          <Dialog.Content style={{fontFamily: organization.font}} className="fixed inset-0 z-[1000] bg-[#000000b6]">
            <div className="fixed left-1/2 w-full -translate-x-1/2 transform">
              <div className="px-5 py-28 overflow-y-scroll h-screen">
                <div style={{ background: organization.backgroundCss, backgroundColor: organization.backgroundColorHex, borderColor: organization.secondaryOutlineColorHex || "#CFD8DC" }} className="mx-auto border rounded-2xl bg-white shadow-xl md:w-[600px]">
                  {offerState === OfferState.Success ? (
                    <div
                      style={{
                        color: organization.primaryFontColorHex || "#000000",
                      }}
                      className="flex flex-col px-32 py-16 gap-10 items-center">
                      <div className="text-2xl font-semibold">
                        Your Bid Succeeded
                      </div>
                      <div
                        style={{ borderColor: organization.secondaryOutlineColorHex || "#CFD8DC", borderRadius: organization.borderRadius || "12px" }}
                        className="overflow-hidden border">
                        <TokenMedia
                          token={tokenListing}
                          organization={organization}
                          collectionName={data.collection?.collection?.name || ""}
                          collectionImage={
                            data?.collection?.collection?.metadata?.imageUrl as string
                          }
                          size={200}
                        />
                        <div
                          style={{ borderColor: organization.secondaryOutlineColorHex || "#CFD8DC" }}
                          className="px-3 py-4">
                          <p
                            className="mb-3 overflow-hidden truncate dark:text-white font-normal text-sm"
                            title={tokenListing?.name || tokenListing?.tokenId || undefined}
                          >
                            {tokenListing?.name || `#${tokenListing?.tokenId}`}
                          </p>
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="reservoir-h6 text-lg dark:text-white">
                                <FormatPrice
                                  price={{
                                    amount: {
                                      raw: "0",
                                      decimal: +listingPrice,
                                      usd: 0,
                                      native: 0,
                                    },
                                    currency,
                                  }}
                                  logoWidth={16}
                                  organization={organization}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
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
                      </div>
                    </div>
                  ) : (
                    <>
                      <div
                        style={{ borderColor: organization.secondaryOutlineColorHex || "#CFD8DC"}}
                        className="px-8 py-6 flex items-center justify-between border-b">
                        <div className="flex flex-row gap-3">
                          <Dialog.Title style={{ color: organization.primaryFontColorHex || "#000000" }} className="text-2xl font-semibold dark:text-white">
                            Place a bid
                          </Dialog.Title>
                        </div>
                        <Dialog.Close className="p-1.5">
                          <HiX style={{ color: organization.secondaryFontColorHex || "#959DA6" }} className="h-6 w-6" />
                        </Dialog.Close>
                      </div>
                      <div className="m-8">
                        {offerState ? (
                          <LoadingState
                            organization={organization}
                            state={offerState}
                            listingPrice={listingPrice}
                            currency={currency}
                          />
                        ) : (
                          <>
                            <div className="flex flex-row gap-6">
                              <div className="aspect-square h-fit rounded-xl overflow-hidden basis-3/12">
                                <TokenMedia
                                  token={tokenListing}
                                  organization={organization}
                                  collectionName={data?.collection?.collection?.name || ""}
                                  collectionImage={
                                    data?.collection?.collection?.metadata?.imageUrl as string
                                  }
                                  size={140}
                                />
                              </div>
                              <div
                                style={{
                                  color: organization.primaryFontColorHex || "#000000",
                                }}
                                className="flex flex-col gap-8 justify-between justify-items-start basis-9/12">
                                <div
                                  className="text-xl font-semibold">
                                  {tokenListing.name}
                                </div>

                                <div className="flex flex-col gap-2">
                                  <label
                                    htmlFor="price"
                                    className="text-sm font-semibold"
                                  >
                                    Price
                                  </label>
                                  <div className="flex flex-row gap-2">
                                    <input
                                      style={{
                                        borderColor: organization.secondaryOutlineColorHex || "#CFD8DC",
                                        outlineColor: organization.primaryColorHex,
                                      }}
                                      placeholder="Amount"
                                      id="price"
                                      type="number"
                                      min={0}
                                      step={0.01}
                                      value={listingPrice}
                                      onChange={(e) => setListingPrice(e.target.value)}
                                      className="focus:outline-none border-[1px] bg-transparent placeholder-secondary-font rounded py-2.5 px-3 w-full"
                                    />
                                    <CurrencySelector
                                      organization={organization}
                                      setCurrency={setCurrency}
                                      currency={currency}
                                      offers
                                    />
                                  </div>
                                  {maker && (
                                    <div className="flex flex-row gap-2 items-center">
                                      <div style={{ color: organization.secondaryFontColorHex || "#959DA6"}} className="uppercase text-sm font-semibold">
                                        Your Balance
                                      </div>
                                      <div className="text-sm font-normal">
                                        <Balance address={maker} organization={organization} currency={currency} />
                                      </div>
                                    </div>
                                  )}
                                </div>
                                <div className="flex flex-col gap-2">
                                  <ExpirationSelector
                                    label={"Bid Expiration"}
                                    presets={expirationPresets}
                                    setExpiration={setExpiration}
                                    expiration={expiration}
                                    organization={organization}
                                  />
                                </div>
                              </div>
                            </div>
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
                      <div
                        style={{ borderColor: organization.secondaryOutlineColorHex || "#CFD8DC" }}
                        className="px-8 py-6 flex flex-row-reverse gap-4 items-center justify-between border-t">
                        <SnagButton
                          classType="Link"
                          organization={organization}
                          className="px-10 py-2 text-lg flex flex-row-reverse gap-4 items-center justify-between"
                          isPrimary
                          disabled={+listingPrice === 0 || waitingTx}
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
                            <div>Place a bid</div>
                          )}
                        </SnagButton>
                      </div>
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

export default TokenOfferModal

const expirationPresets = [
  {
    preset: 'oneHour',
    value: () =>
      DateTime.now().plus({ hours: 1 }).toMillis().toString().slice(0, -3),
    duration: () =>
      Duration.fromObject({ hours: 1 }).toMillis() / 1000,
    display: '1 Hour',
  },
  {
    preset: 'oneWeek',
    value: () =>
      DateTime.now().plus({ weeks: 1 }).toMillis().toString().slice(0, -3),
    duration: () =>
      Duration.fromObject({ weeks: 1 }).toMillis() / 1000,
    display: '1 Week',
  },
  {
    preset: 'oneMonth',
    value: () =>
      DateTime.now().plus({ months: 1 }).toMillis().toString().slice(0, -3),
    duration: () =>
      Duration.fromObject({ months: 1 }).toMillis() / 1000,
    display: '1 Month',
  },
  {
    preset: 'threeMonths',
    value: () => 
      DateTime.now().plus({ months: 3 }).toMillis().toString().slice(0, -3),
    duration: () => 
      Duration.fromObject({ months: 3 }).toMillis() / 1000,
    display: '3 Months',
  },
]

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

const StepIcon: FC<{
  text: string
  organization: Organization
}> = ({
  text,
  organization
}) => {
  return (
    <div
      style={{ backgroundColor: organization.secondaryBackgroundColorHex || "#F8F9FA", borderColor: organization.secondaryOutlineColorHex || "#CFD8DC" }}
      className="w-10 h-10 leading-10 text-center text-xl font-semibold border-[1px] rounded-full"
    >
      {text}
    </div>
  );
}

const StepOneIcon: FC<{
  state: OfferState,
  organization: Organization,
}> = ({
  state,
  organization,
}) => {
  if (state === OfferState.Created) {
    return (
      <LoadingIcon organization={organization} />
    );
  }

  return (
    <SuccessIcon />
  );
}

const StepTwoIcon: FC<{
  state: OfferState,
  organization: Organization,
}> = ({
  state,
  organization,
}) => {
  if (state === OfferState.Submitted) {
    return (
      <LoadingIcon organization={organization} />
    );
  }

  if (state === OfferState.Created) {
    return (
      <StepIcon text="2" organization={organization} />
    );
  }

  return (
    <SuccessIcon />
  );
}

const LoadingState: FC<{
  state: OfferState,
  listingPrice: string,
  currency: Currency,
  organization: Organization,
}> = ({
  state,
  listingPrice,
  currency,
  organization,
}) => {
  return (
    <div
      style={{
        color: organization.primaryFontColorHex || "#000000",
      }}
      className="flex flex-col gap-8">
      <div className="flex flex-row gap-6 items-center">
        <StepOneIcon state={state} organization={organization} />
        <div className="flex flex-col justify-between">
          <div className="text-xl	font-semibold">
            Approve this bid
          </div>
          <div className="text-sm">
            Requires a one-time gas fee.
          </div>
        </div>
      </div>
      <div className="flex flex-row gap-6 items-center">
        <StepTwoIcon state={state} organization={organization} />
        <div className="flex flex-col justify-between">
          <div className="text-xl	font-semibold">
            Confirm {listingPrice} {currency.symbol} bid
          </div>
          <div className="text-sm">
            Confirm your bid and pay gas fee.
          </div>
        </div>
      </div>
    </div>
  );
}
