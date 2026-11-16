/** Recording media format. Recordings do not include audio. */
export type RecordingFormat = 'mp4' | 'webm' | 'gif';

/**
 * How the requested duration controls the recording timeline:
 * - fixed pads or cuts off at the requested duration.
 * - target adjusts playback speed to fit the completed timeline.
 * - at_least records for at least the requested duration, letting actions finish up to 90 seconds.
 * - at_most stops when actions finish or the requested duration is reached (default).
 * @see https://docs.htmlcsstoimage.com/parameters/duration_mode/
 */
export type RecordingDurationMode = 'fixed' | 'target' | 'at_least' | 'at_most';

/** Recording lifecycle states recognized by this client. ready, failed, and cancelled are terminal. */
export const knownRecordingStatuses = ['processing', 'pending_retry', 'ready', 'failed', 'cancelled', 'awaiting_render'] as const;

/**
 * Current recording lifecycle state. ready, failed, and cancelled are terminal.
 * unknown is an unrecognized status from a newer API version.
 * @see https://docs.htmlcsstoimage.com/management-api/recordings/
 */
export type RecordingStatus = typeof knownRecordingStatuses[number] | 'unknown';

/** Edge of the document or selected scroll container. */
export type ScrollPosition = 'top' | 'bottom' | 'left' | 'right';

export type RecordingMouseButton = 'left' | 'right' | 'middle' | 'back' | 'forward';

/** Easing curve for a scroll movement. */
export type ScrollEasing =
    | 'linear'
    | 'ease_in_cubic' | 'ease_out_cubic' | 'ease_in_out_cubic'
    | 'ease_in_quad' | 'ease_out_quad' | 'ease_in_out_quad'
    | 'ease_in_quart' | 'ease_out_quart' | 'ease_in_out_quart'
    | 'ease_in_quint' | 'ease_out_quint' | 'ease_in_out_quint'
    | 'ease_in_sine' | 'ease_out_sine' | 'ease_in_out_sine'
    | 'ease_in_expo' | 'ease_out_expo' | 'ease_in_out_expo'
    | 'ease_in_circ' | 'ease_out_circ' | 'ease_in_out_circ'
    | 'ease_in_back' | 'ease_out_back' | 'ease_in_out_back'
    | 'ease_in_elastic' | 'ease_out_elastic' | 'ease_in_out_elastic'
    | 'ease_in_bounce' | 'ease_out_bounce' | 'ease_in_out_bounce';

/**
 * Format, frame rate, and output size. The browser viewport is configured separately.
 * @see https://docs.htmlcsstoimage.com/parameters/output/
 */
export interface RecordingOutputOptions {
    /** Media format. Defaults to mp4. */
    format?: RecordingFormat | null;
    /** Frames per second. Defaults to 15 for GIF and 30 for video. GIF supports 10–50; video supports 10–120. */
    fps?: number | null;
    /** Scales captured pixels without changing page layout. Defaults to 1; 0.5 halves both dimensions. */
    scale?: number | null;
}

/** Start recording immediately after page preparation. This is the default trigger. */
export interface RecordingImmediateTrigger {
    type: 'immediate';
}

/** Wait for a matching element to become visible before recording. A timeout fails the recording. */
export interface RecordingElementVisibleTrigger {
    type: 'element_visible';
    /** CSS selector for the element to wait for. */
    selector: string;
    /** Maximum wait in milliseconds. Defaults to 1000; minimum 100. Plan limits apply. */
    timeout_ms?: number;
}

/** Wait for the page to call window.RecordingReady(). A timeout fails the recording. */
export interface RecordingFunctionCallTrigger {
    type: 'function_call';
    /** Maximum wait in milliseconds. Defaults to 1000; minimum 100. Plan limits apply. */
    timeout_ms?: number;
}

/**
 * When capture and timeline actions start, after page preparation.
 * @see https://docs.htmlcsstoimage.com/parameters/trigger/
 */
export type RecordingTrigger = RecordingImmediateTrigger | RecordingElementVisibleTrigger | RecordingFunctionCallTrigger;

/** Scroll down repeatedly until reaching the bottom or the recording deadline. */
export interface RecordingSimpleScrollAction {
    type: 'simple_scroll';
    /** Duration of each movement in milliseconds. Defaults to 800. */
    scroll_duration_ms?: number | null;
    /** Pause between movements in milliseconds. Defaults to 400; 0 scrolls continuously. */
    ms_between_scrolls?: number | null;
    /** CSS pixels as a number, or a string such as '900px' or '90vh'. Defaults to '90vh'. */
    scroll_distance?: number | string | null;
    /** Movement easing. Defaults to ease_in_out_expo. */
    easing?: ScrollEasing | null;
    /** Time to hold at the bottom in milliseconds, limited by remaining recording time. Defaults to 0. */
    stall_at_end_ms?: number | null;
}

