import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  signerIdentity,
  transactionBuilder,
  Umi,
  publicKey,
  generateSigner,
  some,
} from "@metaplex-foundation/umi";
import { AnchorProvider, getProvider, Program, web3 } from "@coral-xyz/anchor";
import {
  baseUpdateAuthority,
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
} from "@metaplex-foundation/umi-web3js-adapters";
import {
  fetchDigitalAssetWithTokenByMint,
  mplTokenMetadata,
} from "@metaplex-foundation/mpl-token-metadata";
import { TOKEN_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/utils/token";

export class NftService {
  private candyMachine = publicKey(
    "7JcbH5Ge33UzfbbStismeZjqeJTof6T58efdhxMpWAMe"
  );
  private collection = publicKey(
    "873sJ6yruD12GupTWDV8yTCLCAQNTX2TKsCvfBi4gPGu"
  );
  private treasury = publicKey("J4fMrUCnUaBFXyA5fNeAMqiGw1D7ouFhLpaKWmx4B2QW");

  private get anchorProvider(): AnchorProvider {
    return getProvider() as AnchorProvider;
  }

  private get umi(): Umi {
    return createUmi(this.anchorProvider.connection)
      .use(signerIdentity(this.anchorProvider.wallet as any))
      .use(mplCore())
      .use(mplCandyMachine());
  }

  constructor() {}

  async getCandyMachine(): Promise<CandyMachine> {
    const candyMachine = await fetchCandyMachine(this.umi, this.candyMachine);
    return candyMachine;
  }

  async mint() {
    const umi = this.umi;

    const candyMachine = this.candyMachine;
    const collection = this.collection;
    const treasury = this.treasury;

    const asset = generateSigner(umi);
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
      const sig = await this.anchorProvider.sendAndConfirm(tx, [assetWeb3], {
        commitment: "finalized",
      });
      console.log(sig);
    } catch (e) {
      console.log(e);
    }
  }

  async getOwnedNfts(): Promise<
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
