/**
 * Retrieves a random Web3 quote from the predefined list.
 * @returns {string}
 */
export function getRandomQuote(): string {
  const quotes = [
    '"Code is law, but you write the code." - Web3 Builder',
    '"Trust, but verify." - Satoshi Nakamoto',
    '"Vires in Numeris." - Bitcoin Motto',
    '"The future is decentralized." - Anonymous',
    '"Decentralization is not a feature, it is survival." - Crypto Visionary',
    '"Every block tells a story." - Blockchain Engineer',
    '"Consensus builds trust without kings." - Distributed Systems',
    '"Mine the future, one block at a time." - Miner Philosophy',
    '"Smart contracts, smarter future." - Web3 Developer',
    '"Not your keys, not your coins." - Crypto Community',
    '"Blockchain is the internet of value." - Anonymous',
    '"One node can start a revolution." - Decentralized Network',
    '"In cryptography we trust." - Cypherpunk',
    '"The chain never sleeps." - Blockchain Motto',
    '"Decentralized systems empower people." - Open Web Movement',
    '"Every hash matters." - PoW Miner',
    '"Freedom through cryptography." - Cypherpunk Manifesto',
    '"Nodes connected, future protected." - Network Builder',
    '"A distributed future starts today." - Blockchain Researcher',
    '"Blocks, hashes, consensus, freedom." - Web3 Philosophy',
    '"The strongest networks have no center." - Distributed Computing',
    '"Digital ownership changes everything." - NFT Creator',
    '"Transparency creates trust." - Open Blockchain',
    '"The ledger remembers everything." - Blockchain Principle',
    '"Build decentralized, think limitless." - Web3 Architect',
    '"Mining is proof of participation." - PoW Community',
    '"Open networks outlive closed empires." - Internet Philosophy',
    '"Innovation begins with one genesis block." - CointMU',
    '"Every validator protects the network." - Blockchain Security',
    '"A blockchain is only as strong as its nodes." - Network Theory',
    '"Peer-to-peer is people-to-people." - Decentralized Internet',
    '"Cryptography is the foundation of digital trust." - Security Research',
    '"One transaction can change an ecosystem." - Web3 Economy',
    '"Immutable by design." - Blockchain Core',
    '"The block is temporary, the chain is forever." - Anonymous',
    '"Decentralized networks resist centralized failure." - Distributed Systems',
    '"Build the chain you want to see in the world." - CointMU Labs',
    '"Innovation is born at the edge of decentralization." - Web3 Builder',
    '"Your wallet is your identity in Web3." - Crypto Community',
    '"Hash first, trust later." - Miner Motto',
  ];
  return quotes[Math.floor(Math.random() * quotes.length)];
}
