import { Program } from "@coral-xyz/anchor";

import { AnchorProvider } from "@coral-xyz/anchor";
import { Neobots } from "../target/types/neobots";
import {
  CreateCompressedNftOutput,
  CreateNftOutput,
  keypairIdentity,
  Metaplex,
} from "@metaplex-foundation/js";

import { Keypair, PublicKey } from "@solana/web3.js";
import { BankrunProvider } from "anchor-bankrun";

export class NFTBuilder {
  private metaplex: Metaplex;
  private collection: CreateCompressedNftOutput;

  constructor(private provider: AnchorProvider, private authority: Keypair) {
    this.metaplex = new Metaplex(provider.connection).use(
      keypairIdentity(authority)
    );
  }

  async createCollection(): Promise<CreateCompressedNftOutput> {
    this.collection = await this.metaplex.nfts().create({
      uri: "http://localhost:3000/nft.json",
      name: "NeoBots",
      symbol: "NB",
      sellerFeeBasisPoints: 0,
      isCollection: true,
    });

    return this.collection;
  }

  async createNft(
    name: string,
    symbol: string,
    owner: PublicKey
  ): Promise<CreateCompressedNftOutput> {
    const nft = await this.metaplex.nfts().create({
      uri: "http://localhost:3000/nft.json",
      name,
      symbol,
      sellerFeeBasisPoints: 0,
      isCollection: false,
      collection: this.collection.nft.address,
      collectionAuthority: this.authority,
      tokenOwner: owner,
    });

    await this.metaplex.nfts().verifyCollection({
      collectionMintAddress: this.collection.nft.address,
      mintAddress: nft.nft.address,
      collectionAuthority: this.authority,
    });

    return nft;
  }

  async unverifyCollection(nft: CreateCompressedNftOutput) {
    await this.metaplex.nfts().unverifyCollection({
      collectionMintAddress: this.collection.nft.address,
      mintAddress: nft.nft.address,
      collectionAuthority: this.authority,
    });
  }
}
