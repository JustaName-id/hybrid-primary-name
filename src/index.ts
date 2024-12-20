import { ClientWithEns } from "@ensdomains/ensjs/dist/types/contracts/consts";
import { getName } from "@ensdomains/ensjs/public";
import { Address } from "viem";
import { mainnet, sepolia } from "viem/chains";
import { PrimaryNameGetByAddressResponse } from "./types";

// Define constants outside the function with uppercase names
const SUPPORTED_CHAIN_IDS = [mainnet.id, sepolia.id] as number[];
const API_URL = "https://api.justaname.id/ens/v1/primary-name/address";

/**
 * Extends the PublicClient with a getEnsFromAddress method.
 */
export function primaryName() {
  return function (client: ClientWithEns) {
    return {
      /**
       * Performs reverse ENS resolution.
       *
       * @param params - The parameters for reverse resolution.
       * @returns The resolved ENS name as a string or null if not found.
       * @throws Error if chain ID is not supported.
       */
      async getEnsFromAddress(address: Address): Promise<string | null> {
        const chainId = await client.chain.id;

        if (!SUPPORTED_CHAIN_IDS.includes(chainId)) {
          throw new Error("Chain ID not supported");
        }

        try {
          const reverseResult = await getName(client, { address });
          if (reverseResult?.name) {
            return reverseResult.name;
          }
        } catch (error) {
          // Handle error if necessary
        }

        try {
          const url = new URL(API_URL);
          const params = new URLSearchParams({
            address,
            chainId: chainId.toString(),
          });

          url.search = params.toString();

          const response = await fetch(url);

          if (response.ok) {
            const { result } = await response.json();
            const { name } = result.data as PrimaryNameGetByAddressResponse;
            if (name) {
              return name;
            }
          }
        } catch (error) {
          // Handle error if necessary
        }

        return null;
      },
    };
  };
}
