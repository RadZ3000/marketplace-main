import { ComponentProps, FC, useContext, useEffect, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import ExpirationSelector from './ExpirationSelector'
import { DateTime, Duration } from 'luxon'
import { constants, ethers } from 'ethers'
import { useSigner } from 'wagmi'
import { SWRResponse } from 'swr'
import { HiX, HiChevronRight } from 'react-icons/hi'
import { FiArrowLeft } from 'react-icons/fi'
import Toast from './Toast'
import { SWRInfiniteResponse } from 'swr/infinite/dist/infinite'
import { DirectListState, Token } from 'lib/types'
import useUserTokens from 'hooks/useUserTokens'
import useCollection from 'hooks/useCollection'
import useDetails from 'hooks/useDetails'
import useReservoirClient from 'hooks/useReservoirClient'
import useCoinConversion from 'hooks/useCoinConversion'
import { useAccount } from 'wagmi'
import { GlobalContext } from 'context/GlobalState'
import useAsks from 'hooks/useAsks'
import { Organization } from 'context/config'
import { formatDollarsFromEth } from 'lib/numbers'
import { CgSpinner } from 'react-icons/cg'
import { ImSpinner8 } from 'react-icons/im'
import { BsCheck } from 'react-icons/bs'
import FormatPrice from './FormatPrice'
import TokenMedia from './token/TokenMedia'
import SnagButton from "components/SnagButton"
import { getBaseDomain } from 'lib/domain'
import CurrencySelector from 'components/CurrencySelector'
import { Currency, SUPPORTED_CURRENCIES } from 'lib/currency'

const FEE_BPS = process.env.NEXT_PUBLIC_FEE_BPS

type Props = {
  details?: ReturnType<typeof useDetails>
  collectionId: string
  token?: Token
  isInTheWrongNetwork: boolean | undefined
  maker: string | undefined
  mutate?: SWRResponse['mutate'] | SWRInfiniteResponse['mutate']
  setToast: (data: ComponentProps<typeof Toast>['data']) => any
  signer: ReturnType<typeof useSigner>['data']
  organization: Organization
  show: boolean
  tokenListing?: Token | undefined
  refreshData: () => any
}

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
  state: DirectListState,
  organization: Organization,
}> = ({
  state,
  organization,
}) => {
  if (state === DirectListState.Created) {
    return (
      <LoadingIcon organization={organization} />
    );
  }

  return (
    <SuccessIcon />
  );
}

const StepTwoIcon: FC<{
  state: DirectListState,
  organization: Organization,
}> = ({
  state,
  organization,
}) => {
  if (state === DirectListState.Submitted) {
    return (
      <LoadingIcon organization={organization} />
    );
  }

  if (state === DirectListState.Created) {
    return (
      <StepIcon text="2" organization={organization} />
    );
  }

  return (
    <SuccessIcon />
  );
}

const LoadingState: FC<{
  state: DirectListState,
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
            Approve this item for sale
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
            Confirm {listingPrice} {currency.symbol} listing
          </div>
          <div className="text-sm">
            Confirm your listing and pay gas fee.
          </div>
        </div>
      </div>
    </div>
  );
}

