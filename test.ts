
import { FundsSDK } from "@symmetry-hq/funds-sdk";
import { FilterTime, FilterType, Fund, SortBy, WeightTime, WeightType } from "@symmetry-hq/funds-sdk";
import NodeWallet from "@project-serum/anchor/dist/cjs/nodewallet";
import { Connection, PublicKey } from "@solana/web3.js";
import { connection, keypair } from "../config/config";

async function main() {
    let rpcConnection: Connection = connection;
    let wallet: NodeWallet = new NodeWallet(keypair);
    let fundsSDK = await FundsSDK.init(
        rpcConnection,
        wallet
    );
    
    let tokenList = fundsSDK.getTokenInfoData();
    // let solanaId = fundsSDK.tokenIdFromMint("So11111111111111111111111111111111111111112");
    /*
        List of tokens and their IDs supported by symmetry
        console.log(tokenList);
    */
    
    let fund = await createFund(fundsSDK, wallet);

    /*
    // Load Fund from specific pubkey
    let fund = await fundsSDK.loadFromPubkey(
        new PublicKey("5AL2LFRVMMuQSFFmeiU7KmPFJ4ekiTEZQBYdgv7o3xwF")
    );
    */
    
    // console.log("Fund State", fund.ownAddress.toBase58());

    let buyState = await fundsSDK.buyFund(fund, 500);

    /*
    // Find active buyStates for user
    let buyState = (await fundsSDK.findActiveBuyStates(wallet.publicKey))[0];
    */

    // console.log("BuyState:", buyState.ownAddress.toBase58());

    let txs = await fundsSDK.rebalanceBuyState(buyState);
    console.log(txs);

    let tx = await fundsSDK.mintFund(buyState);
    console.log(tx);

}


async function createFund(
    fundsSdk: FundsSDK,
    wallet: NodeWallet,
): Promise<Fund> {
    let baseRule = {
        filterBy: FilterType.Fixed,
        numAssets: 1,
        filterDays: FilterTime.Day,
        sortBy: SortBy.DescendingOrder,
        weightBy: WeightType.Volume,
        weightDays: WeightTime.Day,
        weightExpo: 1,
        excludeAssets: [],
    }
    return await fundsSdk
        .createFund({
            name: "Workshop: LP",   // name of a fund
            symbol: "WORKSHOP",     // ticker symbol of a fund
            description: "This is a demo fund, which is providing liquidity", //descirption
            hostPlatform: wallet.publicKey,   // host platform
            hostPlatformFee: 0,               // deposit fee from users that goes to host
            manager: wallet.publicKey,        // manager pubkey
            managerFee: 10,                   // 10bps  = 0.1% deposit fee from users
            activelyManaged: true,            // manager can modify fund settings
            assetPool: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17], // asset pool
            refilterInterval: 24 * 60 * 60,  // 24 hours
            reweightInterval: 60 * 60,       // 1 hour
            rebalanceInterval: 60 * 60,      // 1 hour
            rebalanceSlippage: 300,          // 3%
            rebalanceThreshold: 6000,        // 60%
            lpOffsetThreshold: 10000,        // 100%
            rules: [{
                fixedAsset: 0,   // USDC
                totalWeight: 40,
                ...baseRule
            },{
                fixedAsset: 14,  // MNGO
                totalWeight: 40,
                ...baseRule
            },{
                fixedAsset: 11,  // ORCA
                totalWeight: 5,
                ...baseRule
            },{
                fixedAsset: 12,  // SRM
                totalWeight: 5,
                ...baseRule
            },{
                fixedAsset: 17,  // RAY
                totalWeight: 5,
                ...baseRule
            },{
                fixedAsset: 4,   // USDT
                totalWeight: 5,
                ...baseRule
            }],
        })
}

main();
