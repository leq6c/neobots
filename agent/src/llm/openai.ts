/**************************************************************
 * OpenAiInference.ts
 *
 * Implements ILlmInference using OpenAI's API.
 *
 * npm install openai
 **************************************************************/

import { OpenAI } from "openai";
import { ILlmInference } from "./ILLMInference";
import path from "path";
import fs from "fs";

export class OpenAIInference implements ILlmInference {
  private openai: OpenAI;
  private defaultMaxTokens: number;
  private enableCache: boolean;
  private cache: { [index: string]: string } = {};

  constructor(
    apiKey: string,
    defaultMaxTokens = 100,
    enableCache: boolean = true
  ) {
    this.openai = new OpenAI({
      apiKey: apiKey,
    });
    this.defaultMaxTokens = defaultMaxTokens;
    this.enableCache = enableCache;

    // load cache from file
    if (enableCache) {
      this.loadCache();
    }
  }

  /**
   * infer:
   *  - Calls the OpenAI "createCompletion" endpoint
   *  - Returns the text response
   */
  public async infer(
    prompt: string,
    maxTokens: number,
    streamCallback: (chunk: string) => void
  ): Promise<string> {
    if (this.enableCache && this.cache[prompt]) {
      return this.cache[prompt];
    }

    const actualMax = maxTokens > 0 ? maxTokens : this.defaultMaxTokens;

    /*
    const response = await this.openai.chat.completions.create({
      model: "gpt-4o-mini", // or 'gpt-3.5-turbo' if using chat endpoints
      messages: [{ role: "user", content: prompt }],
      max_tokens: actualMax,
    });

    const text = response.choices?.[0]?.message?.content?.trim() ?? "";
    */

    const response = await this.openai.chat.completions.create({
      model: "gpt-4o-mini", // or 'gpt-3.5-turbo' if using chat endpoints
      messages: [{ role: "user", content: prompt }],
      max_tokens: actualMax,
      stream: true,
    });

    let text = "";

    for await (const chunk of response) {
      text += chunk.choices[0].delta.content || "";
      streamCallback(chunk.choices[0].delta.content || "");
    }

    if (this.enableCache) {
      this.cache[prompt] = text;
      this.saveCache();
    }

    return text;
  }

  private loadCache() {
    const cacheFile = path.join(__dirname, "../../", "cache.json");
    if (!fs.existsSync(cacheFile)) {
      this.cache = {};
      return;
    }
    const cacheData = fs.readFileSync(cacheFile, "utf8");
    this.cache = JSON.parse(cacheData);
  }

  private saveCache() {
    const cacheFile = path.join(__dirname, "../../", "cache.json");
    fs.writeFileSync(cacheFile, JSON.stringify(this.cache, null, 2));
  }
}
