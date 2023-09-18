import { paths } from '@reservoir0x/reservoir-kit-client'
import React, {
  ComponentProps,
  FC,
  useContext,
  useEffect,
  useState,
} from 'react'
import { SWRResponse } from 'swr'
import * as Dialog from '@radix-ui/react-dialog'
import { HiX } from 'react-icons/hi'
import { useConnect, useSigner } from 'wagmi'
import useReservoirClient from 'hooks/useReservoirClient'
import Toast from './Toast'
import { SWRInfiniteResponse } from 'swr/infinite/dist/infinite'
import { Token } from 'lib/types'
import { CgSpinner } from 'react-icons/cg'
import { GlobalContext } from 'context/GlobalState'
import { Organization } from 'context/config'
import SnagButton from "components/SnagButton"

type Details = paths['/tokens/details/v4']['get']['responses']['200']['schema']
type Collection = paths['/collection/v2']['get']['responses']['200']['schema']

type Props = {
  data:
    | {
        collection: Collection | undefined
      }
    | {
        collectionId: string | undefined
        contract?: string | undefined
        tokenId?: string | undefined
        id?: string | undefined
      }
  maker?: string
  isInTheWrongNetwork: boolean | undefined
  mutate?: SWRResponse['mutate'] | SWRInfiniteResponse['mutate']
  setToast: (data: ComponentProps<typeof Toast>['data']) => any
  show: boolean
  signer: ReturnType<typeof useSigner>['data']
  tokenListing?: Token | undefined
  organization: Organization
  refreshData: () => any
}

const CancelListing: FC<Props> = ({
  data,
  isInTheWrongNetwork,
  maker,
  mutate,
  setToast,
  show,
  signer,
  tokenListing,
  organization,
  refreshData,
}) => {
  const [waitingTx, setWaitingTx] = useState<boolean>(false)
  const { connect, connectors } = useConnect()
  const reservoirClient = useReservoirClient()
  const [open, setOpen] = useState(false)

  // Data from props
  const [collection, setCollection] = useState<Collection>()
  const { dispatch } = useContext(GlobalContext)

  useEffect(() => {
    if (data && open) {
      // Load data if missing
      if ('tokenId' in data) {
        const { contract, tokenId, collectionId } = data

        // getDetails(contract, tokenId, setDetails)
        // getCollection(collectionId, setCollection)
      }
      // Load data if provided
      if ('details' in data) {

        setCollection(collection)
      }
    }
  }, [data, open])

  // Set the token either from SWR or fetch
  let token: NonNullable<Details['tokens']>[0] = { token: undefined }

  const modalData = {
    collection: {
      name: collection?.collection?.name,
    },
    token: {
      contract: token?.token?.contract,
      id: token?.token?.tokenId,
      image: token?.token?.image,
      name: token?.token?.name,
      topBuyValue: token?.market?.topBid?.value,
      floorSellValue: token?.market?.floorAsk?.price,
    },
  }

  const handleError = (
    err: any
  ) => {
    setOpen(false)
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
      title: 'Could not cancel listing',
    })
  }

  const handleSuccess = () => {
    mutate && mutate()

    refreshData()
  }


  const execute = async ( maker: string) => {
    const id = tokenListing?.reservoirListing?.orderId
    if (!id) return;

    setWaitingTx(true)
    if (!signer) {
      throw 'Signer is missing'
    }
    if (!reservoirClient) {
      throw 'reservoirClient is not initialized'
    }


    await reservoirClient.actions.cancelOrder({
      id,
      signer,
      onProgress: (_event) => {},
    })
    .then(handleSuccess)
    .catch(handleError)
    setWaitingTx(false)
    setOpen(false)
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      {show && (
        <div>
          <SnagButton
            classType="Dialog"
            organization={organization}
            disabled={isInTheWrongNetwork}
            className="px-6 py-2 text-base"
          >
            Cancel Listing
          </SnagButton>
        </div>
      )}
      <Dialog.Portal>
        <Dialog.Overlay>
          <Dialog.Content style={{fontFamily: organization.font}} className="fixed inset-0 z-[1000] bg-[#000000b6]">
            <div className="fixed left-1/2 w-full -translate-x-1/2 transform">
              <div className="px-5 py-28 overflow-y-scroll h-screen">
                <div style={{ background: organization.backgroundCss, backgroundColor: organization.backgroundColorHex, borderColor: organization.secondaryOutlineColorHex || "#CFD8DC" }} className="mx-auto rounded-2xl border bg-white shadow-xl md:w-[600px]">
                  <div
                    style={{ borderColor: organization.secondaryOutlineColorHex || "#CFD8DC" }}
                    className="px-8 py-6 flex items-center justify-between border-b">
                    <div className="flex flex-row gap-3">
                      <Dialog.Title style={{ color: organization.primaryFontColorHex || "#000000" }} className="text-2xl font-semibold">
                        Are you sure?
                      </Dialog.Title>
                    </div>
                    <Dialog.Close className="p-1.5 dark:border-neutral-600 dark:text-white dark:ring-primary-900 dark:focus:ring-4">
                      <HiX style={{ color: organization.secondaryFontColorHex || "#959DA6" }} className="h-6 w-6" />
                    </Dialog.Close>
                  </div>
                  <div
                    style={{
                      color: organization.primaryFontColorHex || "#000000",
                    }}
                    className="p-8 text-md">
                    Cancelling your listing will remove them and requires a transaction to ensure that they will never be fulfilled.
                  </div>
                  <div
                    style={{ borderColor: organization.secondaryOutlineColorHex || "#CFD8DC" }}
                    className="px-8 py-6 flex flex-row-reverse	items-center justify-start gap-3 border-t">
                    
                    <SnagButton
                      classType="Link"
                      organization={organization}
                      disabled={waitingTx || isInTheWrongNetwork}
                      className="px-6 py-2 text-base"
                      isPrimary
                      onClick={() => {
                        if (!maker || !signer) {
                          dispatch({ type: 'CONNECT_WALLET', payload: true })
                          return
                        }
                        execute(maker)
                      }}
                    >
                      {waitingTx ? (
                        <div>
                          <CgSpinner className="h-6 w-28 animate-spin" />
                        </div>
                      ) : (
                        <div>Cancel Listing</div>
                      )}
                    </SnagButton>

                    <SnagButton
                      classType="Link"
                      organization={organization}
                      disabled={waitingTx || isInTheWrongNetwork}
                      className="px-6 py-2 text-base"
                      onClick={() => {
                        setOpen(false)
                      }}
                    >
                      Never mind
                    </SnagButton>
                  </div>
                </div>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default CancelListing
