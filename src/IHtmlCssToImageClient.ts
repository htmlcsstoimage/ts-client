import type {CreateHtmlCssImageRequest, CreateTemplatedImageRequest, CreateUrlImageRequest} from "./types/request.js";
import type {CreateImageBatchResponse, CreateImageResponse, DeleteImageResponse} from "./types/response.js";

export interface IHtmlCssToImageClient {
    createImage(request: CreateHtmlCssImageRequest|CreateUrlImageRequest|CreateTemplatedImageRequest) : Promise<CreateImageResponse>;
    createImageBatch<T extends CreateHtmlCssImageRequest|CreateUrlImageRequest>(variations: T[],default_options?:T) : Promise<CreateImageBatchResponse>;
    deleteImage(imageId: string): Promise<DeleteImageResponse>;
    deleteImageBatch(imageIds: readonly string[]): Promise<DeleteImageResponse>;
    generateCreateAndRenderUrl(request: CreateUrlImageRequest): string;
    generateTemplatedImageUrl<T extends Record<string,any>>(template_id: string, template_values: T, template_version?: number):string;
    generateTemplatedImageUrl(request: CreateTemplatedImageRequest):string;
}
