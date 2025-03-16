import { Keypair } from "@solana/web3.js";
import fs from "fs";

export function getTestKeypair(): Keypair {
  if (!fs.existsSync("tmpkeypair.json")) {
    const keypair = Keypair.generate();
    // save
    const privateKey = Buffer.from(keypair.secretKey).toJSON();
    fs.writeFileSync(
      "tmpkeypair.json",
      JSON.stringify({
        privateKey: privateKey,
      })
    );
    return keypair;
  } else {
    const data = fs.readFileSync("tmpkeypair.json", "utf8");
    const privateKey = Buffer.from(JSON.parse(data).privateKey, "base64");
    return Keypair.fromSecretKey(privateKey);
  }
}
