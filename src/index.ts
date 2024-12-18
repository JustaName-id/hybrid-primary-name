import { addEnsContracts } from "@ensdomains/ensjs";
import { getName } from "@ensdomains/ensjs/public";
import type { Account, Chain } from "viem";
import {
  createPublicClient,
  http,
  type PublicClient,
  type Transport,
} from "viem";
import { mainnet, sepolia } from "viem/chains";
import {
  PrimaryNameGetByAddressResponse,
  ReverseResolutionParams,
} from "./types";

/**
 * Extends the PublicClient with a reverseResolution method.
 */
export function reverseResolution() {
  return function <
    TTransport extends Transport,
    TChain extends Chain | undefined,
    TAccount extends Account | undefined
  >(client: PublicClient<TTransport, TChain, TAccount>) {
    return {
      /**
       * Performs reverse ENS resolution.
       *
       * @param params - The parameters for reverse resolution.
       * @returns The resolved ENS name as a string or empty string if not found.
       */
      async reverseResolution({
        address,
        providerUrl,
      }: ReverseResolutionParams): Promise<string> {
        const tempClient = createPublicClient({
          transport: http(providerUrl),
        });
        const chainId = await tempClient.getChainId();
        const baseChain = chainId === 1 ? mainnet : sepolia;

        const ensChain = addEnsContracts(baseChain);

        const ensClient = createPublicClient({
          chain: ensChain,
          transport: http(providerUrl),
        });

        let name = "";

        try {
          const reverseResult = await getName(ensClient, {
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

          const primaryNameGetByAddressResponse =
            (await res.json()) as PrimaryNameGetByAddressResponse;

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
