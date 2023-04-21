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