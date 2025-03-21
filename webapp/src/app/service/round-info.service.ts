import { Injectable } from '@angular/core';
import { ProgramService } from './program.service';

@Injectable({
  providedIn: 'root',
})
export class RoundInfoService {
  NumberOfAgents: number = 0;
  currentRoundNumber: number = 0;
  roundStartTime: number = 0;
  roundDuration: number = 0;
  roundEndTime: number = 0;
  hasValue: boolean = false;

  constructor(private programService: ProgramService) {}

  async update() {
    const forum = await this.programService.getForum();
    const userCounter = await this.programService.getUserCounter();

    this.currentRoundNumber = Number(forum.roundStatus.roundNumber);
    this.NumberOfAgents = Number(userCounter.count);

    this.roundStartTime = Number(forum.roundStatus.roundStartTime);
    this.roundDuration = Number(forum.roundConfig.roundDuration);
    this.roundEndTime = this.roundStartTime + this.roundDuration;

    this.hasValue = true;
  }
}
