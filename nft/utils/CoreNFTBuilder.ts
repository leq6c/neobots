import { AnchorProvider } from "@coral-xyz/anchor";
import { Keypair as Web3Keypair } from "@solana/web3.js";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  mplCandyMachine as mplCoreCandyMachine,
  create,
  addConfigLines,
  fetchCandyMachine,
  deleteCandyMachine,
  mintV1,
} from "@metaplex-foundation/mpl-core-candy-machine";
import {
  Umi,
  PublicKey,
  generateSigner,
  transactionBuilder,
  keypairIdentity,
  some,
  sol,
  dateTime,
  TransactionBuilderSendAndConfirmOptions,
  publicKey,
  Keypair,
  Signer,
  createSignerFromKeypair,
} from "@metaplex-foundation/umi";
import { createCollectionV1 } from "@metaplex-foundation/mpl-core";
import { setComputeUnitLimit } from "@metaplex-foundation/mpl-toolbox";
import { KeypairSigner } from "@metaplex-foundation/js";
import { checkCandyMachine } from "./CoreNFTUtils";
import {
  fromWeb3JsKeypair,
  toWeb3JsKeypair,
} from "@metaplex-foundation/umi-web3js-adapters";

export class CoreNFTBuilder {
  private umi: Umi;
  private keypair: Keypair;
  private collectionMint: Signer & Keypair;
  private treasury: Signer & Keypair;
  private candyMachine: Signer & Keypair;

  private options: TransactionBuilderSendAndConfirmOptions = {
    send: { skipPreflight: true },
    confirm: { commitment: "processed" },
  };

  constructor(
    private provider: AnchorProvider,
    private authority: Web3Keypair,
    private collectionMintKeypair: Web3Keypair,
    private treasuryKeypair: Web3Keypair,
    private candyMachineKeypair: Web3Keypair
  ) {
    this.keypair = fromWeb3JsKeypair(authority);

    this.umi = createUmi(provider.connection)
      .use(mplCoreCandyMachine())
      .use(keypairIdentity(this.keypair));

    this.collectionMint = createSignerFromKeypair(
      this.umi,
      fromWeb3JsKeypair(this.collectionMintKeypair)
    );
    this.treasury = createSignerFromKeypair(
      this.umi,
      fromWeb3JsKeypair(this.treasuryKeypair)
    );
    this.candyMachine = createSignerFromKeypair(
      this.umi,
      fromWeb3JsKeypair(this.candyMachineKeypair)
    );

    console.log(`Testing Candy Machine Core...`);
    console.log(`Important account information:`);
    console.table({
      keypair: this.keypair.publicKey.toString(),
      collectionMint: this.collectionMint.publicKey.toString(),
      treasury: this.treasury.publicKey.toString(),
      candyMachine: this.candyMachine.publicKey.toString(),
    });
  }

  getCollectionMint(): Web3Keypair {
    return toWeb3JsKeypair(this.collectionMint);
  }

  async airdrop(signer: Web3Keypair, sols: number): Promise<void> {
    const umiKeypair = await fromWeb3JsKeypair(signer);
    const umiSigner = createSignerFromKeypair(this.umi, umiKeypair);
    try {
      await this.umi.rpc.airdrop(
        umiSigner.publicKey,
        sol(sols),
        this.options.confirm
      );
      console.log(
        `1. ✅ - Airdropped ${sols} SOL to the ${umiSigner.publicKey.toString()}`
      );
    } catch (error) {
      console.log("1. ❌ - Error airdropping SOL to the wallet.");
    }
  }

  async deleteCandyMachine(): Promise<void> {
    try {
      await deleteCandyMachine(this.umi, {
        candyMachine: this.candyMachine.publicKey,
      }).sendAndConfirm(this.umi, this.options);
      console.log(
        `8. ✅ - Deleted the Candy Machine: ${this.candyMachine.publicKey.toString()}`
      );
    } catch (error) {
      console.log("8. ❌ - Error deleting the Candy Machine.");
    }
  }

