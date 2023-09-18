import { FC, useState, useEffect } from 'react'
import LoadingCard from './LoadingCard'
import { useRouter } from 'next/router'
import { SWRInfiniteResponse } from 'swr/infinite/dist/infinite'
import Link from 'next/link'
import { useInView } from 'react-intersection-observer'
import FormatPrice from './FormatPrice'
import Masonry from 'react-masonry-css'
import { TokenInfiniteList } from 'lib/types'
import { ethers } from 'ethers'
import { Organization } from 'context/config'
import TokenMedia from 'components/token/TokenMedia'
import { Token } from 'lib/types'

type Props = {
  tokens: SWRInfiniteResponse<
    TokenInfiniteList,
    any
  >
  organization: Organization
  collectionImage: string | undefined
  collectionName: string
  includeExchangeIcon: boolean
  viewRef: ReturnType<typeof useInView>['ref']
}

type TokenCardProp = {
  token: Token
  organization: Organization
  collectionImage: string | undefined
  collectionName: string
  includeExchangeIcon: boolean
}

const TokenCard: FC<TokenCardProp> = ({ organization, token, collectionImage, collectionName, includeExchangeIcon }) => {
  const [hover, setHover] = useState<boolean>(false)
  
  const includeBoxShadow = Boolean(organization.primaryButtonBoxShadow)
  const boxShadow = organization.primaryButtonBoxShadow || 0
  const borderColor = hover && includeBoxShadow ? (organization.primaryOutlineColorHex || "#959DA6") : (organization.secondaryOutlineColorHex || "#CFD8DC")
  const cardShadowStyle = {
    boxShadow: hover && includeBoxShadow ? `${boxShadow * 2}px ${boxShadow * 2}px 0px 0px ${borderColor}` : "",
    transform: hover && includeBoxShadow ? `translateY(-${boxShadow * 2}px) translateX(-${boxShadow * 2}px)` : "",
  }

  const price = (!organization.disableAggregation || token.reservoirListing?.isLocalListing) ? token?.price : null
  return (
    <Link
      href={`/collections/${token?.collectionId}/tokens/${token?.tokenId}`}
    >
      <a
        onMouseEnter={() => {
          setHover(true)
        }}
        onMouseLeave={() => {
          setHover(false)
        }}
        style={{
          borderColor,
          backgroundColor: hover ? (organization.secondaryButtonHoverColorHex || "#F8F9FA") : organization.secondaryBackgroundColorHex || "#FFFFFF00",
          borderRadius: organization.borderRadius || "12px",
          borderWidth: organization.primaryButtonBoxShadow || "1px",
          ...cardShadowStyle,
        }}
        className={`group relative mb-3 sm:mb-6 grid transform-gpu self-start overflow-hidden border transition cursor-pointer ${!includeBoxShadow && "ease-in hover:-translate-y-0.5 hover:scale-[1.01] hover:shadow-lg hover:ease-out"}`}>
        <TokenMedia
          token={token}
          organization={organization}
          collectionImage={collectionImage}
          collectionName={collectionName}
          size={250}
          includeExchangeIcon={includeExchangeIcon}
        />
        <div className="px-3 py-4">
          <p
            style={{
              color: organization.primaryFontColorHex || "#000000"
            }}
            className="mb-3 overflow-hidden truncate font-normal text-sm"
            title={token?.name}
          >
            {token?.name}
          </p>
          <div className="flex items-center justify-between h-7">
            {price ? (
            <div className="text-lg">
              <FormatPrice
                price={price}
                logoWidth={16}
                organization={organization}
              />
            </div>
            ) : (
              <div
                style={{
                  color: organization.secondaryFontColorHex || "#959DA6"
                }}
                className="text-sm"
              >
                Unlisted
              </div>
            )}
          </div>
        </div>
      </a>
    </Link>
  )
}

const TokensGrid: FC<Props> = ({ tokens, organization, viewRef, collectionName, collectionImage, includeExchangeIcon }) => {
  const router = useRouter()
  const { data, error } = tokens

  const [minPrice, setMinPrice] = useState<string>();
  const [maxPrice, setMaxPrice] = useState<string>();

  useEffect(() => {
    setMinPrice(router.query["price[gte]"]?.toString() || "")
    setMaxPrice(router.query["price[lte]"]?.toString() || "")
  }, [router.query])

  // Reference: https://swr.vercel.app/examples/infinite-loading
  const flattenedTokens = data?.map(tokens => tokens.tokens)?.flat()
  const mappedTokensPrefilter = flattenedTokens ?? []

  const minPriceEth = minPrice ? ethers.utils.parseEther(minPrice) : null
  const maxPriceEth = maxPrice ? ethers.utils.parseEther(maxPrice) : null
  const mappedTokens = mappedTokensPrefilter.filter((token) => {
    const priceEth = token.price?.amount?.raw ? ethers.utils.parseEther(token.price?.amount?.raw) : null
    if (priceEth === null) return (minPriceEth === null && maxPriceEth === null)

    return (minPriceEth === null || priceEth.gte(minPriceEth)) && (maxPriceEth === null || priceEth.lte(maxPriceEth))
  })

  const isLoadingInitialData = !data && !error
  const didReachEnd =
    data &&
    (data[data.length - 1]?.tokens?.length === 0 ||
      data[data.length - 1]?.continuation === null || mappedTokens.length === 0)

  return (
    <Masonry
      key="tokensGridMasonry"
      breakpointCols={{
        default: 6,
        1900: 5,
        1536: 4,
        1280: 3,
        1024: 2,
        768: 2,
        640: 2,
      }}
      className="masonry-grid gap-3 sm:gap-8"
    >
      {isLoadingInitialData
        ? Array(10)
            .fill(null)
            .map((_, index) => <LoadingCard key={`loading-card-${index}`} />)
        : mappedTokens?.map((token, idx) => {
            return (
              <TokenCard
                key={`${collectionName}${idx}`}
                organization={organization}
                token={token}
                collectionImage={collectionImage}
                collectionName={collectionName}
                includeExchangeIcon={includeExchangeIcon}
              />
            )
          })}
      {!didReachEnd &&
        Array(10)
          .fill(null)
          .map((_, index) => {
            if (index === 0) {
              return (
                <LoadingCard viewRef={viewRef} key={`loading-card-${index}`} />
              )
            }
            return <LoadingCard key={`loading-card-${index}`} />
          })}
    </Masonry>
  )
}

export default TokensGrid
