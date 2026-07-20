export type ColorSchemeType = 'light' | 'dark';
export type PdfUnit = 'px' | 'in' | 'cm' | 'mm';
export type MediaType = 'print' | 'screen';

export interface PdfValueWithUnits {
    value: number;
    unit: PdfUnit;
}

export type PdfValueInput = number | PdfValueWithUnits;


/**
 * Represents the margins of a PDF document.
 *
 * This interface defines the margin values for a PDF, allowing
 * customization of the top, right, bottom, and left spacing in the document.
 * Each margin value is expected to be provided using the `PdfValueInput` type.
 */
export interface PdfMargins {
    top: PdfValueInput;
    right: PdfValueInput;
    bottom: PdfValueInput;
    left: PdfValueInput;
}

export class PDFOptions {
    /**
     * Whether background graphics should be printed in the PDF output.
     */
    print_background?: boolean;

    /**
     * The scale factor applied when generating the PDF output.
     */
    scale?: number;

    /**
     * Gets or sets the margins to be applied to the PDF output.
     * Specifies the top, right, bottom, and left margins.
     */
    margins?: PdfMargins;

    /**
     * The height of the PDF page (e.g., 8.5, '11in', '297mm').
     */
    page_height?: PdfValueInput;

    /**
     * The width of the PDF page (e.g., 11, '8.5in', '210mm').
     */
    page_width?: PdfValueInput;

    constructor(init?: Partial<PDFOptions>) {
        Object.assign(this, init);
    }


}


export abstract class BaseCreateImageRequest {
    /**
     * A CSS selector to target a specific element on the page.
     * The API will crop the image to the dimensions of this element.
     */
    selector?: string;

    /**
     * Adjusts the pixel ratio for the screenshot.
     * The default is 2, which is equivalent to a 4K monitor.
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
     */
    max_wait_ms?: number;

    /**
     * Adds extra time before taking the screenshot, such as when waiting for JavaScript to execute.
     */
    ms_delay?: number;

    /**
     * Wait until ScreenshotReady() is called from JavaScript before taking the screenshot.
     */
    render_when_ready?: boolean;

    /**
     * Ensure the image is only ever rendered and saved one time.
     */
    max_render_once?: boolean;

    /**
     * Disable Twemoji fallback rendering.
     */
    disable_twemoji?: boolean;

    /**
     * Render as if the user has selected light or dark mode.
     */
    color_scheme?: ColorSchemeType;

    /**
     * Set the browser timezone using an IANA timezone name.
     */
    timezone?: string;

    /**
     * Render as if the viewport is a mobile device.
     */
    viewport_mobile?: boolean;

    /**
     * Enable touch interactions within the viewport.
     */
    viewport_touch?: boolean;

    /**
     * Render the viewport in landscape orientation.
     */
    viewport_landscape?: boolean;

    /**
     * Set the rendering media type.
     */
    media_type?: MediaType;

    /**
     * Select an organization proxy for rendering.
     */
    proxy_id?: string;

    /**
     * Set the maximum width in jumbo mode. jumbo_max_height must also be defined.
     */
    jumbo_max_width?: number;

    /**
     * Set the maximum height in jumbo mode. jumbo_max_width must also be defined.
     */
    jumbo_max_height?: number;

    /**
     * Render the image with a transparent background.
     */
    transparent_background?: boolean;

    /**
     * Options for generating a PDF from the HTML/CSS or Url.
     */
    pdf_options?: PDFOptions;

    protected constructor(init?: Partial<BaseCreateImageRequest>) {
        Object.assign(this, init);
    }
}


export class CreateHtmlCssImageRequest extends BaseCreateImageRequest {
    readonly __type = 'html_css' as const;
    /**
     * Represents an HTML string value that should contain raw HTML content.
     */
    html!: string;
    /**
     * A variable representing optional CSS styles.
     * This can be used to define custom styling rules that are applied to a component or element.
     * The value should be a valid CSS string or undefined.
     */
    css?: string;
    /**
     * An optional array of strings representing the names of Google Fonts to be used in the application.
     *
     * This variable allows specifying one or more Google Fonts that can be dynamically loaded for styling purposes.
     * Each entry in the array should be the name of a valid font available from Google Fonts.
     *
     * If undefined or empty, no Google Fonts will be loaded.
     */
    google_fonts?: string[];

    constructor(init?: Partial<CreateHtmlCssImageRequest>) {
        super();
        Object.assign(this, init);
    }
}

export class CreateUrlImageRequest extends BaseCreateImageRequest {
    readonly __type = 'url' as const;
    /**
     * Represents a web address or resource location.
     * This variable is expected to contain a valid URL string.
     */
    url!: string;

    /**
     * Custom CSS rules to inject into the target webpage before rendering.
     * Use this to override existing styles or customize specific elements.
     */
    css?: string;

    /**
     * Indicates whether the screenshot should capture the entire webpage in full height.
     *
     * When set to true, this property ensures that the screenshot includes the full vertical content of the webpage,
     * scrolling beyond the visible portion of the viewport if necessary. If set to false or null, only the visible
     * portion of the webpage within the configured viewport dimensions will be captured.
     */
    full_screen?: boolean;

    /**
     * Attempt to block cookie/consent banners from displaying.
     */
    block_consent_banners?: boolean;

    constructor(init?: Partial<CreateUrlImageRequest>) {
        super();
        Object.assign(this, init);
    }
}

export class CreateTemplatedImageRequest<T = Record<string, any>> {
    readonly __type = 'templated' as const;
    /**
     * Identifies the specific template to be used.
     */
    template_id!: string;

    /**
     * The optional version of the template to be used. If not provided, the most recent version is used.
     */
    template_version?: number;

    /**
     * Dynamic data to be injected into the template.
     */
    template_values!: T;

    constructor(init?: Partial<CreateTemplatedImageRequest<T>>) {
        Object.assign(this, init);
    }
}
