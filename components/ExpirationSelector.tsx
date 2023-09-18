import React, { FC } from 'react'
import { AiOutlineCalendar } from 'react-icons/ai'
import { HiChevronDown } from 'react-icons/hi'
import { Organization } from 'context/config'

type Props = {
  presets: {
    preset: string
    value: () => string
    display: string
  }[]
  label?: string
  expiration: string
  organization: Organization
  setExpiration: React.Dispatch<React.SetStateAction<string>>
}

const ExpirationSelector: FC<Props> = ({
  presets,
  label,
  expiration,
  organization,
  setExpiration,
}) => {
  return (
    <>
      <label
        htmlFor="expirationSelector"
        className="text-sm font-semibold"
      >
        {label || "Expiration"}
      </label>

      <div className="relative w-full">
        <AiOutlineCalendar className="w-5 h-5 left-3 absolute top-1/2 -translate-y-1/2" />
        <HiChevronDown className="w-5 h-5 right-3 absolute top-1/2 -translate-y-1/2 fill-[#959DA6]" />
        <select
          style={{
            borderColor: organization.secondaryOutlineColorHex || "#CFD8DC",
            outlineColor: organization.primaryColorHex,
          }}
          name="expiration"
          id="expirationSelector"
          defaultValue={expiration}
          onChange={(e) => setExpiration(e.target.value)}
          className="focus:outline-none border-[1px] rounded py-2.5 px-3 bg-transparent w-full pl-10"
        >
          {presets.map(({ preset, display }) => (
            <option key={preset} value={preset}>
              {display}
            </option>
          ))}
        </select>
      </div>
    </>
  )
}

export default ExpirationSelector
