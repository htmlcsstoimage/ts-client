import {BaseCreateRequestWithoutVariableOptions, BasePDFOptions} from "./internals.js";

export type ColorSchemeType = 'light' | 'dark';
export type PdfUnit = 'px' | 'in' | 'cm' | 'mm';

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

export class PDFOptions extends BasePDFOptions {
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
        super();
        Object.assign(this, init);
    }


}


export abstract class BaseCreateImageRequest extends BaseCreateRequestWithoutVariableOptions {
    /**
     * Options for generating a PDF from the HTML/CSS or Url.
     */
    pdf_options?: PDFOptions;

    protected constructor(init?: Partial<BaseCreateImageRequest>) {
        super();
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