const ListItemRow: FC<{
  organization: Organization,
  token: Token,
  collectionName: string,
  collectionImageURL: string,
  snagTokenIdToMakerAsks: any,
  onClick: () => void
}> = ({
  organization,
  token,
  collectionName,
  collectionImageURL,
  onClick,
  snagTokenIdToMakerAsks,
}) => {
  const [hover, setHover] = useState(false)

  const includeBoxShadow = Boolean(organization.primaryButtonBoxShadow)
  const boxShadow = organization.primaryButtonBoxShadow || 0
  const borderColor = hover && includeBoxShadow ? (organization.primaryOutlineColorHex || "#959DA6") : (organization.secondaryOutlineColorHex || "#CFD8DC")
  const disabled = !(!snagTokenIdToMakerAsks[token?.tokenId])
  const cardShadowStyle = {
    marginTop: `${boxShadow * 2}px`,
    marginLeft: `${boxShadow * 2}px`,
    boxShadow: hover && includeBoxShadow ? `${boxShadow * 2}px ${boxShadow * 2}px 0px 0px ${borderColor}` : "",
    transform: hover && includeBoxShadow ? `translateY(-${boxShadow * 2}px) translateX(-${boxShadow * 2}px)` : "",
    borderColor,
    backgroundColor: hover ? (organization.secondaryButtonHoverColorHex || "#F8F9FA") : "",
    borderRadius: organization.borderRadius || "12px",
    borderWidth: organization.primaryButtonBoxShadow || "1px",
  }

  return (
    <a
      onMouseEnter={() => {
        setHover(true)
      }}
      onMouseLeave={() => {
        setHover(false)
      }}
      key={token?.tokenId}
      onClick={onClick}
      style={cardShadowStyle}
      className={`cursor-pointer border-[1px] rounded-xl px-5 py-3 transition ${!disabled ? "pointer-events-auto" : "pointer-events-none opacity-50"}`}
    >
      <div className="flex flex-row justify-between	items-center gap-4">
        <div className="flex flex-row items-center gap-4">
          <div style={{ borderRadius: organization.borderRadius || "12px" }} className="overflow-hidden w-[60px]">
            <TokenMedia
              token={token}
              organization={organization}
              collectionName={collectionName}
              collectionImage={collectionImageURL}
              size={60}
            />
          </div>
          <div
            style={{
              color: organization.primaryFontColorHex || "#000000"
            }}
            className="text-lg font-semibold">
            {token?.name || `Token #${token?.tokenId}`}
          </div>
        </div>
        <HiChevronRight style={{
          color: organization.secondaryFontColorHex || "#959DA6",
        }} className="h-6 w-6" />
      </div>
    </a>
  );
}

