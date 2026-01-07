import {IHtmlCssToImageClient} from "./IHtmlCssToImageClient.js";
import {CreateHtmlCssImageRequest, CreateTemplatedImageRequest, CreateUrlImageRequest, PDFOptions, PdfValueInput} from "./types/request.js";
import {CreateImageBatchResponse, CreateImageBatchSuccessResponse, CreateImageErrorResponse, CreateImageResponse, CreateImageSuccessResponse} from "./types/response.js";
import {InternalCreateHtmlCssImageRequest, InternalCreateHtmlCssImageRequestWithOptionalHtml, InternalCreateUrlImageRequest, InternalCreateUrlImageRequestWithOptionalUrl, InternalPDFOptions} from "./types/internals.js";
import * as crypto from 'node:crypto';

export type FetchFunction = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;

export class HtmlCssToImageClient implements IHtmlCssToImageClient {

    private readonly apiId: string;
    private readonly apiKey: string;
    private readonly baseUrl: string = 'https://hcti.io';
    private readonly authHeader: string;

    private readonly fetch: FetchFunction;

    constructor(apiId: string, apiKey: string, customFetch?: FetchFunction) {
        const fetchImpl = customFetch || (typeof fetch !== 'undefined' ? fetch : undefined);
        if (!fetchImpl) {
            throw new Error(
                "The 'fetch' API is not available in this environment. " +
                "Please provide a fetch implementation (like node-fetch or undici) in the constructor."
            );
        }
        this.fetch = fetchImpl;
        this.apiId = apiId;
        this.apiKey = apiKey;
        const auth = Buffer.from(`${this.apiId}:${this.apiKey}`).toString('base64');
        this.authHeader = `Basic ${auth}`;
    }

    static fromEnv(): HtmlCssToImageClient {
        const id =  process.env.HCTI_API_ID;
        const key = process.env.HCTI_API_KEY;

        if (!id || !key) {
            throw new Error("Missing environment variables HCTI_API_ID or HCTI_API_KEY");
        }

        return new HtmlCssToImageClient(id, key);
    }


