import Link from 'next/link'
import formatUrl from 'lib/formatUrl'
import { FC, useState } from 'react'
import FormatPrice from 'components/FormatPrice'
import {
  Collection,
  TokenDetails,
  TokenDetailsAttribute,
} from 'types/reservoir'
import { Token } from 'lib/types'
import { formatNumber } from 'lib/numbers'
import { Organization } from 'context/config'

type Props = {
  token: Token
  collection?: Collection
  organization: Organization
}

const TokenAttributes: FC<Props> = ({ token, collection, organization }: Props) => {
  if (token?.attributes?.length === 0) return null
  return (
    <div className="col-span-full md:col-span-4 lg:col-span-5 lg:col-start-2">
      <article className="col-span-full">
        <p
          style={{
            color: organization.primaryFontColorHex || "#000000",
          }}
          className="font-semibold text-lg mb-5">Properties</p>
        <div className="grid grid-cols-1 gap-3 overflow-visible lg:grid-cols-2">
          {token?.attributes
            ?.sort((a, b) => (b?.floorAskPrice || 0) - (a?.floorAskPrice || 0))
            .map((attribute) => (
              <TokenAttribute
                key={attribute.key}
                attribute={attribute}
                collectionId={token?.collectionId}
                collectionTokenCount={collection?.tokenCount}
                organization={organization}
              />
            ))}
        </div>
      </article>
    </div>
  )
}

type TokenAttributeProps = {
  attribute: TokenDetailsAttribute
  collectionId?: string
  collectionTokenCount?: string
  organization: Organization
}

const TokenAttribute: FC<TokenAttributeProps> = ({
  attribute,
  collectionId,
  collectionTokenCount,
  organization,
}) => {
  const [hover, setHover] = useState<boolean>(false)

  const attributeTokenCount = attribute?.tokenCount || 0
  const totalTokens = collectionTokenCount ? +collectionTokenCount : 0
  const attributeRarity = formatNumber(
    (attributeTokenCount / totalTokens) * 100,
    1
  )

  const includeBoxShadow = Boolean(organization.primaryButtonBoxShadow)
  const boxShadow = organization.primaryButtonBoxShadow || 0
  const borderColor = hover && includeBoxShadow ? (organization.primaryOutlineColorHex || "#959DA6") : (organization.secondaryOutlineColorHex || "#CFD8DC")
  const cardShadowStyle = {
    boxShadow: hover && includeBoxShadow ? `${boxShadow}px ${boxShadow}px 0px 0px ${borderColor}` : "",
    transform: hover && includeBoxShadow ? `translateY(-${boxShadow}px) translateX(-${boxShadow}px)` : "",
    backgroundColor: hover ? organization.secondaryButtonHoverColorHex || "#F8F9FA" : organization.secondaryBackgroundColorHex || "#FFFFFF00",
    borderColor: organization.secondaryOutlineColorHex || "#CFD8DC",
    borderRadius: organization.borderRadius || "12px",
  }

  return (
    <Link
      key={`${attribute.key}-${attribute.value}`}
      href={`/collections/${collectionId}?${formatUrl(
        `attributes[${attribute.key}]`
      )}=${formatUrl(`${attribute.value}`)}`}
    >
      <a
        onMouseEnter={() => {
          setHover(true)
        }}
        onMouseLeave={() => {
          setHover(false)
        }}
        style={cardShadowStyle}
        className="border-[1px] p-3 ring-inset ring-blue-600 transition-colors">
        <div
          style={{
            color: organization.primaryFontColorHex || "#000000",
          }}
          className="text-sm text-black font-normal">
          {attribute.key}
        </div>
        <div className="mt-1 mb-4 flex justify-between gap-1 text-sm text-black">
          <span
            style={{
              color: organization.primaryFontColorHex || "#000000",
            }}
            className="reservoir-h6 text-black"
            title={attribute.value}
          >
            {attribute.value}
          </span>
        </div>
        <div className="flex justify-between gap-1 text-sm dark:text-neutral-300">
          <span style={{ color: organization.secondaryFontColorHex || "#959DA6" }}>
            {formatNumber(attribute.tokenCount)} {totalTokens > 0 ? `(${attributeRarity}%)` : ''}
          </span>
          <span>
            <FormatPrice amount={attribute.floorAskPrice} organization={organization} />
          </span>
        </div>
      </a>
    </Link>
  )
}

export default TokenAttributes