const ListTokenModal: FC<Props> = ({
  details,
  collectionId,
  token,
  maker,
  isInTheWrongNetwork,
  signer,
  children,
  mutate,
  setToast,
  organization,
  show,
  tokenListing,
  refreshData,
}) => {
  // User input
  const [expiration, setExpiration] = useState('threeMonths')
  const [currency, setCurrency] = useState<Currency>(SUPPORTED_CURRENCIES[0])
  const [postOnOpenSea, setPostOnOpenSea] = useState<boolean>(false)
  const [listingPrice, setListingPrice] = useState('')
  const [youGet, setYouGet] = useState(constants.Zero)

  const [directListState, setDirectListState] = useState<DirectListState>()

  const [userSelectedToken, setUserSelectedToken] = useState<Token>()
  const selectedToken = token || userSelectedToken;

  const erc20ToUsd = useCoinConversion("USD", currency.symbol)

  const onOpenChange = (open: boolean) => {
    setOpen(open)

    // reset all state
    if (!open) {
      setExpiration('threeMonths')
      setCurrency(SUPPORTED_CURRENCIES[0])
      setPostOnOpenSea(false)
      setListingPrice('')
      setYouGet(constants.Zero)
      setDirectListState(undefined)
      setUserSelectedToken(undefined)
      setWaitingTx(false)
    }
  }

  // Modal
  const [waitingTx, setWaitingTx] = useState<boolean>(false)

  const { dispatch } = useContext(GlobalContext)

  const [open, setOpen] = useState(false)

  const account = useAccount()
  const makerAsks = useAsks(undefined, undefined, account?.address)
  const reservoirClient = useReservoirClient()
  const userTokens: ReturnType<typeof useUserTokens> = useUserTokens(account?.address, collectionId, undefined)
  const { tokens, ref } = userTokens

  const { data, isValidating, size } = tokens
  const mappedTokens = data?.map(tokens => tokens.tokens)?.flat() || []
  const snagTokenIdToMakerAsks = Object.assign({}, ...(makerAsks.data?.orders || []).map((x) => {
    if ((x.source?.domain !== getBaseDomain()) || x.side !== "sell" ) return {}

    return {[x.tokenSetId.split(":").slice(-1)[0]]: x}
  }))

  const collection = useCollection(undefined, collectionId)

  let apiBps = 0

  function getBps(royalties: number | undefined, envBps: string | undefined) {
    let sum = 0
    if (royalties) sum += royalties
    if (envBps) sum += +envBps
    return sum
  }
  const bps = getBps(apiBps, FEE_BPS)

  const currencyOption = organization.currencies?.find(x => x.symbol === currency.symbol)
  const royaltyFee = currencyOption?.royaltyFee || organization.royaltyFee
  const royaltyFeeRecipient = currencyOption?.royaltyFeeRecipient || organization.royaltyFeeRecipient
  const serviceFee = currencyOption?.serviceFee || organization.serviceFee
  const serviceFeeRecipient = currencyOption?.serviceFeeRecipient || organization.serviceFeeRecipient
  const savingsRate = currencyOption?.savingsRate || organization.savingsRate

  const execute = async () => {
    setWaitingTx(true)

    const expirationValue = expirationPresets
      .find(({ preset }) => preset === expiration)
      ?.value()

    if (!maker) throw 'maker is undefined'

    const expirationDuration = expirationPresets
      .find(({ preset }) => preset === expiration)
      ?.duration()

    if (!expirationDuration) {
      console.log('Duration not found')
      return
    }

    if (!signer) {
      throw 'Signer is missing'
    }
    if (!reservoirClient) {
      throw 'reservoirClient is not initialized'
    }

    setDirectListState(DirectListState.Created)

    await reservoirClient.actions.listToken({
      listings: [{
        orderbook: 'reservoir',
        weiPrice: ethers.utils.parseUnits(listingPrice, currency.decimals).toString(),
        currency: currency.contract,
        token: `${collectionId}:${selectedToken?.tokenId}`,
        expirationTime: expirationValue,
        orderKind: "seaport",
        automatedRoyalties: !Boolean(royaltyFeeRecipient),
        fees: [
          `${serviceFeeRecipient}:${serviceFee * 10000}`,
          ...(royaltyFeeRecipient ? [`${royaltyFeeRecipient}:${royaltyFee * 10000}`] : [])
        ],
      }],
      signer,
      onProgress: (event) => {
        if (event && event[2]?.items && event[2].items[0]?.status === 'complete') {
          setDirectListState(DirectListState.Submitted)
        }
      },
    })
    .then(() => {
      setTimeout(() => {
        setDirectListState(DirectListState.Completed)
        setTimeout(() => {
          setDirectListState(DirectListState.Success)
        }, 500)
        refreshData()
        setWaitingTx(false)
      }, 3000)
    })
    .catch((err) => {
      if (err?.code === 4001) {
        setToast({
          kind: 'error',
          message: 'You have canceled the listing.',
          title: 'User canceled listing',
        })
        onOpenChange(false)
        return
      } else if (err?.message) {
        setToast({
          kind: 'error',
          message: err?.message,
          title: 'Bad request error',
        })
        onOpenChange(false)
        return
      }
    })
  }

  const SelectToken: FC<{organization: Organization, onOpenChange: (open: boolean) => void }> = ({ organization, onOpenChange }) => {
    if (mappedTokens.length === 0) {
      return (
        <div className="flex flex-col gap-5 items-center py-5">
          <div className="flex flex-col gap-5 items-center">
            <img src="/icons/ShoppingBag.svg" alt="Shopping bag" />
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
            isPrimary
            onClick={() => {
              onOpenChange(false)
            }}
          >
            Explore listed items
          </SnagButton>
        </div>
      )
    }

    return (
      <>
        <div
          style={{
            color: organization.primaryFontColorHex || "#000000"
          }}
          className="text-base mb-6">
          Choose the item you want to list:
        </div>
        <div className="max-h-72 overflow-y-auto pr-3">
          <div className="grid grid-cols-1 gap-2">
            {mappedTokens.map((token, idx) => (
              <ListItemRow
                key={idx}
                organization={organization}
                token={token}
                collectionName={collection.data?.collection?.name || ""}
                collectionImageURL={collection.data?.collection?.metadata?.imageUrl as string}
                snagTokenIdToMakerAsks={snagTokenIdToMakerAsks}
                onClick={() => {
                  setUserSelectedToken(token)
                }}
              />
            ))}
          </div>
        </div>
      </>
    )
  }

  const isListedItem = () => {
    return ((tokenListing?.reservoirListing))
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      {show && (
        <div>
          <SnagButton
            classType="Dialog"
            organization={organization}
            disabled={isInTheWrongNetwork}
            className="px-6 py-2 text-base"
            isPrimary={Boolean(tokenListing || token)}
            onClick={async (e) => {
              if (tokenListing?.price) {
                setListingPrice(tokenListing.price?.amount?.decimal?.toString())
                setCurrency(tokenListing.price?.currency)
              }
            }}
          >
            {isListedItem() ? "Lower Price" : token ? "List for sale" : "List an Item"}
          </SnagButton>
        </div>
      )}
      <Dialog.Portal>
        <Dialog.Overlay>
          <Dialog.Content style={{fontFamily: organization.font}} className="fixed inset-0 z-[1000] bg-[#000000b6]">
            <div className="fixed left-1/2 w-full -translate-x-1/2 transform">
              <div className="px-5 py-28 overflow-y-scroll h-screen">
                <div
                  style={{
                    background: organization.backgroundCss,
                    backgroundColor: organization.backgroundColorHex,
                    borderColor: organization.secondaryOutlineColorHex || "#CFD8DC",
                  }}
                  className="mx-auto rounded-2xl border bg-white shadow-xl md:w-[600px]"
                >
                  {selectedToken && directListState === DirectListState.Success ? (
                    <div
                      style={{
                        color: organization.primaryFontColorHex || "#000000",
                      }}
                      className="flex flex-col px-32 py-16 gap-10 items-center">
                      <div className="text-2xl font-semibold">
                        Your Listing Succeeded
                      </div>
                      <div
                        style={{ borderColor: organization.secondaryOutlineColorHex || "#CFD8DC", borderRadius: organization.borderRadius || "12px" }}
                        className="overflow-hidden border">
                        <TokenMedia
                          token={selectedToken}
                          organization={organization}
                          collectionName={collection.data?.collection?.name || ""}
                          collectionImage={
                            collection.data?.collection?.metadata?.imageUrl as string
                          }
                          size={200}
                        />
                        <div
                          style={{ borderColor: organization.secondaryOutlineColorHex || "#CFD8DC" }}
                          className="px-3 py-4">
                          <p
                            className="mb-3 overflow-hidden truncate dark:text-white font-normal text-sm"
                            title={selectedToken?.name || selectedToken?.tokenId || undefined}
                          >
                            {selectedToken?.name || `#${selectedToken?.tokenId}`}
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

                        {(!window.location.href.includes("/tokens/")) && (
                          <SnagButton
                            classType="Link"
                            organization={organization}
                            className="px-6 py-2 text-lg"
                            isPrimary
                            href={`/collections/${collectionId}/tokens/${selectedToken?.tokenId}`}
                            onClick={() => {
                              onOpenChange(false)
                            }}
                            >
                            View Item
                          </SnagButton>
                        )}
                      </div>
                    </div>
                  ) : (
                    <>
                      <div style={{
                        borderColor: organization.secondaryOutlineColorHex || "#CFD8DC"
                      }} className="px-8 py-6 flex items-center justify-between border-b">
                        <div className="flex flex-row gap-3">
                          {selectedToken && !directListState && !token && (
                            <button
                              style={{ borderColor: organization.secondaryOutlineColorHex || "#CFD8DC" }}
                              className="rounded-full	border flex items-center p-2 text-black dark:border-neutral-600 dark:text-primary-100 dark:ring-primary-900 dark:focus:ring-4"
                              onClick={ () => { setUserSelectedToken(undefined)  } }
                            >
                              <FiArrowLeft
                                style={{
                                  color: organization.primaryFontColorHex || "#000000",
                                }}
                                className="h-4 w-4"/>
                            </button>
                          )}
                          <Dialog.Title style={{
                            fontFamily: organization.font,
                            color: organization.primaryFontColorHex || "#000000",
                          }} className="text-2xl font-semibold" >
                            {directListState ? "Complete Your Listing" : (tokenListing && (tokenListing.reservoirListing)) ? "Lower the listing price" : "List an item"}
                          </Dialog.Title>
                        </div>
                        <Dialog.Close
                          className="p-1.5"
                        >
                          <HiX
                            style={{
                              color: organization.secondaryFontColorHex || "#959DA6",
                            }}
                            className="h-6 w-6"
                          />
                        </Dialog.Close>
                      </div>
                      <div className="my-6 mx-8">
                        {directListState ? (
                          <LoadingState
                            organization={organization}
                            state={directListState}
                            listingPrice={listingPrice}
                            currency={currency}
                          />
                        ) :
                        selectedToken ? (
                          <div className="flex flex-row gap-10">
                            <div className="basis-2/5">
                              <div
                                style={{ borderRadius: organization.borderRadius || "12px" }}
                                className="aspect-square overflow-hidden"
                              >
                                <TokenMedia
                                  token={selectedToken}
                                  organization={organization}
                                  collectionName={collection.data?.collection?.name || ""}
                                  collectionImage={
                                    collection.data?.collection?.metadata?.imageUrl as string
                                  }
                                  size={200}
                                />
                              </div>
                            </div>
                            <div
                              style={{
                                color: organization.primaryFontColorHex || "#000000",
                              }}
                              className="flex flex-col gap-8 basis-3/5">
                              <div
                                className="text-xl font-semibold">
                                {selectedToken?.name || `Token #${selectedToken?.tokenId}`}
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
                                  />
                                </div>
                              </div>
                              <div className="flex flex-col gap-2">
                                <ExpirationSelector
                                  presets={expirationPresets}
                                  setExpiration={setExpiration}
                                  expiration={expiration}
                                  organization={organization}
                                />
                              </div>
                              <div className="flex flex-col gap-3">
                                <label
                                  htmlFor="price"
                                  className="text-sm font-semibold"
                                >
                                  Fees
                                </label>
                                <div className="flex flex-col gap-2">
                                  <div className="flex flex-row text-sm">
                                    <div style={{ color: organization.secondaryFontColorHex || "#959DA6"}} className="mr-2">
                                      Creator Royalties:
                                    </div>
                                    <div className="font-semibold mr-2">
                                      {(organization.combineFeesInUI ? (royaltyFee + serviceFee) : royaltyFee) * 100}%
                                    </div>
                                    {(+listingPrice !== 0) && savingsRate !== 0 && (organization.combineFeesInUI) && (
                                      <div style={{ color: organization.positiveColorHex || "#4CAF50"}} className="font-semibold">
                                        Saving {formatDollarsFromEth((savingsRate) * +listingPrice, erc20ToUsd)}
                                      </div>
                                    )}
                                  </div>
                                  {!organization.combineFeesInUI && (<div className="flex flex-row text-sm">
                                    <div style={{ color: organization.secondaryFontColorHex || "#959DA6"}} className="mr-2">
                                      Service Fee:
                                    </div>
                                    <div className="font-semibold mr-2">
                                      {(serviceFee) * 100}%
                                    </div>
                                    {(+listingPrice !== 0) && savingsRate !== 0 && (
                                      <div style={{ color: organization.positiveColorHex || "#4CAF50"}} className="font-semibold">
                                        Saving {formatDollarsFromEth((savingsRate) * +listingPrice, erc20ToUsd)}
                                      </div>
                                    )}
                                  </div>)}
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <SelectToken organization={organization} onOpenChange={onOpenChange} />
                        )
                      }
                      </div>
                      {selectedToken && !directListState && (
                        <div>
                          <div
                            className={`mt-5 mx-8 mb-8 text-xs`}
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
                          <div
                            style={{ borderColor: organization.secondaryOutlineColorHex || "#CFD8DC" }}
                            className="px-8 py-6 flex flex-row-reverse gap-4 items-center justify-between border-t border-gray-300">
                            <SnagButton
                              classType="Link"
                              organization={organization}
                              className="px-10 py-2 text-lg flex flex-row-reverse gap-4 items-center justify-between"
                              isPrimary
                              disabled={+listingPrice === 0}
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
                                <div>{((tokenListing?.reservoirListing)) ? "Set new price" : "Complete listing"}</div>
                              )}
                            </SnagButton>
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

export default ListTokenModal

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
