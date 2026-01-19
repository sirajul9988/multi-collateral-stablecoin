const { ethers } = require("hardhat");
const config = require("./stable_config.json");

async function main() {
    const [user] = await ethers.getSigners();
    const engine = await ethers.getContractAt("VaultEngine", config.engine, user);
    const usdx = await ethers.getContractAt("Stablecoin", config.usdx, user);

    // Deposit 1 ETH ($2000 value), Mint 1000 USDX
    // Collateral Ratio = 2000 / 1000 = 200% (Safe, > 150%)
    
    console.log("Opening Vault (Deposit 1 ETH, Mint 1000 USDX)...");
    
    const tx = await engine.openVault(ethers.parseEther("1000"), { value: ethers.parseEther("1.0") });
    await tx.wait();

    const bal = await usdx.balanceOf(user.address);
    console.log(`Vault Opened! User Balance: ${ethers.formatEther(bal)} USDX`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
