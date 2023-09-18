import {  toggleOffAttributeValue, toggleOnAttribute } from 'lib/url'
import { useRouter } from 'next/router'
import { toggleOffItem } from 'lib/router'
import { FC, useState } from 'react'
import { SWRInfiniteResponse } from 'swr/infinite/dist/infinite'
import { MdCheckBox, MdCheckBoxOutlineBlank } from "react-icons/md";
import { Organization } from "context/config"

type Props = {
  organization: Organization
  attribute: string
  value: string
  count: string
  setTokensSize: SWRInfiniteResponse['setSize']
}

const AttributeButton: FC<Props> = ({
  organization,
  attribute,
  value,
  count,
  setTokensSize,
}) => {
  const router = useRouter()
  const [hover, setHover] = useState(false)
  const checked = router.query[`attributes[${attribute}]`] && (router.query[`attributes[${attribute}]`]?.includes(value));
  return (
    <button
      onClick={() => {
        router.query?.attribute_key && toggleOffItem(router, 'attribute_key')
        // Update the URL queries
        if (!checked) {
          toggleOffItem(router, 'attribute_key')
          toggleOnAttribute(router, attribute, value)
        } else {
          toggleOffAttributeValue(router, attribute, value)
        }
        setTokensSize(0)
      }}
      onMouseEnter={() => {
        setHover(true)
      }}
      onMouseLeave={() => {
        setHover(false)
      }}
      style={{
        backgroundColor: hover || checked ? organization.secondaryButtonHoverColorHex || "#F8F9FA" : ""
      }}
      className={
        "flex w-full h-11 items-center justify-between gap-3 px-5 py-3 text-left"
      }
    >
      <span
        style={{
          color: organization.primaryFontColorHex || "#000000"
        }}
        className="font-normal dark:text-white whitespace-nowrap overflow-hidden text-ellipsis">{value}</span>
      <div className="flex items-center gap-2">
        <span style={{
          color: organization.secondaryFontColorHex || "#959DA6",
        }} className="font-normal">{count}</span>
        { checked
          ? (<MdCheckBox style={{ fill: organization.primaryColorHex }} className="h-5 w-5" />)
          : (<MdCheckBoxOutlineBlank style={{ fill: organization.secondaryOutlineColorHex || "#CFD8DC" }}className="h-5 w-5" />)
        }
      </div>
    </button>
  )
}

export default AttributeButton
