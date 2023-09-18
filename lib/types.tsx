import { paths } from '@reservoir0x/reservoir-kit-client'
import { Currency } from 'lib/currency'

export enum BuyListingState {
  Created = "created",
  Submitted = "submitted",
  Completed = "completed",
  Success = "success",
}

export type Price = {
  currency: Currency,
  amount: {
    raw: string,
    decimal: number,
    usd: number,
    native: number
  }
}

export type Token = {
  tokenId: string;
  collectionId: string;
  image: string | null;
  name: string;
  kind: string | null;
  ownerAddress: string | null;
  price: Price | null;
  reservoirListing?: {
    orderId?: string | null,
    source: string | null;
    sourceLink: string | null;
    price: Price;
    isLocalListing: boolean;
    duration?: { // this isn't populated on all endpoints.
      startTimeInSeconds: number;
      endTimeInSeconds: number | null;
    } | null;
  } | null,
  attributes?: {
    key?: string | undefined,
    value?: string | undefined,
    tokenCount?: number | undefined,
    onSaleCount?: number | undefined,
    floorAskPrice?: number | undefined,
    topBidValue?: number | undefined
  }[] | null
}

export type TokenInfiniteList = {
  tokens: Token[]
  continuation: string | undefined
}

export enum DirectListState {
  Created = "created",
  Submitted = "submitted",
  Completed = "completed",
  Success = "success",
}

export enum OfferState {
  Created = "created",
  Submitted = "submitted",
  Completed = "completed",
  Success = "success",
}

export type ChainId = 1 | 5

export type Overwrite<T, U> = Pick<T, Exclude<keyof T, keyof U>> & U

type ReservoirTokens = paths['/tokens/v5']['get']['responses']['200']['schema']

export function convertReservoirTokenToSnagToken(reservoirTokens: ReservoirTokens, source?: string): TokenInfiniteList {
  const tokens = reservoirTokens.tokens?.map((token) => {        
    const tokenId = token?.token?.tokenId || ""
    let reservoirListing = null
    const price = token.market?.floorAsk?.price as any
    if (price) {
      if (price?.currency !== undefined) {
        const sourceDomain = (token.market?.floorAsk?.source?.["domain"] as string)?.toLowerCase() ?? null
        reservoirListing = {
          orderId: token?.market?.floorAsk?.id,
          source: sourceDomain,
          sourceLink: null,
          price,
          isLocalListing: Boolean(source) && sourceDomain === source
        }
      }
    }

    return {
      collectionId: token.token?.collection?.id?.toLowerCase() ?? "",
      tokenId: tokenId,
      kind: token.token?.kind ?? null,
      name: token?.token?.name ?? `Token #${tokenId}`,
      ownerAddress: token?.token?.owner ?? null,
      image: token?.token?.image ?? null,
      price: reservoirListing?.price ?? null,
      reservoirListing: reservoirListing,
      attributes: token?.token?.attributes,
    }
  })
  return {
    tokens: tokens ?? [],
    continuation: reservoirTokens.continuation,
  }
}

type ReservoirUserTokens = paths['/users/{user}/tokens/v5']['get']['responses']['200']['schema']

export function convertReservoirUserTokenToSnagToken(reservoirTokens: ReservoirUserTokens, ownerAddress: string | null, source?: string): TokenInfiniteList {
  const tokens = reservoirTokens.tokens?.map((token) => {        
    const tokenId = token?.token?.tokenId || ""
    let reservoirListing = null
    const price = token.ownership?.floorAsk?.price as any
    if (price) {
      reservoirListing = {
        source: null,
        sourceLink: null,
        price,
        isLocalListing: true, // # this is not true, but setting to true to unblock
      }
    }

    return {
      collectionId: token.token?.collection?.id?.toLowerCase() ?? "",
      tokenId: tokenId,
      kind: null,
      name: token?.token?.name ?? `Token #${tokenId}`,
      ownerAddress,
      image: token?.token?.image ?? null,
      price: reservoirListing?.price,
      reservoirListing: reservoirListing,
    }
  })
  return {
    tokens: tokens ?? [],
    continuation: undefined,
  }
}
