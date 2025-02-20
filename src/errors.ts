export class CancelError extends Error {
    constructor() {
        super('Canceled');
    }
}

export class ConfigNotFoundError extends Error {
    constructor() {
        super('Config file not found');
    }
}

export class LinterFailedError extends Error {
    constructor(message?: string, options?: ErrorOptions) {
        super(message, options);
    }
}

export type AbortError = Error & { code: 'ABORT_ERR' };

export const toError = (error: unknown): Error => {
    if (error instanceof Error) {
        return error;
    }
    return new Error(String(error));
};

export const isAbortError = (error: unknown): error is AbortError => {
    return error instanceof Error && (error as { code?: string }).code === 'ABORT_ERR';
};
