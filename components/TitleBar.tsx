import { FC } from 'react'
import Link from 'next/link'
import ListTokenModal from 'components/ListTokenModal'
import ConnectWallet from './ConnectWallet'
import { FaDiscord, FaTwitter, FaFacebook, FaInstagram } from 'react-icons/fa'
import { useAccount, useSigner, useNetwork } from 'wagmi'
import { setToast } from './token/setToast'
import { Organization } from 'context/config'
import { Token } from 'lib/types'
import { getChainId } from 'lib/chain'

type Props = {
  collectionId: string | undefined
  organization: Organization
  editProfileButton?: boolean
  refreshData: () => any
}

const TitleBar: FC<Props> = ({ collectionId, organization, refreshData, editProfileButton = false }) => {
  const account = useAccount()
  const { data: signer } = useSigner()
  const { chain: activeChain } = useNetwork()
  const chainId = getChainId(organization)
  
  if (!chainId) return null

  const isInTheWrongNetwork = Boolean(signer && activeChain?.id !== +chainId)

  return (
    <div
      style={{ borderColor: organization.secondaryOutlineColorHex || "#CFD8DC", backgroundColor: organization.secondaryBackgroundColorHex || "#FFFFFF00" }}
      className="flex flex-row justify-between items-center flex-wrap gap-3 items-center col-span-full px-4 sm:px-10 py-4 sm:py-5 border-b-[1px]">

      <div className="flex flex-row justify-between shrink-0 items-center gap-6 hidden md:inline-flex items-center flex-wrap">
        <Link href={`/collections/${organization.contractId}`}>
          <button
            className="flex flex-row items-center gap-6"
          >
            {organization.titleBarBanner && (
              <img
                className="h-8"
                src={organization.titleBarBanner}
              />
            )}
            {!organization.titleBarBanner && (<img
              className="w-8 h-8 rounded-full"
              src={organization.aggregateIcon || organization.listingIcon}
            />)}
            <div
              style={{
                color: organization.primaryFontColorHex || "#000000",
              }}
              className="flex flex-row gap-2 font-semibold items-center text-base"
            >
              Marketplace
              {organization.betaTag && (
                <div
                  style={{
                    borderColor: organization.primaryColorHex,
                    backgroundColor: organization.secondaryButtonHoverColorHex || "#F8F9FA"
                  }}
                  className="font-semibold text-xs rounded px-2 py-1 w-fit border-2"
                >
                  BETA
                </div>
              )}
            </div>
          </button>
        </Link>
        {/* <a
          target="_blank"
          rel="noreferrer"
          href={"holderstats.url"}
        >
          <button
            className="items-center"
          >
            Holders Stats
          </button>
        </a> */}
        <div
          style={{
            borderColor: organization.secondaryOutlineColorHex || "#CFD8DC",
          }}
          className="h-5 border-l-[1px]">
        </div>
        <a
          target="_blank"
          rel="noreferrer"
          href={organization.homeUrl}
        >
          <button className="align-middle">
            {organization.websiteIcon ? (
              <img
                className="h-4 w-4"
                src={organization.websiteIcon}
              />
            ) : (
              <div
                style={{
                  color: organization.primaryFontColorHex || "#000000",
                }}
              >
                {organization.groupName || organization.name}
              </div>
            )}
          </button>
        </a>
        <div
          style={{ borderColor: organization.secondaryOutlineColorHex || "#CFD8DC" }}
          className="h-5 border-l-[1px]"></div>
        <div
          style={{
            color: organization.primaryFontColorHex || "#000000",
          }}
          className="flex flex-row gap-5 items-center"
        >
          {organization.discordUrl && (
            <a
              target="_blank"
              rel="noreferrer"
              className="cursor-pointer"
              href={organization.discordUrl}
            >
              <FaDiscord className="h-4 w-4" />
            </a>
          )}
          {organization.twitterUrl && (
            <a
              target="_blank"
              rel="noreferrer"
              className="cursor-pointer"
              href={organization.twitterUrl}
            >
              <FaTwitter className="h-4 w-4" />
            </a>
          )}
          {organization.facebookUrl && (
            <a
              target="_blank"
              rel="noreferrer"
              className="cursor-pointer"
              href={organization.facebookUrl}
            >
              <FaFacebook className="h-4 w-4" />
            </a>
          )}
          {organization.instagramUrl && (
            <a
              target="_blank"
              rel="noreferrer"
              className="cursor-pointer"
              href={organization.instagramUrl}
            >
              <FaInstagram className="h-4 w-4" />
            </a>
          )}
        </div>
      </div>

      <div className="flex flex-row flex-wrap items-stretch gap-3">
        {editProfileButton && (
          <button
            style={{ borderColor: organization.secondaryOutlineColorHex || "#CFD8DC" }}
            className="whitespace-nowrap border px-6 py-2 rounded-full font-semibold text-base text-black">
            Edit Profile
          </button>
        )}
        {collectionId && account && (
          <ListTokenModal
            collectionId={collectionId}
            isInTheWrongNetwork={isInTheWrongNetwork}
            maker={account?.address}
            setToast={setToast}
            signer={signer}
            organization={organization}
            show={Boolean(collectionId)}
            refreshData={refreshData}
          />
        )}
        <ConnectWallet
          organization={organization}
        />
      </div>
    </div>
  )
}

export default TitleBar
