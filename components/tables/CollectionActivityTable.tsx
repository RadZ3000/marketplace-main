import FormatPrice from 'components/FormatPrice'
import useSales from 'hooks/useSales'
import { optimizeImage } from 'lib/optmizeImage'
import { truncateAddress } from 'lib/truncateText'
import { DateTime } from 'luxon'
import Link from 'next/link'
import { FC, useEffect, useState } from 'react'
import { Collection, TokenSale } from 'types/reservoir'
import Image from 'next/image'
import { useMediaQuery } from '@react-hookz/web'
import LoadingIcon from 'components/LoadingIcon'
import { FiExternalLink } from 'react-icons/fi'
import { Organization } from 'context/config'
import { BsCart3 } from 'react-icons/bs';
import { getBaseDomain } from 'lib/domain'

type Props = {
  id: string | undefined
  collection: Collection
  organization: Organization
}

const CollectionActivityTable: FC<Props> = ({ id, collection, organization }) => {
  const { sales, ref: swrInfiniteRef } = useSales(id)

  useEffect(() => {
    if (sales.data) {
      sales.setSize(1)
      sales.mutate()
    }
  }, [])

  const { data: salesData } = sales
  const flatSalesData = salesData?.flatMap((sale) => sale.sales) || []
  const noSales = !sales.isValidating && flatSalesData.length == 0
  const collectionImage = collection?.metadata?.imageUrl as string

  return (
    <>
      <table>
        <tbody>
          {flatSalesData.map((sale, i) => {
            if (!sale) {
              return null
            }

            return (
              <CollectionActivityTableRow
                key={`${sale?.id}-${i}`}
                sale={sale}
                collectionImage={collectionImage}
                organization={organization}
              />
            )
          })}
          {noSales && (
            <div className="mt-20 mb-20 flex w-full flex-col justify-center">
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
                There hasn&apos;t been any activity for this <br /> collection
                yet.
              </div>
            </div>
          )}
          <tr ref={swrInfiniteRef}></tr>
        </tbody>
      </table>
      {sales.isValidating && (
        <div className="my-20 flex justify-center">
          <LoadingIcon />
        </div>
      )}
    </>
  )
}

type CollectionActivityTableRowProps = {
  sale: TokenSale
  collectionImage?: string
  organization: Organization
}

const CollectionActivityTableRow: FC<CollectionActivityTableRowProps> = ({
  sale,
  collectionImage,
  organization,
}) => {
  const isMobile = useMediaQuery('only screen and (max-width : 730px)')
  const [toShortAddress, setToShortAddress] = useState((sale?.to && truncateAddress(sale.to)) || '')
  const [fromShortAddress, setFromShortAddress] = useState((sale?.from && truncateAddress(sale.from)) || '')
  const [imageSrc, setImageSrc] = useState(
    sale.token?.image || collectionImage || ''
  )
  const [timeAgo, setTimeAgo] = useState((sale?.timestamp && DateTime.fromSeconds(sale.timestamp).toRelative()) || '')
  const [hover, setHover] = useState(false)

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
      setImageSrc(optimizeImage(sale.token.image, 160))
    } else if (collectionImage) {
      setImageSrc(optimizeImage(collectionImage, 160))
    }
  }, [sale, collectionImage])

  if (!sale) {
    return null
  }

  let saleSourceImgSrc = null
  const sourceDomain = (sale as { orderSourceDomain: string}).orderSourceDomain?.toLowerCase()
  const orderDomain = (sale as any)?.orderSourceDomain || sale.orderSource
  if (sourceDomain?.includes("reservoir") || sourceDomain?.includes("snag") || sourceDomain?.includes(getBaseDomain()) || orderDomain === null) {
    saleSourceImgSrc = organization.aggregateIcon || organization.listingIcon
  } else {
    saleSourceImgSrc = `https://api.reservoir.tools/redirect/logo/v1?source=${orderDomain}`
  }
  let saleDescription = 'Sale'

  switch (sale?.orderSide as any) {
    case 'ask': {
      saleDescription = 'Sale'
      break
    }
    case 'bid': {
      saleDescription = 'Offer Accepted'
    }
  }

  if (sale.orderKind === 'mint') {
    saleDescription = 'Mint'
  }

  return (
    <Link
      key={sale.id}
      href={`/collections/${sale.token?.contract}/tokens/${sale.token?.tokenId}`}
      passHref
    >
      <tr
        onMouseEnter={() => {
          setHover(true)
        }}
        onMouseLeave={() => {
          setHover(false)
        }}
        style={{
          borderColor: organization.secondaryOutlineColorHex || "#CFD8DC",
          backgroundColor: hover ? organization.secondaryButtonHoverColorHex || "#F8F9FA" : "",
          color: organization.primaryFontColorHex || "#000000",
        }}
        className="text-xs sm:text-sm h-28 border-b cursor-pointer"
      >
        <td>
          <div className="ml-4 mr-2.5 flex flex-wrap items-center gap-3">
            <img
              className="h-5 w-5 rounded-full"
              src={saleSourceImgSrc}
              alt={`${sale.orderSource} Source`}
            />
            <BsCart3
              style={{
                color: organization.primaryFontColorHex || "#000000",
              }}
              size={20} />
            <span
              className="font-normal">
              {saleDescription}
            </span>
          </div>
        </td>
        <td>
          <a className="mr-2.5 flex items-center">
            {imageSrc && (
              <Image
                style={{borderRadius: organization.borderRadius || "12px"}}
                className="object-cover"
                loader={({ src }) => src}
                src={imageSrc}
                alt={`${sale.token?.name} Token Image`}
                width={60}
                height={60}
              />
            )}
            <span className="text-xs sm:text-base font-semibold ml-3 truncate dark:text-white">
              {sale.token?.name}
            </span>
          </a>
        </td>
        <td>
          <FormatPrice price={sale.price as any} organization={organization} />
        </td>
        <td
          style={{ color: organization.secondaryFontColorHex || "#959DA6" }}
          className="font-normal">
          <div className="flex flex-row flex-wrap">
            From
            <Link href={`/addresses/${sale.from}/collections/${organization.contractId}`}>
              <a
                style={{ color: organization.primaryFontColorHex || "#000000" }}
                className="ml-1 font-semibold text-black">
                {fromShortAddress}
              </a>
            </Link>
          </div>
        </td>
        <td
          style={{ color: organization.secondaryFontColorHex || "#959DA6" }}
          className="font-normal">
          <div className="flex flex-row flex-wrap">
            To
            <Link href={`/addresses/${sale.to}/collections/${organization.contractId}`}>
              <a
                style={{ color: organization.primaryFontColorHex || "#000000" }}
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
              style={{ color: organization.primaryFontColorHex || "#000000" }}
              target="_blank"
              rel="noopener noreferrer"
              className="flex justify-end	items-center gap-2 whitespace-nowrap text-black font-normal mr-4"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              {timeAgo}
              <FiExternalLink className="h-4 w-4" />
            </a>
          </Link>
        </td>
      </tr>
    </Link>
  )
}

export default CollectionActivityTable
