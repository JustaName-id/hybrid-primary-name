# Hybrid Primary Name

**Hybrid Primary Name** is a Viem extension package that enables reverse ENS resolution to fetch the primary ENS name associated with a given Ethereum address. It integrates seamlessly with both Viem's `createPublicClient` and ENS's `createEnsPublicClient`.

## Table of Contents

- [Hybrid Primary Name](#hybrid-primary-name)
  - [Table of Contents](#table-of-contents)
  - [Installation](#installation)
  - [Initialization](#initialization)
    - [Using Viem's `createPublicClient` with ENS Contracts](#using-viems-createpublicclient-with-ens-contracts)
    - [Using ENS's `createEnsPublicClient`](#using-enss-createenspublicclient)
  - [Usage](#usage)

## Installation

Install the package via **npm** or **yarn**:

```bash
npm install @justaname.id/hybrid-primary-name
# or
yarn add @justaname.id/hybrid-primary-name
```

## Initialization

### Using Viem's `createPublicClient` with ENS Contracts

```typescript
import { createPublicClient, http } from 'viem';
import { addEnsContracts } from '@ensdomains/ensjs';
import { mainnet, sepolia } from 'viem/chains';
import { primaryName } from '@justaname.id/hybrid-primary-name';

const client = createPublicClient({
        chain: addEnsContracts(**mainnet or sepolia**),
        transport: http(**Provider URL**),
    }).extend(primaryName())
```

### Using ENS's `createEnsPublicClient`

```typescript
import { http } from 'viem';
import { createEnsPublicClient } from '@ensdomains/ensjs'
import { mainnet, sepolia } from 'viem/chains';
import { primaryName } from '@justaname.id/hybrid-primary-name';

const client = createEnsPublicClient({
        chain: **mainnet or sepolia**,
        transport: http(**Provider URL**),
    }).extend(primaryName())
```

## Usage

The `getEnsFromAddress` method returns the primary ENS name associated with the given Ethereum address.

```typescript
await client.getEnsFromAddress(**Address**),
```
