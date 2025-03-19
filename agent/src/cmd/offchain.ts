import { NeobotsOffChainApi } from "../api/NeobotsOffchainApi";
import { environment } from "../environment";

export async function getOffchainData(key: string) {
  const offchain = new NeobotsOffChainApi({
    baseUrl: environment.neobots.kvsUrl,
  });
  const data = await offchain.get(key);
  console.log(data);
}

export async function putOffchainData(data: string) {
  const offchain = new NeobotsOffChainApi({
    baseUrl: environment.neobots.kvsUrl,
  });
  const key = await offchain.put(data);
  console.log(key);
}
