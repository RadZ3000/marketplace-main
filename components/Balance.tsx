import { FC } from 'react'
import { constants, ethers } from 'ethers'
import { Organization } from 'context/config'
import { Currency } from 'lib/currency'
import { useBalance } from 'wagmi'
import FormatPrice from './FormatPrice'


type BalanceProps = {
  address: string
  organization: Organization
  currency?: Currency
}

const Balance: FC<BalanceProps> = ({ address, organization, currency }) => {
  const { data: balance } = useBalance({ addressOrName: address, ...(currency?.contract !== constants.AddressZero ? { token: currency?.contract } : {})})

  if (!currency) return null;

  return <FormatPrice
    price={{
      amount: {
        raw: "0",
        decimal: balance ? +ethers.utils.formatUnits(balance.value, balance.decimals) : 0,
        usd: 0,
        native: 0,
      },
      currency,
    }}
    organization={organization}
  />
}

export default Balance
