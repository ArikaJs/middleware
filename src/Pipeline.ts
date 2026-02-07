import { Request, Response } from '@arikajs/http';
import { Container } from '@arikajs/foundation';
import { MiddlewareHandler, Middleware } from './Middleware';

/**
 * Pipeline executes a stack of middleware in an onion-style model.
 */
export class Pipeline {
    /**
     * The stack of middleware handlers.
     */
    private handlers: MiddlewareHandler[] = [];

    /**
     * Create a new Pipeline instance.
     */
    constructor(private readonly container?: Container) { }

    /**
     * Add middleware to the pipeline.
     */
    public pipe(middleware: MiddlewareHandler | MiddlewareHandler[]): this {
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
        request: Request,
        destination: (request: Request) => Promise<Response> | Response
    ): Promise<Response> {
        const invoke = async (index: number, req: Request): Promise<Response> => {
            const handler = this.resolve(this.handlers[index]);

            if (!handler) {
                return destination(req);
            }

            if (typeof handler === 'function') {
                return handler(req, (nextReq: Request) => invoke(index + 1, nextReq));
            }

            if (typeof handler === 'object' && 'handle' in handler && typeof handler.handle === 'function') {
                return (handler as Middleware).handle(req, (nextReq: Request) => invoke(index + 1, nextReq));
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
