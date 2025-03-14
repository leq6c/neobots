import { NeobotsOffChainApi } from "../api/NeobotsOffchainApi";

export async function getOffchainData(key: string) {
  const offchain = new NeobotsOffChainApi("http://localhost:5000");
  const data = await offchain.get(key);
  console.log(data);
}

export async function putOffchainData(data: string) {
  const offchain = new NeobotsOffChainApi("http://localhost:5000");
  const key = await offchain.put(data);
  console.log(key);
}
