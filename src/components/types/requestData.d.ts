/**
 * General-use type used to set constraints on request body formats
 */
interface CustomRequest<T> {
    body: T;
}

/**
 * Type used for all requests POSTing SMS data
 */
interface SMSRequest {
    userPhone: string;
    message: string;
}