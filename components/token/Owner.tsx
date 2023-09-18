import EthAccount from 'components/EthAccount'
import useDetails from 'hooks/useDetails'
import Link from 'next/link'
import { FC, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import * as Tooltip from '@radix-ui/react-tooltip'
import { FiAlertCircle, FiRefreshCcw, FiShare2, FiHeart } from 'react-icons/fi'
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai"
import { setToast } from './setToast'
import { useAccount } from "wagmi"
import useWalletTokenActivity from 'hooks/useWalletTokenActivity'
import { Organization } from "context/config"
import SnagButton from "components/SnagButton"
import { Token } from 'lib/types'

const PROXY_API_BASE = process.env.NEXT_PUBLIC_PROXY_API_BASE

type Props = {
  collectionId: string,
  tokenId: string,
  bannedOnOpenSea: boolean
  organization: Organization
  tokenListing: Token
}

const Owner: FC<Props> = ({ organization, collectionId, tokenId, bannedOnOpenSea, tokenListing }) => {
  const router = useRouter()

  const [refreshLoading, setRefreshLoading] = useState(false)
  const [updatingLike, setUpdatingLike] = useState(false)

  const account = useAccount()

  const { data: walletTokenActivity, mutate: mutateWalletTokenActivity } = useWalletTokenActivity(
    collectionId,
    tokenId,
    account?.address
  )

  async function refreshToken(token: string | undefined) {
    function handleError(message?: string) {
      setToast({
        kind: 'error',
        message: message || 'Request to refresh this token was rejected.',
        title: 'Refresh token failed',
      })

      setRefreshLoading(false)
    }

    try {
      if (!token) throw new Error('No token')

      const data = {
        token,
      }

      const pathname = `${PROXY_API_BASE}/tokens/refresh/v1`

      setRefreshLoading(true)

      const res = await fetch(pathname, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const json = await res.json()
        handleError(json?.message)
        return
      }

      setToast({
        kind: 'success',
        message: 'Request to refresh this token was accepted.',
        title: 'Refresh token',
      })
    } catch (err) {
      handleError()
      console.error(err)
      return
    }

    setRefreshLoading(false)
  }

  useEffect(() => {
    const updateView = async () => {
      await fetch('/api/wallet_token_activities', {
        method: 'POST',
        body: JSON.stringify({
          collectionId: collectionId.toLowerCase(),
          tokenId: tokenId.toLowerCase(),
          walletAddress: account?.address?.toLowerCase(),
          view: true,
        }),
        headers: { 'Content-Type': 'application/json' },
      })
    }

    if (account?.address) {
      updateView()
    }
  }, [account?.address])

  async function updateLike(like: boolean) {
    if (!account?.address) return;
  
    setUpdatingLike(true)
    await fetch('/api/wallet_token_activities', {
      method: 'POST',
      body: JSON.stringify({
        collectionId: collectionId.toLowerCase(),
        tokenId: tokenId.toLowerCase(),
        walletAddress: account?.address?.toLowerCase(),
        like,
      }),
      headers: { 'Content-Type': 'application/json' },
    })

    setUpdatingLike(false)
    mutateWalletTokenActivity && mutateWalletTokenActivity()
  }

  const owner = tokenListing?.ownerAddress
  return (
    <div className="col-span-full md:col-span-4 lg:col-span-5 lg:col-start-2">
      <article className="col-span-full bg-transparent dark:border-neutral-600">
        <div className="text-3xl overflow-visible font-semibold mb-6 flex flex-row justify-between items-center gap-4 overflow-hidden text-3xl">
          <div className="flex flex-row items-center gap-4">
            <div
              style={{ color: organization.primaryFontColorHex || "#000000" }}
              >{tokenListing?.name || (tokenListing?.tokenId && `#${tokenListing?.tokenId}`)}</div>
            {bannedOnOpenSea && !organization.disableBannedOnOpenSea && (
              <Tooltip.Provider>
                <Tooltip.Root delayDuration={0}>
                  <Tooltip.Trigger>
                    <FiAlertCircle className="h-6 w-6 text-[#FF3B3B]" />
                  </Tooltip.Trigger>
                  <Tooltip.Content
                    sideOffset={5}
                    className="reservoir-body-2 w-[191px] rounded-2xl bg-neutral-800 py-3 px-4 text-center text-white dark:bg-neutral-100 dark:text-black"
                  >
                    <Tooltip.Arrow className="fill-neutral-800 dark:fill-neutral-100" />
                    Reported for suspicious activity on OpenSea
                  </Tooltip.Content>
                </Tooltip.Root>
              </Tooltip.Provider>
            )}
          </div>
          <div className="flex flex-row gap-4">
            <SnagButton
              classType="Link"
              organization={organization}
              className="px-2 py-2"
              onClick={() => {
                navigator.clipboard.writeText(organization.url + router.asPath)
                setToast({
                  kind: 'success',
                  message: 'Token link copied to clipboard.',
                  title: 'Share token',
                })
              }}
            >
              <FiShare2 className="h-4 w-4"/>
            </SnagButton>
            <SnagButton
              classType="Link"
              organization={organization}
              className="px-2 py-2"
              disabled={refreshLoading}
              onClick={() => {
                refreshToken(`${tokenListing?.collectionId}:${tokenListing?.tokenId}`)
              }}
            >
              <FiRefreshCcw
                className={`h-4 w-4 ${
                  refreshLoading ? 'animate-spin-reverse' : ''
                }`}
              />
            </SnagButton>
          </div>
        </div>

        <div className="flex flex-row items-center justify-between">
          <div>
            {owner && (
              <Link href={`/addresses/${owner}/collections/${organization.contractId}`}>
                <a className="inline-block">
                  <EthAccount
                    organization={organization}
                    title="Owned by"
                    address={tokenListing.ownerAddress || undefined}
                    side="left"
                    largeText
                    ownAddress={account?.address}
                  />
                </a>
              </Link>
            )}
          </div>
          {walletTokenActivity && (
            <div className="flex flex-row gap-5 text-sm">
              <div
                style={{
                  color: organization.primaryFontColorHex || "#000000",
                }}
                className={
                  `flex flex-row gap-2 items-center ${account?.address && !updatingLike ? "cursor-pointer" : ""}`
                }
                onClick={() => {
                  updateLike(!walletTokenActivity.walletLike)
                }}
              >
                {walletTokenActivity.walletLike ? (
                  <AiFillHeart
                    style={{ fill: organization.primaryColorHex, borderColor: organization.primaryColorHex }}
                    className="w-4 h-4"
                  />
                ) : (
                  <AiOutlineHeart
                    className="w-4 h-4"
                  />
                )}
                {walletTokenActivity.totalLikes} likes
              </div>
              <div style={{ color: organization.primaryFontColorHex || "#000000" }}>
                {walletTokenActivity.totalViews} views
              </div>
            </div>
          )}
        </div>
      </article>
    </div>
  )
}

export default Owner