  async hasCollection(): Promise<boolean> {
    try {
      const collection = await this.provider.connection.getAccountInfo(
        toWeb3JsKeypair(this.collectionMint).publicKey
      );
      return collection !== null;
    } catch (error) {
      return false;
    }
  }

  async createCollection(): Promise<void> {
    try {
      await createCollectionV1(this.umi, {
        collection: this.collectionMint,
        name: "Neobots Agent Collection",
        uri: "https://example.com/my-collection.json",
      }).sendAndConfirm(this.umi, this.options);
      console.log(
        `2. ✅ - Created collection: ${this.collectionMint.publicKey.toString()}`
      );
    } catch (error) {
      console.log("2. ❌ - Error creating collection.");
      throw error;
    }
  }

  async hasCandyMachine(): Promise<boolean> {
    try {
      const candyMachine = await this.provider.connection.getAccountInfo(
        toWeb3JsKeypair(this.candyMachine).publicKey
      );
      return candyMachine !== null;
    } catch (error) {
      return false;
    }
  }

  async createCandyMachine(): Promise<void> {
    try {
      const createIx = await create(this.umi, {
        candyMachine: this.candyMachine,
        collection: this.collectionMint.publicKey,
        collectionUpdateAuthority: this.umi.identity,
        itemsAvailable: 30,
        authority: this.umi.identity.publicKey,
        isMutable: false,
        configLineSettings: some({
          prefixName: "Neobots agent #",
          nameLength: 11,
          prefixUri: "https://example.com/metadata/",
          uriLength: 29,
          isSequential: false,
        }),
        guards: {
          botTax: some({ lamports: sol(0.001), lastInstruction: true }),
          solPayment: some({
            lamports: sol(0.01),
            destination: this.treasury.publicKey,
          }),
          startDate: some({ date: dateTime("2023-04-04T16:00:00Z") }),
          // All other guards are disabled...
        },
      });
      await createIx.sendAndConfirm(this.umi, this.options);
      console.log(
        `3. ✅ - Created Candy Machine: ${this.candyMachine.publicKey.toString()}`
      );
    } catch (error) {
      console.log("3. ❌ - Error creating Candy Machine.");
      console.log(error);
      throw error;
    }
  }

  async addItemsToCandyMachine(): Promise<void> {
    try {
      let configLines: { name: string; uri: string }[] = [];
      for (let i = 0; i < 30; i++) {
        configLines.push({ name: `${i + 1}`, uri: `${i + 1}.json` });
      }
      await addConfigLines(this.umi, {
        candyMachine: this.candyMachine.publicKey,
        index: 0,
        configLines,
      }).sendAndConfirm(this.umi, this.options);
      console.log(
        `4. ✅ - Added items to the Candy Machine: ${this.candyMachine.publicKey.toString()}`
      );
    } catch (error) {
      console.log("4. ❌ - Error adding items to the Candy Machine.");
      throw error;
    }
  }

  async checkCandyMachine(): Promise<void> {
    await checkCandyMachine(
      this.umi,
      this.candyMachine.publicKey,
      {
        itemsLoaded: 30,
        authority: this.umi.identity.publicKey,
        collection: this.collectionMint.publicKey,
        itemsRedeemed: 0,
      },
      5,
      this.options
    );
  }

  async mintNFT(signer: Web3Keypair): Promise<Web3Keypair> {
    const umiKeypair = await fromWeb3JsKeypair(signer);

    const umi = this.umi.use(keypairIdentity(umiKeypair));
    const asset = generateSigner(umi);

    await transactionBuilder()
      .add(setComputeUnitLimit(umi, { units: 800_000 }))
      .add(
        mintV1(umi, {
          candyMachine: this.candyMachine.publicKey,
          asset,
          collection: this.collectionMint.publicKey,
          mintArgs: {
            solPayment: some({ destination: this.treasury.publicKey }),
          },
        })
      )
      .sendAndConfirm(umi, this.options);

    console.log(
      `5. ✅ - Minted NFT: ${asset.publicKey.toString()} to ${umiKeypair.publicKey.toString()}`
    );

    return toWeb3JsKeypair(asset);
  }
}
