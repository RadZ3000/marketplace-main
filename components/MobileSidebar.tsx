import * as Accordion from '@radix-ui/react-accordion'
import * as Dialog from '@radix-ui/react-dialog'
import { useRouter } from 'next/router'
import { FC, useState } from 'react'
import { SWRResponse } from 'swr'
import { SWRInfiniteResponse } from 'swr/infinite/dist/infinite'
import { paths } from '@reservoir0x/reservoir-kit-client'
import Filters from 'components/Filters'
import { Organization } from "context/config"
import { CgSortAz } from 'react-icons/cg'
import SnagButton from "components/SnagButton"

type Props = {
  attributes: SWRResponse<
    paths['/collections/{collection}/attributes/all/v1']['get']['responses']['200']['schema']
  >
  setTokensSize: SWRInfiniteResponse['setSize']
  organization: Organization
}

const MobileSidebar: FC<Props> = ({ attributes, setTokensSize, organization }) => {
  const router = useRouter()

  const [open, setOpen] = useState(false)

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <SnagButton
        classType="Dialog"
        organization={organization}
        className="md:hidden w-full mt-2 mb-1 px-6 py-2 text-base rounded"
      >
        <div className="flex flex-row items-center justify-center gap-2">
          <CgSortAz size={24} />
          Filters
        </div>
      </SnagButton>
      <Dialog.Portal>
        <Dialog.Overlay>
          <Dialog.Content
            style={{
              fontFamily: organization.font
            }}
            className="fixed inset-0 z-[1000] bg-[#000000b6]"
          >
            <div className="fixed bottom-0 w-full">
              <div>
                <div style={{
                  background: organization.backgroundCss,
                  backgroundColor: organization.secondaryBackgroundColorHex || "#FFFFFF",
                }} className="mx-auto rounded-t-2xl bg-white shadow-xl md:w-[600px]">
                  <Accordion.Root
                    type="multiple"
                  >
                  <div style={{
                    borderColor: organization.secondaryOutlineColorHex || "#CFD8DC"
                  }} className="flex flex-row justify-between items-center overflow-hidden w-full border-b-[1px] p-5">
                    <div className="flex flex-row gap-2 items-center">
                      <div
                        style={{
                          color: organization.primaryFontColorHex || "#000000",
                        }}
                        className="font-semibold text-lg transition">
                        Filters
                      </div>
                      {/* <div
                      style={{ color: organization.secondaryFontColorHex || "#959DA6" }}
                      className="cursor-pointer text-sm font-semibold capitalize transition"
                      onClick={() => {
                          clearAllAttributeKeys(router)
                      }}
                      >
                        Clear All
                      </div> */}
                    </div>
                    <div
                      style={{ color: organization.primaryFontColorHex || "#000000" }}
                      className="cursor-pointer transition place-self-end text-base font-semibold"
                      onClick={() => {
                        setOpen(false)
                      }}
                    >
                      Done
                    </div>
                  </div>
                  <div className="max-h-[500px] overflow-y-auto">
                  <Filters
                    attributes={attributes}
                    setTokensSize={setTokensSize}
                    organization={organization}
                  />
                  </div>
                  </Accordion.Root>
                </div>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default MobileSidebar
