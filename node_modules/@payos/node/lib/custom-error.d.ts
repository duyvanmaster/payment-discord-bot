export declare class PayOSError extends Error {
    private code;
    constructor({ code, message }: {
        code: string;
        message: string;
    });
}
