import { Injectable } from '@angular/core';
import { ProgramService as ProgramServiceRef } from '../../../../ref/program.service';
import { AnchorProvider, getProvider } from '@coral-xyz/anchor';

@Injectable({
  providedIn: 'root',
})
export class ProgramService extends ProgramServiceRef {
  constructor() {
    super(undefined as any);
  }

  setAnchorProvider(anchorProvider: AnchorProvider) {
    this.anchorProvider = anchorProvider;
  }
}
