import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  signerIdentity,
  transactionBuilder,
  Umi,
  publicKey,
  generateSigner,
  some,
  KeypairSigner,
  PublicKey,
} from "@metaplex-foundation/umi";
import { AnchorProvider, Program, web3 } from "@coral-xyz/anchor";
import {
  baseUpdateAuthority,
  fetchAsset,
  getAssetV1GpaBuilder,
  Key,
  mplCore,
} from "@metaplex-foundation/mpl-core";
import {
  mintV1,
  mplCandyMachine,
  fetchCandyMachine,
  CandyMachine,
} from "@metaplex-foundation/mpl-core-candy-machine";
import {
  toWeb3JsTransaction,
  toWeb3JsKeypair,
  fromWeb3JsInstruction,
  toWeb3JsInstruction,
} from "@metaplex-foundation/umi-web3js-adapters";
import {
  fetchDigitalAssetWithTokenByMint,
  mplTokenMetadata,
} from "@metaplex-foundation/mpl-token-metadata";
import { TOKEN_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/utils/token";
import {
  Transaction,
  TransactionInstruction,
  VersionedTransaction,
} from "@solana/web3.js";
import { dasApi } from "@metaplex-foundation/digital-asset-standard-api";
import { das } from "@metaplex-foundation/mpl-core-das";

interface NftServiceConfig {
  candyMachine: string;
  collection: string;
  treasury: string;
}

/**
 * Service for interacting with NFTs on the Solana blockchain.
 * This consolidated implementation combines features from agent, indexer, and webapp versions.
 */
export class NftService {
  private get candyMachine(): PublicKey {
    return publicKey(this.config.candyMachine);
  }
  private get collection(): PublicKey {
    return publicKey(this.config.collection);
  }
  private get treasury(): PublicKey {
    return publicKey(this.config.treasury);
  }

  private get umi(): Umi {
    return createUmi(this.anchorProvider.connection)
      .use(signerIdentity(this.anchorProvider.wallet as any))
      .use(mplCore())
      .use(mplCandyMachine())
      .use(dasApi()) as any;
  }

  constructor(
    private config: NftServiceConfig,
    protected anchorProvider: AnchorProvider
  ) {
    // polyfill Buffer for anchor if in browser environment
    try {
      if (typeof window !== "undefined" && Buffer) {
        (window as any).Buffer = Buffer;
      }
    } catch {
      // may fail
    }
  }

  async getNftOwner(nftMint: string): Promise<string> {
    const asset = await fetchAsset(this.umi, publicKey(nftMint));
    return asset.owner.toString();
  }

  async getCandyMachine(): Promise<CandyMachine> {
    const candyMachine = await fetchCandyMachine(this.umi, this.candyMachine);
    return candyMachine;
  }

  async generateAssetSigner() {
    const umi = this.umi;
    const asset = generateSigner(umi);
    return asset;
  }

  async mint(asset?: KeypairSigner) {
    const umi = this.umi;

    const candyMachine = this.candyMachine;
    const collection = this.collection;
    const treasury = this.treasury;

    if (!asset) {
      asset = await this.generateAssetSigner();
    }

    const assetWeb3 = toWeb3JsKeypair(asset);

    let umiTx = transactionBuilder().add(
      mintV1(umi, {
        candyMachine,
        asset,
        collection,
        mintArgs: {
          solPayment: some({
            destination: treasury,
          }),
        },
      })
    );

    umiTx = await umiTx.setLatestBlockhash(umi);

    const tx = toWeb3JsTransaction(umiTx.build(umi));

    try {
      // Using the webapp implementation which doesn't specify commitment
      const sig = await this.anchorProvider.sendAndConfirm(tx, [assetWeb3], {
        skipPreflight: true,
        commitment: "finalized",
        maxRetries: 5,
      });
      console.log(sig);
      return sig;
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  async getOwnedNfts(): Promise<
    { name: string; uri: string; owner: string; publicKey: string }[]
  > {
    return await das.getAssetsByOwner(this.umi, {
      owner: publicKey(this.anchorProvider.wallet.publicKey.toString()),
    });
  }

  // without DAS
  async _getOwnedNfts(): Promise<
    { name: string; uri: string; owner: string; publicKey: string }[]
  > {
    const assets = await getAssetV1GpaBuilder(this.umi)
      .whereField("key", Key.AssetV1)
      .whereField(
        "owner",
        publicKey(this.anchorProvider.wallet.publicKey.toString())
      )
      .whereField(
        "updateAuthority",
        baseUpdateAuthority("Collection", [this.collection])
      )
      .getDeserialized();

    return assets;
  }
}
