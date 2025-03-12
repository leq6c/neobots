// helpers/parseLogs.ts

/**
 * Extract logs relevant to a given program invocation.
 *
 * @param allLogs - The entire array of log messages from the transaction
 * @param programId - The program ID string for which we're filtering logs
 * @returns An object { logsForThisIx, leftoverLogs } so we can remove consumed lines from the original array
 */
export function extractProgramLogs(
  allLogs: string[],
  programId: string
): { logsForThisIx: string[]; leftoverLogs: string[] } {
  const programStartQuery = `Program ${programId} invoke`;
  const programLogPrefix = "Program log:";

  let idx = allLogs.findIndex((l) => l.startsWith(programStartQuery));
  if (idx < 0) {
    // no logs found for this instruction
    return { logsForThisIx: [], leftoverLogs: allLogs };
  }

  // Move one past the "Program ... invoke" line
  idx++;
  const logsForThisIx: string[] = [];
  while (idx < allLogs.length && allLogs[idx].startsWith(programLogPrefix)) {
    // remove "Program log:" part
    const line = allLogs[idx].slice(programLogPrefix.length + 1);
    logsForThisIx.push(line);
    idx++;
  }

  // leftover logs is everything after we've consumed logs for this instruction
  const leftoverLogs = allLogs.slice(idx);

  return { logsForThisIx, leftoverLogs };
}
