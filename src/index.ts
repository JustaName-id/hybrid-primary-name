import type { Account, Chain } from "viem";
import {
  createPublicClient,
  http,
  type PublicClient,
  type Transport,
} from "viem";
import {
  PrimaryNameGetByAddressResponse,
  ReverseResolutionParams,
} from "./types";
import { getName } from "@ensdomains/ensjs/public";
import { addEnsContracts } from "@ensdomains/ensjs";
import { mainnet, sepolia } from "viem/chains";
import { ClientWithEns } from "@ensdomains/ensjs/dist/types/contracts/consts";

export function reverseResolution() {
  return function <
    TTransport extends Transport,
    TChain extends Chain | undefined,
    TAccount extends Account | undefined
  >(client: PublicClient<TTransport, TChain, TAccount>) {
    return {
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

        const url = new URL(
          "https://api.justaname.id/ens/v1/primary-name/address"
        );
        url.searchParams.set("address", address);
        url.searchParams.set("chainId", chainId.toString());

        const res = await fetch(url.toString());
        if (!res.ok) {
          console.warn("Failed to fetch primary name from JustaName API");
        } else {
          const primaryNameGetByAddressResponse =
            (await res.json()) as PrimaryNameGetByAddressResponse;
          if (primaryNameGetByAddressResponse?.name) {
            name = primaryNameGetByAddressResponse.name;
          } else {
            const reverseResolution = await getName(ensClient, {
              address: address,
            });

            if (reverseResolution && reverseResolution?.name) {
              name = reverseResolution.name;
            }
          }
        }
        return name;
      },
    };
  };
}
