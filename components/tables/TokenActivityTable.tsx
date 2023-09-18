import FormatPrice from 'components/FormatPrice'
import useSales from 'hooks/useSales'
import { optimizeImage } from 'lib/optmizeImage'
import { truncateAddress } from 'lib/truncateText'
import { DateTime } from 'luxon'
import Link from 'next/link'
import { FC, useEffect, useState } from 'react'
import { Collection, TokenSale } from 'types/reservoir'
import LoadingIcon from 'components/LoadingIcon'
import { FiExternalLink } from 'react-icons/fi'
import { Organization } from 'context/config'
import { getBaseDomain } from 'lib/domain'
import { RiLoader5Line } from 'react-icons/ri'

type Props = {
  collectionId: string | undefined
  tokenId: string | undefined
  collection: Collection
  organization: Organization
}

const TokenActivityTable: FC<Props> = ({ tokenId, collectionId, collection, organization }) => {
  const { sales, ref: swrInfiniteRef } = useSales(undefined, `${collectionId}:${tokenId}`)

  useEffect(() => {
    if (sales.data) {
      sales.setSize(1)
      sales.mutate()
    }
  }, [])

  const { data: salesData } = sales
  const flatSalesData = salesData?.flatMap((sale) => sale.sales)?.filter(sale => sale) || []
  const noSales = !sales.isValidating && flatSalesData.length == 0
  const collectionImage = collection?.metadata?.imageUrl as string

  const initialLoad = sales.isValidating && flatSalesData.length == 0
  const didReachEnd =
      salesData &&
    (salesData[salesData.length - 1]?.sales?.length === 0 ||
      salesData[salesData.length - 1]?.continuation === null)

  return (
    <div
      style={{ borderColor: organization.secondaryOutlineColorHex || "#CFD8DC", backgroundColor: organization.secondaryBackgroundColorHex || "#00000000", borderRadius: organization.borderRadius || "12px" }}
      className="text-xs sm:text-sm border dark:border-[#525252] pl-6 pt-6">
      <div
        style={{
          color: organization.primaryFontColorHex || "#000000",
        }}
        className="text-lg font-semibold">
        Activity
      </div>
      <div className="max-h-72 overflow-auto pr-6">
        <table className="w-full border-collapse">
          <tbody>
            {flatSalesData.map((sale, i) => {
              if (!sale) {
                return null
              }

              return (
                <TokenActivityTableRow
                  key={`${sale?.id}-${i}`}
                  sale={sale}
                  collectionImage={collectionImage}
                  organization={organization}
                />
              )
            })}
            {noSales && (
              <div className="my-10 flex w-full flex-col justify-center">
                <img
                  src="/magnifying-glass.svg"
                  className="h-[59px]"
                  alt="Magnifying Glass"
                />
                <div
                  style={{
                    color: organization.primaryFontColorHex || "#000000",
                  }}
                  className="mt-4 mb-2 text-center dark:text-white">
                  No activity yet
                </div>
                <div
                  style={{
                    color: organization.primaryFontColorHex || "#000000",
                  }}
                  className="text-center text-xs font-light dark:text-white">
                  There has not been any activity for this token.
                </div>
              </div>
            )}
            {!initialLoad && !didReachEnd && (
              <tr ref={swrInfiniteRef}>
                <td align="center" colSpan={5}>
                  <RiLoader5Line className="h-6 w-6 m-2 animate-spin-loading" />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {initialLoad && (
        <div className="my-20 flex justify-center">
          <LoadingIcon />
        </div>
      )}
    </div>
  )
}

type TokenActivityTableRowProps = {
  sale: TokenSale
  collectionImage?: string
  organization: Organization
}

const TokenActivityTableRow: FC<TokenActivityTableRowProps> = ({
  sale,
  collectionImage,
  organization,
}) => {
  const [toShortAddress, setToShortAddress] = useState((sale?.to && truncateAddress(sale.to)) || '')
  const [fromShortAddress, setFromShortAddress] = useState((sale?.from && truncateAddress(sale.from)) || '')
  const [imageSrc, setImageSrc] = useState(
    sale.token?.image || collectionImage || ''
  )
  const [timeAgo, setTimeAgo] = useState((sale?.timestamp && DateTime.fromSeconds(sale.timestamp).toRelative()) || '')

  useEffect(() => {
    setToShortAddress(truncateAddress(sale?.to || ''))
    setFromShortAddress(truncateAddress(sale?.from || ''))
    setTimeAgo(
      sale?.timestamp
        ? DateTime.fromSeconds(sale.timestamp).toRelative() || ''
        : ''
    )
  }, [sale])

  useEffect(() => {
    if (sale?.token?.image) {
      setImageSrc(optimizeImage(sale.token.image, 48))
    } else if (collectionImage) {
      setImageSrc(optimizeImage(collectionImage, 48))
    }
  }, [sale, collectionImage])

  if (!sale) {
    return null
  }

  let saleSourceImgSrc = null
  const sourceDomain = (sale as any).orderSource
  if (!sourceDomain || sale.orderSource?.toLowerCase()?.includes("reservoir") || sale.orderSource?.includes("snag") || sourceDomain?.toLowerCase()?.includes(getBaseDomain())) {
    saleSourceImgSrc = organization.aggregateIcon || organization.listingIcon
  } else {
    const orderDomain = (sale as any)?.orderSource
    saleSourceImgSrc = `https://api.reservoir.tools/redirect/logo/v1?source=${orderDomain}`
  }

  let saleDescription = 'Sale'

  switch (sale?.orderSide) {
    case 'ask': {
      saleDescription = 'Sale'
      break
    }
    case 'bid': {
      saleDescription = 'Offer Accepted'
    }
  }

  return (
    <tr
      key={sale.id}
      style={{ borderColor: organization.secondaryOutlineColorHex || "#CFD8DC" }}
      className="h-[60px] border-b last:border-0"
    >
      <td>
        <div className="mr-2.5 flex flex-wrap items-center gap-3">
          <img
            className="h-5 w-5 rounded-full"
            src={saleSourceImgSrc}
            alt={`${sale.orderSource} Source`}
          />
          <span
            style={{
              color: organization.primaryFontColorHex || "#000000",
            }}
            className="text-black font-normal	dark:text-neutral-300">
            {saleDescription}
          </span>
        </div>
      </td>
      <td>
        <FormatPrice price={sale.price as any} organization={organization} />
      </td>
      <td style={{ color: organization.secondaryFontColorHex || "#959DA6"}} className="font-normal">
        <div className="flex flex-row flex-wrap">
          From
          <Link href={`/addresses/${sale.from}/collections/${organization.contractId}`}>
            <a
              style={{
                color: organization.primaryFontColorHex || "#000000",
              }}
              className="ml-1 font-semibold text-black">
              {fromShortAddress}
            </a>
          </Link>
        </div>
      </td>
      <td style={{ color: organization.secondaryFontColorHex || "#959DA6"}} className="font-normal">
        <div className="flex flex-row flex-wrap">
          To
          <Link href={`/addresses/${sale.to}/collections/${organization.contractId}`}>
            <a
              style={{
                color: organization.primaryFontColorHex || "#000000",
              }}
              className="ml-1 font-semibold text-black">
              {toShortAddress}
            </a>
          </Link>
        </div>
      </td>
      <td>
        <Link
          href={`https://${organization.testnetNetwork ? 'goerli.' : ''}etherscan.io/tx/${
            sale.txHash
          }`}
        >
          <a
            style={{
              color: organization.primaryFontColorHex || "#000000",
            }}
            target="_blank"
            rel="noopener noreferrer"
            className="flex justify-end	items-center gap-2 whitespace-nowrap text-black font-normal"
          >
            {timeAgo}
            <FiExternalLink className="h-4 w-4" />
          </a>
        </Link>
      </td>
    </tr>
  )
}

export default TokenActivityTable
