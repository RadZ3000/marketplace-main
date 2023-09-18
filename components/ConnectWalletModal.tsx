import React, { FC, useContext, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { HiX } from 'react-icons/hi'
import { useConnect } from 'wagmi'
import { FiChevronRight } from 'react-icons/fi'
import { GlobalContext } from 'context/GlobalState'
import { Organization } from "context/config"
import SnagButton from "components/SnagButton"

const ConnectWalletModal: FC<{
  organization: Organization
}> = ({
  organization,
}) => {
  const {
    state: {
      connectWallet: { open },
    },
    dispatch,
  } = useContext(GlobalContext)

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(state) =>
        dispatch({ type: 'CONNECT_WALLET', payload: state })
      }
    >
      <SnagButton
        classType="Dialog"
        organization={organization}
        className="px-6 py-2"
        isPrimary
      >
        Connect Wallet
      </SnagButton>
      <Dialog.Portal>
        <Dialog.Overlay>
          <Dialog.Content style={{fontFamily: organization.font}} className="fixed inset-0 z-[1000] bg-[#000000b6]">
            <div className="fixed left-1/2 w-full -translate-x-1/2 transform">
              <div className="px-5 py-28 overflow-y-scroll h-screen">
                <div style={{ background: organization.backgroundCss, backgroundColor: organization.backgroundColorHex || "#FFFFFF", borderColor: organization.secondaryOutlineColorHex || "#CFD8DC" }} className="mx-auto rounded-2xl border shadow-xl md:w-[600px]">
                  <div style={{
                      borderColor: organization.secondaryOutlineColorHex || "#CFD8DC",
                      color: organization.primaryFontColorHex || "#000000",
                    }} className="px-8 py-6 flex items-center justify-between border-b">
                    <Dialog.Title style={{ color: organization.primaryFontColorHex || "#000000" }} className="text-2xl	font-semibold">
                      Connect Wallet
                    </Dialog.Title>
                    <Dialog.Close className="p-1.5">
                      <HiX style={{ color: organization.secondaryFontColorHex || "#959DA6" }} className="h-6 w-6" />
                    </Dialog.Close>
                  </div>
                  <div className="my-6 mx-8">
                    <div
                      style={{
                        color: organization.primaryFontColorHex || "#000000",
                      }}
                      className="text-base mb-4">
                      Choose your preferred wallet:
                    </div>
                    <Wallets organization={organization} />
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

export default ConnectWalletModal

const wallets: { [key: string]: any } = {
  // Naming injected as MetaMask is not a mistake
  // This is how it was requested to be labeled
  injected: {
    icon: '/icons/MetaMask.svg',
    name: 'MetaMask',
    href: 'https://metamask.io/download/',
  },
  walletConnect: {
    icon: '/icons/WalletConnect.svg',
    name: 'Wallet Connect',
    href: 'https://docs.walletconnect.com/quick-start/dapps/client',
  },
  coinbaseWallet: {
    icon: '/icons/Coinbase.svg',
    name: 'Coinbase Wallet',
    href: 'https://docs.cloud.coinbase.com/wallet-sdk/docs/installing',
  },
}

const ConnectorButton: FC<{
  organization: Organization
  connector: any
  connect: any
}> = ({
  organization,
  connector,
  connect,
}) => {
  const [hover, setHover] = useState(false)

  return (
    <button
      style={{
        color: organization.primaryFontColorHex || "#000000",
        borderColor: organization.secondaryOutlineColorHex || "#CFD8DC",
        backgroundColor: hover ? organization.secondaryButtonHoverColorHex || "#F8F9FA" : ""
      }}
      className="h-16 py-3 px-5 rounded-xl border"
      disabled={!connector.ready}
      key={connector.id}
      onClick={() => connect({ connector: connector })}
      onMouseEnter={() => {
        setHover(true)
      }}
      onMouseLeave={() => {
        setHover(false)
      }}
    >
      <a
        target="_blank"
        rel="noreferrer noopener"
        className="flex items-center justify-between dark:text-white"
      >
        <div className="flex items-center gap-4">
          {Boolean(wallets[connector.id]?.icon) && (
            <img src={wallets[connector.id]?.icon} alt="" className="w-8" />
          )}
          <div>
            {wallets[connector.id]?.name}
            {!connector.ready && ' (unsupported)'}
          </div>
        </div>
        <FiChevronRight style={{ stroke: organization.primaryOutlineColorHex }} className="h-6 w-6" />
      </a>
    </button>
  )
}

export const Wallets: FC<{organization: Organization}> = ({organization}) => {
  const { connect, connectors, error } = useConnect()

  return (
    <div className="grid gap-4">
      {connectors.map((connector, idx) => (
        <ConnectorButton
          key={idx}
          organization={organization}
          connector={connector}
          connect={connect}
        />
      ))}

      {error && <div>{error.message}</div>}
    </div>
  )
}
