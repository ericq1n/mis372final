declare const app: import("express-serve-static-core").Express;
declare global {
    namespace Express {
        interface Request {
            userId?: string;
        }
    }
}
export default app;
//# sourceMappingURL=server.d.ts.map