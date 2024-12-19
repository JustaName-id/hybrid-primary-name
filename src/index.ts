import { ClientWithEns } from "@ensdomains/ensjs/dist/types/contracts/consts";
import { getName } from "@ensdomains/ensjs/public";
import { Address } from "viem";
import { PrimaryNameGetByAddressResponse } from "./types";

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
       * @returns The resolved ENS name as a string or empty string if not found.
       * @throws Error if chain ID is not supported.
       */
      async getEnsFromAddress(address: Address): Promise<string> {
        const chainId = await client.chain.id;
        const supportedChainsIds = [1, 11155111];

        if (!supportedChainsIds.includes(chainId)) {
          throw new Error("Chain ID not supported");
        }

        let name = "";

        try {
          const reverseResult = await getName(client, {
            address: address,
          });

          if (reverseResult && reverseResult.name) {
            name = reverseResult.name;
            return name;
          }
        } catch (error) {
          console.warn(
            `Failed to get name using ENS: ${(error as Error).message}`
          );
        }

        try {
          const url = new URL(
            "https://api.justaname.id/ens/v1/primary-name/address"
          );
          url.searchParams.set("address", address);
          url.searchParams.set("chainId", chainId.toString());

          const res = await fetch(url.toString());
          if (!res.ok) {
            console.warn(
              "Failed to fetch primary name from API",
              res.statusText
            );
            return name;
          }

          const primaryNameGetByAddressResponse = (await res.json()).result
            .data as PrimaryNameGetByAddressResponse;

          if (primaryNameGetByAddressResponse?.name) {
            name = primaryNameGetByAddressResponse.name;
          }
        } catch (error) {
          console.warn(`Error fetching from API: ${(error as Error).message}`);
        }

        return name;
      },
    };
  };
}
