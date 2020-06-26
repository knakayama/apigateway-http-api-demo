import {
  BadRequestResult,
  ErrorResult,
  ForbiddenResult,
  InternalServerErrorResult,
  NotFoundResult,
  UnauthorizedResult,
  ConflictResult,
} from '@presenters/errors'
import {
  ApiCallback,
  ApiResponse,
  ErrorResponseBody,
} from '@presenters/interfaces'
import { HttpStatusCodes } from '@presenters/status-codes'

export class ResponseBuilder {
  static accepted<T>(result: T, callback: ApiCallback): void {
    this._returnAs<T>(result, HttpStatusCodes.Accepted, callback)
  }

  static badRequest(
    code: string,
    description: string,
    callback: ApiCallback
  ): void {
    const errorResult = new BadRequestResult(code, description)
    this._returnAs<BadRequestResult>(
      errorResult,
      HttpStatusCodes.BadRequest,
      callback
    )
  }

  static unuthorized(
    code: string,
    description: string,
    callback: ApiCallback
  ): void {
    const errorResult = new BadRequestResult(code, description)
    this._returnAs<UnauthorizedResult>(
      errorResult,
      HttpStatusCodes.Unauthorized,
      callback
    )
  }

  static forbidden(
    code: string,
    description: string,
    callback: ApiCallback
  ): void {
    const errorResult = new ForbiddenResult(code, description)
    this._returnAs<ForbiddenResult>(
      errorResult,
      HttpStatusCodes.Forbidden,
      callback
    )
  }

  static internalServerError(
    code: string,
    description: string,
    callback: ApiCallback
  ): void {
    const errorResult = new InternalServerErrorResult(code, description)
    this._returnAs<InternalServerErrorResult>(
      errorResult,
      HttpStatusCodes.InternalServerError,
      callback
    )
  }

  static noContent(callback: ApiCallback): void {
    this._returnAs<unknown>({}, HttpStatusCodes.NoContent, callback)
  }

  static notFound(
    code: string,
    description: string,
    callback: ApiCallback
  ): void {
    const errorResult = new NotFoundResult(code, description)
    this._returnAs<NotFoundResult>(
      errorResult,
      HttpStatusCodes.NotFound,
      callback
    )
  }

  static conflict(
    code: string,
    description: string,
    callback: ApiCallback
  ): void {
    const errorResult = new ConflictResult(code, description)
    this._returnAs<ConflictResult>(
      errorResult,
      HttpStatusCodes.Conflict,
      callback
    )
  }

  static ok<T>(result: T, callback: ApiCallback): void {
    this._returnAs<T>(result, HttpStatusCodes.OK, callback)
  }

  private static _returnAs<T>(
    result: T,
    statusCode: number,
    callback: ApiCallback
  ): void {
    const bodyObject: ErrorResponseBody | T =
      result instanceof ErrorResult ? { error: result } : result
    const response: ApiResponse = {
      body: JSON.stringify(bodyObject),
      statusCode,
    }
    callback(undefined, response)
  }
}