    async createImage(request: CreateHtmlCssImageRequest | CreateUrlImageRequest | CreateTemplatedImageRequest): Promise<CreateImageResponse> {
        const internal_request = this.mapToInternal(request, false);

        const response = await this.fetch(`${this.baseUrl}/v1/image`, {
            method: 'POST',
            headers: {
                'Authorization': this.authHeader,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(internal_request),
        });
        return await this.responseToType<CreateImageResponse>(response);


    }

    private mapToInternal(request: CreateHtmlCssImageRequest | CreateUrlImageRequest | CreateTemplatedImageRequest, in_batch: boolean): any {
        switch (request.__type) {
            case 'html_css':
                return this.mapHtmlCssToInternalRequest(request, in_batch);
            case 'url':
                return this.mapUrlToInternalRequest(request, in_batch);
            case 'templated':
                return request;
            default:
                throw new Error("Unsupported request type");
        }
    }

    async createImageBatch<T extends CreateHtmlCssImageRequest | CreateUrlImageRequest>(variations: T[], default_options?: T): Promise<CreateImageBatchResponse> {
        if (variations.length === 0) {
            return Promise.resolve({images: [] as CreateImageResponse[]} as CreateImageBatchSuccessResponse);
        }
        const internal_variations = variations.map(variation => this.mapToInternal(variation, true));
        let internal_default_option = default_options ? this.mapToInternal(default_options, true) : undefined;

        const batch_request = {
            variations: internal_variations,
            default_options: internal_default_option
        }


        const response = await this.fetch(`${this.baseUrl}/v1/image/batch`, {
            method: 'POST',
            headers: {
                'Authorization': this.authHeader,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(batch_request),
        });
        return await this.responseToType<CreateImageBatchResponse>(response);


    }


    createTemplatedImageUrl<T extends Record<string, any>>(templateIdOrRequest: string | CreateTemplatedImageRequest<T>, templateValues?: T, templateVersion?: number): string {
        let request: CreateTemplatedImageRequest;
        if (typeof templateIdOrRequest === 'string') {
            request = new CreateTemplatedImageRequest({
                template_id: templateIdOrRequest,
                template_values: templateValues || {},
                template_version: templateVersion
            })
        } else {
            request = templateIdOrRequest;
        }


        const params = new URLSearchParams();
        if (request.template_version) {
            params.append('template_version', request.template_version.toString());
        }
        const sortedKeys = Object.keys(request.template_values).sort();
        for (const key of sortedKeys) {
            const value = (request.template_values as any)[key];
            if (value !== null && value !== undefined) {
                if (typeof value === 'object') {
                    // Serialize objects and arrays to JSON
                    params.append(key, JSON.stringify(value));
                } else {
                    // Primitive values (string, number, boolean) are appended directly
                    params.append(key, value.toString());
                }
            }
        }
        const queryString = params.toString();
        const token = this.generateHmacToken(queryString);
        return `${this.baseUrl}/v1/image/${request.template_id}/${token}${queryString ? '?' : ''}${queryString}`;
    }

    createAndRenderUrl(request: CreateUrlImageRequest): string {
        const params = new URLSearchParams();
        params.append('url', request.url);
        Object.entries(request)
            .filter(([key, value]) => key !== 'url' && key != 'pdf_options' && key !== '__type')
            .sort((a, b) => a[0].localeCompare(b[0]))
            .forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== false) {
                    params.append(key, value.toString())
                }
            });
        const queryString = params.toString();
        const token = this.generateHmacToken(queryString);
        return `${this.baseUrl}/v1/image/create-and-render/${this.apiId}/${token}?${queryString}`;
    }

    private async responseToType<T>(response: Response): Promise<T> {
        let response_json: Record<string, any>;

        try {
            response_json = await response.json() as Record<string, any>;
        } catch (e) {
            // Fallback for cases where the body is not JSON (e.g. 500 edge error)
            response_json = {
                error: 'Internal Server Error',
                message: `The server returned an unexpected response (Status: ${response.status}).`
            };
        }

        if (response.ok) {
            return { success: true, ...response_json } as T;
        } else {
            return { success: false, ...response_json } as T;
        }
    }

    private mapHtmlCssToInternalRequest(request: CreateHtmlCssImageRequest, in_batch: boolean): InternalCreateHtmlCssImageRequest | InternalCreateHtmlCssImageRequestWithOptionalHtml {
        const {pdf_options, google_fonts, __type, ...shared_request} = request;
        let new_request: InternalCreateHtmlCssImageRequest|InternalCreateHtmlCssImageRequestWithOptionalHtml;
        if(in_batch){
            new_request = {...shared_request} as InternalCreateHtmlCssImageRequestWithOptionalHtml;
            if(new_request.html===''){
                new_request.html=undefined;
            }
        }else{
            new_request=  {...shared_request} as InternalCreateHtmlCssImageRequest;
        }

        new_request.pdf_options = this.mapPDFOptionsToInternal(pdf_options);
        if (google_fonts && google_fonts.length > 0) {
            const processed_fonts = google_fonts
                .map(font => font.trim().replace(/ /g, '+'))
                .filter(font => font.length > 0);
            const unique_fonts = [...new Set(processed_fonts)];
            new_request.google_fonts = unique_fonts.join('|');
        }
        return new_request;
    }

    private mapUrlToInternalRequest(request: CreateUrlImageRequest, in_batch: boolean): InternalCreateUrlImageRequest|InternalCreateUrlImageRequestWithOptionalUrl {
        const {pdf_options, __type, ...shared_request} = request;
        let new_request: InternalCreateUrlImageRequest|InternalCreateUrlImageRequestWithOptionalUrl;
        if(in_batch){
            new_request = {...shared_request} as InternalCreateUrlImageRequestWithOptionalUrl;
            if(new_request.url===''){
                new_request.url=undefined;
            }
        }else{
            new_request=  {...shared_request} as InternalCreateUrlImageRequest;
        }

        new_request.pdf_options = this.mapPDFOptionsToInternal(pdf_options);
        return new_request;
    }

    private mapPDFOptionsToInternal(pdf_options?: PDFOptions): InternalPDFOptions | undefined {
        if (pdf_options) {
            const {margins, page_height, page_width, ...shared_pdf_options} = pdf_options;
            const new_pdf_options: InternalPDFOptions = {
                ...shared_pdf_options
            };

            if (margins) {

                new_pdf_options.margins = [
                    this.pdfValueWithUnitsToString(margins.top),
                    this.pdfValueWithUnitsToString(margins.right),
                    this.pdfValueWithUnitsToString(margins.bottom),
                    this.pdfValueWithUnitsToString(margins.left)
                ]
            }
            if (page_height) {
                new_pdf_options.page_height = this.pdfValueWithUnitsToString(page_height);
            }
            if (page_width) {
                new_pdf_options.page_width = this.pdfValueWithUnitsToString(page_width);
            }
            return new_pdf_options;
        }
    }


    private pdfValueWithUnitsToString(item: PdfValueInput) {
        if (typeof item === "number") {
            return `${item}px`;
        } else {
            return `${item.value}${item.unit}`;
        }
    }

    private generateHmacToken(queryString: string): string {
        return crypto
            .createHmac('sha256', this.apiKey)
            .update(queryString)
            .digest('hex');
    }


}