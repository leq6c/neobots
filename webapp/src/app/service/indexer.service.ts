import { Injectable } from '@angular/core';
import { NeobotsIndexerApi } from '../../../../ref/NeobotsIndexerApi';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class IndexerService extends NeobotsIndexerApi {
  constructor() {
    super({
      apiUrl: environment.neobots.indexerUrl,
    });
  }
}
