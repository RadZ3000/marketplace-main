import { FC } from 'react'
import FormatPrice from 'components/FormatPrice'
import { formatNumber } from 'lib/numbers'
import { formatBN } from 'lib/numbers'
import { Organization } from 'context/config'

type Props = {
  onSaleCount: number
  count: number
  ownerCount: number
  topOffer: number | undefined
  floor: number | undefined
  allTime: number | undefined
  todayVolume: number | undefined
  volumeChange: number
  floorChange: number | undefined
}

const HeroStats: FC<{ stats: Props, organization: Organization }> = ({ stats, organization }) => {
  return (
    <div className="flex flex-row flex-wrap items-center gap-5 sm:gap-10">
      <div
        style={{
          backgroundColor: organization.secondaryBackgroundColorHex || "#F8F9FA",
          borderColor: organization.secondaryOutlineColorHex || "#CFD8DC",
          borderRadius: organization.borderRadius || "12px",
        }}
        className="flex flex-row grow place-content-evenly border items-center py-3 px-4 sm:px-10">
        <Stat name="ON SALE" organization={organization} >
          <h3
            style={{
              color: organization.primaryFontColorHex || "#000000",
            }}
            className="text-base sm:text-xl font-semibold dark:text-white whitespace-nowrap">
           {formatNumber(stats.onSaleCount)} / {formatNumber(stats.count)}
          </h3>
        </Stat>
        <Divider organization={organization} />
        <Stat name="FLOOR" organization={organization} >
          <h3
            style={{
              color: organization.primaryFontColorHex || "#000000",
            }}
            className="text-base sm:text-xl font-semibold flex items-center justify-center gap-1 dark:text-white">
            <FormatPrice amount={stats.floor} maximumFractionDigits={2} organization={organization} />
            <PercentageChange organization={organization} value={stats.floorChange} />
          </h3>
        </Stat>
        <Divider organization={organization} />
        <Stat name="OWNERS" organization={organization} >
        <h3
          style={{
            color: organization.primaryFontColorHex || "#000000",
          }}
          className="text-base sm:text-xl font-semibold dark:text-white">
           {formatNumber(stats.ownerCount)}
          </h3>
        </Stat>
      </div>
      <div className="flex flex-row sm:flex-col grow shrink flex-wrap gap-x-4 sm:gap-x-10 gap-y-2">
        <div className="flex flex-row items-baseline gap-2">
          <div style={{ color: organization.secondaryFontColorHex || "#959DA6" }} className="font-semibold text-xs">TOTAL VOLUME</div>
          <div className="font-semibold text-sm">
            <FormatPrice amount={stats.allTime} maximumFractionDigits={1} organization={organization} />
          </div>
        </div>
        <div className="flex flex-row flex-wrap items-baseline gap-2">
          <div style={{ color: organization.secondaryFontColorHex || "#959DA6" }} className="font-semibold text-xs">24H SALES</div>
          <div className="font-semibold text-sm">
            <FormatPrice amount={stats.todayVolume} maximumFractionDigits={1} organization={organization} />
          </div>
          <div style={{ color: (stats.volumeChange > 0 ? (organization.positiveColorHex || "#4CAF50") : (organization.negativeColorHex || "#FFA726")) }} className="font-semibold text-sm">
            {stats.volumeChange > 0 && "+"}{formatBN(stats.volumeChange, 1)}%
          </div>
        </div>
      </div>
    </div>
  )
}

const Stat: FC<{ name: string, organization: Organization }> = ({ name, organization, children }) => (
  <div className="flex h-12 flex-col gap-1 items-start justify-center">
    <p style={{ color: organization.secondaryFontColorHex || "#959DA6" }} className="text-left w-full font-semibold text-xs">{name}</p>
    {children}
  </div>
)

const Divider: FC<{ organization: Organization }> = ({ organization }) => (
  <div style={{ borderColor: organization.secondaryOutlineColorHex || "#CFD8DC" }} className="border-l w-[1px] mx-[12px] sm:mx-10 h-6" />
)

export const PercentageChange: FC<{ value: number | undefined | null, organization: Organization }> = ({
  value,
  organization,
}) => {
  if (value === undefined || value === null) return null

  const percentage = (value - 1) * 100

  if (percentage > 100 || value === 0) {
    return null
  }

  if (value < 1) {
    return (
      <div style={{ color: organization.negativeColorHex || "#FFA726" }} className="text-sm">{formatNumber(percentage)}%</div>
    )
  }

  if (value > 1) {
    return (
      <div style={{ color: organization.positiveColorHex || "#4CAF50" }} className="text-sm">+{formatNumber(percentage)}%</div>
    )
  }

  return null
}

export default HeroStats
