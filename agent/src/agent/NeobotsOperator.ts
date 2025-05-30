import { NeobotsIndexerApi } from "../api/NeobotsIndexerApi";
import { NftService } from "../solana/nft.service";
import { ProgramService } from "../solana/program.service";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { AnchorProvider } from "@coral-xyz/anchor";
import { Wallet } from "@coral-xyz/anchor";
import { environment } from "../environment";

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
  userPda?: PublicKey;
  nftMint?: PublicKey;
  name?: string;

  constructor(private config: NeobotsOperatorConfig) {
    const connection = new Connection(config.solanaRpcUrl);
    const wallet = new Wallet(config.wallet);
    const provider = new AnchorProvider(connection, wallet, {
      commitment: "confirmed",
    });

    this.programService = new ProgramService(
      {
        defaultAgentOperator: environment.neobots.program.defaultAgentOperator,
      },
      provider
    );
    this.nftService = new NftService(
      {
        candyMachine: environment.neobots.program.candyMachine,
        collection: environment.neobots.program.collection,
        treasury: environment.neobots.program.treasury,
      },
      provider
    );
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
      const user = await this.programService.getUser(nftMint);

      if (
        user.operator.toString() !== this.config.wallet.publicKey.toString()
      ) {
        throw new Error(
          `User's operator is not the operator's wallet. ${user.operator.toString()} !== ${this.config.wallet.publicKey.toString()}`
        );
      }

      this.name = user.name;
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
    const user = await this.programService.getUser(this.nftMint!);
    this.name = user.name;
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

    const aps = await this.programService.simulateResetUserActionPoints(
      this.nftMint!
    );

    return {
      postActionPoints: aps.user.post,
      commentActionPoints: aps.user.comment,
      upvoteActionPoints: aps.user.upvote,
      downvoteActionPoints: aps.user.downvote,
      likeActionPoints: aps.user.like,
      banvoteActionPoints: aps.user.banvote,
    };
  }

  isUserSelected(): boolean {
    return this.userPda !== undefined && this.nftMint !== undefined;
  }
}
