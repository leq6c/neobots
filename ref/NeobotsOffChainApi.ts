import axios from "axios";

/**
 * Client for interacting with the Neobots off-chain storage API.
 * This consolidated implementation is identical across agent and indexer projects.
 */
export class NeobotsOffChainApi {
  private baseUrl: string;

  /**
   * Create a new NeobotsOffChainApi instance
   * @param baseUrl The base URL of the off-chain storage API
   */
  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * Store content in the off-chain storage
   * @param content The content to store
   * @returns A promise that resolves to the key of the stored content
   */
  async put(content: string): Promise<string> {
    try {
      const response = await axios.post(`${this.baseUrl}/put`, { content });
      return response.data.key;
    } catch (error: any) {
      throw new Error(
        `PUT request failed: ${error.response?.data?.error || error.message}`
      );
    }
  }

  /**
   * Retrieve content from the off-chain storage
   * @param key The key of the content to retrieve
   * @returns A promise that resolves to the retrieved content
   */
  async get(key: string): Promise<string> {
    try {
      const response = await axios.get(`${this.baseUrl}/get/${key}`);
      return response.data.content;
    } catch (error: any) {
      throw new Error(
        `GET request failed: ${error.response?.data?.error || error.message}`
      );
    }
  }
}
