const { ethers } = require("hardhat");
const config = require("./stable_config.json");

async function main() {
    const [_, liquidator, victim] = await ethers.getSigners();
    const engine = await ethers.getContractAt("VaultEngine", config.engine, liquidator);
    const oracle = await ethers.getContractAt("MockOracle", config.oracle);
    const usdx = await ethers.getContractAt("Stablecoin", config.usdx, liquidator);

    // 1. Crash the price (1 ETH = $1000). 
    // Victim has 1 ETH Collateral ($1000) and 1000 USDX Debt.
    // Ratio = 1000/1000 = 100%. (Unsafe, < 150%)
    console.log("Crashing ETH price to $1000...");
    await oracle.setPrice(ethers.parseEther("1000"));

    // 2. Liquidator needs USDX to pay off debt
    // In real life, they buy it. Here we mint/cheat or assume they have it.
    // Let's assume liquidator got USDX from somewhere (e.g. open their own vault)
    // For test, we just use another vault opening
    await engine.openVault(ethers.parseEther("2000"), { value: ethers.parseEther("4.0") });

    console.log("Approving Engine to burn liquidator's USDX...");
    await usdx.approve(config.engine, ethers.MaxUint256);

    console.log("Liquidating Victim...");
    const tx = await engine.liquidate(victim.address);
    await tx.wait();

    console.log("Liquidation Successful! Victim collateral seized.");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
