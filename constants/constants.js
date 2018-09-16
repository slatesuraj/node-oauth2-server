exports.constants = {
  log: {

  },
  error: {
    ERROR_SAVING_UPDATING_TOKEN: 'Error during saving/updating token :: '
  },
  response: {
    INVALID_REQUEST: 'invalid_request',
    METHOD_MUST_BE_POST: 'Method must be POST with application/x-www-form-urlencoded encoding',
    INVALID_MISSING_GRANT: 'Invalid or missing grant_type parameter',
    INVALID_CLIENT: 'invalid_client',
    MISSING_INVALID_CLIENT_ID: 'Invalid or missing client_id parameter',
    MISSING_CLIENT_SECRET: 'Missing client_secret parameter',
    INVALID_CLIENT_CREDS: 'Client credentials are invalid',
    NO_CODE_PARAMETER: 'No "code" parameter',
    INVALID_CODE: 'Invalid code',
    SERVER_ERROR: 'server_error',
    CODE_EXPIRED: 'Code has expired',
    USER_NOT_RETURNED_FROM_GETAUTHCODE: 'No user/userId parameter returned from getauthCode',
    MISSING_PARAM_EMAIL_PASS: 'Missing parameters. "email" and "password" are required',
    INVALID_USER_CREDS: 'User credentials are invalid',
    NO_REFRESH_TOKEN_PARAM: 'No "refresh_token" parameter',
    INVALID_REFRESH_TOKEN: 'Invalid refresh token',
    REFRESH_TOKEN_EXPIRED: 'Refresh token has expired',
    INVALID_GRANT: 'invalid_grant',
    USER_PARAM_NOT_RETURNED_GETREFRESHTOKEN: 'No user/userId parameter returned from getRefreshToken',
    CLIENT_ID_SECRET_REQUIRED: 'Missing parameters. "client_id" and "client_secret" are required',
    GRANT_NOT_AUTHORIZED_CLIENT: 'The grant type is unauthorised for this client_id',
    TOKEN_EXPIRED: 'Token Expired',
    INVALID_TOKEN: 'Invalid Token',
    TOKEN_NOT_FOUND: 'Token not found',
    SUCCESS_DELETE_TOKEN: 'Successfully deleted token',
    UNABLE_TO_SAVE_TOKEN: 'Unable to save token',
    INVALID_ACCESS_TOKEN: 'The access token provided is invalid.',
    ACCESS_TOKEN_EXPIRED: 'The access token provided has expired.',

    UNABLE_TO_PARSE_TOKEN: 'Unable to parse token. Error occured as ::',
    PARSING_TOKEN_ERROR: 'Token Error. Unable to parse.',
    USER_AUTHORISED: 'User Authorised',
    USER_NOT_AUTHORISED: 'User Not Authorised',
    ACCESS_GRANTED: 'Access Granted',

    USER_CREATED: 'Successfully Created User and email sent',
    USER_LOGOUT: 'User Logged out successfully',

    PAGE_EXPIRED: 'Page expired',
    EMAIL_VERIFIED: 'Successfully verified email'
  },
  keys: {
    AUTHORIZATION_CODE: 'authorization_code',
    PASSWORD: 'password',
    CLIENT_CREDENTIALS: 'client_credentials',
    REFRESH_TOKEN_GRANT: 'refresh_token',
    REFRESH_TOKEN: 'refreshToken',
    ACCESS_TOKEN: 'accessToken',
    TOKEN_TYPE_BEARER: 'bearer',
    TOKEN: 'token',
    OAUTH_TOKEN_ALGO: 'aes-256-cbc',
    OAUTH_TOKEN_ALGO_SECRET_KEY: 'mysecretcode',
    SUCCESS: 'Success'

  },
  values: {
    EMAIL_TOKEN_LIFE: 600000, // in ms
    ACCESS_TOKEN_LIFE: 1800, // in sec
    GRANTS: ['password', 'refresh_token'],
    CRYPTO_DELIMITER: ',',
    // API response code for email verification
    SUCCESS_CODE: 100,
    TOKEN_EXPIRED_CODE: 101,
    INVALID_TOKEN_CODE: 102,
    INVALID_REQUEST_CODE: 103,
    UNABLE_TO_SAVE_TOKEN_CODE: 104,
    NOT_AUTHORISED: 105,
    UNABLE_TO_PARSE_TOKEN: 106,
    MAIL_SUBJECT: 'oAuth2 Registration Verification',
    VERIFY_TOKEN_URL: 'http://localhost:3000/user/validate/'
  }
}
