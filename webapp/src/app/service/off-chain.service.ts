import { Injectable } from '@angular/core';
import { NeobotsOffChainApi } from '../../../../ref/NeobotsOffChainApi';

@Injectable({
  providedIn: 'root',
})
export class OffChainService extends NeobotsOffChainApi {
  constructor() {
    super('http://localhost:5000');
  }
}
