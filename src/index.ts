export {
    BaseCreateImageRequest,
    BaseCreateRecordingRequest,
    CreateHtmlCssRecordingRequest,
    CreateUrlRecordingRequest,
    CreateHtmlCssImageRequest,
    CreateTemplatedImageRequest,
    TemplatedBatchImageOptions,
    CreateUrlImageRequest,
    PDFOptions,
    RequestOverrideAction,
    RequestOverrideResourceType
} from './types/request.js';

export type {
    ColorSchemeType,
    MediaType,
    PdfMargins,
    PdfValueInput,
    PdfValueWithUnits,
    PdfUnit,
    RenderImageFormat,
    RequestOverride
} from './types/request.js';

export type {
    CreateRecordingResponse,
    CreateRecordingSuccessResponse,
    RecordingStatusResponse,
    RecordingStatusSuccessResponse,
    DeleteRecordingResponse,
    CreateImageBatchResponse,
    CreateImageBatchSuccessResponse,
    CreateImageErrorResponse,
    CreateImageResponse,
    CreateImageSuccessResponse,
    DeleteImageResponse,
    DeleteImageSuccessResponse,
    ValidationError
} from './types/response.js';
export { HtmlCssToImageClient } from './HtmlCssToImageClient.js';
export type { FetchFunction } from './HtmlCssToImageClient.js';
export type { IHtmlCssToImageClient } from './IHtmlCssToImageClient.js';

export type {
    RecordingFormat,
    RecordingDurationMode,
    RecordingStatus,
    RecordingMouseButton,
    RecordingOutputOptions,
    RecordingAudio,
    RecordingAssetAudio,
    RecordingUrlAudio,
    RecordingAudioEndBehavior,
    RecordingTrigger,
    RecordingImmediateTrigger,
    RecordingElementVisibleTrigger,
    RecordingFunctionCallTrigger,
    RecordingAction,
    RecordingSimpleScrollAction,
    RecordingScrollAction,
    RecordingStallAction,
    RecordingLocateSelectorAction,
    RecordingClickAction,
    RecordingExecuteJavaScriptAction,
    RecordingErrorAction,
    RecordingError,
    ScrollPosition,
    ScrollEasing,
    ScrollStep,
    ScrollTarget,
    PositionScrollTarget,
    CoordinatesScrollTarget,
    SelectorScrollTarget
} from './types/recording.js';
