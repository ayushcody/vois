const { ethers } = require('ethers');

async function checkBalance() {
    const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');

    // The account from the private key you imported
    const address = '0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1';

    const balance = await provider.getBalance(address);
    const balanceInEth = ethers.formatEther(balance);

    console.log(`Address: ${address}`);
    console.log(`Balance: ${balanceInEth} ETH`);

    // Also check the first few Ganache accounts
    const accounts = await provider.listAccounts();
    console.log(`\nTotal accounts from provider: ${accounts.length}`);
}

checkBalance().catch(console.error);
