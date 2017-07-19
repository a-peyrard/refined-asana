export interface Tweak {
    name: string;
    apply: (asana: any) => Promise<boolean>;
}