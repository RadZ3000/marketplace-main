import { useState } from 'react'
import { FC } from 'react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { HiChevronDown } from 'react-icons/hi'
import { Organization } from 'context/config'
import { getCurrencyOptions, getOffersCurrencyOptions, Currency } from 'lib/currency'
import CryptoCurrencyIcon from 'components/CryptoCurrencyIcon'

type Props = {
  organization: Organization
  currency: Currency
  offers?: boolean
  setCurrency: React.Dispatch<React.SetStateAction<Currency>>
}

type ItemProps = {
  organization: Organization
  currency: Currency
  selected: boolean
  onClick: () => void
}

const CurrencyDropdownItem: FC<ItemProps> = ({ organization, currency, selected, onClick }) => {
  const [hover, setHover] = useState<boolean>(false)

  return (
    <DropdownMenu.Item
      key={currency.symbol}
      onMouseEnter={() => {
        setHover(true)
      }}
      onMouseLeave={() => {
        setHover(false)
      }}
      style={{
        borderColor: organization.secondaryOutlineColorHex || "#CFD8DC",
        backgroundColor: hover ? organization.secondaryButtonHoverColorHex || "#F8F9FA" : "",
      }}
      className={`overflow-hidden border-b p-0 outline-none first:rounded-t last:rounded-b last:border-b-0`}
    >
      <div className="flex flex-row items-center gap-2">
        <a
          onClick={onClick}
          className="flex flex-row items-center w-full cursor-pointer"
        >
          {selected && (
            <div
              style={{
                backgroundColor: true ? organization.primaryColorHex : "#00000000"
              }}
              className="absolute w-1 h-6"
            />
          )}
          <div
            className="h-12 flex items-center gap-4 px-3 justify-between"
          >
            <div className="flex flex-row items-center gap-3">
              <CryptoCurrencyIcon organization={organization} address={currency.contract} className="w-4 h-4 rounded-full" />
              <p
                style={{ color: organization.primaryFontColorHex || "#000000" }}
                className="truncate text-sm">
                {currency.symbol}
              </p>
            </div>
          </div>
        </a>
      </div>
    </DropdownMenu.Item>
  )
}

const CurrencySelector: FC<Props> = ({ organization, offers, currency, setCurrency }) => {
  const [open, setOpen] = useState(false)

  const currencies = offers ? getOffersCurrencyOptions(organization) : getCurrencyOptions(organization)

  const style = {
    borderColor: organization.secondaryOutlineColorHex || "#CFD8DC",
    background: organization.backgroundCss,
    backgroundColor: organization.secondaryBackgroundColorHex || "#FFFFFF",
    fontFamily: organization.font
  }
  const disabled = currencies.length <= 1
  return (
    <DropdownMenu.Root onOpenChange={setOpen}>
      <DropdownMenu.Trigger
        style={{
          borderColor: organization.secondaryOutlineColorHex || "#CFD8DC",
          outlineColor: organization.primaryColorHex,
          opacity: disabled ? 0.5 : 1,
        }}
        disabled={disabled}
        className="max-w-[120px] focus:outline-none border-[1px] rounded py-2.5 px-3 bg-transparent w-full relative">
        <div className="flex flex-row items-center gap-3">
          <CryptoCurrencyIcon organization={organization} address={currency.contract} className="w-4 h-4 rounded-full" />
          <p
            style={{ color: organization.primaryFontColorHex || "#000000" }}
            className="truncate text-sm">
            {currency.symbol}
          </p>
        </div>
        
        <HiChevronDown
          className={`h-5 w-5 right-3 absolute top-1/2 -translate-y-1/2 fill-[#959DA6] transition-transform ${
            open ? 'rotate-180' : ''
          }`}
        />
      </DropdownMenu.Trigger>

      <DropdownMenu.Content
        align="end"
        style={style}
        className="w-[120px] z-50 max-h-[330px] overflow-y-scroll overscroll-y-auto rounded border-[1px] shadow-md radix-side-bottom:animate-slide-down bg-white"
        sideOffset={2}
      >
        {currencies.map((currencyOption) => (
          <CurrencyDropdownItem
            key={currencyOption.symbol}
            organization={organization}
            currency={currencyOption}
            selected={currency.symbol === currencyOption.symbol}
            onClick={() => {
              setCurrency(currencyOption)
            }}
          />
        ))}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  )
}

export default CurrencySelector
