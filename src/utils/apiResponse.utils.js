class ApiResponse {
    constructor(statusCode, data = null, message = "success", meta = null, errors = null) {
        this.data = data;
        this.statusCode = statusCode;
        this.message = message;
        this.success = statusCode < 400;
        this.meta = meta;
        this.errors = errors;
    }
}

export { ApiResponse }