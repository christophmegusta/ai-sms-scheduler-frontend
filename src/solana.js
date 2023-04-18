
  if (window.solana) {
    console.log("Phantom wallet is installed");
  } else {
    console.log("Phantom wallet is not installed");
  }

  async function connectWallet() {
    if (window.solana) {
      try {
        const connected = await window.solana.connect();
        if (connected) {
          console.log("Connected to Phantom wallet");
          sendSolana();
        } else {
          console.log("Failed to connect to Phantom wallet");
        }
      } catch (error) {
        console.error("Error connecting to Phantom wallet:", error);
      }
    } else {
      console.log("Phantom wallet is not installed");
    }
  }

  async function getUserAddress() {
    if (window.solana && window.solana.isConnected) {
      const userAddress = window.solana.publicKey.toString();
      console.log("User address:", userAddress);
      return userAddress;
    } else {
      console.log("Phantom wallet is not connected");
    }
  }


  const { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } = solanaWeb3;

  const cluster = "https://api.devnet.solana.com";
  const connection = new Connection(cluster, "confirmed");

  async function sendTransaction(destinationAddress, amount) {
    try {
      if (!window.solana.isConnected) {
        console.log("Phantom wallet is not connected");
        return;
      }

      const userAddress = window.solana.publicKey;
      const destinationPublicKey = new PublicKey(destinationAddress);

      // Use the SystemProgram's transfer instruction
      const instruction = SystemProgram.transfer({
        fromPubkey: userAddress,
        toPubkey: destinationPublicKey,
        lamports: amount * LAMPORTS_PER_SOL,
      });

      const transaction = new Transaction().add(instruction);

      // Set the fee payer
      transaction.feePayer = userAddress;

      // Fetch the recent blockhash and set it in the transaction
      const recentBlockhash = await connection.getRecentBlockhash();
      transaction.recentBlockhash = recentBlockhash.blockhash;

      const signedTransaction = await window.solana.signTransaction(transaction);
      const transactionId = await connection.sendRawTransaction(signedTransaction.serialize());

      console.log(`Transaction sent: ${transactionId}`);
    } catch (error) {
      console.error("Error sending transaction:", error);
    }
  }

async function sendSolana() {
    // Call the sendTransaction function
    const destinationAddress = "6ksqernqfZFMkv5cWQqPmzcu4qYGFmpJaJtM5VYpeDve";
    const amount = 0.001; // 0.001 SOL
    return await sendTransaction(destinationAddress, amount);
}