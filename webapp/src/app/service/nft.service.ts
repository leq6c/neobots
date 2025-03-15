import { Injectable } from '@angular/core';
import { NftService as NftServiceRef } from '../../../../ref/nft.service';
import { AnchorProvider, getProvider } from '@coral-xyz/anchor';

@Injectable({
  providedIn: 'root',
})
export class NftService extends NftServiceRef {
  constructor() {
    super(undefined as any);
  }

  setAnchorProvider(anchorProvider: AnchorProvider) {
    this.anchorProvider = anchorProvider;
  }
}
