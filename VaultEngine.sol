// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./Stablecoin.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface IOracle {
    function getEthPrice() external view returns (uint256);
}

contract VaultEngine is ReentrancyGuard {
    Stablecoin public usdx;
    IOracle public oracle;

    uint256 public constant COLLATERAL_RATIO = 150; // 150%
    uint256 public constant LIQUIDATION_BONUS = 10; // 10%

    struct Vault {
        uint256 collateral; // ETH amount
        uint256 debt;       // USDX minted
    }

    mapping(address => Vault) public vaults;

    event VaultOpened(address indexed user, uint256 collateral, uint256 debt);
    event VaultLiquidated(address indexed user, address indexed liquidator, uint256 debtRepaid, uint256 collateralSeized);

    constructor(address _usdx, address _oracle) {
        usdx = Stablecoin(_usdx);
        oracle = IOracle(_oracle);
    }

    // Deposit ETH and Mint USDX
    function openVault(uint256 amountToMint) external payable nonReentrant {
        require(msg.value > 0, "Must deposit ETH");
        require(amountToMint > 0, "Must mint USDX");

        Vault storage vault = vaults[msg.sender];
        vault.collateral += msg.value;
        vault.debt += amountToMint;

        require(_getHealthFactor(msg.sender) >= 1e18, "Undercollateralized");

        usdx.mint(msg.sender, amountToMint);
        emit VaultOpened(msg.sender, msg.value, amountToMint);
    }

    // Liquidate an unsafe vault
    function liquidate(address user) external nonReentrant {
        require(_getHealthFactor(user) < 1e18, "Vault is healthy");

        Vault storage vault = vaults[user];
        uint256 debtToCover = vault.debt;
        
        // Liquidator burns USDX to pay off debt
        usdx.transferFrom(msg.sender, address(this), debtToCover);
        usdx.burn(address(this), debtToCover);

        // Liquidator gets collateral + bonus
        // For simplicity: Liquidator takes ALL collateral in this basic version
        // In prod: Math is complex (Debt * Price * 1.1)
        uint256 collateralToSeize = vault.collateral;

        vault.collateral = 0;
        vault.debt = 0;

        (bool success, ) = msg.sender.call{value: collateralToSeize}("");
        require(success, "Transfer failed");

        emit VaultLiquidated(user, msg.sender, debtToCover, collateralToSeize);
    }

    // Check health: (CollateralValue * Threshold) / Debt
    function _getHealthFactor(address user) public view returns (uint256) {
        if (vaults[user].debt == 0) return 2e18; // Infinite health

        uint256 ethPrice = oracle.getEthPrice();
        uint256 collateralValue = (vaults[user].collateral * ethPrice) / 1e18;
        
        // Threshold adjusted value
        uint256 adjustedCollateral = (collateralValue * 100) / COLLATERAL_RATIO;
        
        return (adjustedCollateral * 1e18) / vaults[user].debt;
    }
}
