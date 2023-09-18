import { FC, useState } from 'react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { FiChevronDown } from 'react-icons/fi'
import Link from 'next/link'
import useCollectionStats from 'hooks/useCollectionStats'
import { useRouter } from 'next/router'
import FormatPrice from './FormatPrice'
import { Organization, Collection } from 'context/config'
import SnagButton from "components/SnagButton"

type ItemProps = {
  organization: Organization
  collection: Collection
  onClick: () => void
}

const CommunityDropdownItem: FC<ItemProps> = ({ organization, collection, onClick }) => {
  const router = useRouter()

  const [hover, setHover] = useState<boolean>(false)

  // this is not very efficient, makes network call everytime dropdown is opened
  const stats = useCollectionStats(router, collection.contractId)

  const style = {
    borderColor: organization.secondaryOutlineColorHex || "#CFD8DC",
    backgroundColor: hover ? organization.secondaryButtonHoverColorHex || "#F8F9FA" : "",
  }

  return (
    <DropdownMenu.Item
      key={collection.contractId}
      onMouseEnter={() => {
        setHover(true)
      }}
      onMouseLeave={() => {
        setHover(false)
      }}
      style={style}
      className={`overflow-hidden rounded-none border-b p-0 outline-none first:rounded-t-${organization.borderRadius || "12px"} last:rounded-b-${organization.borderRadius || "12px"} last:border-b-0`}
    >
      <div className="flex flex-row items-center">
        <div
          style={{
            backgroundColor: collection.contractId === organization.contractId ? organization.primaryColorHex : "#00000000"
          }}
          className="w-1 h-11"
        />
        <Link href={`/collections/${collection.contractId}`}>
          <a
            onClick={onClick}
            className="flex items-center gap-4 rounded-none pl-5 pr-12 py-4 justify-between w-full"
          >
            <div className="flex flex-row items-center gap-4">
              <img
                src={collection.listingIcon}
                alt={`${collection.name} Collection Image`}
                className="h-10 w-10 shrink-0 overflow-hidden rounded-full"
              />
              <p
                style={{ color: organization.primaryFontColorHex || "#000000" }}
                className="truncate text-lg">
                {collection.name}
              </p>
            </div>

            <div className="flex flex-row gap-2">
              <FormatPrice amount={stats?.data?.stats?.market?.floorAsk?.price} organization={organization} />
            </div>
          </a>
        </Link>
      </div>
    </DropdownMenu.Item>
  )
}

type Props = {
  organization: Organization
}
const CommunityDropdown: FC<Props> = ({ organization }) => {
  const [open, setOpen] = useState(false)

  const includeBoxShadow = Boolean(organization.primaryButtonBoxShadow)
  const boxShadow = organization.primaryButtonBoxShadow || 0
  const borderColor = (organization.primaryOutlineColorHex || "#959DA6")
  const style = {
    borderColor,
    boxShadow: includeBoxShadow ? `${boxShadow * 2}px ${boxShadow * 2}px 0px 0px ${borderColor}` : "",
    width: "calc(100vw - 24px)",
    borderRadius: organization.borderRadius || "12px",
    background: organization.backgroundCss,
    backgroundColor: organization.secondaryBackgroundColorHex || "#FFFFFF",
    fontFamily: organization.font
  }

  return (
    <DropdownMenu.Root open={open} onOpenChange={setOpen}>
      <SnagButton
          classType="DropdownMenu"
          organization={organization}
          className="px-4 py-[6px] font-semibold text-sm w-fit"
        >
          <div className="flex flex-row gap-1 items-center">
            <div className="font-semibold text-sm whitespace-nowrap">
              Change Collection
            </div>
            <FiChevronDown
              size={16}
              style={{ color: organization.secondaryFontColorHex || "#959DA6" }}
              className={`inline transition-transform ${
                open ? 'rotate-180' : ''
              }`}
            />
          </div>
        </SnagButton>

      <DropdownMenu.Content
        sideOffset={15}
        align="start"
        avoidCollisions={true}
        collisionPadding={12}
        style={style}
        className="max-w-xl z-50 max-h-[330px] overflow-y-scroll overscroll-y-auto rounded-2xl border shadow-md radix-side-bottom:animate-slide-down bg-white"
      >
        {organization.collections.map((collection) => {
            return (
              <CommunityDropdownItem
                key={collection.contractId}
                organization={organization}
                collection={collection}
                onClick={() => {
                  setOpen(false)
                }}
              />
            )
          })}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  )
}

export default CommunityDropdown
