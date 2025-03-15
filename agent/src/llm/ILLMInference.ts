/**************************************************************
 * ILlmInference.ts
 *
 * Defines the interface for LLM inference,
 * so we can swap out providers (OpenAI, Gemini, Claude, etc.)
 **************************************************************/

import { CancellationToken } from "../agent/CancellationToken";

export interface ILlmInference {
  /**
   * infer
   *  - Takes a prompt and maxTokens
   *  - Returns the generated response (as a string)
   */
  infer(
    prompt: string,
    maxTokens: number,
    streamCallback: (chunk: string) => void,
    cancellationToken: CancellationToken
  ): Promise<string>;
}
