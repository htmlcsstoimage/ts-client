export {
    BaseCreateImageRequest,
    CreateHtmlCssImageRequest,
    CreateTemplatedImageRequest,
    CreateUrlImageRequest,
    PDFOptions
} from './types/request.js';

export type {
    ColorSchemeType,
    MediaType,
    PdfMargins,
    PdfValueInput,
    PdfValueWithUnits,
    PdfUnit
} from './types/request.js';

export type {
    CreateImageBatchResponse,
    CreateImageBatchSuccessResponse,
    CreateImageErrorResponse,
    CreateImageResponse,
    CreateImageSuccessResponse,
    ValidationError
} from './types/response.js';
export { HtmlCssToImageClient } from './HtmlCssToImageClient.js';
export type { FetchFunction } from './HtmlCssToImageClient.js';
export type { IHtmlCssToImageClient } from './IHtmlCssToImageClient.js';
