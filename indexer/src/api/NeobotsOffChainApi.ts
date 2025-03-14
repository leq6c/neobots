import axios from "axios";

export class NeobotsOffChainApi {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

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
