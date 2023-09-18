import { CurrencySymbol } from 'lib/currency'

const env = process.env.NODE_ENV

export type Collection = {
  name: string
  contractId: string
  listingIcon: string
  royaltyFee?: number
  royaltyFeeRecipient?: string
  savingsRate?: number
}

export type CurrencyOption = {
  symbol: CurrencySymbol
  royaltyFee?: number
  royaltyFeeRecipient? : string
  serviceFee?: number
  serviceFeeRecipient?: string
  savingsRate?: number
}

export type Organization = {
  name: string
  contractId: string
  listingIcon: string
  aggregateIcon?: string
  websiteIcon?: string
  titleBarBanner?: string
  groupName?: string

  collections: Collection[]

  reservoirCollectionSetId?: string

  disableAggregation?: boolean
  combineFeesInUI?: boolean

  url: string // this should be the same as the key, used for twitter url
  primaryColorHex: string
  primaryColorHoverHex?: string
  primaryButtonBoxShadow?: number
  borderRadius?: string

  backgroundCss?: string
  backgroundImage?: string
  backgroundColorHex?: string
  secondaryBackgroundColorHex?: string
  primaryOutlineColorHex?: string
  secondaryOutlineColorHex?: string

  secondaryButtonColorHex?: string
  
  secondaryButtonHoverColorHex?: string

  primaryFontColorHex?: string
  secondaryFontColorHex?: string
  darkEthIcon?: boolean

  positiveColorHex?: string
  negativeColorHex?: string
  font?: string
  royaltyFee: number
  royaltyFeeRecipient? : string
  serviceFee: number
  serviceFeeRecipient: string
  savingsRate: number
  titleIconUrl?: string
  homeUrl: string
  tweet?: string // Ensure this is within char limit
  discordUrl?: string
  twitterUrl?: string
  instagramUrl?: string
  facebookUrl?: string

  disableBannedOnOpenSea?: boolean
  betaTag?: boolean

  testnetNetwork?: boolean
  currencies?: CurrencyOption[]

  development?: {
    collections: Collection[]
    royaltyFee?: number
    serviceFee?: number
    testnetNetwork?: boolean
  }

  hidePoweredBySnag?: boolean
}

