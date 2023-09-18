import React, { FC, useEffect, useState } from 'react'
import AttributeButton from 'components/AttributeButton'
import { DebounceInput } from 'react-debounce-input'
import { matchSorter } from 'match-sorter'
import { sortAttributes } from './functions'
import { SWRInfiniteResponse } from 'swr/infinite/dist/infinite'
import { FiSearch, FiXCircle } from 'react-icons/fi'
import { paths } from '@reservoir0x/reservoir-kit-client'
import { Organization } from "context/config"

type Props = {
  attribute: NonNullable<
    paths['/collections/{collection}/attributes/all/v1']['get']['responses']['200']['schema']['attributes']
  >[number]
  setTokensSize: SWRInfiniteResponse['setSize']
  organization: Organization
}

const AttributeSelector: FC<Props> = ({
  attribute: { key, values },
  setTokensSize,
  organization,
}) => {
  const [searchedValues, setsearchedValues] = useState(values || [])
  const [query, setQuery] = useState('')
  const [hover, setHover] = useState(false)

  useEffect(() => {
    let results = matchSorter(values || [], query, {
      keys: ['value'],
    })
    sortAttributes(results)
    setsearchedValues(results)
  }, [query, values])

  if (!key) {
    console.error(new ReferenceError('key is undefined'))
    return null
  }

  return (
    <div
      style={{ borderColor: organization.secondaryOutlineColorHex || "#CFD8DC" }}
      className="border-b-[1px] border-gray-300 dark:border-neutral-600">
      <div className="mt-2 mb-3 mx-5">
        <DebounceInput
          onMouseEnter={() => {
            setHover(true)
          }}
          onMouseLeave={() => {
            setHover(false)
          }}
          style={{
            borderColor: organization.secondaryOutlineColorHex || "#CFD8DC",
            outlineColor: organization.primaryColorHex,
            backgroundColor: hover ? organization.secondaryButtonHoverColorHex || "#F8F9FA" : "",
            color: organization.primaryFontColorHex || "#000000",
          }}
          className="focus:outline-none placeholder-secondary-font rounded bg-transparent rounded border-[1px] w-full px-3 py-2.5"
          type="text"
          autoFocus
          value={query}
          autoComplete="off"
          placeholder={key.toUpperCase()}
          debounceTimeout={300}
          onChange={(e) => setQuery(e.target.value)}
        />
        {typeof query === 'string' && query !== '' && (
          <button onClick={() => setQuery('')}>
            <FiXCircle className="absolute top-1/2 right-3 z-20 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
          </button>
        )}
      </div>
      <div className="mb-3 max-h-[264px] overflow-y-auto">
        {searchedValues.map(({ value, count }, index) => {
          if (!value) return null
          return (
            <AttributeButton
              organization={organization}
              value={value}
              count={count?.toString() ?? ""}
              attribute={key}
              key={`${value}${index}`}
              setTokensSize={setTokensSize}
            />
          )
        })}
      </div>
    </div>
  )
}

export default AttributeSelector
