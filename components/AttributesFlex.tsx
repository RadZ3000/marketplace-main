import { toggleOffAttributeValue, toggleOffUrlParam } from 'lib/url'
import { clearAllAttributeKeys } from 'lib/router'
import { useRouter } from 'next/router'
import React, { FC } from 'react'
import { HiX } from 'react-icons/hi'
import { Organization } from 'context/config'

type Attribute = {
  key: string
  value: string
}[]

type Props = {
  className: string
  organization: Organization
}

const AttributesFlex: FC<Props> = ({ organization, className }) => {
  const router = useRouter()

  const [filters, setFilters] = React.useState<Attribute>([])
  const [minPrice, setMinPrice] = React.useState<string>();
  const [maxPrice, setMaxPrice] = React.useState<string>();

  React.useEffect(() => {
    let filters = Object.keys({ ...router.query }).filter(
      (key) =>
        key.startsWith('attributes[') &&
        key.endsWith(']') &&
        router.query[key] !== ''
    )
    const temp: Attribute = []
    filters.forEach((key) => {
      const attr : string | string[] | undefined = router.query[key];
      if (attr === undefined) {
        return
      }
      else if (Array.isArray(attr)) {
        (attr as string[]).forEach((val:string) => {
          temp.push({
            key: key.slice(11, -1),
            value: val,
          })
        })
      } else {
        temp.push({
          key: key.slice(11, -1),
          value: attr,
        })
      }
    })
    setFilters(temp)
    setMinPrice(router.query["price[gte]"]?.toString())
    setMaxPrice(router.query["price[lte]"]?.toString())
  }, [router.query])

  if (filters.length === 0 && !minPrice && !maxPrice) return null

  return (
    <div className={className}>
      {minPrice && (
        <div
          style={{
            backgroundColor: organization.secondaryBackgroundColorHex || "#F8F9FA",
            borderColor: organization.secondaryOutlineColorHex || "#00000000",
            color: organization.primaryFontColorHex || "#000000",
          }}
          key="price[gte]"
          className="flex flex-row gap-2 text-sm border rounded-full px-4 py-3 h-fit"
        >
          <div>
            {`> ${minPrice} ETH`}
          </div>
          <button
            onClick={() => toggleOffUrlParam(router, "price[gte]")}
          >
            <HiX size={20} style={{ color: organization.secondaryFontColorHex || "#959DA6" }} />
          </button>
        </div>
      )}
      {maxPrice && (
        <div
          style={{
            backgroundColor: organization.secondaryBackgroundColorHex || "#F8F9FA",
            borderColor: organization.secondaryOutlineColorHex || "#00000000",
            color: organization.primaryFontColorHex || "#000000",
          }}
          key="price[gte]"
          className="flex flex-row gap-2 text-sm border rounded-full px-4 py-3 h-fit"
        >
          <div>
            {`< ${maxPrice} ETH`}
          </div>
          <button
            onClick={() => toggleOffUrlParam(router, "price[lte]")}
          >
            <HiX size={20} style={{ color: organization.secondaryFontColorHex || "#959DA6" }} />
          </button>
        </div>
      )}
      {filters.map(({ key, value }) => (
        <div
          style={{
            backgroundColor: organization.secondaryBackgroundColorHex || "#F8F9FA",
            borderColor: organization.secondaryOutlineColorHex || "#00000000",
            color: organization.primaryFontColorHex || "#000000",
          }}
          key={key}
          className="flex flex-row gap-2 text-sm border rounded-full px-4 py-3 h-fit"
        >
          <div>
            {value}
          </div>
          <button
            onClick={() => toggleOffAttributeValue(router, key, value)}
          >
            <HiX size={20} style={{ color: organization.secondaryFontColorHex || "#959DA6" }} />
          </button>
        </div>
      ))} 
      <div
        style={{ color: organization.primaryColorHex }}
        className="px-4 py-3 font-semibold text-sm cursor-pointer"
        onClick={() => {
          clearAllAttributeKeys(router)
        }}
      >
        Clear All
      </div>
    </div>
  )
}

export default AttributesFlex
