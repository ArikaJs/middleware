"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.compose = compose;
const Pipeline_1 = require("./Pipeline");
/**
 * Compose multiple middleware handlers into a single middleware handler.
 */
function compose(middleware) {
    return async (request, next) => {
        return new Pipeline_1.Pipeline()
            .pipe(middleware)
            .handle(request, next);
    };
}
//# sourceMappingURL=Compose.js.map