import {CreateHtmlCssImageRequest, CreateTemplatedImageRequest, CreateUrlImageRequest} from "./types/request.js";
import {CreateImageBatchResponse, CreateImageErrorResponse, CreateImageResponse, CreateImageSuccessResponse} from "./types/response.js";

export interface IHtmlCssToImageClient {
    createImage(request: CreateHtmlCssImageRequest|CreateUrlImageRequest|CreateTemplatedImageRequest) : Promise<CreateImageResponse>;
    createImageBatch<T extends CreateHtmlCssImageRequest|CreateUrlImageRequest>(variations: T[],default_options?:T) : Promise<CreateImageBatchResponse>;
    generateCreateAndRenderUrl(request: CreateUrlImageRequest): string;
    generateTemplatedImageUrl<T extends Record<string,any>>(template_id: string, template_values: T, template_version?: number):string;
    generateTemplatedImageUrl(request: CreateTemplatedImageRequest):string;
}