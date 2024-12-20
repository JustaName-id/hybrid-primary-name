import { ClientWithEns } from "@ensdomains/ensjs/dist/types/contracts/consts";
import { getName } from "@ensdomains/ensjs/public";
import { Address } from "viem";
import { mainnet, sepolia } from "viem/chains";
import { PrimaryNameGetByAddressResponse } from "./types";

const SUPPORTED_CHAIN_IDS = [mainnet.id, sepolia.id] as number[];
const API_URL = "https://api.justaname.id/ens/v1/primary-name/address";

/**
 * Creates a plugin that extends the PublicClient with ENS resolution capabilities.
 * This plugin adds the ability to perform reverse ENS lookups using both on-chain
 * and API-based resolution methods.
 *
 * @returns A function that extends the client with the getEnsFromAddress method
 */
export function primaryName() {
  return function (client: ClientWithEns) {
    return {
      /**
       * Performs reverse ENS resolution for a given Ethereum address.
       * First attempts on-chain resolution, then falls back to API-based lookup.
       *
       * @param address - The Ethereum address to resolve
       * @returns The primary ENS name associated with the address, or null if none found
       * @throws Error if the current chain ID is not supported (must be mainnet or sepolia)
       *
       * @example
       * ```typescript
       * const ensName = await client.getEnsFromAddress('0x123...')
       * if (ensName) {
       *   console.log(`ENS name: ${ensName}`)
       * }
       * ```
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
            const { result } = await response.json(); // TODO: Add proper type
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
