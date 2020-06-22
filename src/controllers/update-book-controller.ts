import { BookValidator } from '@controllers/book-validator'
import { ErrorCodes } from '@presenters/error-codes'
import { ErrorResult, NotFoundResult } from '@presenters/errors'
import {
  ApiCallback,
  ApiContext,
  ApiEvent,
  ApiHandler,
} from '@presenters/interfaces'
import { ResponseBuilder } from '@presenters/response-builder'
import { BookTitle } from '@externals/drivers/database/book-interfaces'
import { UpdateBookUseCase } from '@use-cases/update-book-use-case'

export class UpdateBookController {
  constructor(private readonly _updateBookUseCase: UpdateBookUseCase) {}

  updateBook: ApiHandler = (
    event: ApiEvent,
    context: ApiContext,
    callback: ApiCallback
  ): void => {
    const bookId = event.pathParameters?.book_id

    if (!event.body) {
      return ResponseBuilder.badRequest(
        ErrorCodes.BadRequest,
        'Please specify a request body!',
        callback
      )
    }

    const requestBody: BookTitle = JSON.parse(event.body) as BookTitle

    if (!bookId || !requestBody.book_title) {
      return ResponseBuilder.badRequest(
        ErrorCodes.BadRequest,
        'Please specify a valid request body!',
        callback
      )
    }

    if (!BookValidator.isValidBookId(bookId)) {
      ResponseBuilder.badRequest(
        ErrorCodes.BadRequest,
        'Please specify a valid book id!',
        callback
      )
    }

    if (!BookValidator.isValidBookTitle(requestBody.book_title)) {
      ResponseBuilder.badRequest(
        ErrorCodes.BadRequest,
        'Please specify a valid book title!',
        callback
      )
    }

    this._updateBookUseCase
      .updateBook({ book_id: bookId, ...requestBody })
      .then(() => ResponseBuilder.noContent(callback))
      .catch((error: ErrorResult) => {
        if (error instanceof NotFoundResult) {
          ResponseBuilder.notFound(error.code, error.description, callback)
        }

        ResponseBuilder.internalServerError(
          error.code,
          error.description,
          callback
        )
      })
  }
}
