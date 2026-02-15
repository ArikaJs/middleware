"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Pipeline = void 0;
/**
 * Pipeline executes a stack of middleware in an onion-style model.
 */
class Pipeline {
    /**
     * Create a new Pipeline instance.
     */
    constructor(container) {
        this.container = container;
        /**
         * The stack of middleware handlers.
         */
        this.handlers = [];
        this.middlewareGroups = {};
        this.aliases = {};
    }
    /**
     * Set the middleware groups.
     */
    setMiddlewareGroups(groups) {
        this.middlewareGroups = groups;
        return this;
    }
    /**
     * Set the middleware aliases.
     */
    setAliases(aliases) {
        this.aliases = aliases;
        return this;
    }
    /**
     * Add middleware to the pipeline.
     */
    pipe(middleware) {
        if (Array.isArray(middleware)) {
            this.handlers.push(...middleware);
        }
        else {
            this.handlers.push(middleware);
        }
        return this;
    }
    /**
     * Run the pipeline through the given destination.
     */
    async handle(request, destination, response) {
        const flattened = this.flattenHandlers(this.handlers);
        const invoke = async (index, req) => {
            if (index >= flattened.length) {
                return destination(req, response);
            }
            const handler = this.resolve(flattened[index]);
            if (typeof handler === 'function') {
                return handler(req, (nextReq) => invoke(index + 1, nextReq), response);
            }
            if (typeof handler === 'object' && 'handle' in handler && typeof handler.handle === 'function') {
                return handler.handle(req, (nextReq) => invoke(index + 1, nextReq), response);
            }
            throw new Error(`Invalid middleware handler: ${typeof handler}`);
        };
        return invoke(0, request);
    }
    /**
     * Resolve the middleware handler.
     */
    resolve(handler) {
        if (typeof handler === 'string' && this.container) {
            return this.container.make(handler);
        }
        return handler;
    }
    /**
     * Flatten handlers by resolving groups and aliases.
     */
    flattenHandlers(handlers) {
        let flattened = [];
        for (const handler of handlers) {
            if (typeof handler === 'string') {
                if (this.middlewareGroups[handler]) {
                    flattened.push(...this.flattenHandlers(this.middlewareGroups[handler]));
                    continue;
                }
                if (this.aliases[handler]) {
                    const resolved = this.aliases[handler];
                    if (Array.isArray(resolved)) {
                        flattened.push(...this.flattenHandlers(resolved));
                    }
                    else {
                        flattened.push(...this.flattenHandlers([resolved]));
                    }
                    continue;
                }
            }
            flattened.push(handler);
        }
        return flattened;
    }
}
exports.Pipeline = Pipeline;
//# sourceMappingURL=Pipeline.js.map