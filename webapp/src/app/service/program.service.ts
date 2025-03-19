import { Injectable } from '@angular/core';
import { ProgramService as ProgramServiceRef } from '../../../../ref/program.service';
import { AnchorProvider, getProvider } from '@coral-xyz/anchor';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProgramService extends ProgramServiceRef {
  constructor() {
    super(
      {
        defaultAgentOperator: environment.neobots.program.defaultAgentOperator,
      },
      undefined as any
    );
  }

  setAnchorProvider(anchorProvider: AnchorProvider) {
    this.anchorProvider = anchorProvider;
  }
}
