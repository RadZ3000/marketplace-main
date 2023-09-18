import { FC, useContext, useState } from 'react'
import {
  useAccount,
  useBalance,
  useConnect,
  useDisconnect,
  useEnsAvatar,
  useEnsName,
} from 'wagmi'
import EthAccount from './EthAccount'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import Link from 'next/link'
import { HiOutlineLogin, HiChevronDown, HiOutlineBookmark, HiOutlinePencil } from 'react-icons/hi'
import FormatPrice from './FormatPrice'
import ConnectWalletModal from './ConnectWalletModal'
import { GlobalContext } from 'context/GlobalState'
import { Organization } from "context/config"
import SnagButton from "components/SnagButton"
import { BsGrid } from 'react-icons/bs';

const DARK_MODE = process.env.NEXT_PUBLIC_DARK_MODE

type ConnectWalletProps = {
  organization: Organization
}

const ConnectWallet: FC<ConnectWalletProps> = ({
  organization,
}) => {
  const account = useAccount()
  const [hoverItems, setHoverItems] = useState<boolean>(false)
  const [hoverDisconnect, setHoverDisconnect] = useState<boolean>(false)  
  const { data: ensAvatar } = useEnsAvatar({ addressOrName: account?.address })
  const { data: ensName } = useEnsName({ address: account?.address })
  const { connectors } = useConnect()
  const { disconnect } = useDisconnect()
  const wallet = connectors[0]
  const { dispatch } = useContext(GlobalContext)

  if (account.isConnecting) return null

  if (!account.isConnected) return <ConnectWalletModal organization={organization} />

  const includeBoxShadow = Boolean(organization.primaryButtonBoxShadow)
  const boxShadow = organization.primaryButtonBoxShadow || 0
  const borderColor = (organization.primaryOutlineColorHex || "#959DA6")
  const style = {
    borderColor,
    boxShadow: includeBoxShadow ? `${boxShadow * 2}px ${boxShadow * 2}px 0px 0px ${borderColor}` : "",
    borderRadius: organization.borderRadius || "12px",
    background: organization.backgroundCss,
    backgroundColor: organization.secondaryBackgroundColorHex || "#FFFFFF",
    fontFamily: organization.font
  }

  return (
    <DropdownMenu.Root>
      <SnagButton
        classType="DropdownMenu"
        organization={organization}
        className="p-2 normal-case"
      >
        <div className="flex flex-row gap-4 items-center">
          <EthAccount
            organization={organization}
            side="left"
            address={account.address?.toLowerCase()}
            ens={{
              avatar: ensAvatar,
              name: ensName,
            }}
            singleLine
          />
          <HiChevronDown style={{
            color: organization.secondaryFontColorHex || "#959DA6"
          }} className="w-4 h-4 mr-2" />
        </div>
      </SnagButton>

      <DropdownMenu.Content align="end" sideOffset={6} className="z-10" >
        <div
          style={style}
          className="w-64 border-[1px] rounded-xl bg-white shadow-md"
        >
          <div
            style={{ borderColor: organization.secondaryOutlineColorHex || "#CFD8DC" }}
            className="p-5 border-b">
            <EthAccount
              organization={organization}
              side="left"
              address={account.address?.toLowerCase()}
              ens={{
                avatar: ensAvatar,
                name: ensName,
              }}
              largeText
            />
            <div className="group flex mt-5 items-center gap-2">
              <span style={{
                color: organization.secondaryFontColorHex || "#959DA6"
              }} className="uppercase font-semibold text-xs">your balance </span>
              <span className="text-sm">
                {account.address && <Balance address={account.address} organization={organization} />}
              </span>
            </div>
          </div>
          <Link href={`/addresses/${account.address}/collections/${organization.contractId}`}>
            <DropdownMenu.Item
              onMouseEnter={() => {
                setHoverItems(true)
              }}
              onMouseLeave={() => {
                setHoverItems(false)
              }}
              asChild
            >
              <a
                style={{
                  borderColor: organization.secondaryOutlineColorHex || "#CFD8DC",
                  backgroundColor: hoverItems ? organization.secondaryButtonHoverColorHex || "#F8F9FA" : "",
                }}
                className="group focus-visible:outline-0 flex flex-row gap-3 w-full cursor-pointer items-center justify-left p-5 border-b">
                <BsGrid
                  style={{
                    color: organization.primaryFontColorHex || "#000000",
                  }}
                  size={16}
                />
                <div
                  style={{
                    color: organization.primaryFontColorHex || "#000000",
                  }}
                  className="text-sm">
                  My Items
                </div>
              </a>
            </DropdownMenu.Item>
          </Link>
          {/* <Link href={`/addresses/${account.address}/collections/${organization.contractId}`}>
            <DropdownMenu.Item asChild>
              <a className="group focus-visible:outline-0 flex flex-row gap-3 w-full cursor-pointer items-center justify-left rounded p-5 border-b">
                <HiOutlineBookmark size={24} />
                <div>
                  Saved For Later
                </div>
              </a>
            </DropdownMenu.Item>
          </Link>
          <Link href={`/addresses/${account.address}/collections/${organization.contractId}`}>
            <DropdownMenu.Item asChild>
              <a className="group focus-visible:outline-0 flex flex-row gap-3 w-full cursor-pointer items-center justify-left rounded p-5 border-b">
                <HiOutlinePencil size={24} />
                <div>
                  Edit Profile
                </div>
              </a>
            </DropdownMenu.Item>
          </Link> */}
          <DropdownMenu.Item
            onMouseEnter={() => {
              setHoverDisconnect(true)
            }}
            onMouseLeave={() => {
              setHoverDisconnect(false)
            }}
            asChild
          >
            <a
              onClick={() => {
                dispatch({ type: 'CONNECT_WALLET', payload: false })
                disconnect()
              }}
              style={{
                backgroundColor: hoverDisconnect ? organization.secondaryButtonHoverColorHex || "#F8F9FA" : "",
                borderBottomLeftRadius: organization.borderRadius || "12px",
                borderBottomRightRadius: organization.borderRadius || "12px",
              }}
              className="group focus-visible:outline-0 flex flex-row gap-3 w-full cursor-pointer items-center justify-left p-5"
            >
              <HiOutlineLogin
                style={{
                  color: organization.primaryFontColorHex || "#000000",
                }}
                size={16}
              />
              <div
                style={{
                  color: organization.primaryFontColorHex || "#000000",
                }}
                className="text-sm">
                Disconnect
              </div>
            </a>
          </DropdownMenu.Item>
        </div>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  )
}

export default ConnectWallet

type Props = {
  address: string
  organization: Organization
}

export const Balance: FC<Props> = ({ address, organization }) => {
  const { data: balance } = useBalance({ addressOrName: address })
  return <FormatPrice amount={balance?.value} organization={organization} />
}
