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

export type CreateImageBatchResponse = CreateImageBatchSuccessResponse | CreateImageErrorResponse;

export type CreateImageResponse = CreateImageSuccessResponse | CreateImageErrorResponse;