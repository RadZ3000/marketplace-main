import * as Accordion from '@radix-ui/react-accordion'
import * as SwitchPrimitive from '@radix-ui/react-switch';
import { styled } from '@stitches/react';
import { useRouter } from 'next/router'
import { FC, useState, useEffect } from 'react'
import AttributeSelector from './filter/AttributeSelector'
import { SWRResponse } from 'swr'
import { SWRInfiniteResponse } from 'swr/infinite/dist/infinite'
import { FiChevronDown } from 'react-icons/fi'
import { paths } from '@reservoir0x/reservoir-kit-client'
import { toggleOffUrlParam, toggleOnUrlParam, updateUrlParam } from 'lib/url'
import { Organization } from "context/config"
import { blackA } from '@radix-ui/colors';

type Props = {
  attributes: SWRResponse<
    paths['/collections/{collection}/attributes/all/v1']['get']['responses']['200']['schema']
  >
  setTokensSize: SWRInfiniteResponse['setSize']
  organization: Organization
}

const SwitchThumb = styled(SwitchPrimitive.Thumb, {
  display: 'block',
  width: 20,
  height: 20,
  backgroundColor: 'white',
  borderRadius: '9999px',
  transition: 'transform 100ms',
  transform: 'translateX(4px)',
  willChange: 'transform',
  cursor: 'pointer',
  '&[data-state="checked"]': { transform: 'translateX(28px)' },
});

const Switch = styled(SwitchPrimitive.Root, {
  all: 'unset',
  width: 52,
  height: 28,
  backgroundColor: blackA.blackA8,
  borderRadius: '9999px',
  position: 'relative',
  cursor: 'pointer',
  WebkitTapHighlightColor: 'rgba(0, 0, 0, 0)',
});

type AccordionItemProps = {
  attribute: {
    key: string;
    kind: "string" | "number" | "date" | "range";
    values?: {
      value: string;
      count?: number | undefined;
    }[]
  }
  setTokensSize: SWRInfiniteResponse['setSize']
  organization: Organization
}

const AccordionItem: FC<AccordionItemProps> = ({ attribute, setTokensSize, organization }) => {
  const [hover, setHover] = useState(false)

  return (
    <Accordion.Item
      value={`item-${attribute.key}`}
      key={attribute.key}
      className="overflow-hidden"
    >
      <Accordion.Header className="divide-gray-300 dark:divide-gray-800">
        <Accordion.Trigger
          onMouseEnter={() => {
            setHover(true)
          }}
          onMouseLeave={() => {
            setHover(false)
          }}
          style={{
            backgroundColor: hover ? organization.secondaryButtonHoverColorHex || "#F8F9FA" : ""
          }}
          className={
          "flex w-full px-5 py-4 align-middle transition"
        }>
          <div
            style={{
              color: organization.primaryFontColorHex || "#000000"
            }}
            className="text-left text-sm whitespace-nowrap overflow-hidden text-ellipsis	font-semibold capitalize transition">
            {attribute.key}
          </div>
          <div
            style={{ color: organization.secondaryFontColorHex || "#959DA6" }}
            className="text-left ml-2 text-sm font-semibold capitalize transition"
          >
            {attribute.values?.length || 0}
          </div>
          <FiChevronDown
            style={{ color: organization.secondaryFontColorHex || "#959DA6" }}
            className="h-4 w-4 ml-auto self-center" aria-hidden />
        </Accordion.Trigger>
      </Accordion.Header>
      <Accordion.Content>
        <AttributeSelector
          organization={organization}
          attribute={attribute}
          setTokensSize={setTokensSize}
        />
      </Accordion.Content>
    </Accordion.Item>
  )
}

