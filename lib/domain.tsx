export function getBaseDomain() {
  {
    return window.location.host.replace(".localhost:3000", "")
  }
}

export function getBaseDomainFromHost(host: string) {
  {
    return host.replace(".localhost:3000", "")
  }
}
