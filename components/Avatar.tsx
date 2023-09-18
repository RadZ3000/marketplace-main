import { FC } from 'react'
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon'

type Props = {
  address: string | undefined
  avatar?: string | null | undefined
  size?: number
}

const Avatar: FC<Props> = ({ address, avatar, size = 24 }) => {
  return avatar ? (
    <div
      className="rounded-full"
      style={{
        height: size,
        width: size,
      }}
    >
      <img
        className="h-full w-full rounded-full"
        src={avatar}
        alt={'ENS Avatar'}
      />
    </div>
  ) : (
    <Jazzicon
      diameter={size}
      paperStyles={{
        borderRadius: `${size / 2}px`
      }}
      seed={jsNumberForAddress(address || '')}
    />
  )
}

export default Avatar
