import React, { FC } from 'react'
import useReservoirClient from 'hooks/useReservoirClient'
import { constants } from 'ethers'
import { styled } from '@stitches/react'
import { StyledComponent } from '@stitches/react/types/styled-component'
import { Organization } from 'context/config'

type Props = {
  address: string
  organization: Organization
  className?: string
} & Parameters<StyledComponent>['0']

const StyledImg = styled('img', {})

const CryptoCurrencyIcon: FC<Props> = ({
  address = constants.AddressZero,
  organization,
  css,
  className,
}) => {
  let src = `https://api${organization.testnetNetwork ? "-goerli" : ""}.reservoir.tools/redirect/currency/${address}/icon/v1`
  if (constants.AddressZero === address) {
    src = organization.darkEthIcon ? '/eth-dark.svg' : '/eth.svg'
  }

  return (
    <StyledImg
      src={src}
      css={css}
      className={className}
    />
  )
}

export default CryptoCurrencyIcon
