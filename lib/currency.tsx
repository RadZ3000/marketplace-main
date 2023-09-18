import { Organization } from 'context/config'

export type CurrencySymbol = 'ETH' | 'APE' | 'SOL' | 'GOAPE' | 'WETH'

export type Currency = {
  contract: string;
  name: string;
  symbol: CurrencySymbol;
  decimals: number;
}

export const SUPPORTED_CURRENCIES: Currency[] = [
  {
    contract: '0x0000000000000000000000000000000000000000',
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  {
    contract: '0x4d224452801ACEd8B2F0aebE155379bb5D594381',
    name: 'ApeCoin',
    symbol: 'APE',
    decimals: 18,
  },
  {
    contract: '0xABA4DA2fFBdC773C5EE0A98Bae496e8a82E7b6e4',
    name: 'Go APE',
    symbol: 'GOAPE',
    decimals: 18,
  }
]

export function getCurrencyOptions(organization: Organization): Currency[] {
  const currencySymbols = ['ETH', ...(organization.currencies ?? []).map(c => c.symbol)]
  return SUPPORTED_CURRENCIES.filter((currency) => currencySymbols.includes(currency.symbol))
}

export const SUPPORTED_OFFERS_CURRENCIES: Currency[] = [
  {
    contract: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    name: 'Wrapped',
    symbol: 'WETH',
    decimals: 18,
  }
]

export const GOERLI_SUPPORTED_OFFERS_CURRENCIES: Currency[] = [
  {
    contract: '0xb4fbf271143f4fbf7b91a5ded31805e42b2208d6',
    name: 'Wrapped',
    symbol: 'WETH',
    decimals: 18,
  }
]

export function getOffersCurrencyOptions(organization: Organization): Currency[] {
  return organization.testnetNetwork ? GOERLI_SUPPORTED_OFFERS_CURRENCIES : SUPPORTED_OFFERS_CURRENCIES
}
