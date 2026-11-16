import type {
    CreateHtmlCssImageRequest,
    CreateHtmlCssRecordingRequest,
    CreateTemplatedImageRequest,
    CreateUrlImageRequest,
    CreateUrlRecordingRequest,
    RenderImageFormat,
    TemplatedBatchImageOptions,
} from "./types/request.js";
import type {
    CreateImageBatchResponse,
    CreateImageResponse,
    CreateRecordingResponse,
    DeleteImageResponse,
    DeleteRecordingResponse,
    RecordingStatusResponse,
} from "./types/response.js";

export interface IHtmlCssToImageClient {
    /** Create an HTML/CSS or URL recording. Rendering may continue after creation. */
    createRecording(request: CreateHtmlCssRecordingRequest | CreateUrlRecordingRequest): Promise<CreateRecordingResponse>;
    /** Fetch lifecycle status once. Both HTTP 200 and 202 return status information. */
    fetchRecordingStatus(recordingId: string): Promise<RecordingStatusResponse>;
    /** Delete a recording and clear its media from the CDN. */
    deleteRecording(recordingId: string): Promise<DeleteRecordingResponse>;
    /** Delete multiple recordings in one API call. */
    deleteRecordingBatch(recordingIds: readonly string[]): Promise<DeleteRecordingResponse>;
    createImage(request: CreateHtmlCssImageRequest|CreateUrlImageRequest|CreateTemplatedImageRequest) : Promise<CreateImageResponse>;
    createImageBatch<T extends CreateHtmlCssImageRequest|CreateUrlImageRequest>(variations: T[],default_options?:T) : Promise<CreateImageBatchResponse>;
    deleteImage(imageId: string): Promise<DeleteImageResponse>;
    createTemplatedImageBatch<T = Record<string, any>>(variations: TemplatedBatchImageOptions<T>[], default_options?: TemplatedBatchImageOptions<T>): Promise<CreateImageBatchResponse>;
    deleteImageBatch(imageIds: readonly string[]): Promise<DeleteImageResponse>;
    generateCreateAndRenderUrl(request: CreateUrlImageRequest): string;
    generateTemplatedImageUrl<T extends Record<string,any>>(template_id: string, template_values: T, template_version?: number, format?: RenderImageFormat):string;
    generateTemplatedImageUrl(request: CreateTemplatedImageRequest):string;
}
