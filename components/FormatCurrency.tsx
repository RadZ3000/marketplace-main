import { BigNumberish } from 'ethers'
import { formatBN } from 'lib/numbers'
import { FC } from 'react'
import { Organization } from 'context/config'
import { Price } from 'lib/types'

type Props = {
  amount?: BigNumberish | null | undefined
  price?: Price
  organization: Organization
  maximumFractionDigits?: number
  children?: React.ReactNode
  logoWidth?: number
  showAmountDollars?: boolean | null | undefined
}

const FormatCurrency: FC<Props> = ({
  amount,
  price,
  organization,
  maximumFractionDigits = 8,
  logoWidth = 16,
  children,
}) => {
  const value = formatBN(amount, maximumFractionDigits)
  return (
    <div className={`flex flex-row items-center gap-${logoWidth / 8}`}>
      <span
        style={{
          color: organization?.primaryFontColorHex || "#000000",
        }}
        className="font-semibold">{value}</span>
      {children}
    </div>
  )
}

export default FormatCurrency
