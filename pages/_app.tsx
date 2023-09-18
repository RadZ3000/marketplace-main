import 'styles/globals.css'
import 'styles/inter.css'
import 'styles/druk.css'
import 'styles/montserrat.css'
import 'styles/open-sans.css'
import 'styles/playfair-display.css'
import 'styles/roboto.css'
import 'styles/chalkboard.css'
import 'styles/frankruhllibre.css'
import 'styles/gazpacho.css'
import 'styles/editorialnew.css'
import 'styles/lucidagrande.css'
import 'styles/nunitosans.css'
import 'styles/sora.css'
import 'styles/styreneb.css'
import 'styles/gothicusroman.css'
import 'styles/roobert.css'
import 'styles/rodger.css'
import 'styles/blue-goblet.css'
import 'styles/valera-round.css'
import 'styles/sweet-sans-pro.css'
import 'styles/quicksand.css'
import type { AppContext, AppProps } from 'next/app'
import App from 'next/app'
import { WagmiConfig, createClient, allChains, configureChains } from 'wagmi'
import { CoinbaseWalletConnector } from 'wagmi/connectors/coinbaseWallet'
import { InjectedConnector } from 'wagmi/connectors/injected'
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect'
import { alchemyProvider } from 'wagmi/providers/alchemy'
import { publicProvider } from 'wagmi/providers/public'
import { GlobalProvider } from 'context/GlobalState'
import AnalyticsProvider from 'components/AnalyticsProvider'
import { ThemeProvider } from 'next-themes'
import { createGlobalStyle } from 'styled-components'
import { Organization } from 'context/config'
import { OrganizationProvider } from 'context/OrganizationProvider'
import { ReservoirClientProvider, ReservoirClientProviderOptions } from 'context/ReservoirClientProvider'
import { getReservoirApiBase } from 'lib/chain'

// Select a custom ether.js interface for connecting to a network
// Reference = https://wagmi-xyz.vercel.app/docs/provider#provider-optional
// OPTIONAL
const infuraId = process.env.NEXT_PUBLIC_INFURA_ID

const RESERVOIR_API_KEY = process.env.RESERVOIR_API_KEY

// API key for Ethereum node
// Two popular services are Alchemy (alchemy.com) and Infura (infura.io)
const alchemyId = process.env.NEXT_PUBLIC_ALCHEMY_ID

const THEME_SWITCHING_ENABLED = process.env.NEXT_PUBLIC_THEME_SWITCHING_ENABLED
const DARK_MODE_ENABLED = process.env.NEXT_PUBLIC_DARK_MODE

// Set up chains
const { chains, provider } = configureChains(allChains, [
  alchemyProvider({ apiKey: alchemyId }),
  publicProvider(),
])

// Set up connectors
const client = createClient({
  autoConnect: true,
  provider,
  connectors: [
    new InjectedConnector({
      chains,
      options: { name: 'Injected' },
    }),
    new WalletConnectConnector({
      chains,
      options: {
        qrcode: true,
      },
    }),
    new CoinbaseWalletConnector({
      chains,
      options: {
        appName: 'reservoir.market',
      },
    }),
  ],
})

function MyApp({ Component, pageProps, baseUrl }: AppProps & { baseUrl: string }) {
  const defaultTheme = DARK_MODE_ENABLED ? 'dark' : 'light'

  const organization: Organization = pageProps.organization
  const GlobalStyle = createGlobalStyle`
    :root {
      --secondary-font: ${organization?.secondaryFontColorHex || "#959DA6"};
      --primary-font: ${organization?.primaryFontColorHex || "#000000"};
    }
  `

  const baseDomain = typeof window !== 'undefined' ? window.location.origin : baseUrl
  const apiBase = `${baseDomain}/api/reservoir`
  const source = baseDomain.replace(".localhost:3000", "").replace("http://", "").replace("https://", "")
  const reservoirClientOptions: ReservoirClientProviderOptions = {
    apiBase,
    apiKey: RESERVOIR_API_KEY,
    source,
    automatedRoyalties: !Boolean(organization?.royaltyFeeRecipient),
  }

  return (
    <GlobalProvider>
      <OrganizationProvider organization={organization}>
        <WagmiConfig client={client}>
          <AnalyticsProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme={defaultTheme}
              forcedTheme={!THEME_SWITCHING_ENABLED ? defaultTheme : undefined}
            >
              <ReservoirClientProvider options={reservoirClientOptions}>
                <GlobalStyle />
                <Component {...pageProps} />
              </ReservoirClientProvider>
            </ThemeProvider>
          </AnalyticsProvider>
        </WagmiConfig>
      </OrganizationProvider>
    </GlobalProvider>
  )
}

MyApp.getInitialProps = async (appContext: AppContext) => {
  // calls page's `getInitialProps` and fills `appProps.pageProps`
  const appProps = await App.getInitialProps(appContext)
  
  let baseUrl = getReservoirApiBase(appProps.pageProps.organization)
  if (appContext.ctx.req?.headers.host) {
    baseUrl = `http://${appContext.ctx.req?.headers.host}`
  }

  return { ...appProps, baseUrl }
}

export default MyApp
