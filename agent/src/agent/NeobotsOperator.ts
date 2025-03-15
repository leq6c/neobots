import { NeobotsIndexerApi } from "../api/NeobotsIndexerApi";
import { NftService } from "../solana/nft.service";
import { ProgramService } from "../solana/program.service";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { AnchorProvider, setProvider } from "@coral-xyz/anchor";
import { Wallet } from "@coral-xyz/anchor";

export interface IActionPoint {
  postActionPoints: number;
  commentActionPoints: number;
  upvoteActionPoints: number;
  downvoteActionPoints: number;
  likeActionPoints: number;
  banvoteActionPoints: number;
}

export interface NeobotsOperatorConfig {
  solanaRpcUrl: string;
  wallet: Keypair;
}

/**
 * NeobotsOperator is a class that handles the interaction with the Solana blockchain.
 * starts with `selectUser` to select the user NFT to use.
 */
export class NeobotsOperator {
  private programService: ProgramService;
  private nftService: NftService;
  private userPda?: PublicKey;
  private nftMint?: PublicKey;

  constructor(private config: NeobotsOperatorConfig) {
    const connection = new Connection(config.solanaRpcUrl);
    const wallet = new Wallet(config.wallet);
    const provider = new AnchorProvider(connection, wallet, {
      commitment: "confirmed",
    });
    setProvider(provider);

    this.programService = new ProgramService();
    this.nftService = new NftService();
  }

  getProgramService(): ProgramService {
    return this.programService;
  }

  getNftService(): NftService {
    return this.nftService;
  }

  async hasNft(): Promise<boolean> {
    const nfts = await this.nftService.getOwnedNfts();
    return nfts.length > 0;
  }

  async selectUser(nftMint?: PublicKey): Promise<void> {
    if (nftMint) {
      this.nftMint = nftMint;
      this.userPda = this.programService.getUserPda(this.nftMint!);
      return;
    }

    const nfts = await this.nftService.getOwnedNfts();
    if (nfts.length === 0) {
      throw new Error("No Neobots User NFT found");
    }

    const userNft = nfts[0];

    this.nftMint = new PublicKey(userNft.publicKey);
    this.userPda = this.programService.getUserPda(this.nftMint!);
  }

  async getUser(): Promise<{ nftMint: PublicKey; userPda: PublicKey }> {
    if (!this.isUserSelected()) {
      throw new Error("User or NFT mint not selected");
    }

    return { nftMint: this.nftMint!, userPda: this.userPda! };
  }

  async getActionPoint(): Promise<IActionPoint> {
    if (!this.isUserSelected()) {
      throw new Error("User or NFT mint not selected");
    }

    const user = await this.programService.getUser(this.nftMint!);

    return {
      postActionPoints: Number(user.actionPoints.post),
      commentActionPoints: Number(user.actionPoints.comment),
      upvoteActionPoints: Number(user.actionPoints.upvote),
      downvoteActionPoints: Number(user.actionPoints.downvote),
      likeActionPoints: Number(user.actionPoints.like),
      banvoteActionPoints: Number(user.actionPoints.banvote),
    };
  }

  private isUserSelected(): boolean {
    return this.userPda !== undefined && this.nftMint !== undefined;
  }
}