const hostnameToOrganization: { [key: string]: Organization } = {
  'staging.snag-render.com': {
    name: "CryptoChicks",
    contractId: "0x1981cc36b59cffdd24b01cc5d698daa75e367e04",
    listingIcon: "/icons/CryptoChicks.jpeg",
    collections: [{
      name: "CryptoChicks",
      contractId: '0x1981cc36b59cffdd24b01cc5d698daa75e367e04',
      listingIcon: "/icons/CryptoChicks.jpeg",
    }],
    primaryColorHex: "#741B47",
    url: 'https://cryptochicks.snag-render.com',
    royaltyFee: 0.05,
    royaltyFeeRecipient: "0x70BF5945845546716E628Cedc8F83d82179a79E9",
    serviceFee: 0,
    serviceFeeRecipient: "0x70BF5945845546716E628Cedc8F83d82179a79E9",
    savingsRate: 0.025,
    homeUrl: "https://www.cryptochicks.app/",
    tweet: "I just purchased an @NFTCryptoChicks",
    discordUrl: "https://discord.gg/TJ4DZvEhFv",
    twitterUrl: "https://twitter.com/NFTCryptoChicks",
    instagramUrl: "https://www.instagram.com/cryptochicksnft/",
    facebookUrl: "https://www.facebook.com/CryptoChicksOrg/",
    disableBannedOnOpenSea: false,

    currencies: [
      {
        symbol: 'APE',
        royaltyFee: 0.06,
        royaltyFeeRecipient: '0x70BF5945845546716E628Cedc8F83d82179a79E9',
        serviceFee: 0.015,
        serviceFeeRecipient: '0x70BF5945845546716E628Cedc8F83d82179a79E9',
        savingsRate: 0.02,
      },
    ],
    development: {
      testnetNetwork: true,
      collections: [{
        name: "CryptoChicks",
        contractId: '0xc12574fab74e35402f3775fb00e67c6b3f5dbb8f',
        listingIcon: "/icons/CryptoChicks.jpeg",
      },{
        name: "CryptoChicks",
        contractId: '0xc12574fab74e35402f3775fb00e67c6b3f5dbb8f',
        listingIcon: "/icons/CryptoChicks.jpeg",
      }],
    },
  },
  'marketplace.cryptochicks.app': {
    name: "CryptoChicks",
    contractId: "0x1981cc36b59cffdd24b01cc5d698daa75e367e04",
    listingIcon: "/icons/CryptoChicks.jpeg",
    collections: [{
      name: "CryptoChicks",
      contractId: '0x1981cc36b59cffdd24b01cc5d698daa75e367e04',
      listingIcon: "/icons/CryptoChicks.jpeg",
    }],
    primaryColorHex: "#741B47",
    url: 'https://marketplace.cryptochicks.app',
    royaltyFee: 0.05,
    serviceFee: 0,
    serviceFeeRecipient: "0x70BF5945845546716E628Cedc8F83d82179a79E9",
    savingsRate: 0.025,
    homeUrl: "https://www.cryptochicks.app/",
    tweet: "I just purchased an @NFTCryptoChicks",
    discordUrl: "https://discord.gg/TJ4DZvEhFv",
    twitterUrl: "https://twitter.com/NFTCryptoChicks",
    instagramUrl: "https://www.instagram.com/cryptochicksnft/",
    facebookUrl: "https://www.facebook.com/CryptoChicksOrg/",
    disableBannedOnOpenSea: false,

  },
  'boki.snag-render.com': {
    name: "Boki",
    contractId: "0x248139afb8d3a2e16154fbe4fb528a3a214fd8e7",
    listingIcon: "/icons/boki.svg",
    collections: [{
      name: "Boki",
      contractId: '0x248139afb8d3a2e16154fbe4fb528a3a214fd8e7',
      listingIcon: "/icons/boki.svg",
    }],
    primaryColorHex: "#412E28",
    backgroundColorHex: "#FFE2C8",
    secondaryBackgroundColorHex: "#FFF0E1",

    secondaryButtonColorHex: "#FFFFFF00",
    secondaryButtonHoverColorHex: "#0000000D",
    primaryOutlineColorHex: "#A8806B",
    secondaryOutlineColorHex: "#A8806B",

    secondaryFontColorHex: "#A8806B",

    positiveColorHex: "#64A193",
    negativeColorHex: "#F35166",
    font: "Valera Round",

    url: 'https://boki.snag-render.com',
    royaltyFee: 0.05,
    serviceFee: 0,
    serviceFeeRecipient: "0x70BF5945845546716E628Cedc8F83d82179a79E9",
    savingsRate: 0.025,
    homeUrl: "https://www.boki.art/",
    tweet: "I just purchased an @BokiNFT",
    discordUrl: "https://discord.gg/bokiworld",
    twitterUrl: "https://twitter.com/BokiNFT",
    instagramUrl: "https://www.instagram.com/bokinft/",
    disableBannedOnOpenSea: false,

  },
  'marketplace.nfteams.club': {
    name: "NFTeams",
    contractId: "0x03f5cee0d698c24a42a396ec6bdaee014057d4c8",
    listingIcon: "/icons/NFTeams.png",
    collections: [{
      name: "NFTeams",
      contractId: '0x03f5cee0d698c24a42a396ec6bdaee014057d4c8',
      listingIcon: "/icons/NFTeams.png",
    },
    {
      name: "NFTeams Mint Passes",
      contractId: '0x47372620e06b05e722ee829f487fa132bc5a79a7',
      listingIcon: "/icons/NFTeams.png",
    }],
    primaryColorHex: "#22a75d",
    backgroundColorHex: "#050609",

    secondaryBackgroundColorHex: "#242528",
    secondaryOutlineColorHex: "#45494D",
    secondaryButtonColorHex: "#FFFFFF00",
    secondaryButtonHoverColorHex: "#F9FAFB0D",

    primaryFontColorHex: "#FFFFFF",

    primaryOutlineColorHex: "#091A2A",
    darkEthIcon: true,

    url: 'https://marketplace.nfteams.club',
    royaltyFee: 0,
    royaltyFeeRecipient: "0x70BF5945845546716E628Cedc8F83d82179a79E9",
    serviceFee: 0,
    serviceFeeRecipient: "0x70BF5945845546716E628Cedc8F83d82179a79E9",
    savingsRate: 0.075,
    homeUrl: "https://www.nfteams.club/",
    tweet: "I just purchased an @NFTeams_",
    discordUrl: "https://discord.gg/GUKXQvryd2",
    twitterUrl: "https://www.twitter.com/NFTeams_",
    disableBannedOnOpenSea: false,
  },
  'marketplace.truthlabs.co': {
    name: "goblintown.wtf",
    contractId: "0xbce3781ae7ca1a5e050bd9c4c77369867ebc307e",
    listingIcon: "/icons/goblintown.svg",
    aggregateIcon: "/icons/Truth.svg",
    websiteIcon: "/icons/TruthWebsite.gif",
    groupName: "Truth Labs",
    collections: [{
      name: "goblintown.wtf",
      contractId: '0xbce3781ae7ca1a5e050bd9c4c77369867ebc307e',
      listingIcon: "/icons/goblintown.svg",
    }, {
      name: "IlluminatiNFT",
      contractId: "0x26badf693f2b103b021c670c852262b379bbbe8a",
      listingIcon: "/icons/illuminatinft.gif",
    }, {
      name: "The 187",
      contractId: "0xa48eda4b2c63928cac2a1fd631493ac038dafa5d",
      listingIcon: "/icons/187.png",
    }, {
      name: "grumpls",
      contractId: "0x529574d1affef7cf347cdd02b91efd2c00bb773b",
      listingIcon: "/icons/grumpls.png",
    }, {
      name: "mcgoblintown.wtf",
      contractId: '0xc5b52253f5225835cc81c52cdb3d6a22bc3b0c93',
      listingIcon: "/icons/mcgoblin.svg",
    }, {
      name: "IlluminatiNFT DAO",
      contractId: "0xe25f0fe686477f9df3c2876c4902d3b85f75f33a",
      listingIcon: "/icons/illuminatidao.gif",
    }, {
      name: "UNDAO",
      contractId: "0x7912a656ece2bc669d4116ad8e9495f722d92d76",
      listingIcon: "/icons/undao.gif",
    }, {
      name: "IlluminatiNFT Illuminaries",
      contractId: "0x50b4a624b297198debedf908940f7aacfba60180",
      listingIcon: "/icons/illuminatinftilluminaries.jpeg",
    }, {
      name: "IlluminatiNFT - Mint Pass",
      contractId: "0xbfc5f30e9da14d9506a0ea1eea71e2bf6bb0c3f9",
      listingIcon: "/icons/illuminatipasses.jpeg",
    }, {
      name: "IlluminatiNFT - Believer Pass",
      contractId: "0x3266b70962a61f1917f79c387749e3bd95a9ff52",
      listingIcon: "/icons/illuminatipasses.jpeg",
    }, {
      name: "IlluminatiNFT - Community Pass",
      contractId: "0x920cc6bf85c293b778fb22c79a391c8b014800dd",
      listingIcon: "/icons/illuminatipasses.jpeg",
    }, {
      name: "CryptoFace.me",
      contractId: "0x66dab8a88b7ca020a89f45380cc61692fe62e7ed",
      listingIcon: "/icons/gearface.png",
      royaltyFee: 0.072,
      royaltyFeeRecipient: "0x8c53577C1AaFce6B8A50E0173BD8E32e54D41009",
      savingsRate: 0.025
    }],
    reservoirCollectionSetId: "9f01eb2116a528d60559281e65f944949075d03495169c308e737c14863fe214",
    disableAggregation: true,
    primaryColorHex: "#82933c",
    primaryColorHoverHex: "#257d35",
    primaryButtonBoxShadow: 2,
    backgroundColorHex: "#FFFBF5",
    secondaryBackgroundColorHex: "#FFFFFF",
    primaryOutlineColorHex: "#091A2A",

    primaryFontColorHex: "#091A2A",
    secondaryFontColorHex: "#A6A6A6",

    secondaryOutlineColorHex: "#A6A6A6",
    secondaryButtonHoverColorHex: "#F2F2F2",

    borderRadius: "4px",
    font: "Sweet Sans Pro",
    url: 'https://marketplace.truthlabs.co/',
    royaltyFee: 0.047,
    royaltyFeeRecipient: "0xe382357719828bb01C6116D564aBa0B15F2Ac89e",
    serviceFee: 0.003,
    combineFeesInUI: true,
    serviceFeeRecipient: "0x70BF5945845546716E628Cedc8F83d82179a79E9",
    savingsRate: 0.05,
    homeUrl: "https://truthlabs.co/",
    tweet: "I just purchased a @truth NFT!",
    twitterUrl: "https://twitter.com/truth",
    disableBannedOnOpenSea: true,
    betaTag: true,
    hidePoweredBySnag: true,
  },
  'bayc.snag-render.com': {
    name: "Bored Ape Yacht Club",
    groupName: "ApeCoin DAO",
    aggregateIcon: "/icons/apecoin.png",
    contractId: "0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d",
    listingIcon: "/icons/bayc.png",
    collections: [{
      name: "Bored Ape Yacht Club",
      contractId: '0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d',
      listingIcon: "/icons/bayc.png",
    }, {
      name: "Mutant Ape Yacht Club",
      contractId: '0x60E4d786628Fea6478F785A6d7e704777c86a7c6',
      listingIcon: "/icons/mayc.png",
    }, {
      name: "Bored Ape Kennel Club",
      contractId: '0xba30E5F9Bb24caa003E9f2f0497Ad287FDF95623',
      listingIcon: "/icons/bakc.png",
      royaltyFee: 0,
      royaltyFeeRecipient: "0x70BF5945845546716E628Cedc8F83d82179a79E9",
    }, {
      name: "Otherdeed for Otherside",
      contractId: '0x34d85c9CDeB23FA97cb08333b511ac86E1C4E258',
      listingIcon: "/icons/ofo.png",
      royaltyFee: 0.05,
      royaltyFeeRecipient: "0x70BF5945845546716E628Cedc8F83d82179a79E9",
    }, {
      name: "Bored Ape Chemistry Club",
      contractId: '0x22c36BfdCef207F9c0CC941936eff94D4246d14A',
      listingIcon: "/icons/bacc.png",
    }],
    primaryColorHex: "#0E28E3",
    backgroundColorHex: "#000000",

    secondaryBackgroundColorHex: "#000000",
    secondaryOutlineColorHex: "#45494D",
    secondaryButtonColorHex: "#FFFFFF00",
    secondaryButtonHoverColorHex: "#222222",

    primaryFontColorHex: "#FFFFFF",

    primaryOutlineColorHex: "#091A2A",
    darkEthIcon: true,

    url: 'https://bayc.snag-render.com',
    royaltyFee: 0.025,
    serviceFee: 0.0025,
    serviceFeeRecipient: "0x70BF5945845546716E628Cedc8F83d82179a79E9",
    savingsRate: 0.02,
    homeUrl: "https://apecoin.com/",
    discordUrl: "https://discord.gg/3P5K3dzgdB",
    twitterUrl: "https://www.twitter.com/BoredApeYC",

    currencies: [
      {
        symbol: 'APE',
        royaltyFee: 0.0025,
        royaltyFeeRecipient: '0x70BF5945845546716E628Cedc8F83d82179a79E9',
        serviceFee: 0,
        serviceFeeRecipient: '0x70BF5945845546716E628Cedc8F83d82179a79E9',
        savingsRate: 0.0225,
      },
    ],
  },
  'bayc-audit.snag-render.com': {
    name: "Bored Ape Yacht Club",
    groupName: "ApeCoin DAO",
    contractId: "0x8ad5a4fa5edd954b42f8ead1a45c3eb9affdaccb",
    listingIcon: "/icons/bayc.png",
    aggregateIcon: "/icons/apecoin.png",
    collections: [{
      name: "Bored Ape Yacht Club",
      contractId: '0x8ad5a4fa5edd954b42f8ead1a45c3eb9affdaccb',
      listingIcon: "/icons/bayc.png",
    }],
    primaryColorHex: "#0E28E3",
    backgroundColorHex: "#000000",

    secondaryBackgroundColorHex: "#000000",
    secondaryOutlineColorHex: "#45494D",
    secondaryButtonColorHex: "#FFFFFF00",
    secondaryButtonHoverColorHex: "#222222",

    primaryFontColorHex: "#FFFFFF",

    primaryOutlineColorHex: "#091A2A",
    darkEthIcon: true,

    url: 'https://bayc-audit.snag-render.com',
    royaltyFee: 0.025,
    serviceFee: 0.0025,
    serviceFeeRecipient: "0x70BF5945845546716E628Cedc8F83d82179a79E9",
    savingsRate: 0.02,
    homeUrl: "https://apecoin.com/",
    discordUrl: "https://discord.gg/3P5K3dzgdB",
    twitterUrl: "https://www.twitter.com/BoredApeYC",

    currencies: [
      {
        symbol: 'GOAPE',
        royaltyFee: 0.0025,
        royaltyFeeRecipient: '0x70BF5945845546716E628Cedc8F83d82179a79E9',
        serviceFee: 0,
        serviceFeeRecipient: '0x70BF5945845546716E628Cedc8F83d82179a79E9',
        savingsRate: 0.0225,
      },
    ],

    testnetNetwork: true,
  },
  'marketplace.piratesnft.io': {
    name: "Pirates of the Metaverse",
    contractId: "0xe75113d4a417c2d33c67fb127b419e5f47c5d62c",
    listingIcon: "/icons/pirates.svg",
    collections: [{
      name: "Pirates of the Metaverse",
      contractId: '0xe75113d4a417c2d33c67fb127b419e5f47c5d62c',
      listingIcon: "/icons/pirates.svg",
    }],

    font: "Quicksand",
    primaryColorHex: "#DF105F",

    secondaryBackgroundColorHex: "#FFFFFF00",
    secondaryOutlineColorHex: "#45494D",
    secondaryButtonColorHex: "#FFFFFF00",
    secondaryButtonHoverColorHex: "#F9FAFB0D",

    primaryFontColorHex: "#FFFFFF",

    backgroundCss: "radial-gradient(111.78% 111.78% at 50% -11.78%, #0F1334 0%, #000000 100%)",
    primaryOutlineColorHex: "#091A2A",
    darkEthIcon: true,

    url: 'https://marketplace.piratesnft.io',
    royaltyFee: 0.01,
    royaltyFeeRecipient: "0xB01A3021f067c16FA1ac56F790cFdE75CD8e63e3",
    serviceFee: 0,
    serviceFeeRecipient: "0x70BF5945845546716E628Cedc8F83d82179a79E9",
    savingsRate: 0.065,
    homeUrl: "https://www.piratesnft.io/",
    twitterUrl: "https://twitter.com/PiratesMeta",
    discordUrl: "https://discord.gg/SfE4GvHp7T",
    instagramUrl: "https://www.instagram.com/piratesmeta/",
  },
  'marketplace.tajigen.xyz': {
    name: "Citizens of Tajigen",
    contractId: "0xb000a4933107033a4e5483a1576eda178f769508",
    listingIcon: "/icons/citizens.jpeg",
    collections: [{
      name: "Citizens of Tajigen",
      contractId: '0xb000a4933107033a4e5483a1576eda178f769508',
      listingIcon: "/icons/citizens.jpeg",
    }],
    primaryColorHex: "#2B2936",
    backgroundColorHex: "#FAFAFC",
    url: 'https://marketplace.tajigen.xyz',
    royaltyFee: 0,
    royaltyFeeRecipient: "0x77772620e637C1e3276E615638a51C13F3176A69",
    serviceFee: 0,
    serviceFeeRecipient: "0x70BF5945845546716E628Cedc8F83d82179a79E9",
    savingsRate: 0.075,
    homeUrl: "https://www.tajigen.xyz/",
    tweet: "I just purchased an @0xTajigen NFT",
    discordUrl: "https://discord.com/invite/tajigen",
    twitterUrl: "https://twitter.com/0xTajigen",
  },
  'market.foxyfam.io': {
    name: "FoxyFams",
    contractId: "0x444467738cf0c5bcca9c1d6f66670f4c493e53ff",
    listingIcon: "/icons/foxyfam.png",
    collections: [{
      name: "FoxyFams",
      contractId: '0x444467738cf0c5bcca9c1d6f66670f4c493e53ff',
      listingIcon: "/icons/foxyfam.png",
    },
    {
      name: "FoxyHounds",
      contractId: '0xde3a8b06113d18e41949812b77716ea865aa8f48',
      listingIcon: "/icons/foxyhound.webp",
    }],
    primaryColorHex: "#3c7011",
    secondaryBackgroundColorHex: "#FFFFFF",
    secondaryFontColorHex: "#71797E",
    url: 'https://market.foxyfam.io',
    backgroundImage: "/icons/foxyfamBg.svg",
    royaltyFee: 0.05,
    serviceFee: 0,
    serviceFeeRecipient: "0x70BF5945845546716E628Cedc8F83d82179a79E9",
    savingsRate: 0.025,
    homeUrl: "http://foxyfam.io/",
    tweet: "I just purchased an @foxyfamnft",
    discordUrl: "https://discord.gg/TJ4DZvEhFv",
    twitterUrl: "https://www.twitter.com/foxyfamnft",
  },
  'market.killabears.com': {
    name: "Killabears",
    contractId: "0xc99c679c50033bbc5321eb88752e89a93e9e83c5",
    listingIcon: "/icons/killabears.webp",
    groupName: "Killabears",
    collections: [{
      name: "Killabears",
      contractId: '0xc99c679c50033bbc5321eb88752e89a93e9e83c5',
      listingIcon: "/icons/killabears.webp",
    },{
      name: "Killabits",
      contractId: "0x64a1c0937728d8d2fa8cd81ef61a9c860b7362db",
      listingIcon: "/icons/killabits.webp",
    }],
    primaryColorHex: "#252b2d",
    url: 'https://market.killabears.com',
    royaltyFee: 0.065,
    serviceFee: 0,
    serviceFeeRecipient: "0x70BF5945845546716E628Cedc8F83d82179a79E9",
    savingsRate: 0.025,
    homeUrl: "https://killabears.com/",
    tweet: "I just purchased an @killabearsnft",
    discordUrl: "https://discord.gg/fdmWqgaytj",
    twitterUrl: "https://www.twitter.com/killabearsnft",
  },
  'wasd.snag-render.com': {
    name: "We All Survive Death",
    contractId: "0x27013d274aa60c6e6883aa2130e8b01249eb11d4",
    listingIcon: "/icons/wasd.webp",
    collections: [{
      name: "We All Survive Death",
      contractId: '0x27013d274aa60c6e6883aa2130e8b01249eb11d4',
      listingIcon: "/icons/wasd.webp",
    }],
    primaryColorHex: "#181818",
    secondaryBackgroundColorHex: "#242528",
    secondaryOutlineColorHex: "#45494D",
    secondaryButtonColorHex: "#FFFFFF00",
    secondaryButtonHoverColorHex: "#F9FAFB0D",

    primaryFontColorHex: "#FFFFFF",

    backgroundColorHex: "#050609",
    primaryOutlineColorHex: "#091A2A",
    darkEthIcon: true,
    url: 'https://wasd.snag-render.com',
    royaltyFee: 0.075,
    serviceFee: 0,
    serviceFeeRecipient: "0x70BF5945845546716E628Cedc8F83d82179a79E9",
    savingsRate: 0.025,
    homeUrl: "https://wasdnft.com/",
    tweet: "I just purchased an @WeAllSurvived",
    discordUrl: "https://discord.gg/wasd",
    instagramUrl: "https://www.instagram.com/wasdnft",
    twitterUrl: "https://www.twitter.com/WeAllSurvived",

    currencies: [
      {
        symbol: 'APE',
      },
    ],
  },
  'webacy.snag-render.com': {
    name: "Grimmies",
    groupName: "Webacy",
    contractId: "0x760C355b8E3DBdA999CC7f41B9278104B782d235",
    listingIcon: "/icons/grimmies.webp",
    titleBarBanner: "/icons/grimmies-bar.png",
    collections: [{
      name: "Grimmies",
      contractId: '0x760C355b8E3DBdA999CC7f41B9278104B782d235',
      listingIcon: "/icons/grimmies.webp",
    }],
    primaryColorHex: "#688EC0",
    backgroundColorHex: "#B8FFAD",
    secondaryOutlineColorHex: "#688EC0",
    secondaryBackgroundColorHex: "#FFFFFF",
  
    url: 'https://webacy.snag-render.com',
    royaltyFee: 0.05,
    royaltyFeeRecipient: "0xb39CBdA91e0316B59B25C6DA733195bBfca9d733",
    serviceFee: 0,
    serviceFeeRecipient: "0x70BF5945845546716E628Cedc8F83d82179a79E9",
    savingsRate: 0.044,
    homeUrl: "https://www.grimmies.io/",
    tweet: "I just purchased an @GrimmiesNFT",
    discordUrl: "https://discord.gg/SuqmqqY82F",
    instagramUrl: "https://www.instagram.com/mywebacy",
    twitterUrl: "https://www.twitter.com/GrimmiesNFT",
  },
  'notokaybear.snag-render.com': {
    name: "Not Okay Bears",
    contractId: "0x76B3AF5F0f9B89CA5a4f9fe6C58421dbE567062d",
    listingIcon: "/icons/notokaybear.png",
    collections: [{
      name: "Not Okay Bears",
      contractId: '0x76B3AF5F0f9B89CA5a4f9fe6C58421dbE567062d',
      listingIcon: "/icons/notokaybear.png",
    }],
    primaryColorHex: "#16AFCA",
    backgroundColorHex: "#202D39",

    secondaryBackgroundColorHex: "#242528",
    secondaryOutlineColorHex: "#45494D",
    secondaryButtonColorHex: "#FFFFFF00",
    secondaryButtonHoverColorHex: "#F9FAFB0D",
    primaryFontColorHex: "#FFFFFF",
    primaryOutlineColorHex: "#091A2A",
    darkEthIcon: true,
  
    url: 'https://notokaybear.snag-render.com',
    royaltyFee: 0.075,
    serviceFee: 0,
    serviceFeeRecipient: "0x70BF5945845546716E628Cedc8F83d82179a79E9",
    savingsRate: 0.025,
    homeUrl: "https://notokay.art/",
    tweet: "I just purchased an @Not_OkayBears",
    discordUrl: "https://discord.gg/notokaybears",
    instagramUrl: "https://www.instagram.com/notokaybearsnft",
    twitterUrl: "https://www.twitter.com/Not_OkayBears",
  },
  'primordials.snag-render.com': {
    name: "Primordials",
    groupName: "Playcent",
    contractId: "0xf7d76a348414AB54c2DBEd8F5317DCA434C7ACA2",
    listingIcon: "/icons/primordials.png",
    collections: [{
      name: "Primordials",
      contractId: '0xf7d76a348414AB54c2DBEd8F5317DCA434C7ACA2',
      listingIcon: "/icons/primordials.png",
    }],
    primaryColorHex: "#E0623C",
    backgroundColorHex: "#020202",
    secondaryBackgroundColorHex: "#242528",
    secondaryOutlineColorHex: "#45494D",
    secondaryButtonColorHex: "#FFFFFF00",
    secondaryButtonHoverColorHex: "#F9FAFB0D",
    primaryFontColorHex: "#FFFFFF",
    primaryOutlineColorHex: "#091A2A",
    darkEthIcon: true,
    url: 'https://primordials.snag-render.com',
    royaltyFee: 0.10,
    serviceFee: 0.01,
    serviceFeeRecipient: "0x70BF5945845546716E628Cedc8F83d82179a79E9",
    savingsRate: 0.015,
    homeUrl: "https://primordials.io/",
    tweet: "I just purchased an @primordialsio",
    discordUrl: "https://discord.gg/zSUHTK6syM",
    twitterUrl: "https://www.twitter.com/primordialsio",
    disableBannedOnOpenSea: false,
  },
}

export const getOrganizationFromHostname = (hostname?: string, contractId?: string): Organization | null => {
  if (!hostname) {
    return null
  }

  let developmentMode = env !== "production"
  if(developmentMode) {
    hostname = hostname.replace(".localhost:3000", "")
  }

  let organization = hostnameToOrganization[hostname]
  if (!organization) {
    return null
  }
  
  if (developmentMode && organization.development) {
    organization = {
      ...organization,
      ...organization.development,
    }
  }

  const collection = contractId && organization.collections.find((collection) => collection.contractId.toLowerCase() === contractId.toLowerCase())
  if (collection) {
    organization = {
      ...organization,
      ...collection,
    }
  }
  if (developmentMode && !contractId && organization.collections.length > 0) {
    const defaultCollection = organization.collections[0]
    organization = {
      ...organization,
      ...defaultCollection,
    }
  }

  return organization;
}
