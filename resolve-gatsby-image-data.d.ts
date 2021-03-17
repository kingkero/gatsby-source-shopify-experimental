import { ImageFormat } from "gatsby-plugin-image";
declare type ImageLayout = "constrained" | "fixed" | "fullWidth";
export declare function resolveGatsbyImageData(image: Node & {
    width: number;
    height: number;
    originalSrc: string;
}, { formats, layout, ...options }: {
    formats: Array<ImageFormat>;
    layout: ImageLayout;
}): Promise<import("gatsby-plugin-image").IGatsbyImageData>;
export {};
