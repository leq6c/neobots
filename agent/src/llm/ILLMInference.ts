/**************************************************************
 * ILlmInference.ts
 *
 * Defines the interface for LLM inference,
 * so we can swap out providers (OpenAI, Gemini, Claude, etc.)
 **************************************************************/

export interface ILlmInference {
  /**
   * infer
   *  - Takes a prompt and maxTokens
   *  - Returns the generated response (as a string)
   */
  infer(prompt: string, maxTokens: number): Promise<string>;
}
