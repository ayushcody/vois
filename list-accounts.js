const { ethers } = require('ethers');

async function listAccounts() {
    const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');

    console.log('Checking Ganache accounts...\n');

    // Check balances for first 5 accounts
    for (let i = 0; i < 5; i++) {
        try {
            const signer = await provider.getSigner(i);
            const address = await signer.getAddress();
            const balance = await provider.getBalance(address);
            const balanceInEth = ethers.formatEther(balance);

            console.log(`Account ${i}:`);
            console.log(`  Address: ${address}`);
            console.log(`  Balance: ${balanceInEth} ETH\n`);
        } catch (e) {
            break;
        }
    }
}

listAccounts().catch(console.error);
