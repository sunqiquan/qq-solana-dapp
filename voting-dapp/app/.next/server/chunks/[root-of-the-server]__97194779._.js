module.exports = {

"[project]/.next-internal/server/app/api/vote/route/actions.js [app-rsc] (server actions loader, ecmascript)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
}}),
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}}),
"[project]/src/app/api/vote/route.ts [app-route] (ecmascript)": ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s({
    "GET": ()=>GET,
    "OPTIONS": ()=>OPTIONS,
    "POST": ()=>POST
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$actions$2f$lib$2f$esm$2f$constants$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@solana/actions/lib/esm/constants.js [app-route] (ecmascript)");
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
                    href: 'http://localhost:3000/api/vote?candidate=crunchy',
                    label: 'Vote Crunchy',
                    type: 'transaction'
                },
                {
                    href: 'http://localhost:3000/api/vote?candidate=smooth',
                    label: 'Vote Smooth',
                    type: 'transaction'
                }
            ]
        }
    };
    return Response.json(actionMetadata, {
        headers: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$solana$2f$actions$2f$lib$2f$esm$2f$constants$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ACTIONS_CORS_HEADERS"]
    });
}
async function POST(request) {}
}),

};

//# sourceMappingURL=%5Broot-of-the-server%5D__97194779._.js.map