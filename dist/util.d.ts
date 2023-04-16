import { ActionInterface } from "./constants";
export declare function extractErrorMessage<T>(error: T): string;
export declare function isNullOrUndefined(
  value: unknown
): value is undefined | null | "";
export declare function ssh(action: ActionInterface): Promise<void>;
export declare function suppressSensitiveInformation(
  str: string,
  action: ActionInterface
): string;
/**
 * Strips the protocol from a provided URL.
 */
export declare const stripProtocolFromUrl: (url: string) => string;
