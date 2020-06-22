import {
  ApiContext,
  ApiEvent,
  ApiHandler,
  ApiResponse,
  ErrorResponseBody,
} from '@presenters/interfaces'
import {
  ApiErrorResponseParsed,
  ApiResponseParsed,
  PathParameter,
  Headers,
} from '@test/utils/interfaces'
import {
  BasicBook,
  BookTitle,
} from '@externals/drivers/database/book-interfaces'

type SuccessCallerForParameter = <T>(
  handler: ApiHandler,
  parameters: PathParameter,
  headers?: Headers
) => Promise<ApiResponseParsed<T>>

type SuccessCallerForRequestBody = <T>(
  handler: ApiHandler,
  requestBody: BasicBook | BookTitle
) => Promise<ApiResponseParsed<T>>

type FailureCallerForParameter = (
  handler: ApiHandler,
  parameters: PathParameter,
  headers?: Headers
) => Promise<ApiErrorResponseParsed>

type SuccessCaller = <T>(handler: ApiHandler) => Promise<ApiResponseParsed<T>>

type FailureCallerForRequestBody = (
  handler: ApiHandler,
  requestBody: BasicBook | BookTitle
) => Promise<ApiErrorResponseParsed>

type FailureCallerForRequestBodyAndParameter = (
  handler: ApiHandler,
  requestBody: BasicBook | BookTitle,
  parameters: PathParameter
) => Promise<ApiErrorResponseParsed>

type FailureCaller = (handler: ApiHandler) => Promise<ApiErrorResponseParsed>

type SuccessCallerForRequestBodyAndParameter = <T>(
  handler: ApiHandler,
  requestBody: BasicBook | BookTitle,
  parameters: PathParameter
) => Promise<ApiResponseParsed<T>>

function invokeHandlerForFailure(
  event: ApiEvent,
  handler: ApiHandler
): Promise<ApiErrorResponseParsed> {
  return new Promise((resolve, reject) => {
    handler(
      event,
      {} as ApiContext,
      (error?: Error | null | string, result?: ApiResponse): void => {
        if (typeof result === 'undefined') {
          reject('No result was returned by the handler!')
          return
        }
        const parsedResult: ApiErrorResponseParsed = result as ApiErrorResponseParsed
        parsedResult.parsedBody = JSON.parse(result.body) as ErrorResponseBody
        resolve(parsedResult)
      }
    )
  })
}

function invokeHandlerForSuccess<T>(
  event: ApiEvent,
  handler: ApiHandler
): Promise<ApiResponseParsed<T>> {
  return new Promise((resolve, reject) => {
    handler(
      event,
      {} as ApiContext,
      (error?: Error | null | string, result?: ApiResponse): void => {
        if (typeof result === 'undefined') {
          reject('No result was returned by the handler!')
          return
        }
        const parsedResult: ApiResponseParsed<T> = result as ApiResponseParsed<
          T
        >
        parsedResult.parsedBody = JSON.parse(result.body) as T

        resolve(parsedResult)
      }
    )
  })
}

export const callSuccessForParameter: SuccessCallerForParameter = <T>(
  handler: ApiHandler,
  parameters: PathParameter,
  headers?: Headers
): Promise<ApiResponseParsed<T>> => {
  const event: ApiEvent = {} as ApiEvent
  event.pathParameters = parameters

  if (headers) {
    event.headers = headers
  }
  return invokeHandlerForSuccess(event, handler)
}

export const callSuccessForRequestBody: SuccessCallerForRequestBody = <T>(
  handler: ApiHandler,
  requestBody: BasicBook | BookTitle
): Promise<ApiResponseParsed<T>> => {
  const event: ApiEvent = {} as ApiEvent
  event.body = JSON.stringify(requestBody)

  return invokeHandlerForSuccess<T>(event, handler)
}

export const callSuccessForRequestBodyAndParameter: SuccessCallerForRequestBodyAndParameter = <
  T
>(
  handler: ApiHandler,
  requestBody: BasicBook | BookTitle,
  parameters: PathParameter
): Promise<ApiResponseParsed<T>> => {
  const event: ApiEvent = {} as ApiEvent
  event.body = JSON.stringify(requestBody)
  event.pathParameters = parameters

  return invokeHandlerForSuccess<T>(event, handler)
}

export const callSuccess: SuccessCaller = <T>(
  handler: ApiHandler
): Promise<ApiResponseParsed<T>> => {
  const event: ApiEvent = {} as ApiEvent

  return invokeHandlerForSuccess<T>(event, handler)
}

export const callFailureForParameter: FailureCallerForParameter = (
  handler: ApiHandler,
  parameters: PathParameter,
  headers?: Headers
): Promise<ApiErrorResponseParsed> => {
  const event: ApiEvent = {} as ApiEvent
  event.pathParameters = parameters

  if (headers) {
    event.headers = headers
  }

  return invokeHandlerForFailure(event, handler)
}

export const callFailureForRequestBodyAndParameter: FailureCallerForRequestBodyAndParameter = (
  handler: ApiHandler,
  requestBody: BasicBook | BookTitle,
  parameters: PathParameter
): Promise<ApiErrorResponseParsed> => {
  const event: ApiEvent = {} as ApiEvent
  event.body = JSON.stringify(requestBody)
  event.pathParameters = parameters

  return invokeHandlerForFailure(event, handler)
}

export const callFailureForRequestBody: FailureCallerForRequestBody = (
  handler: ApiHandler,
  requestBody?: BasicBook | BookTitle
): Promise<ApiErrorResponseParsed> => {
  const event: ApiEvent = {} as ApiEvent
  event.body = JSON.stringify(requestBody)

  return invokeHandlerForFailure(event, handler)
}

export const callFailure: FailureCaller = (
  handler: ApiHandler
): Promise<ApiErrorResponseParsed> => {
  const event: ApiEvent = {} as ApiEvent

  return invokeHandlerForFailure(event, handler)
}
