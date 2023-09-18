import { FC } from 'react'
import { optimizeImage } from 'lib/optmizeImage'
import { Token } from 'lib/types'
import { Organization } from 'context/config'


const ExchangeIcon: FC<{
    token: Token,
    organization: Organization
    bigImage: boolean
  }> = ({
    token,
    organization,
    bigImage,
  }) => {
    let iconSrc = null
    if (token.reservoirListing?.isLocalListing) {
      iconSrc = organization.aggregateIcon || organization.listingIcon
    } else if (!organization.disableAggregation && token.reservoirListing?.source) {
      iconSrc = `https://api.reservoir.tools/redirect/logo/v1?source=${token.reservoirListing?.source}`
    }
  
    if (!iconSrc) {
      return null
    }
  
    return (
      <img
        className={`absolute rounded-full top-0 w-8 h-8 ${bigImage ? "m-4" : "m-3"}`}
        src={iconSrc}
        alt=""
      />
    )
  }
  
  const TokenMedia: FC<{
    token: Token,
    organization: Organization,
    collectionImage: string | undefined,
    collectionName: string,
    size: number
    includeExchangeIcon?: boolean
  }> = ({
    token,
    organization,
    collectionImage,
    collectionName,
    size,
    includeExchangeIcon = false,
  }) => {
    const image = token.image ? (
      <img
        src={optimizeImage(token.image, size)}
        alt={token.name}
        className="aspect-square w-full object-cover"
        width={size}
        height={size}
      />
    ) : (
      <div className="relative w-full">
        <div className="absolute inset-0 grid place-items-center backdrop-blur-lg">
          <div className="flex flex-col gap-2">
            <img
              src={optimizeImage(collectionImage, size)}
              alt={collectionName}
              className="w-1/4 mx-auto overflow-hidden rounded-full border-2 border-white"
            />
            <div
              style={{
                fontSize: Math.max(size / 40, 6),
              }}
              className="font-semibold text-white text-center"
            >
              No Content Available
            </div>
          </div>
        </div>
        <img
          src={optimizeImage(collectionImage, size)}
          alt={collectionName}
          className="aspect-square w-full object-cover"
          width={size}
          height={size}
        />
      </div>
    )
  
    return (
      <div className="relative">
        <div className="block">
        {image}
        {includeExchangeIcon && (<ExchangeIcon token={token} organization={organization} bigImage={size > 300} />)}
        </div>
      </div>
    )
  }

  export default TokenMedia