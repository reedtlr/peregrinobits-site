// PeregrinoBits verify page.
//
// 1. Read the one time proof (e and c) that the coin's chip put in the URL.
// 2. Ask our API whether it is genuine. The API answers with the coin record.
// 3. Ask mempool.space for the balance of the coin's public address, straight
//    from this browser. Our server is not involved in that part.
(function () {
    "use strict";

    var cfg = window.PB_VERIFY;
    var STATES = ["idle", "checking", "verified", "stale", "revoked", "invalid", "error"];

    function show(state) {
        STATES.forEach(function (s) {
            document.getElementById("state-" + s).hidden = (s !== state);
        });
    }

    function setText(id, value) {
        document.getElementById(id).textContent = (value === undefined || value === null) ? "" : String(value);
    }

    // Satoshis to a readable coin amount, without floating point surprises.
    function formatSats(sats, unit) {
        var whole = Math.floor(sats / 1e8);
        var frac = String(sats % 1e8).padStart(8, "0").replace(/0+$/, "");
        return whole + (frac ? "." + frac : "") + " " + unit;
    }

    // Turn mempool.space address stats into the three numbers we show plus a verdict.
    // Exposed on window so it can be checked from the browser console.
    function summarise(stats) {
        var c = stats.chain_stats, m = stats.mempool_stats;
        var received = c.funded_txo_sum + m.funded_txo_sum;
        var sent = c.spent_txo_sum + m.spent_txo_sum;
        var balance = received - sent;
        var state;
        if (received === 0) state = "unfunded";
        else if (sent === 0) state = "intact";
        else if (balance === 0) state = "redeemed";
        else state = "partly-spent";
        return {
            received: received, sent: sent, balance: balance, state: state,
            pending: (m.funded_txo_sum + m.spent_txo_sum) > 0
        };
    }
    window.PB_summarise = summarise;

    // Wording per kind of item. A record with no item_type is a coin.
    //   coin  the chip sits under the coin's own hologram
    //   card  the chip sits in the paper certificate that travels with a wallet card
    var KINDS = {
        coin: { noun: "coin", seal: "Verified genuine", kind: "", note: "" },
        card: {
            noun: "card", seal: "Certificate verified", kind: "Certificate of Authenticity",
            note: "The chip is in this certificate, not in the card itself. Check that the card " +
                "you are holding matches this photo and serial."
        }
    };

    function fundingText(state, noun) {
        return {
            "unfunded": "Not funded yet. Nothing has ever been sent to this " + noun + ".",
            "intact": "Funded and intact. Nothing has ever been spent from this " + noun + ".",
            "redeemed": "Redeemed. Everything sent to this " + noun + " has been spent.",
            "partly-spent": "Partly spent. Some bitcoin has left this " + noun + ", so its private key has been used."
        }[state];
    }

    function showBalance(coin, words) {
        var net = cfg.networks[coin.network] || cfg.networks.mainnet;
        var link = document.getElementById("address-link");
        link.textContent = coin.address;
        link.href = net.explorer + "/address/" + encodeURIComponent(coin.address);

        var box = document.getElementById("funding");
        fetch(net.api + "/address/" + encodeURIComponent(coin.address))
            .then(function (r) {
                if (!r.ok) throw new Error("mempool " + r.status);
                return r.json();
            })
            .then(function (stats) {
                var s = summarise(stats);
                setText("bal-current", formatSats(s.balance, net.unit));
                setText("bal-received", formatSats(s.received, net.unit));
                setText("bal-sent", formatSats(s.sent, net.unit));
                box.className = "funding funding-" + s.state;
                box.textContent = fundingText(s.state, words.noun) +
                    (s.pending ? " Includes a transaction that is still unconfirmed." : "");
            })
            .catch(function () {
                box.className = "funding funding-unknown";
                box.textContent = "The balance lookup did not answer. The verification still stands. " +
                    "Use the address link below to check the balance yourself.";
                ["bal-current", "bal-received", "bal-sent"].forEach(function (id) { setText(id, "unavailable"); });
            });
    }

    function showVerified(result) {
        var coin = result.coin;
        var words = KINDS[coin.item_type] || KINDS.coin;
        setText("verified-seal", words.seal);
        setText("item-kind", words.kind);
        document.getElementById("item-kind").hidden = !words.kind;
        setText("item-note", words.note);
        document.getElementById("item-note").hidden = !words.note;
        setText("funding-heading", "Bitcoin on this " + words.noun);
        setText("coin-title", coin.serial || "PeregrinoBits " + words.noun);
        var of = coin.edition_size ? " of " + coin.edition_size : "";
        setText("coin-subtitle", [coin.series, coin.coin_number ? "No. " + coin.coin_number + of : ""]
            .filter(Boolean).join(", "));
        setText("fact-serial", coin.serial);
        setText("fact-maker", coin.maker_serial);
        document.getElementById("row-maker").hidden = !coin.maker_serial;
        setText("fact-series", coin.series);
        setText("fact-number", coin.coin_number ? coin.coin_number + of : "");
        setText("fact-taps", result.tap.counter);

        if (coin.image_url) {
            var img = document.getElementById("coin-image");
            img.alt = "Photo of " + words.noun + " " + (coin.serial || "");
            img.onload = function () { img.hidden = false; };
            img.src = coin.image_url;
        }
        show("verified");
        if (coin.address) showBalance(coin, words);
    }

    function run() {
        var params = new URLSearchParams(location.search);
        var e = params.get("e"), c = params.get("c");

        if (!e || !c) { show("idle"); return; }

        // Take the proof out of the address bar straight away. It only works
        // once, so a reload or a shared link should land on the plain page.
        history.replaceState(null, "", location.pathname);

        show("checking");
        fetch(cfg.api + "?e=" + encodeURIComponent(e) + "&c=" + encodeURIComponent(c), { cache: "no-store" })
            .then(function (r) {
                if (!r.ok) throw new Error("api " + r.status);
                return r.json();
            })
            .then(function (result) {
                if (result.status === "verified") showVerified(result);
                else if (result.status === "stale") show("stale");
                else if (result.status === "revoked") {
                    setText("revoked-serial", (result.coin && result.coin.serial) || "");
                    show("revoked");
                }
                else show("invalid");
            })
            .catch(function () { show("error"); });
    }

    run();
})();
