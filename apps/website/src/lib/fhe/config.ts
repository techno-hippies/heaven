/**
 * FHE Configuration for Zama fhEVM on Sepolia
 */

export const FHE_CONFIG = {
  // Chain configuration
  chainId: 11155111, // Sepolia
  rpcUrl: import.meta.env.VITE_RPC_URL || 'https://ethereum-sepolia-rpc.publicnode.com',

  // DatingV3 contract
  datingContractAddress: import.meta.env.VITE_DATING_ADDRESS || '0xcAb2919b79D367988FB843420Cdd7665431AE0e7',

  // Sponsor PKP public key (uncompressed, 0x04...)
  sponsorPkpPublicKey: import.meta.env.VITE_SPONSOR_PKP_PUBLIC_KEY || '0x044615ca5ec3bfec5f5306f62ccc1a398cbd7e9cc53ac0e715b27ba81272e7397b185aa6f43c9bb2f0d9c489d30478cec9310685cd3a33922c0d12417b6375bc08',

  // Lit Action CID for dating-setbasics-sponsor
  litActionCid: import.meta.env.VITE_DATING_SETBASICS_CID || 'Qmb9C3KBjLqS8mkBZeTnWMoiM1Q9kXevDwq5Ys3avWbjbe',

  // Zama Sepolia FHEVM configuration
  fhevm: {
    aclContractAddress: '0xf0Ffdc93b7E186bC2f8CB3dAA75D86d1930A433D',
    kmsContractAddress: '0xbE0E383937d564D7FF0BC3b46c51f0bF8d5C311A',
    inputVerifierContractAddress: '0xBBC1fFCdc7C316aAAd72E807D9b0272BE8F84DA0',
    verifyingContractAddressDecryption: '0x5D8BD78e2ea6bbE41f26dFe9fdaEAa349e077478',
    verifyingContractAddressInputVerification: '0x483b9dE06E4E4C7D35CCf5837A1668487406D955',
    gatewayChainId: 10901,
    relayerUrl: 'https://relayer.testnet.zama.org',
  },
} as const
