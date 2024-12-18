import { Address } from "viem";

export interface ReverseResolutionParams {
  address: Address;
  providerUrl: string;
}

export interface PrimaryNameGetByAddressResponse {
  id: string;
  name: string;
  address: string;
  nameHash: string;
  chainId: number;
}
