import {
  createNft,
  fetchDigitalAsset,
  mplTokenMetadata,
} from "@metaplex-foundation/mpl-token-metadata";

import {
  getExplorerLink,
  getKeypairFromFile,
} from "@solana-developers/helpers";

import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { clusterApiUrl } from "@solana/web3.js";
import {
  generateSigner,
  keypairIdentity,
  percentAmount,
  publicKey,
} from "@metaplex-foundation/umi";

const user = await getKeypairFromFile();
const umi = createUmi(clusterApiUrl("devnet"), { commitment: "finalized" });
umi.use(mplTokenMetadata());

const umiUser = umi.eddsa.createKeypairFromSecretKey(user.secretKey);
umi.use(keypairIdentity(umiUser));

const collectionAddress = publicKey(
  "5iQ9U4stPJjxzongJz2EEzULbeFoYjRpDzwCe3GsVjzA"
);

const nftMint = generateSigner(umi);
console.log("NFT Mint Address:", nftMint.publicKey);

const transaction = await createNft(umi, {
  mint: nftMint,
  name: "SQQ NFT",
  symbol: "SQT",
  uri: "https://raw.githubusercontent.com/sunqiquan/qq-token/main/qq-nft.json",
  sellerFeeBasisPoints: percentAmount(10),
  collection: {
    key: collectionAddress,
    verified: false,
  },
});

await transaction.sendAndConfirm(umi);
const createdNft = await fetchDigitalAsset(umi, nftMint.publicKey);

console.log(
  `Created CollectionAddress: ${getExplorerLink(
    "address",
    createdNft.mint.publicKey,
    "devnet"
  )}`
);
