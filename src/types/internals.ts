import {ColorSchemeType} from "./request.js";

export abstract class BaseCreateRequestWithoutVariableOptions {
    /**
     * A CSS selector to target a specific element on the page.
     * The API will crop the image to the dimensions of this element.
     */
    selector?: string;

    /**
     * Adjusts the pixel ratio for the screenshot.
     * The default is 2 which is equivalent to a 4K monitor.
     */
    device_scale?: number;

    /**
     * Set the height of Chrome's viewport. This will disable automatic cropping.
     */
    viewport_height?: number;

    /**
     * Set the width of Chrome's viewport. This will disable automatic cropping.
     */
    viewport_width?: number;

    /**
     * Sets a limit on time to wait until the screenshot is taken.
     * Use this if your page loads a lot of extra irrelevant content.
     */
    max_wait_ms?: number;

    /**
     * Adds extra time before taking the screenshot,
     * like if you need to wait for Javascript to execute.
     */
    ms_delay?: number;

    /**
     * This will wait until 'ScreenshotReady()' is called from Javascript to take the screenshot.
     */
    render_when_ready?: boolean;

    /**
     * Ensure the image is only ever rendered and saved one time.
     * This is an advanced option not applicable to most scenarios.
     */
    max_render_once?: boolean;

    /**
     * Twemoji is used to render emoji as a fallback for native emoji fonts.
     * This option will disable that behavior.
     */
    disable_twemoji?: boolean;
    /**
     * Set Chrome to render assuming the user has explicitly set their browser to Light or Dark mode.
     */
    color_scheme?: ColorSchemeType;

    /**
     * Sets the timezone for the browser instance. Use IANA timezone format (e.g. 'America/New_York').
     */
    timezone?: string;

    /**
     * Attempt to block cookie/consent banners from displaying.
     */
    block_consent_banners?: boolean;

    constructor(init?: Partial<BaseCreateRequestWithoutVariableOptions>) {
        Object.assign(this, init);
    }
}

export abstract class BasePDFOptions {
    /**
     * Whether the background graphics should be printed in the PDF output.
     */
    print_background?: boolean;
    /**
     * The scale factor to be applied when generating the PDF output (e.g., 1.0).
     */
    scale?: number;

    constructor(init?: Partial<BasePDFOptions>) {
        Object.assign(this, init);
    }
}

/**
 * Internal interface representing how PDFOptions looks over the wire.
 * All units are flattened to strings (e.g., "10in").
 * @internal
 */
export interface InternalPDFOptions extends BasePDFOptions {
    margins?: string[];
    page_height?: string;
    page_width?: string;
}

export interface InternalBaseCreateRequest extends BaseCreateRequestWithoutVariableOptions {
    pdf_options?: InternalPDFOptions;
}

export interface InternalCreateHtmlCssImageRequest extends InternalBaseCreateRequest {
    html: string;
    css?: string;
    google_fonts?: string;
}

export interface InternalCreateHtmlCssImageRequestWithOptionalHtml extends InternalBaseCreateRequest {
    html?: string;
    css?: string;
    google_fonts?: string;
}

export interface InternalCreateUrlImageRequest extends InternalBaseCreateRequest {
    url: string;
    full_screen?: boolean;
}

export interface InternalCreateUrlImageRequestWithOptionalUrl extends InternalBaseCreateRequest {
    url?: string;
    full_screen?: boolean;
}