/** Scroll through an ordered sequence of timed movements. */
export interface RecordingScrollAction {
    type: 'scroll';
    /** Scrollable container's CSS selector. Omit or use null to scroll the document. */
    container_selector?: string | null;
    /** Ordered movements. Supply at least one step. */
    steps: ScrollStep[];
    /** Fallback when the container is missing. Omitted, null, or empty skips this action. */
    if_not_found?: RecordingAction[] | null;
}

/** Wait while capture and page activity continue. */
export interface RecordingStallAction {
    type: 'stall';
    /** Wait in milliseconds. The recording deadline can end it early. */
    duration_ms?: number;
}

/** Find an element and run the corresponding branch. Each branch action supplies its own selector. */
export interface RecordingLocateSelectorAction {
    type: 'locate_selector';
    /** CSS selector to find. */
    selector: string;
    /** Maximum wait in milliseconds. Defaults to 0 for a single check. */
    timeout_ms?: number;
    /** Actions when found. Omitted, null, or empty continues with the parent sequence. */
    if_found?: RecordingAction[] | null;
    /** Actions when missing. Include an error action to fail the recording. */
    if_not_found?: RecordingAction[] | null;
}

/** Find and click an element, scrolling it into view if needed. */
export interface RecordingClickAction {
    type: 'click';
    /** CSS selector of the element to click. */
    selector: string;
    /** Maximum wait in milliseconds. Defaults to 0 for a single check. */
    timeout_ms?: number;
    /** Fallback when missing. Omitted, null, or empty continues; use an error action to fail. */
    if_not_found?: RecordingAction[] | null;
    /** Mouse button. Defaults to left. */
    button?: RecordingMouseButton | null;
    /** Event click count, from 1 to 3. Defaults to 1; this does not repeat the action. */
    count?: number | null;
    /** Delay between mouse down and up, in milliseconds. Defaults to 0; maximum 5000. */
    delay_ms?: number | null;
    /** CSS pixels from the element's top-left. Supplying either offset makes the other default to 0. */
    offset_x?: number | null;
    /** CSS pixels from the element's top-left. Omit both offsets to use the default clickable point. */
    offset_y?: number | null;
}

/** Run an async JavaScript function body in the page while recording. */
export interface RecordingExecuteJavaScriptAction {
    type: 'execute_javascript';
    /** Function body supporting await. Its return value is ignored. */
    script: string;
    /** Maximum execution time in milliseconds. Zero or omitted uses the page timeout; maximum 90000. */
    timeout_ms?: number;
    /** Omitted or null fails on script errors; [] ignores errors. A timeout does not undo side effects. */
    if_error?: RecordingAction[] | null;
}

/** Fail the recording. This must be the last action in its array. */
export interface RecordingErrorAction {
    type: 'error';
}

/**
 * Ordered timeline interactions. Nested branches return to their parent sequence on completion.
 * @see https://docs.htmlcsstoimage.com/parameters/actions/
 */
export type RecordingAction =
    | RecordingSimpleScrollAction
    | RecordingScrollAction
    | RecordingStallAction
    | RecordingLocateSelectorAction
    | RecordingClickAction
    | RecordingExecuteJavaScriptAction
    | RecordingErrorAction;

/** Scroll to an edge of the document or selected container. */
export interface PositionScrollTarget {
    type: 'position';
    /** Edge to scroll to. Defaults to top. */
    position?: ScrollPosition;
}

/** Scroll to absolute CSS pixel coordinates within the document or selected container. */
export interface CoordinatesScrollTarget {
    type: 'coordinates';
    /** Horizontal position. Defaults to 0. */
    x?: number;
    /** Vertical position. Defaults to 0. */
    y?: number;
}

/** Scroll to a matching element with optional offsets in CSS pixels. */
export interface SelectorScrollTarget {
    type: 'selector';
    selector: string;
    /** Horizontal offset from the element. Defaults to 0. */
    offset_x?: number;
    /** Vertical offset from the element. Defaults to 0. */
    offset_y?: number;
    /** Fallback when missing. Omitted, null, or empty skips this movement and continues to the next step. */
    if_not_found?: RecordingAction[] | null;
}

/** Destination for a scroll step within the document or selected container. */
export type ScrollTarget = PositionScrollTarget | CoordinatesScrollTarget | SelectorScrollTarget;

/** One timed movement in a scroll action. */
export interface ScrollStep {
    to: ScrollTarget;
    /** Required movement duration in milliseconds, at least 1. The recording deadline can cut it short. */
    duration_ms: number;
    /** Movement easing. Defaults to linear. */
    easing?: ScrollEasing;
}

/** Error from a recording attempt. The lifecycle status determines whether processing will continue. */
export interface RecordingError {
    /** Machine-readable failure code. */
    code: string;
    /** Human-readable failure details. */
    message: string;
    /** UTC timestamp as an ISO 8601 string. */
    occurred_at: string;
    /** Whether this kind of failure is eligible for retry. Status and the retry budget still apply. */
    retryable: boolean;
    /** Failing action's path, such as 'actions[1].if_found[0]', or null when unrelated to an action. */
    action_path?: string | null;
}
