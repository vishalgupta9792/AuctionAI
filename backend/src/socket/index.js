export const registerSocket = (io) => {
  io.on("connection", (socket) => {
    socket.on("auction:join", (auctionId) => {
      socket.join(`auction_${auctionId}`);
    });

    socket.on("auction:leave", (auctionId) => {
      socket.leave(`auction_${auctionId}`);
    });

    socket.on("disconnect", () => {});
  });
};
