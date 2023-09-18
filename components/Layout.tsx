import { ComponentProps, FC } from 'react'
import { Toaster } from 'react-hot-toast'
import NetworkWarning from './NetworkWarning'
import { Organization } from 'context/config'

type Props = {
  organization: Organization
}

const Layout: FC<Props> = ({ organization, children }) => {
  return (
    <div style={{
      fontFamily: organization.font,
      background: organization.backgroundCss,
      backgroundColor: organization.backgroundColorHex,
      ...(organization.backgroundImage ? {
        background: `url(${organization.backgroundImage}) no-repeat`,
        backgroundAttachment: 'fixed',
        backgroundSize: 'cover',
      } : {})
    }}>
      <Toaster position={'top-right'} />
      <NetworkWarning />
      <main className="min-h-screen mx-auto max-w-[2560px] pb-4">
        <div className="grid grid-cols-8 md:gap-x-4 lg:gap-x-[60px] md:grid-cols-8 lg:grid-cols-12">
          {children}
        </div>
      </main>
    </div>
  )
}

export default Layout
