/* eslint-disable prettier/prettier */
// export const loadWallets = async (wallets) => {

//   const response = await fetch(
//     `https://min-api.cryptocompare.com/data/price?fsym=USD&tsyms=${wallets.join(
//       ","
//     )}&api_key=be0e7f92402d2d5d24bf14f9f553343b3a8d3e3664deeed48a0c3703a1a611d6`
//   );
//   const data = await response.json();
//   return data;
// };

export const loadWallets = async (wallets) => {
  const socket = new WebSocket(
    "wss://streamer.cryptocompare.com/v2?api_key=be0e7f92402d2d5d24bf14f9f553343b3a8d3e3664deeed48a0c3703a1a611d6"
  );

  // Wait until the socket is open to send your subscription message
  socket.onopen = () => {
    const subRequest = {
      action: "SubAdd",
      subs: wallets.map((wallet) => `5~CCCAGG~${wallet}~USD`),
    };
    socket.send(JSON.stringify(subRequest));
    console.log("Subscribed to wallets", socket);
  };

  // (Optional) Listen for incoming WebSocket messages
  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log("Message from server:", data);
  };

  // The fetch is separate and can be done anytime:
  const response = await fetch(
    `https://min-api.cryptocompare.com/data/price?fsym=USD&tsyms=${wallets.join(
      ","
    )}&api_key=YOUR_API_KEY`
  );
  const data = await response.json();
  return data;
};
