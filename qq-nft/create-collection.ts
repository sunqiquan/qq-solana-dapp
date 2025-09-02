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
} from "@metaplex-foundation/umi";

const user = await getKeypairFromFile();
const umi = createUmi(clusterApiUrl("devnet"), { commitment: "finalized" });
umi.use(mplTokenMetadata());

const umiUser = umi.eddsa.createKeypairFromSecretKey(user.secretKey);
umi.use(keypairIdentity(umiUser));

const collectionMint = generateSigner(umi);
console.log("collectionMint:", collectionMint.publicKey);

const transaction = await createNft(umi, {
  mint: collectionMint,
  name: "SQQ NFT",
  symbol: "SQT",
  uri: "https://raw.githubusercontent.com/sunqiquan/qq-token/main/qq-nft.json",
  sellerFeeBasisPoints: percentAmount(10),
  isCollection: true,
});

const tx = await transaction.sendAndConfirm(umi);
console.log("Your transaction signature", tx);

const createdCollectionNft = await fetchDigitalAsset(
  umi,
  collectionMint.publicKey
);

console.log(
  `Created CollectionAddress: ${getExplorerLink(
    "address",
    createdCollectionNft.mint.publicKey,
    "devnet"
  )}`
);
