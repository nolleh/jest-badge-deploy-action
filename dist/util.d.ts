import { ActionInterface, RequiredActionParameters } from "./constants";
export declare function extractErrorMessage<T>(error: T): string;
export declare function isNullOrUndefined(value: unknown): value is undefined | null | "";
export declare function ssh(action: ActionInterface): Promise<void>;
export declare function generateTokenType(action: ActionInterface): string;
export declare function generateRepositoryPath(action: ActionInterface): string;
export declare function generateFolderPath(action: ActionInterface): string;
export declare function hasRequiredParameters<K extends keyof RequiredActionParameters>(action: ActionInterface, params: K[]): boolean;
export declare function checkParameters(action: ActionInterface): void;
export declare function suppressSensitiveInformation(str: string, action: ActionInterface): string;
/**
 * Strips the protocol from a provided URL.
 */
export declare function stripProtocolFromUrl(url: string): string;
