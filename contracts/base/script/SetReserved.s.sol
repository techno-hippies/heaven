// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {Script, console2} from "forge-std/Script.sol";
import {SubnameRegistrarV2} from "../src/SubnameRegistrarV2.sol";

/// @notice Batch set reserved labels after deployment
/// @dev Run in batches to avoid gas limits
contract SetReservedScript is Script {
    // Split into batches of ~50 to stay under gas limits

    string[] internal batch1 = [
        // Brand / System
        "heaven", "hnsbridge", "handshake", "hns", "official", "team", "admin",
        "support", "help", "staff", "security", "owner", "root", "registry",
        "registrar", "resolver", "records", "docs", "api", "status", "legal",
        "terms", "privacy", "abuse", "report", "verify", "verified", "billing",
        "payment", "refund", "contact", "moderator", "mod", "community",
        "ambassador", "partner", "partnership", "sponsor", "giveaway", "promo",
        "system", "service", "services", "info", "news", "blog", "press", "media"
    ];

    string[] internal batch2 = [
        // Titles / Royalty
        "king", "queen", "prince", "princess", "royal", "crown", "monarch",
        "emperor", "empress", "duke", "duchess", "lord", "lady", "knight",
        "noble", "baron", "baroness", "sir", "madam", "alpha", "sigma", "omega",
        "beta", "boss", "chief", "vip", "legend", "god", "goddess", "angel",
        "devil", "demon", "saint", "prophet", "messiah", "buddha", "jesus",
        "allah", "zeus", "thor", "odin"
    ];

    string[] internal batch3 = [
        // Dating / Romance
        "love", "lover", "soulmate", "valentine", "romance", "romantic", "dating",
        "date", "match", "couple", "single", "taken", "crush", "flirt", "heart",
        "sexy", "hot", "cute", "beautiful", "handsome", "gorgeous", "pretty",
        "babe", "baby", "honey", "sweetheart", "darling", "hottie", "cutie",
        "dreamgirl", "dreamboy", "perfect", "perfectmatch", "theone", "forever",
        "wifey", "hubby", "boo", "bae", "daddy", "mommy", "sugar", "sugarbaby",
        "sugardaddy", "sugarmommy"
    ];

    string[] internal batch4 = [
        // Crypto
        "crypto", "bitcoin", "btc", "ethereum", "eth", "solana", "sol", "defi",
        "nft", "nfts", "token", "wallet", "exchange", "trader", "whale", "degen",
        "memecoin", "airdrop", "staking", "hodl", "moon", "lambo", "wagmi",
        "ngmi", "ape", "punk", "bayc", "opensea", "uniswap", "coinbase",
        "binance", "metamask", "vitalik", "satoshi", "nakamoto"
    ];

    string[] internal batch5 = [
        // Impersonation / Tech
        "scam", "scammer", "phishing", "fake", "thereal", "real", "authentic",
        "legit", "google", "apple", "meta", "facebook", "instagram", "twitter",
        "tiktok", "snapchat", "discord", "telegram", "whatsapp", "amazon",
        "microsoft", "netflix", "spotify", "youtube", "twitch", "reddit",
        "paypal", "venmo", "cashapp", "robinhood"
    ];

    string[] internal batch6 = [
        // Premium short / Wealth
        "ace", "ceo", "cto", "cfo", "coo", "pro", "max", "sex", "xxx", "gay",
        "dom", "sub", "fun", "luv", "omg", "lol", "wtf", "rich", "wealthy",
        "millionaire", "billionaire", "money", "cash", "gold", "diamond",
        "platinum", "luxury", "elite", "exclusive", "premium", "supreme",
        "ultimate", "infinite", "priceless"
    ];

    string[] internal batch7 = [
        // Profanity
        "fuck", "fucker", "fucking", "shit", "shitty", "ass", "asshole", "bitch",
        "bitches", "cunt", "dick", "dickhead", "cock", "pussy", "tits", "boobs",
        "penis", "vagina", "balls", "whore", "slut", "hoe", "thot", "skank",
        "bastard", "damn", "piss", "crap", "douche", "douchebag", "jackass",
        "dumbass", "fatass"
    ];

    string[] internal batch8 = [
        // Slurs (important to block)
        "nigga", "niggas", "nigger", "faggot", "fag", "retard", "retarded",
        "tranny", "chink", "spic", "kike", "nazi", "hitler", "kkk"
    ];

    string[] internal batch9 = [
        // Drugs / Violence
        "cocaine", "heroin", "meth", "weed", "marijuana", "drugs", "dealer",
        "kill", "killer", "murder", "rape", "rapist", "terrorist", "bomb",
        "shooter", "gun", "guns"
    ];

    string[] internal batch10 = [
        // Vanity titles
        "goat", "champion", "winner", "famous", "celebrity", "star", "superstar",
        "icon", "legendary", "epic", "genius", "wizard", "ninja", "warrior",
        "hero", "villain", "pirate", "captain", "president", "doctor",
        "professor", "master", "founder", "creator", "artist", "influencer",
        "gamer", "hacker", "developer", "engineer"
    ];

    function run() external {
        address registrarAddr = vm.envAddress("REGISTRAR");
        uint256 batchNum = vm.envOr("BATCH", uint256(0)); // 0 = all

        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        SubnameRegistrarV2 registrar = SubnameRegistrarV2(registrarAddr);

        console2.log("Setting reserved labels on:", registrarAddr);

        vm.startBroadcast(deployerPrivateKey);

        if (batchNum == 0 || batchNum == 1) {
            registrar.setReservedLabels(batch1, true);
            console2.log("Batch 1 done:", batch1.length, "labels");
        }
        if (batchNum == 0 || batchNum == 2) {
            registrar.setReservedLabels(batch2, true);
            console2.log("Batch 2 done:", batch2.length, "labels");
        }
        if (batchNum == 0 || batchNum == 3) {
            registrar.setReservedLabels(batch3, true);
            console2.log("Batch 3 done:", batch3.length, "labels");
        }
        if (batchNum == 0 || batchNum == 4) {
            registrar.setReservedLabels(batch4, true);
            console2.log("Batch 4 done:", batch4.length, "labels");
        }
        if (batchNum == 0 || batchNum == 5) {
            registrar.setReservedLabels(batch5, true);
            console2.log("Batch 5 done:", batch5.length, "labels");
        }
        if (batchNum == 0 || batchNum == 6) {
            registrar.setReservedLabels(batch6, true);
            console2.log("Batch 6 done:", batch6.length, "labels");
        }
        if (batchNum == 0 || batchNum == 7) {
            registrar.setReservedLabels(batch7, true);
            console2.log("Batch 7 done:", batch7.length, "labels");
        }
        if (batchNum == 0 || batchNum == 8) {
            registrar.setReservedLabels(batch8, true);
            console2.log("Batch 8 done:", batch8.length, "labels");
        }
        if (batchNum == 0 || batchNum == 9) {
            registrar.setReservedLabels(batch9, true);
            console2.log("Batch 9 done:", batch9.length, "labels");
        }
        if (batchNum == 0 || batchNum == 10) {
            registrar.setReservedLabels(batch10, true);
            console2.log("Batch 10 done:", batch10.length, "labels");
        }

        vm.stopBroadcast();

        console2.log("Reserved labels set successfully");
    }
}
