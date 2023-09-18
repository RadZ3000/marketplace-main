import { Organization } from "context/config"

const GOERLI_NETWORK = 5
const MAINNET_NETWORK = 1


export function getChainId(organization: Organization | null) {
  if (!organization) return null

  return organization.testnetNetwork ? GOERLI_NETWORK : MAINNET_NETWORK
}

export function getReservoirApiBase(organization: Organization | null) {
  if (!organization) return null

  return organization.testnetNetwork ? "https://api-goerli.reservoir.tools" : "https://api.reservoir.tools"
}