const Filters: FC<Props> = ({ attributes, setTokensSize, organization }) => {
  const router = useRouter()

  const [minPrice, setMinPrice] = useState<string>();
  const [maxPrice, setMaxPrice] = useState<string>();
  const [minHover, setMinHover] = useState(false)
  const [maxHover, setMaxHover] = useState(false)
  const [buyNow, setBuyNow] = useState<boolean>();

  useEffect(() => {
    setMinPrice(router.query["price[gte]"]?.toString() || "")
    setMaxPrice(router.query["price[lte]"]?.toString() || "")

    const buyNowVal = organization.disableAggregation ?
      router.query["buyNow"]?.toString()?.toLowerCase() !== "false"
      : router.query["buyNow"]?.toString()?.toLowerCase() === "true"
    setBuyNow(buyNowVal)
  }, [router.query])

  return (
    <div>
      {organization.disableAggregation && (
        <div
          className="overflow-hidden font-semibold text-sm w-full px-5 py-5 text-left transition border-b"
          style={{ borderColor: organization.secondaryOutlineColorHex || "#CFD8DC"}}
        >
          <div className="flex flex-row items-center justify-between">
            <div style={{ color: organization.primaryFontColorHex || "#000000" }}>
              Buy Now
            </div>
            <Switch
              css={{
                '&[data-state="checked"]': { backgroundColor: organization.primaryColorHex },
              }}
              checked={buyNow}
              onCheckedChange={(checked: boolean) => {
                if (!checked) {
                  toggleOnUrlParam(router, "buyNow", "false")
                } else {
                  toggleOnUrlParam(router, "buyNow", "true")
                }
                setBuyNow(checked)
              }}
            >
              <SwitchThumb />
            </Switch>
          </div>
        </div>
      )}
      <div
        className="overflow-hidden font-semibold text-sm w-full px-5 py-5 text-left transition">
        <div
          style={{
            color: organization.primaryFontColorHex || "#000000",
          }}
          className="mb-3"
        >
          Price range
        </div>
        <div className="flex flex-row gap-3 items-center">
          <div className="relative w-full">
            <img src={organization.darkEthIcon ? '/eth-dark.svg' : '/eth.svg'} alt="ETH logo" className="w-4 h-4 right-3 absolute top-1/2 -translate-y-1/2" />
            <input
              placeholder="Min"
              id="price"
              type="number"
              min={0}
              step={0.01}
              value={minPrice}
              onMouseEnter={() => {
                setMinHover(true)
              }}
              onMouseLeave={() => {
                setMinHover(false)
              }}
              onChange={(e) => {
                if (!e.target.value) {
                  toggleOffUrlParam(router, "price[gte]")
                } else if (router.query["price[gte]"]) {
                  updateUrlParam(router, "price[gte]", e.target.value)
                } else {
                  toggleOnUrlParam(router, "price[gte]", e.target.value)
                }
                setMinPrice(e.target.value)
              }}
              style={{
                borderColor: organization.secondaryOutlineColorHex || "#CFD8DC",
                outlineColor: organization.primaryColorHex,
                backgroundColor: minHover ? organization.secondaryButtonHoverColorHex || "#F8F9FA" : "",
                color: organization.primaryFontColorHex || "#000000",
              }}
              className={
                "focus:outline-none border-[1px] bg-transparent placeholder-secondary-font rounded py-2.5 px-3 w-full pr-8"
              }
            />
          </div>
          <div
            style={{
              color: organization.primaryFontColorHex || "#000000",
            }}
            className="font-normal"
          >
            to
          </div>
          <div className="relative w-full">
            <img src={organization.darkEthIcon ? '/eth-dark.svg' : '/eth.svg'} alt="ETH logo" className="w-4 h-4 right-3 absolute top-1/2 -translate-y-1/2" />
            <input
              placeholder="Max"
              id="price"
              type="number"
              min={0}
              step={0.01}
              value={maxPrice}
              onMouseEnter={() => {
                setMaxHover(true)
              }}
              onMouseLeave={() => {
                setMaxHover(false)
              }}
              onChange={(e) => {
                if (!e.target.value) {
                  toggleOffUrlParam(router, "price[lte]")
                } else if (router.query["price[lte]"]) {
                  updateUrlParam(router, "price[lte]", e.target.value)
                } else {
                  toggleOnUrlParam(router, "price[lte]", e.target.value)
                }
                setMaxPrice(e.target.value)
              }}
              style={{
                borderColor: organization.secondaryOutlineColorHex || "#CFD8DC",
                outlineColor: organization.primaryColorHex,
                backgroundColor: maxHover ? organization.secondaryButtonHoverColorHex || "#F8F9FA" : "",
                color: organization.primaryFontColorHex || "#000000",
              }}
              className={
                "focus:outline-none placeholder-secondary-font bg-transparent rounded border-[1px] py-2.5 px-3 w-full pr-8"
              }
            />
          </div>
        </div>
      </div>
      {attributes.data?.attributes?.length !== 0 && (
        <div
          style={{ color: organization.secondaryFontColorHex || "#959DA6", borderColor: organization.secondaryOutlineColorHex || "#CFD8DC" }}
          className="overflow-hidden font-semibold text-sm w-full px-5 py-4 mt-2 text-left transition uppercase border-t-[1px]"
        >
          Properties
        </div>
      )}
      {attributes.data?.attributes?.map((attribute, idx) => (
        <AccordionItem
          key={`accordion-item-${attribute.key}-${idx}`}
          attribute={attribute}
          setTokensSize={setTokensSize}
          organization={organization}
        />
      ))}
    </div>
  )
}

export default Filters
