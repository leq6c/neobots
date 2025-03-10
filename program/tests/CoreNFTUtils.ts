import { fetchCandyMachine } from "@metaplex-foundation/mpl-core-candy-machine";
import { PublicKey } from "@metaplex-foundation/umi";
import { TransactionBuilderSendAndConfirmOptions } from "@metaplex-foundation/umi";
import { Umi } from "@metaplex-foundation/umi";

interface ExpectedCandyMachineState {
  itemsLoaded: number;
  itemsRedeemed: number;
  authority: PublicKey;
  collection: PublicKey;
}

export async function checkCandyMachine(
  umi: Umi,
  candyMachine: PublicKey,
  expectedCandyMachineState: ExpectedCandyMachineState,
  step?: number,
  options?: TransactionBuilderSendAndConfirmOptions
) {
  try {
    const loadedCandyMachine = await fetchCandyMachine(
      umi,
      candyMachine,
      options.confirm
    );
    const { itemsLoaded, itemsRedeemed, authority, collection } =
      expectedCandyMachineState;
    if (Number(loadedCandyMachine.itemsRedeemed) !== itemsRedeemed) {
      throw new Error(
        "Incorrect number of items available in the Candy Machine."
      );
    }
    if (loadedCandyMachine.itemsLoaded !== itemsLoaded) {
      throw new Error("Incorrect number of items loaded in the Candy Machine.");
    }
    if (loadedCandyMachine.authority.toString() !== authority.toString()) {
      throw new Error("Incorrect authority in the Candy Machine.");
    }
    if (
      loadedCandyMachine.collectionMint.toString() !== collection.toString()
    ) {
      throw new Error("Incorrect collection in the Candy Machine.");
    }
    step &&
      console.log(`${step}. ✅ - Candy Machine has the correct configuration.`);
  } catch (error) {
    if (error instanceof Error) {
      step &&
        console.log(
          `${step}. ❌ - Candy Machine incorrect configuration: ${error.message}`
        );
    } else {
      step && console.log(`${step}. ❌ - Error fetching the Candy Machine.`);
    }
  }
}
