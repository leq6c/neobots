import { Injectable } from '@angular/core';
import { NeobotsOffChainApi } from '../../../../ref/NeobotsOffChainApi';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class OffChainService extends NeobotsOffChainApi {
  constructor() {
    super({
      baseUrl: environment.neobots.kvsUrl,
    });
  }
}
