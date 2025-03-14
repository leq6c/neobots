import { Injectable } from '@angular/core';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import {
  signerIdentity,
  transactionBuilder,
  Umi,
  publicKey,
  generateSigner,
  some,
} from '@metaplex-foundation/umi';
import { AnchorProvider, getProvider, Program, web3 } from '@coral-xyz/anchor';
import {
  baseUpdateAuthority,
  getAssetV1GpaBuilder,
  Key,
  mplCore,
} from '@metaplex-foundation/mpl-core';
import {
  mintV1,
  mplCandyMachine,
  fetchCandyMachine,
  CandyMachine,
} from '@metaplex-foundation/mpl-core-candy-machine';
import {
  toWeb3JsTransaction,
  toWeb3JsKeypair,
} from '@metaplex-foundation/umi-web3js-adapters';
import {
  dasApi,
  DasApiInterface,
} from '@metaplex-foundation/digital-asset-standard-api';
import {
  fetchDigitalAssetWithTokenByMint,
  mplTokenMetadata,
} from '@metaplex-foundation/mpl-token-metadata';
import { TOKEN_PROGRAM_ID } from '@coral-xyz/anchor/dist/cjs/utils/token';

@Injectable({
  providedIn: 'root',
})
export class NftService {
  private candyMachine = publicKey(
    'BwhUAHwVLn3sN7rLZwtww4NZML7Ss48SeYiLaXVEG39m'
  );
  private collection = publicKey(
    '5sch29XsewaaikcMRjQrFQo2Ddvu1iWrNPRDTXNzHF4z'
  );
  private treasury = publicKey('LNspKb1cEfgpiA7H3RT7952CjjpU82Td63ubtB25m8p');

  private get anchorProvider(): AnchorProvider {
    return getProvider() as AnchorProvider;
  }

  private get umi(): Umi {
    return createUmi(this.anchorProvider.connection)
      .use(signerIdentity(this.anchorProvider.wallet as any))
      .use(mplCore())
      .use(mplCandyMachine())
      .use(dasApi());
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
      const sig = await this.anchorProvider.sendAndConfirm(tx, [assetWeb3]);
      console.log(sig);
    } catch (e) {
      console.log(e);
    }
  }

  async getOwnedNfts(): Promise<
    { name: string; uri: string; owner: string; publicKey: string }[]
  > {
    const assets = await getAssetV1GpaBuilder(this.umi)
      .whereField('key', Key.AssetV1)
      .whereField(
        'owner',
        publicKey(this.anchorProvider.wallet.publicKey.toString())
      )
      .whereField(
        'updateAuthority',
        baseUpdateAuthority('Collection', [this.collection])
      )
      .getDeserialized();

    return assets;
  }
}
