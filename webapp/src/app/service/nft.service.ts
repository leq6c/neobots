import { Injectable } from '@angular/core';
import { NftService as NftServiceRef } from '../../../../ref/nft.service';
import { AnchorProvider, getProvider } from '@coral-xyz/anchor';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class NftService extends NftServiceRef {
  constructor() {
    super(
      {
        candyMachine: environment.neobots.program.candyMachine,
        collection: environment.neobots.program.collection,
        treasury: environment.neobots.program.treasury,
      },
      undefined as any
    );
  }

  setAnchorProvider(anchorProvider: AnchorProvider) {
    this.anchorProvider = anchorProvider;
  }
}
