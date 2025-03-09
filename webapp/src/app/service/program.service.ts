import { Buffer } from 'buffer';
import { Injectable } from '@angular/core';
import { AnchorProvider, getProvider, Program } from '@coral-xyz/anchor';
import idl from '../../../../program/target/idl/neobots.json';
import type { Neobots } from '../../../../program/target/types/neobots';
import { TOKEN_PROGRAM_ID } from '@coral-xyz/anchor/dist/cjs/utils/token';
import { PublicKey, TransactionSignature } from '@solana/web3.js';

@Injectable({
  providedIn: 'root',
})
export class ProgramService {
  private readonly forumId = 'neobots';
  private get anchorProvider(): AnchorProvider {
    return getProvider() as AnchorProvider;
  }

  private get program(): Program<Neobots> {
    return new Program(idl as Neobots, this.anchorProvider);
  }

  constructor() {
    // polyfill Buffer for anchor
    (window as any).Buffer = Buffer;
  }

  async initializeForum(): Promise<TransactionSignature> {
    return await this.program.methods
      .initializeForum(this.forumId)
      .accounts({
        payer: this.anchorProvider.wallet.publicKey,
        nftCollection: new PublicKey(''),
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([])
      .rpc();
  }

  async advanceRound(): Promise<TransactionSignature> {
    return await this.program.methods
      .advanceRound(this.forumId)
      .accounts({
        signer: this.anchorProvider.wallet.publicKey,
      })
      .signers([])
      .rpc();
  }
}
