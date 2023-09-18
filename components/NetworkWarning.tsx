import React from 'react'
import { useNetwork, useSigner } from 'wagmi'
import { useOrganizationContext } from 'context/OrganizationProvider'
import { getChainId } from 'lib/chain'

function NetworkWarning() {
  const { chain: activeChain } = useNetwork()
  const { data: signer } = useSigner()
  const { organization } = useOrganizationContext()
  const chainId = getChainId(organization)

  if (chainId && signer && activeChain?.id !== +chainId) {
    return (
      <div className="flex w-screen items-center justify-center bg-yellow-200 p-4 text-black">
        <span>
          You are connected to the wrong network. Please, switch to{' '}
          <strong>
            {+chainId === 1 ? 'Ethereum Mainnet' : 'Goerli Testnet'}
          </strong>
        </span>
      </div>
    )
  }
  return null
}

export default NetworkWarning
