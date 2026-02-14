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

    /**
     * Create a new Pipeline instance.
     */
    constructor(private readonly container?: Container) { }

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
        const invoke = async (index: number, req: TRequest): Promise<TResponse> => {
            const handler = this.resolve(this.handlers[index]);

            if (!handler) {
                return destination(req, response);
            }

            if (typeof handler === 'function') {
                return handler(req, (nextReq: TRequest) => invoke(index + 1, nextReq), response);
            }

            if (typeof handler === 'object' && 'handle' in handler && typeof handler.handle === 'function') {
                return (handler as any).handle(req, (nextReq: TRequest) => invoke(index + 1, nextReq), response);
            }

            throw new Error('Invalid middleware handler provided to pipeline.');
        };

        return invoke(0, request);
    }

    /**
     * Resolve the middleware handler.
     */
    private resolve(handler: MiddlewareHandler): any {
        if (typeof handler === 'string' && this.container) {
            return this.container.make(handler);
        }

        return handler;
    }
}
