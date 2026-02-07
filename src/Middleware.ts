import { Request, Response } from '@arikajs/http';

/**
 * Middleware contract for ArikaJS.
 */
export interface Middleware {
    /**
     * Handle an incoming request.
     */
    handle(
        request: Request,
        next: (request: Request) => Promise<Response> | Response
    ): Promise<Response> | Response;
}

/**
 * Type for middleware that can be either a class, a function, or a string key.
 */
export type MiddlewareHandler =
    | Middleware
    | ((request: Request, next: (request: Request) => Promise<Response> | Response) => Promise<Response> | Response)
    | string
    | any;
