import * as Accordion from '@radix-ui/react-accordion'
import { clearAllAttributeKeys } from 'lib/router'
import { useRouter } from 'next/router'
import { FC, useState, useEffect } from 'react'
import AttributeSelector from './filter/AttributeSelector'
import { SWRResponse } from 'swr'
import { SWRInfiniteResponse } from 'swr/infinite/dist/infinite'
import Filters from 'components/Filters'
import { FiChevronDown } from 'react-icons/fi'
import { paths } from '@reservoir0x/reservoir-kit-client'
import { toggleOffUrlParam, toggleOnUrlParam, updateUrlParam } from 'lib/url'
import { Organization } from "context/config"

type Props = {
  attributes: SWRResponse<
    paths['/collections/{collection}/attributes/all/v1']['get']['responses']['200']['schema']
  >
  setTokensSize: SWRInfiniteResponse['setSize']
  organization: Organization
}

const Sidebar: FC<Props> = ({ attributes, setTokensSize, organization }) => {
  const router = useRouter()

  return (
    <Accordion.Root
      type="multiple"
      style={{
        borderColor: organization.secondaryOutlineColorHex || "#CFD8DC",
        backgroundColor: organization.secondaryBackgroundColorHex || "#FFFFFF00",
        borderRadius: organization.borderRadius || "12px",
      }}
      className="col-span-4 md:col-span-3 border h-fit hidden md:block"
    >
      <div style={{
        borderColor: organization.secondaryOutlineColorHex || "#CFD8DC",
        color: organization.primaryFontColorHex || "#000000",
      }} className="flex align-middle overflow-hidden w-full border-b-[1px] p-5">
        <div className="font-semibold text-lg text-left transition dark:border-neutral-600 dark:text-white">
          Filters
        </div>
        {/* <div
          style={{ color: organization.secondaryFontColorHex || "#959DA6" }}
          className="flex items-end cursor-pointer ml-2 mb-[3px] text-sm font-semibold capitalize transition dark:text-white"
          onClick={() => {
            clearAllAttributeKeys(router)
          }}
        >
          Clear All
        </div> */}
      </div>
      <Filters
        attributes={attributes}
        setTokensSize={setTokensSize}
        organization={organization}
      />
    </Accordion.Root>
  )
}

export default Sidebar
