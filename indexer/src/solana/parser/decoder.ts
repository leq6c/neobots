// helpers/decodeInstruction.ts
import { BorshInstructionCoder } from "@coral-xyz/anchor";
import type { Neobots } from "../../../../program/target/types/neobots";

export function decodeInstruction(
  data: Buffer | string,
  coder: BorshInstructionCoder
) {
  // We might have to ensure we pass the correct 'base58' or raw buffer
  // depending on how your instructions are encoded.
  return coder.decode(data, "base58");
}
