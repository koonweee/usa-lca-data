"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createHttpApp = createHttpApp;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const express_rate_limit_1 = require("express-rate-limit");
function createHttpApp(trustProxyHops = 0) {
    if (![0, 1].includes(trustProxyHops))
        throw new Error('TRUST_PROXY_HOPS must be 0 or 1');
    const app = (0, express_1.default)();
    app.disable('x-powered-by');
    // Production has exactly one Traefik hop and no published API host port.
    // Trust only that last hop; caller-supplied earlier X-Forwarded-For is ignored.
    app.set('trust proxy', trustProxyHops);
    app.use((0, cors_1.default)());
    for (const [windowMs, limit] of [[60000, 120], [10000, 30]]) {
        app.use((0, express_rate_limit_1.rateLimit)({ windowMs, limit, standardHeaders: 'draft-8', legacyHeaders: false,
            ipv6Subnet: 56, message: { errors: [{ message: 'Too many requests; retry later', extensions: { code: 'RATE_LIMITED' } }] } }));
    }
    app.use(express_1.default.json({ limit: '32kb', inflate: false }));
    const bodyError = (error, _req, res, _next) => {
        const status = error.status === 413 ? 413 : error.status === 415 ? 415 : 400;
        res.status(status).json({ errors: [{ message: status === 413 ? 'Request body exceeds 32 KiB' : 'Invalid JSON request body', extensions: { code: 'BAD_REQUEST' } }] });
    };
    app.use(bodyError);
    return app;
}
