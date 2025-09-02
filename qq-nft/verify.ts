import {
  findMetadataPda,
  mplTokenMetadata,
  verifyCollectionV1,
} from "@metaplex-foundation/mpl-token-metadata";

import {
  getExplorerLink,
  getKeypairFromFile,
} from "@solana-developers/helpers";

import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { clusterApiUrl } from "@solana/web3.js";
import { keypairIdentity, publicKey } from "@metaplex-foundation/umi";

const user = await getKeypairFromFile();
const umi = createUmi(clusterApiUrl("devnet"), { commitment: "finalized" });
umi.use(mplTokenMetadata());

const umiUser = umi.eddsa.createKeypairFromSecretKey(user.secretKey);
umi.use(keypairIdentity(umiUser));

const collectionAddress = publicKey(
  "5iQ9U4stPJjxzongJz2EEzULbeFoYjRpDzwCe3GsVjzA"
);
const nftAddress = publicKey("8mdjG2CLCJqcxEaXjWu91xmw4oRWZZyc64FFfPQLVAaA");
const metadata = findMetadataPda(umi, { mint: nftAddress });
const transaction = await verifyCollectionV1(umi, {
  metadata,
  collectionMint: collectionAddress,
});
await transaction.sendAndConfirm(umi);

console.log(
  `Created CollectionAddress: ${getExplorerLink(
    "address",
    nftAddress.toString(),
    "devnet"
  )}`
);
