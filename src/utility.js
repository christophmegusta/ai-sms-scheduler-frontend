export async function mySignature() {
    return window.localStorage.token;
  }
  
export async function fetchJSON(url) {
    const response = await fetch(`http://localhost:3000${url}`, {
      method: "GET",
      headers: {
        "Authorization": "Bearer " + await mySignature(),
        "Content-Type": "application/json",
      },
    });
    return response.json();
  }
  
  export async function fetchPostJSON(url, data) {
    const response = await fetch(`http://localhost:3000${url}`, {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + await mySignature(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return response;
  }

  export function formatDate(unixTimestamp) {
    const timestamp = unixTimestamp ? unixTimestamp * 1000 : new Date().getTime();
    const date = new Date(timestamp);
    return `${date.toLocaleDateString()}, ${date.toLocaleTimeString()}`;
  }

  async function solanaWalletSignMessage(message) {
    const m = message || "Sign for SMS Scheduler";
    if (window.solana && window.solana.isPhantom) {
      const solana = window.solana;
      const message = new TextEncoder().encode(m);
      const signature = await solana.request({
        method: "signMessage",
        params: {
          message,
          display: "hex",
        },
      });
      return signature;
    } else {
      alert("Please install Phantom wallet to use this app.");
      return null;
    }
  }
  
  async function connectPhantomWallet() {
    if (window.solana && window.solana.isPhantom) {
      const solana = window.solana;
      const connected = await solana.connect();
      if (connected) {
        console.log("Connected to Phantom wallet");
        console.log("Public key:", solana.publicKey.toString());
      } else {
        console.error("Failed to connect to Phantom wallet");
      }
    } else {
      alert("Please install Phantom wallet to use this app.");
    }
  }