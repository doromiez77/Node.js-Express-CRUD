class ErrorResponse {
  errorCode: number;
  errorMessage: string;
  details: string;

  constructor(errorCode: number, errorMessage: string, details?: unknown) {
    this.errorCode = errorCode;
    this.errorMessage = errorMessage;
    this.details = (details as string) || '';
  }
}

export default ErrorResponse;
