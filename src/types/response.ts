import type {RecordingError, RecordingStatus} from "./recording.js";

export interface CreateImageSuccessResponse{
    success: true;
    id: string;
    url: string;
}

export interface ValidationError{
    path: string;
    message: string;
}

export interface CreateImageErrorResponse{
    success: false;
    error: string;
    validation_errors?: ValidationError[];
    message?: string;
}

export interface CreateImageBatchSuccessResponse{
    success: true;
    images: CreateImageSuccessResponse[];
}

export interface DeleteImageSuccessResponse {
    success: true;
}

export type CreateImageBatchResponse = CreateImageBatchSuccessResponse | CreateImageErrorResponse;

export type CreateImageResponse = CreateImageSuccessResponse | CreateImageErrorResponse;

export type DeleteImageResponse = DeleteImageSuccessResponse | CreateImageErrorResponse;

/** Metadata returned when a recording is created or deduplicated. */
export interface CreateRecordingSuccessResponse {
    success: true;
    id: string;
    /** Authenticated endpoint for fetching the current recording status. */
    status_url: string;
    /** Media URL, including the format extension. Embed or request it directly; it waits until the recording is ready. */
    recording_url: string;
}

/** Recording lifecycle information returned by both HTTP 200 and 202. */
export interface RecordingStatusSuccessResponse {
    success: true;
    id: string;
    recording_url: string;
    status: RecordingStatus;
    /** UTC timestamp as an ISO 8601 string. May change while status remains processing. */
    status_entered_at: string;
    /** Attempts started, including retries. */
    attempt_count: number;
    /** Duration of saved media in milliseconds, or null until measured. */
    stored_duration_ms?: number | null;
    /** When true, media is hosted only at the customer's storage destination. */
    storage_destination_hcti_storage_disabled?: boolean | null;
    /** Most recent attempt error. Check status to distinguish retrying from terminal failure. */
    error?: RecordingError | null;
}

export type CreateRecordingResponse = CreateRecordingSuccessResponse | CreateImageErrorResponse;
export type RecordingStatusResponse = RecordingStatusSuccessResponse | CreateImageErrorResponse;
export type DeleteRecordingResponse = DeleteImageResponse;
