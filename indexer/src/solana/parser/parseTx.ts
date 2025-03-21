// parseAny.ts

import { ParsedTransactionWithMeta, PublicKey } from "@solana/web3.js";
import { BorshInstructionCoder } from "@coral-xyz/anchor";
import { extractProgramLogs } from "./parseLogs";
import { decodeInstruction } from "./decoder";
import {
  parseCreatePost,
  parseAddComment,
  parseAddReaction,
  parseInitializeUser,
  parseRewards,
} from "./parser";
import {
  ParsedInstruction,
  BaseParsedInstruction,
  InstructionName,
  RewardData,
} from "./parser.types";
import type { Neobots } from "../../../../program/target/types/neobots"; // your actual IDL
// If 'Neobots' is the TS type for your IDL, or a different name

interface ParseAnyParams {
  tx: ParsedTransactionWithMeta;
  programId: PublicKey;
  idl: Neobots; // or the correct type for your IDL
}

/**
 * Parse instructions from a transaction that match a given programId.
 * Returns an array of typed `ParsedInstruction` objects (one per matched instruction).
 */
export function parseAny(params: ParseAnyParams): {
  instructions: ParsedInstruction[];
  rewards: RewardData[];
} {
  const { tx, programId, idl } = params;

  const allSignatures = tx.transaction.signatures;
  const signature = allSignatures[0] ?? "(unknown)";
  const blockTime = tx.blockTime ?? 0;

  // We may mutate `remainingLogs` as we go
  let remainingLogs = tx.meta?.logMessages ?? [];
  const coder = new BorshInstructionCoder(idl as any);

  const results: ParsedInstruction[] = [];
  const rewards: RewardData[] = [];

  let instructionSequence = -1;

  // Iterate over each instruction in the message
  for (const inst of tx.transaction.message.instructions) {
    instructionSequence++;

    // Filter out instructions not matching our target program
    if (!inst.programId || inst.programId.toBase58() !== programId.toBase58()) {
      continue;
    }

    const accounts = (inst as any).accounts.map((a: PublicKey) => a.toString());

    try {
      // 1) Extract logs relevant to *this* instruction
      const { logsForThisIx, leftoverLogs } = extractProgramLogs(
        remainingLogs,
        programId.toString()
      );
      remainingLogs = leftoverLogs; // update the logs we haven't used yet

      const parsedRewards = parseRewards(logsForThisIx);
      let rewardSequence = -1;
      for (const reward of parsedRewards) {
        rewardSequence++;
        reward.instructionSequence = instructionSequence;
        reward.rewardSequence = rewardSequence;
        reward.signature = signature;
        reward.blockTime = blockTime;
        reward.signer = accounts[accounts.length - 1];
        rewards.push(reward);
      }

      // 2) Decode instruction data
      const decoded = decodeInstruction((inst as any).data, coder);
      if (!decoded) {
        continue;
      }

      // 3) Build our base parsed object
      const baseParsed: BaseParsedInstruction = {
        fn: decoded.name as InstructionName,
        signature,
        blockTime,
      };

      const rawData = decoded.data as any;

      // 4) Switch on the instruction name to parse details
      switch (decoded.name) {
        case "initialize_forum":
          // You said you skip this
          // or you can push some minimal object if you want
          // results.push({ ...baseParsed, fn: 'initialize_forum', data: {} })
          continue;

        case "create_post": {
          const parsedData = parseCreatePost(accounts, rawData, logsForThisIx);
          const parsedIx: ParsedInstruction = {
            ...baseParsed,
            fn: "create_post",
            data: parsedData,
          };
          results.push(parsedIx);
          break;
        }

        case "add_comment": {
          const parsedData = parseAddComment(accounts, rawData, logsForThisIx);
          if (!parsedData) {
            // If we fail to parse logs, skip
            continue;
          }
          const parsedIx: ParsedInstruction = {
            ...baseParsed,
            fn: "add_comment",
            data: parsedData,
          };
          results.push(parsedIx);
          break;
        }

        case "add_reaction": {
          const parsedData = parseAddReaction(accounts, rawData, logsForThisIx);
          if (!parsedData) {
            continue;
          }
          const parsedIx: ParsedInstruction = {
            ...baseParsed,
            fn: "add_reaction",
            data: parsedData,
          };
          results.push(parsedIx);
          break;
        }

        case "initialize_user": {
          const parsedData = parseInitializeUser(accounts, rawData);
          const parsedIx: ParsedInstruction = {
            ...baseParsed,
            fn: "initialize_user",
            data: parsedData,
          };
          results.push(parsedIx);
          break;
        }

        default:
          // skip unknown instructions
          continue;
      }
    } catch (err) {
      console.error("Error parsing instruction:", err);
      throw err;
    }
  }

  return { instructions: results, rewards };
}
