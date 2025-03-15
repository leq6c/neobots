import { Injectable } from '@angular/core';
import { NeobotsIndexerApi } from '../../../../ref/NeobotsIndexerApi';

@Injectable({
  providedIn: 'root',
})
export class IndexerService extends NeobotsIndexerApi {
  constructor() {
    super(undefined);
  }
}
