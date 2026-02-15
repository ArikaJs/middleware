import { Container } from './Contracts/Container';
import { MiddlewareHandler } from './Middleware';
/**
 * Pipeline executes a stack of middleware in an onion-style model.
 */
export declare class Pipeline<TRequest = any, TResponse = any> {
    private readonly container?;
    /**
     * The stack of middleware handlers.
     */
    private handlers;
    private middlewareGroups;
    private aliases;
    /**
     * Create a new Pipeline instance.
     */
    constructor(container?: Container | undefined);
    /**
     * Set the middleware groups.
     */
    setMiddlewareGroups(groups: Record<string, any[]>): this;
    /**
     * Set the middleware aliases.
     */
    setAliases(aliases: Record<string, any>): this;
    /**
     * Add middleware to the pipeline.
     */
    pipe(middleware: MiddlewareHandler<TRequest, TResponse> | MiddlewareHandler<TRequest, TResponse>[]): this;
    /**
     * Run the pipeline through the given destination.
     */
    handle(request: TRequest, destination: (request: TRequest, response?: TResponse) => Promise<TResponse> | TResponse, response?: TResponse): Promise<TResponse>;
    /**
     * Resolve the middleware handler.
     */
    private resolve;
    /**
     * Flatten handlers by resolving groups and aliases.
     */
    private flattenHandlers;
}
//# sourceMappingURL=Pipeline.d.ts.map