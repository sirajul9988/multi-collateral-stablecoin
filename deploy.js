const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying System...");

    // 1. Deploy Stablecoin
    const Token = await ethers.getContractFactory("Stablecoin");
    const usdx = await Token.deploy();
    await usdx.waitForDeployment();
    const usdxAddr = await usdx.getAddress();

    // 2. Deploy Oracle
    const Oracle = await ethers.getContractFactory("MockOracle");
    const oracle = await Oracle.deploy();
    await oracle.waitForDeployment();
    const oracleAddr = await oracle.getAddress();

    // 3. Deploy Engine
    const Engine = await ethers.getContractFactory("VaultEngine");
    const engine = await Engine.deploy(usdxAddr, oracleAddr);
    await engine.waitForDeployment();
    const engineAddr = await engine.getAddress();

    // 4. Grant Minting Rights to Engine
    await usdx.transferOwnership(engineAddr);
    console.log("Engine granted ownership of USDX");

    // Save Config
    const config = { engine: engineAddr, usdx: usdxAddr, oracle: oracleAddr };
    fs.writeFileSync("stable_config.json", JSON.stringify(config));
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
