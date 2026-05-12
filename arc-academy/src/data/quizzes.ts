export interface Question {
  q: string;
  options: string[];
  correct: string;
}

export interface Quiz {
  id: string;
  name: string;
  module: string;
  link: string;
  questions: Question[];
}

export const QUIZZES: Quiz[] = [
  {
    id: "quiz-1",
    name: "Arc House & Architects Program",
    module: "MODULE_01",
    link: "https://community.arc.network/public/externals/introducing-arc-house-and-the-architects-program-2026-03-31",
    questions: [
      {
        q: "What is Arc House primarily designed for?",
        options: ["Token trading", "Mining rewards", "Community collaboration and builder engagement", "NFT marketplace"],
        correct: "Community collaboration and builder engagement",
      },
      {
        q: "How does someone become an Architect in the program?",
        options: ["By submitting an application form", "By buying tokens", "By contributing and earning points through activity", "By staking assets"],
        correct: "By contributing and earning points through activity",
      },
      {
        q: "What is the main purpose of the Architects Program?",
        options: ["To distribute airdrops only", "To grow and support the ecosystem through contributors", "To control validators", "To reduce transaction fees"],
        correct: "To grow and support the ecosystem through contributors",
      },
      {
        q: "What do participants earn through their contributions?",
        options: ["Only tokens", "Only NFTs", "Points, reputation, and opportunities within the ecosystem", "Mining rewards"],
        correct: "Points, reputation, and opportunities within the ecosystem",
      },
      {
        q: "What kind of activities can increase your Architect level?",
        options: ["Only trading", "Posting content, attending events, and helping the community", "Just holding tokens", "Running nodes only"],
        correct: "Posting content, attending events, and helping the community",
      },
    ],
  },
  {
    id: "quiz-2",
    name: "USDC on Arc – Capital Efficiency",
    module: "MODULE_02",
    link: "https://community.arc.network/public/externals/usdc-on-arc-a-capital-efficient-path-for-banks-2026-03-26",
    questions: [
      {
        q: "What is the main benefit of using USDC on Arc for banks?",
        options: ["Higher volatility", "Capital efficiency and faster settlement", "Increased transaction delays", "Manual reconciliation"],
        correct: "Capital efficiency and faster settlement",
      },
      {
        q: "How does Arc improve capital efficiency for financial institutions?",
        options: ["By increasing fees", "By locking funds longer", "By enabling near-instant settlement and reducing idle capital", "By limiting transactions"],
        correct: "By enabling near-instant settlement and reducing idle capital",
      },
      {
        q: "What role does USDC play in this system?",
        options: ["Governance token", "Mining reward", "Stable digital dollar for transactions and settlements", "NFT currency"],
        correct: "Stable digital dollar for transactions and settlements",
      },
      {
        q: "Why is instant settlement important for banks?",
        options: ["It increases paperwork", "It reduces liquidity needs and operational risk", "It slows down transactions", "It removes compliance"],
        correct: "It reduces liquidity needs and operational risk",
      },
      {
        q: "What makes Arc suitable for institutional adoption?",
        options: ["Meme coin ecosystem", "Unpredictable fees", "Stablecoin-native design with reliable infrastructure", "Anonymous transactions only"],
        correct: "Stablecoin-native design with reliable infrastructure",
      },
    ],
  },
  {
    id: "quiz-3",
    name: "Agentic Economic Flow (ERC-8183)",
    module: "MODULE_03",
    link: "https://community.arc.network/public/externals/running-an-agentic-economic-flow-on-arc-with-erc-8183-2026-04-07",
    questions: [
      {
        q: "What is the main purpose of ERC-8183?",
        options: ["To create NFTs for transactions", "To standardize job + payment workflows onchain", "To reduce gas fees", "To enable token staking"],
        correct: "To standardize job + payment workflows onchain",
      },
      {
        q: "Which roles are the three main roles in the system?",
        options: ["Buyer, Seller, Miner", "User, Validator, Node", "Client, Provider, Evaluator", "Creator, Holder, Trader"],
        correct: "Client, Provider, Evaluator",
      },
      {
        q: "What happens to funds when a job is created?",
        options: ["Sent directly to provider", "Burned temporarily", "Locked in escrow until completion", "Split among validators"],
        correct: "Locked in escrow until completion",
      },
      {
        q: "What determines whether payment is released or refunded?",
        options: ["Gas fees", "Time alone", "Evaluator decision", "Network congestion"],
        correct: "Evaluator decision",
      },
      {
        q: "What makes this system suitable for AI agents as well?",
        options: ["It uses NFTs", "It supports automated verification and execution", "It removes blockchain usage", "It requires manual approval only"],
        correct: "It supports automated verification and execution",
      },
    ],
  },
  {
    id: "quiz-4",
    name: "Preparing Blockchains for Q-Day",
    module: "MODULE_04",
    link: "https://community.arc.network/public/externals/preparing-blockchains-for-q-day-2026-04-02",
    questions: [
      {
        q: "What does \"Q-Day\" refer to?",
        options: ["The day Ethereum upgrades", "The moment quantum computers break current cryptography", "A new blockchain launch", "A global crypto regulation event"],
        correct: "The moment quantum computers break current cryptography",
      },
      {
        q: "Why are current blockchains vulnerable to Q-Day?",
        options: ["High gas fees", "Weak smart contracts", "Use of cryptographic algorithms that quantum computers can break", "Lack of decentralization"],
        correct: "Use of cryptographic algorithms that quantum computers can break",
      },
      {
        q: "Which type of cryptography is considered safer against quantum attacks?",
        options: ["Symmetric cryptography", "Hash functions only", "Post-quantum cryptography", "RSA encryption"],
        correct: "Post-quantum cryptography",
      },
      {
        q: "What is a key challenge in upgrading blockchains for quantum resistance?",
        options: ["Lack of users", "Too many tokens", "Migrating existing wallets and keys securely", "Low transaction speed"],
        correct: "Migrating existing wallets and keys securely",
      },
      {
        q: "What is Arc's approach to Q-Day readiness?",
        options: ["Ignore quantum risks", "Replace all tokens", "Design systems that can adapt to new cryptographic standards", "Stop using encryption"],
        correct: "Design systems that can adapt to new cryptographic standards",
      },
    ],
  },
  {
    id: "quiz-5",
    name: "Circle AI Skills",
    module: "MODULE_05",
    link: "https://community.arc.network/public/blogs/circle-ai-skills",
    questions: [
      {
        q: "What is the main focus of Circle AI Skills?",
        options: ["Teaching blockchain mining", "Developing AI-related skills for the future economy", "Creating NFTs", "Trading strategies"],
        correct: "Developing AI-related skills for the future economy",
      },
      {
        q: "Why are AI skills important in this ecosystem?",
        options: ["For gaming only", "To support agent-based economic systems and automation", "To reduce blockchain usage", "To replace stablecoins"],
        correct: "To support agent-based economic systems and automation",
      },
      {
        q: "What type of economy is being emphasized?",
        options: ["Manual labor economy", "Token speculation economy", "Agentic and AI-driven digital economy", "Traditional banking only"],
        correct: "Agentic and AI-driven digital economy",
      },
      {
        q: "How can users benefit from learning AI skills?",
        options: ["Only through airdrops", "By building, contributing, and accessing new opportunities", "By avoiding blockchain", "By mining tokens"],
        correct: "By building, contributing, and accessing new opportunities",
      },
      {
        q: "What is the long-term vision of combining AI and blockchain?",
        options: ["Replace the internet", "Create isolated systems", "Enable autonomous, scalable economic interactions", "Eliminate digital payments"],
        correct: "Enable autonomous, scalable economic interactions",
      },
    ],
  },
];

export const POINTS_PER_QUIZ = 10;
export const PASSING_SCORE = 4;
export const TOTAL_QUESTIONS = 5;
