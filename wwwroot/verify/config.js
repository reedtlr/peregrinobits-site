// Settings for the verify page. This is the only file that differs between
// your local test machine and the live site.
window.PB_VERIFY = {
    // On your own machine tools/local_server.py answers at /api/verify.
    // On the live site, paste the ApiUrl output from "sam deploy" below.
    api: (location.hostname === "localhost" || location.hostname === "127.0.0.1")
        ? "/api/verify"
        : "https://qp4n4zfy58.execute-api.us-east-1.amazonaws.com/verify",

    // Where the browser looks up balances, per network. A coin record says
    // which network it is on. Dummy coins can sit on testnet4 so you can fund
    // and sweep them for free.
    networks: {
        mainnet: { api: "https://mempool.space/api", explorer: "https://mempool.space", unit: "BTC" },
        testnet4: { api: "https://mempool.space/testnet4/api", explorer: "https://mempool.space/testnet4", unit: "tBTC" }
    }
};
