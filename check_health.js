const { ethers } = require("hardhat");
const config = require("./stable_config.json");

async function main() {
    const [user] = await ethers.getSigners();
    const engine = await ethers.getContractAt("VaultEngine", config.engine);

    // Internal health check returns value scaled by 1e18
    // >= 1e18 means healthy
    // < 1e18 means liquidatable
    
    // Using a public getter for _getHealthFactor (requires modifying contract to public) 
    // or just calculate manually here. For simplicity, assuming the contract function is public:
    const health = await engine._getHealthFactor(user.address);
    
    console.log(`Health Factor: ${ethers.formatEther(health)}`);
    if (health >= 1000000000000000000n) {
        console.log("Status: SAFE");
    } else {
        console.log("Status: AT RISK");
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
