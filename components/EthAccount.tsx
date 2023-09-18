import { truncateAddress, truncateEns } from 'lib/truncateText'
import { FC } from 'react'
import Avatar from './Avatar'
import { AiFillStar } from "react-icons/ai"
import { Organization } from "context/config"

type Props = {
  organization: Organization
  address: string | undefined
  ens?: {
    avatar: string | null | undefined
    name: string | null | undefined
  }
  title?: string
  side?: 'left' | 'right'
  hideIcon?: boolean
  largeText?: boolean
  ownAddress?: string | null
  singleLine?: boolean
}

const EthAccount: FC<Props> = ({
  organization,
  address,
  ens,
  title,
  side = 'right',
  hideIcon,
  largeText = false,
  ownAddress = null,
  singleLine = false,
}) => {
  const icon = !hideIcon && <Avatar size={largeText ? 40 : 28} address={address} avatar={ens?.avatar} />

  const isSelf = ownAddress && ownAddress.toLowerCase() === address?.toLowerCase()
  return (
    <div className="flex items-center gap-3">
      {side === 'left' && icon}
        <div className="flex flex-col">
          {title && (
            <div
              style={{ color: organization.primaryFontColorHex || "#000000" }}
              className="text-sm">
              {title}
            </div>
          )}
          {(!singleLine || !ens?.name) && (
            <div
              style={{
                color: organization.primaryFontColorHex || "#000000",
              }}
              className={
                `font-semibold block whitespace-nowrap dark:text-white ${largeText ? 'text-lg' : 'text-base'}`
              }
              title={address}
            >
              { isSelf ? (
                <div className="flex flex-row gap-1 items-center">
                  <div>You</div>
                  <AiFillStar style={{ fill: organization.primaryColorHex }} className="w-4 h-4" />
                </div>
                ) : truncateAddress(address || '')
              }
            </div>
          )}
          {ens?.name && (
            <div title={address} style={{
              color: singleLine ? (organization.primaryFontColorHex || "") : (organization.secondaryFontColorHex || "#959DA6")
            }} className={`${singleLine ? "text-base" : "text-sm"} font-semibold`}>
              {truncateEns(ens.name)}
            </div>
          )}
        </div>
      {side === 'right' && icon}
    </div>
  )
}

export default EthAccount
