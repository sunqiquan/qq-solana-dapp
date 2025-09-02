(globalThis.TURBOPACK = globalThis.TURBOPACK || []).push([typeof document === "object" ? document.currentScript : undefined, {

"[project]/src/components/journal/journal-data-access.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "useGetJournalEntriesQuery": ()=>useGetJournalEntriesQuery,
    "useInvalidateGetJournalEntriesQuery": ()=>useInvalidateGetJournalEntriesQuery
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/useQuery.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/QueryClientProvider.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$wallet$2d$ui$2f$react$2f$dist$2f$index$2e$browser$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@wallet-ui/react/dist/index.browser.mjs [app-client] (ecmascript) <locals>");
(()=>{
    const e = new Error("Cannot find module '@/generated'");
    e.code = 'MODULE_NOT_FOUND';
    throw e;
})();
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature(), _s2 = __turbopack_context__.k.signature();
;
;
;
// 查询 Key
function useGetJournalEntriesQueryKey(param) {
    let { owner } = param;
    _s();
    const { cluster } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$wallet$2d$ui$2f$react$2f$dist$2f$index$2e$browser$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["useWalletUi"])();
    return [
        'get-journal-entries',
        {
            cluster,
            owner
        }
    ];
}
_s(useGetJournalEntriesQueryKey, "k67tCjzqDqikwmkbQJe5QQWC5zs=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$wallet$2d$ui$2f$react$2f$dist$2f$index$2e$browser$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["useWalletUi"]
    ];
});
// 无效化查询
function useInvalidateGetJournalEntriesQuery(param) {
    let { owner } = param;
    _s1();
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"])();
    const queryKey = useGetJournalEntriesQueryKey({
        owner
    });
    return async ()=>{
        await queryClient.invalidateQueries({
            queryKey
        });
    };
}
_s1(useInvalidateGetJournalEntriesQuery, "gevq17UGHWoUT94IJQRGl6qsonM=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"],
        useGetJournalEntriesQueryKey
    ];
});
function useGetJournalEntriesQuery(param) {
    let { owner } = param;
    _s2();
    const { client } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$wallet$2d$ui$2f$react$2f$dist$2f$index$2e$browser$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["useWalletUi"])();
    const queryKey = useGetJournalEntriesQueryKey({
        owner
    });
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey,
        queryFn: {
            "useGetJournalEntriesQuery.useQuery": async ()=>{
                // 1. 使用 getProgramAccounts 查询所有 JournalEntry 账户
                const programAccounts = await client.rpc.getProgramAccounts('EQ84rMPQR8HQQ5QfHKyLnRUGF3XAaUMHtWmhv1ZzSEaE', {
                    filters: [
                        // 过滤 discriminator
                        {
                            memcmp: {
                                offset: 0,
                                bytes: Array.from(JOURNAL_ENTRY_DISCRIMINATOR).map({
                                    "useGetJournalEntriesQuery.useQuery": (b)=>b.toString(16).padStart(2, '0')
                                }["useGetJournalEntriesQuery.useQuery"]).join('')
                            }
                        },
                        // 过滤 owner 字段（偏移 8）
                        {
                            memcmp: {
                                offset: 8,
                                bytes: owner
                            }
                        }
                    ]
                }).send();
                // 2. 解码账户数据
                const decoder = getJournalEntryDecoder();
                return programAccounts.map({
                    "useGetJournalEntriesQuery.useQuery": (account)=>{
                        const decoded = decoder.decode(account.account.data);
                        return {
                            address: account.pubkey,
                            ...decoded
                        };
                    }
                }["useGetJournalEntriesQuery.useQuery"]);
            }
        }["useGetJournalEntriesQuery.useQuery"]
    });
}
_s2(useGetJournalEntriesQuery, "bGqD8UKQ10/BfQsc+GloT2bIi8I=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$wallet$2d$ui$2f$react$2f$dist$2f$index$2e$browser$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["useWalletUi"],
        useGetJournalEntriesQueryKey,
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"]
    ];
});
;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/components/journal/journal-ui.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "JournalList": ()=>JournalList
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$journal$2f$journal$2d$data$2d$access$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/journal/journal-data-access.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$table$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/table.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$refresh$2d$cw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RefreshCw$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/refresh-cw.js [app-client] (ecmascript) <export default as RefreshCw>");
;
var _s = __turbopack_context__.k.signature();
;
;
;
;
;
function JournalList(param) {
    let { address } = param;
    var _query_error, _query_data;
    _s();
    const query = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$journal$2f$journal$2d$data$2d$access$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useGetJournalQuery"])({
        address
    });
    const [showAll, setShowAll] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const items = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "JournalList.useMemo[items]": ()=>{
            var _query_data;
            if (showAll) return query.data;
            return (_query_data = query.data) === null || _query_data === void 0 ? void 0 : _query_data.slice(0, 5);
        }
    }["JournalList.useMemo[items]"], [
        query.data,
        showAll
    ]);
    var _query_data_length;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-2",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex justify-between",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "text-2xl font-bold",
                        children: "Transaction History"
                    }, void 0, false, {
                        fileName: "[project]/src/components/journal/journal-ui.tsx",
                        lineNumber: 20,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-x-2",
                        children: query.isLoading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "loading loading-spinner"
                        }, void 0, false, {
                            fileName: "[project]/src/components/journal/journal-ui.tsx",
                            lineNumber: 23,
                            columnNumber: 13
                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                            variant: "outline",
                            onClick: ()=>query.refetch(),
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$refresh$2d$cw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RefreshCw$3e$__["RefreshCw"], {
                                size: 16
                            }, void 0, false, {
                                fileName: "[project]/src/components/journal/journal-ui.tsx",
                                lineNumber: 26,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/components/journal/journal-ui.tsx",
                            lineNumber: 25,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/journal/journal-ui.tsx",
                        lineNumber: 21,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/journal/journal-ui.tsx",
                lineNumber: 19,
                columnNumber: 7
            }, this),
            query.isError && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("pre", {
                className: "alert alert-error",
                children: [
                    "Error: ",
                    (_query_error = query.error) === null || _query_error === void 0 ? void 0 : _query_error.message.toString()
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/journal/journal-ui.tsx",
                lineNumber: 31,
                columnNumber: 25
            }, this),
            query.isSuccess && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                children: query.data.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    children: "No journals found."
                }, void 0, false, {
                    fileName: "[project]/src/components/journal/journal-ui.tsx",
                    lineNumber: 35,
                    columnNumber: 13
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$table$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Table"], {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$table$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TableHeader"], {
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$table$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TableRow"], {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$table$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TableHead"], {
                                        children: "Title"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/journal/journal-ui.tsx",
                                        lineNumber: 40,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$table$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TableHead"], {
                                        children: "Content"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/journal/journal-ui.tsx",
                                        lineNumber: 41,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$table$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TableHead"], {
                                        children: "Operation"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/journal/journal-ui.tsx",
                                        lineNumber: 42,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/journal/journal-ui.tsx",
                                lineNumber: 39,
                                columnNumber: 17
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/components/journal/journal-ui.tsx",
                            lineNumber: 38,
                            columnNumber: 15
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$table$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TableBody"], {
                            children: [
                                items === null || items === void 0 ? void 0 : items.map((item)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$table$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TableRow"], {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$table$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TableCell"], {
                                                className: "font-mono",
                                                children: item.title
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/journal/journal-ui.tsx",
                                                lineNumber: 48,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$table$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TableCell"], {
                                                children: item.content
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/journal/journal-ui.tsx",
                                                lineNumber: 49,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$table$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TableCell"], {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        className: "bg-yellow-500 text-white px-2 py-1 mr-2",
                                                        onClick: ()=>console.log("Edit journal: ".concat(item.title)),
                                                        children: "Update"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/journal/journal-ui.tsx",
                                                        lineNumber: 51,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        className: "bg-red-500 text-white px-2 py-1",
                                                        onClick: ()=>console.log("Delete journal: ".concat(item.title)),
                                                        children: "Delete"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/journal/journal-ui.tsx",
                                                        lineNumber: 57,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/journal/journal-ui.tsx",
                                                lineNumber: 50,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, item.title, true, {
                                        fileName: "[project]/src/components/journal/journal-ui.tsx",
                                        lineNumber: 47,
                                        columnNumber: 19
                                    }, this)),
                                ((_query_data_length = (_query_data = query.data) === null || _query_data === void 0 ? void 0 : _query_data.length) !== null && _query_data_length !== void 0 ? _query_data_length : 0) > 5 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$table$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TableRow"], {
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$table$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TableCell"], {
                                        colSpan: 4,
                                        className: "text-center",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                            variant: "outline",
                                            onClick: ()=>setShowAll(!showAll),
                                            children: showAll ? 'Show Less' : 'Show All'
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/journal/journal-ui.tsx",
                                            lineNumber: 69,
                                            columnNumber: 23
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/journal/journal-ui.tsx",
                                        lineNumber: 68,
                                        columnNumber: 21
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/components/journal/journal-ui.tsx",
                                    lineNumber: 67,
                                    columnNumber: 19
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/journal/journal-ui.tsx",
                            lineNumber: 45,
                            columnNumber: 15
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/journal/journal-ui.tsx",
                    lineNumber: 37,
                    columnNumber: 13
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/journal/journal-ui.tsx",
                lineNumber: 33,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/journal/journal-ui.tsx",
        lineNumber: 18,
        columnNumber: 5
    }, this);
}
_s(JournalList, "E5CL5cXM425xUIt3uq9dlZzJ3k8=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$journal$2f$journal$2d$data$2d$access$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useGetJournalQuery"]
    ];
});
_c = JournalList;
var _c;
__turbopack_context__.k.register(_c, "JournalList");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/components/journal/journal-feature-detail.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": ()=>JournalFeatureDetail
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$kit$2f$node_modules$2f40$solana$2f$addresses$2f$dist$2f$index$2e$browser$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@solana/kit/node_modules/@solana/addresses/dist/index.browser.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$wallet$2d$ui$2f$react$2f$dist$2f$index$2e$browser$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@wallet-ui/react/dist/index.browser.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$journal$2f$journal$2d$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/journal/journal-ui.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
;
;
;
;
;
function JournalFeatureDetail() {
    _s();
    const { account } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$wallet$2d$ui$2f$react$2f$dist$2f$index$2e$browser$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["useWalletUi"])();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "JournalFeatureDetail.useEffect": ()=>{
            if (!account) {
                router.replace('/account');
            }
        }
    }["JournalFeatureDetail.useEffect"], [
        account,
        router
    ]);
    const params = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useParams"])();
    const address = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "JournalFeatureDetail.useMemo[address]": ()=>{
            if (!params.address || typeof params.address !== 'string') {
                return;
            }
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$kit$2f$node_modules$2f40$solana$2f$addresses$2f$dist$2f$index$2e$browser$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertIsAddress"])(params.address);
            return params.address;
        }
    }["JournalFeatureDetail.useMemo[address]"], [
        params
    ]);
    if (!address) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            children: "Error loading account"
        }, void 0, false, {
            fileName: "[project]/src/components/journal/journal-feature-detail.tsx",
            lineNumber: 26,
            columnNumber: 12
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$journal$2f$journal$2d$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["JournalList"], {
            address: address
        }, void 0, false, {
            fileName: "[project]/src/components/journal/journal-feature-detail.tsx",
            lineNumber: 31,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/journal/journal-feature-detail.tsx",
        lineNumber: 30,
        columnNumber: 5
    }, this);
}
_s(JournalFeatureDetail, "VH7cQX0IqjrcRu4tKoVpmepqzeg=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$wallet$2d$ui$2f$react$2f$dist$2f$index$2e$browser$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["useWalletUi"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useParams"]
    ];
});
_c = JournalFeatureDetail;
var _c;
__turbopack_context__.k.register(_c, "JournalFeatureDetail");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/app/journal/[address]/page.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": ()=>Page
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$journal$2f$journal$2d$feature$2d$detail$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/journal/journal-feature-detail.tsx [app-client] (ecmascript)");
'use client';
;
;
function Page() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$journal$2f$journal$2d$feature$2d$detail$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
        fileName: "[project]/src/app/journal/[address]/page.tsx",
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

//# sourceMappingURL=src_06f5c835._.js.map