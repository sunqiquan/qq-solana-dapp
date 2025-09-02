(globalThis.TURBOPACK = globalThis.TURBOPACK || []).push([typeof document === "object" ? document.currentScript : undefined, {

"[project]/src/idl/voting_program.json (json)": ((__turbopack_context__) => {

__turbopack_context__.v(JSON.parse("{\"address\":\"3NppKdHJeMqQi1PxvUbsfKoCoz4g5tPib4d7GWG56u3G\",\"metadata\":{\"name\":\"voting_program\",\"version\":\"0.1.0\",\"spec\":\"0.1.0\",\"description\":\"Created with Anchor\"},\"instructions\":[{\"name\":\"initialize_candidate\",\"discriminator\":[210,107,118,204,255,97,112,26],\"accounts\":[{\"name\":\"poll_account\",\"writable\":true,\"pda\":{\"seeds\":[{\"kind\":\"const\",\"value\":[112,111,108,108]},{\"kind\":\"arg\",\"path\":\"poll_id\"}]}},{\"name\":\"candidate_account\",\"writable\":true,\"pda\":{\"seeds\":[{\"kind\":\"arg\",\"path\":\"poll_id\"},{\"kind\":\"arg\",\"path\":\"candidate_name\"}]}},{\"name\":\"signer\",\"writable\":true,\"signer\":true},{\"name\":\"system_program\",\"address\":\"11111111111111111111111111111111\"}],\"args\":[{\"name\":\"_poll_id\",\"type\":\"u64\"},{\"name\":\"candidate_name\",\"type\":\"string\"}]},{\"name\":\"initialize_poll\",\"discriminator\":[193,22,99,197,18,33,115,117],\"accounts\":[{\"name\":\"poll_account\",\"writable\":true,\"pda\":{\"seeds\":[{\"kind\":\"const\",\"value\":[112,111,108,108]},{\"kind\":\"arg\",\"path\":\"poll_id\"}]}},{\"name\":\"signer\",\"writable\":true,\"signer\":true},{\"name\":\"system_program\",\"address\":\"11111111111111111111111111111111\"}],\"args\":[{\"name\":\"poll_id\",\"type\":\"u64\"},{\"name\":\"poll_name\",\"type\":\"string\"},{\"name\":\"description\",\"type\":\"string\"},{\"name\":\"poll_start\",\"type\":\"u64\"},{\"name\":\"poll_end\",\"type\":\"u64\"}]},{\"name\":\"vote\",\"discriminator\":[227,110,155,23,136,126,172,25],\"accounts\":[{\"name\":\"poll_account\",\"writable\":true,\"pda\":{\"seeds\":[{\"kind\":\"const\",\"value\":[112,111,108,108]},{\"kind\":\"arg\",\"path\":\"poll_id\"}]}},{\"name\":\"candidate_account\",\"writable\":true,\"pda\":{\"seeds\":[{\"kind\":\"arg\",\"path\":\"poll_id\"},{\"kind\":\"arg\",\"path\":\"candidate_name\"}]}},{\"name\":\"signer\",\"writable\":true,\"signer\":true}],\"args\":[{\"name\":\"_poll_id\",\"type\":\"u64\"},{\"name\":\"_candidate_name\",\"type\":\"string\"}]}],\"accounts\":[{\"name\":\"CandidateAccount\",\"discriminator\":[69,203,73,43,203,170,96,121]},{\"name\":\"PollAccount\",\"discriminator\":[109,254,117,41,232,74,172,45]}],\"types\":[{\"name\":\"CandidateAccount\",\"type\":{\"kind\":\"struct\",\"fields\":[{\"name\":\"candidate_name\",\"type\":\"string\"},{\"name\":\"candidate_votes\",\"type\":\"u64\"}]}},{\"name\":\"PollAccount\",\"type\":{\"kind\":\"struct\",\"fields\":[{\"name\":\"poll_id\",\"type\":\"u64\"},{\"name\":\"poll_name\",\"type\":\"string\"},{\"name\":\"description\",\"type\":\"string\"},{\"name\":\"poll_start\",\"type\":\"u64\"},{\"name\":\"poll_end\",\"type\":\"u64\"},{\"name\":\"candidate_amount\",\"type\":\"u64\"}]}}]}"));}),
"[project]/src/app/api/vote/route.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "GET": ()=>GET,
    "OPTIONS": ()=>OPTIONS,
    "POST": ()=>POST,
    "sendLocalnetTransaction": ()=>sendLocalnetTransaction
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$coral$2d$xyz$2f$anchor$2f$dist$2f$browser$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/node_modules/@coral-xyz/anchor/dist/browser/index.js [app-client] (ecmascript) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$coral$2d$xyz$2f$anchor$2f$dist$2f$browser$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@coral-xyz/anchor/dist/browser/index.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$bn$2e$js$2f$lib$2f$bn$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__BN$3e$__ = __turbopack_context__.i("[project]/node_modules/bn.js/lib/bn.js [app-client] (ecmascript) <export default as BN>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$web3$2e$js$2f$lib$2f$index$2e$browser$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@solana/web3.js/lib/index.browser.esm.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$actions$2f$lib$2f$esm$2f$constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@solana/actions/lib/esm/constants.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$actions$2f$lib$2f$esm$2f$createPostResponse$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@solana/actions/lib/esm/createPostResponse.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$idl$2f$voting_program$2e$json__$28$json$29$__ = __turbopack_context__.i("[project]/src/idl/voting_program.json (json)");
;
;
;
;
const OPTIONS = GET;
async function GET(request) {
    const actionMetadata = {
        icon: 'https://hips.hearstapps.com/hmg-prod/images/peanut-butter-vegan-1556206811.jpg?crop=0.6666666666666666xw:1xh;center,top&resize=1200:*',
        title: 'Vote for Peanut Butter',
        description: 'Vote for your favorite peanut butter!',
        label: 'Vote Now!',
        links: {
            actions: [
                {
                    href: 'http://localhost:3000/api/vote?candidate=Crunchy',
                    label: 'Vote Crunchy',
                    type: 'transaction'
                },
                {
                    href: 'http://localhost:3000/api/vote?candidate=Smooth',
                    label: 'Vote Smooth',
                    type: 'transaction'
                }
            ]
        }
    };
    return Response.json(actionMetadata, {
        headers: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$actions$2f$lib$2f$esm$2f$constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ACTIONS_CORS_HEADERS"]
    });
}
_c = GET;
async function POST(request) {
    const candidate = new URL(request.url).searchParams.get('candidate');
    if (candidate !== 'Crunchy' && candidate !== 'Smooth') {
        return Response.json({
            error: 'Invalid candidate'
        }, {
            status: 400,
            headers: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$actions$2f$lib$2f$esm$2f$constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ACTIONS_CORS_HEADERS"]
        });
    }
    const connection = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$web3$2e$js$2f$lib$2f$index$2e$browser$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Connection"]('http://localhost:8899', 'confirmed');
    const program = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$coral$2d$xyz$2f$anchor$2f$dist$2f$browser$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["Program"](__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$idl$2f$voting_program$2e$json__$28$json$29$__["default"], {
        connection
    });
    const body = await request.json();
    console.log('Request body: ', body);
    let account;
    try {
        account = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$web3$2e$js$2f$lib$2f$index$2e$browser$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PublicKey"](body.account);
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return Response.json({
            error: message
        }, {
            status: 400,
            headers: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$actions$2f$lib$2f$esm$2f$constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ACTIONS_CORS_HEADERS"]
        });
    }
    const instruction = await program.methods.vote(new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$bn$2e$js$2f$lib$2f$bn$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__BN$3e$__["BN"](3), candidate).accounts({
        signer: account
    }).instruction();
    const blockhash = await connection.getLatestBlockhash();
    const tx = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$web3$2e$js$2f$lib$2f$index$2e$browser$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Transaction"]({
        feePayer: account,
        blockhash: blockhash.blockhash,
        lastValidBlockHeight: blockhash.lastValidBlockHeight
    }).add(instruction);
    const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$actions$2f$lib$2f$esm$2f$createPostResponse$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createPostResponse"])({
        fields: {
            type: 'transaction',
            transaction: tx
        }
    });
    console.log('Response: ', response);
    return Response.json(response, {
        headers: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$actions$2f$lib$2f$esm$2f$constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ACTIONS_CORS_HEADERS"]
    });
}
_c1 = POST;
async function sendLocalnetTransaction() {
    const phantom = window.solana;
    if (phantom === null || phantom === void 0 ? void 0 : phantom.isPhantom) {
        await phantom.connect();
    } else {
        console.error('Phantom 未安装');
        return;
    }
    try {
        // 获取钱包公钥
        const account = phantom.publicKey;
        if (!account) {
            throw new Error('Phantom 未连接');
        }
        const connection = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$web3$2e$js$2f$lib$2f$index$2e$browser$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Connection"]('http://localhost:8899', 'confirmed');
        const program = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$coral$2d$xyz$2f$anchor$2f$dist$2f$browser$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["Program"](__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$idl$2f$voting_program$2e$json__$28$json$29$__["default"], {
            connection
        });
        const instruction = await program.methods.vote(new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$bn$2e$js$2f$lib$2f$bn$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__BN$3e$__["BN"](3), 'Smooth').accounts({
            signer: account
        }).instruction();
        const blockhash = await connection.getLatestBlockhash();
        const tx = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$web3$2e$js$2f$lib$2f$index$2e$browser$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Transaction"]({
            feePayer: account,
            blockhash: blockhash.blockhash,
            lastValidBlockHeight: blockhash.lastValidBlockHeight
        }).add(instruction);
        const signedTransaction = await phantom.signTransaction(tx);
        // 发送已签名交易
        const txid = await connection.sendRawTransaction(signedTransaction.serialize());
        console.log('✅ 交易已发送:', txid);
    } catch (err) {
        console.error('❌ 交易失败:', err);
    }
}
var _c, _c1;
__turbopack_context__.k.register(_c, "GET");
__turbopack_context__.k.register(_c1, "POST");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/components/account/account-feature-index.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": ()=>AccountFeatureIndex
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$wallet$2d$ui$2f$react$2f$dist$2f$index$2e$browser$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@wallet-ui/react/dist/index.browser.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$solana$2f$solana$2d$provider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/solana/solana-provider.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$api$2f$vote$2f$route$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/api/vote/route.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
;
;
;
function AccountFeatureIndex(param) {
    let { redirect } = param;
    _s();
    const { account } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$wallet$2d$ui$2f$react$2f$dist$2f$index$2e$browser$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["useWalletUi"])();
    if (account) {
        return redirect("/account/".concat(account.address.toString()));
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "hero py-[64px]",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "hero-content text-center",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$solana$2f$solana$2d$provider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["WalletButton"], {}, void 0, false, {
                    fileName: "[project]/src/components/account/account-feature-index.tsx",
                    lineNumber: 16,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/account/account-feature-index.tsx",
                lineNumber: 15,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                style: {
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    padding: '8px 12px',
                    marginTop: '12px'
                },
                onClick: ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$api$2f$vote$2f$route$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["sendLocalnetTransaction"])(),
                children: "Vote Smooth"
            }, void 0, false, {
                fileName: "[project]/src/components/account/account-feature-index.tsx",
                lineNumber: 18,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/account/account-feature-index.tsx",
        lineNumber: 14,
        columnNumber: 5
    }, this);
}
_s(AccountFeatureIndex, "cB3aMQ4J74Ck0NWuxDshCBIFTMs=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$wallet$2d$ui$2f$react$2f$dist$2f$index$2e$browser$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["useWalletUi"]
    ];
});
_c = AccountFeatureIndex;
var _c;
__turbopack_context__.k.register(_c, "AccountFeatureIndex");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/app/account/page.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": ()=>Page
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$account$2f$account$2d$feature$2d$index$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/account/account-feature-index.tsx [app-client] (ecmascript)");
'use client';
;
;
;
function Page() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$account$2f$account$2d$feature$2d$index$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
        redirect: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["redirect"]
    }, void 0, false, {
        fileName: "[project]/src/app/account/page.tsx",
        lineNumber: 6,
        columnNumber: 10
    }, this);
}
_c = Page;
var _c;
__turbopack_context__.k.register(_c, "Page");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
}]);

//# sourceMappingURL=src_d0a3b339._.js.map