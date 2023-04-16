import { ActionInterface } from "./constants";
export declare const doBadgesExist: (outputPath: string) => Promise<boolean>;
export declare function generateBadge(settings: ActionInterface): Promise<void>;
