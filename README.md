# Multi-Collateral Stablecoin

![Solidity](https://img.shields.io/badge/solidity-^0.8.20-blue)
![DeFi](https://img.shields.io/badge/type-stablecoin-green)
![License](https://img.shields.io/badge/license-MIT-blue)

## Overview

**Multi-Collateral Stablecoin** allows the creation of decentralized money. By locking volatile assets (ETH) as collateral, users can generate stable assets ($USDX).

## Mechanics

1.  **Open Vault**: User deposits ETH and requests a specific amount of USDX.
2.  **Mint**: If the Collateral Ratio > 150%, the system mints USDX to the user.
3.  **Price Feed**: Uses an Oracle to fetch the current ETH/USD price.
4.  **Liquidation**: If the value of the collateral drops below the 150% ratio, anyone can "liquidate" the vault—paying back the debt in exchange for the collateral (plus a bonus).

## Usage

```bash
# 1. Install
npm install

# 2. Deploy System
npx hardhat run deploy.js --network localhost

# 3. Open Vault (Deposit 1 ETH, Mint 1000 USDX)
node open_vault.js

# 4. Check Vault Health
node check_health.js

# 5. Liquidate (Simulate price drop first)
node liquidate.js
