import FormatCurrency from 'components/FormatCurrency'
import { FC, ComponentProps } from 'react'
import { Organization } from 'context/config'
import useSWR from 'swr'
import fetcher from 'lib/fetcher'
import { formatDollarsFromEth, formatDollar } from 'lib/numbers'
import CryptoCurrencyIcon from 'components/CryptoCurrencyIcon'
import { constants } from 'ethers'

const DARK_MODE = process.env.NEXT_PUBLIC_DARK_MODE

type FormatPriceProps = {
  logoWidth?: number
  organization?: Organization
}

type Props = ComponentProps<typeof FormatCurrency> & FormatPriceProps

const FormatPrice: FC<Props> = ({
  amount,
  price,
  organization,
  maximumFractionDigits,
  logoWidth = 16,
  showAmountDollars = false
}) => {
  const icon = organization.darkEthIcon ? '/eth-dark.svg' : '/eth.svg'
  const currencyContract = price?.currency?.contract || constants.AddressZero

  const dollarAmount = price?.amount?.usd && formatDollar(price?.amount?.usd)

  return (
    <FormatCurrency
      amount={amount || price?.amount?.decimal}
      organization={organization}
      maximumFractionDigits={maximumFractionDigits}
      logoWidth={logoWidth}
    >
      <CryptoCurrencyIcon organization={organization} address={currencyContract} css={{ height: `${logoWidth}px` }} className="rounded-full h-4" />
      {showAmountDollars && dollarAmount && (
        <span
          style={{ color: organization?.secondaryFontColorHex || "#959DA6" }}
          className="ml-2 align-middle text-lg font-semibold">
          ({dollarAmount})
        </span>
      )}
    </FormatCurrency>
  )
}

export default FormatPrice
