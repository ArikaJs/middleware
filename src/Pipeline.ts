import { Container } from './Contracts/Container';
import { MiddlewareHandler, Middleware } from './Middleware';

/**
 * Pipeline executes a stack of middleware in an onion-style model.
 */
export class Pipeline<TRequest = any, TResponse = any> {
    /**
     * The stack of middleware handlers.
     */
    private handlers: MiddlewareHandler<TRequest, TResponse>[] = [];
    private middlewareGroups: Record<string, any[]> = {};
    private aliases: Record<string, any> = {};

    /**
     * Create a new Pipeline instance.
     */
    constructor(private readonly container?: Container) { }

    /**
     * Set the middleware groups.
     */
    public setMiddlewareGroups(groups: Record<string, any[]>): this {
        this.middlewareGroups = groups;
        return this;
    }

    /**
     * Set the middleware aliases.
     */
    public setAliases(aliases: Record<string, any>): this {
        this.aliases = aliases;
        return this;
    }

    /**
     * Add middleware to the pipeline.
     */
    public pipe(middleware: MiddlewareHandler<TRequest, TResponse> | MiddlewareHandler<TRequest, TResponse>[]): this {
        if (Array.isArray(middleware)) {
            this.handlers.push(...middleware);
        } else {
            this.handlers.push(middleware);
        }
        return this;
    }

    /**
     * Run the pipeline through the given destination.
     */
    public async handle(
        request: TRequest,
        destination: (request: TRequest, response?: TResponse) => Promise<TResponse> | TResponse,
        response?: TResponse
    ): Promise<TResponse> {
        const flattened = this.flattenHandlers(this.handlers);

        const invoke = async (index: number, req: TRequest): Promise<TResponse> => {
            if (index >= flattened.length) {
                return destination(req, response);
            }

            const handler = this.resolve(flattened[index]);

            if (typeof handler === 'function') {
                return handler(req, (nextReq: TRequest) => invoke(index + 1, nextReq), response);
            }

            if (typeof handler === 'object' && 'handle' in handler && typeof handler.handle === 'function') {
                return (handler as any).handle(req, (nextReq: TRequest) => invoke(index + 1, nextReq), response);
            }

            throw new Error(`Invalid middleware handler: ${typeof handler}`);
        };

        return invoke(0, request);
    }

    /**
     * Resolve the middleware handler.
     */
    private resolve(handler: any): any {
        if (typeof handler === 'string' && this.container) {
            return this.container.make(handler);
        }

        return handler;
    }

    /**
     * Flatten handlers by resolving groups and aliases.
     */
    private flattenHandlers(handlers: any[]): any[] {
        let flattened: any[] = [];

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
                    } else {
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
