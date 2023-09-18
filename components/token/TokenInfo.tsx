import useDetails from 'hooks/useDetails'
import { truncateAddress } from 'lib/truncateText'
import React, { FC } from 'react'
import { FiExternalLink } from 'react-icons/fi'
import { Organization } from 'context/config'
import { Token } from 'lib/types'

type Props = {
  tokenListing?: Token | null | undefined,
  organization: Organization,
}

const TokenInfo: FC<Props> = ({ organization, tokenListing }) => {
  const { hidePoweredBySnag } = organization
  return (
    <div className='justify-between flex flex-row flex-wrap border-t py-10 gap-5 dark:border-neutral-600 dark:bg-black'>
      <div
        style={{ borderColor: organization.secondaryOutlineColorHex || "#CFD8DC" }}
        className="flex flex-row gap-5 whitespace-nowrap flex-wrap ">
        {tokenListing && (
          <div className="flex items-center justify-between gap-1">
            <div style={{ color: organization.secondaryFontColorHex || "#959DA6" }}>Token ID:</div>
            <div
              style={{
                color: organization.primaryFontColorHex || "#000000",
              }}
              className="font-semibold dark:text-white">
              {tokenListing.tokenId}
            </div>
          </div>
        )}
        <div className="flex items-center justify-between">
          <div style={{ color: organization.secondaryFontColorHex || "#959DA6" }}>
            Contract Address:
          </div>
          <div>
            <a
              style={{
                color: organization.primaryFontColorHex || "#000000",
              }}
              className="flex items-center gap-2 font-semibold ml-1 dark:text-white"
              target="_blank"
              rel="noopener noreferrer"
              href={`https://${organization.testnetNetwork ? 'goerli.' : ''}etherscan.io/address/${organization.contractId}`}
            >
              {truncateAddress(organization.contractId)}
              <FiExternalLink className="h-4 w-4 mb-1" />
            </a>
          </div>
        </div>
        {tokenListing && (
          <div className="flex items-center justify-between gap-1">
            <div style={{ color: organization.secondaryFontColorHex || "#959DA6" }}>Token Standard:</div>
            <div
              style={{
                color: organization.primaryFontColorHex || "#000000",
              }}
              className="font-semibold dark:text-white uppercase dark:text-white">
              {tokenListing.kind}
            </div>
          </div>
        )}
        <div className="flex items-center justify-between gap-1">
          <div style={{ color: organization.secondaryFontColorHex || "#959DA6" }}>Creator Royalties:</div>
          <div
            style={{
              color: organization.primaryFontColorHex || "#000000",
            }}
            className="font-semibold dark:text-white uppercase dark:text-white">
            {(organization.combineFeesInUI ? (organization.royaltyFee + organization.serviceFee) : (organization.royaltyFee)) * 100}%
          </div>
        </div>
        {!organization.combineFeesInUI && (<div className="flex items-center justify-between">
          <div
            style={{ backgroundColor: organization.primaryColorHex }}
            className="text-white rounded font-semibold text-sm px-2 py-1 dark:text-white"
          >
            {organization.serviceFee > 0 && 'only'} {organization.serviceFee * 100}% service fee
          </div>
        </div>)}
      </div>
      {!hidePoweredBySnag && (
        <div>
          <div style={{color: organization.primaryFontColorHex || "#000000"}} className='flex flex-row'>
            <div>Powered by&nbsp;</div>
            <strong>Snag Solutions</strong>
          </div>
        </div>
      )}
    </div>
  )
}

export default TokenInfo
