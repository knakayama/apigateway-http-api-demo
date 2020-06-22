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
import { DeleteBookUseCase } from '@use-cases/delete-book-use-case'

export class DeleteBookController {
  constructor(private readonly _deleteBookUseCase: DeleteBookUseCase) {}

  deleteBook: ApiHandler = (
    event: ApiEvent,
    context: ApiContext,
    callback: ApiCallback
  ): void => {
    const bookId = event.pathParameters?.book_id

    if (!bookId) {
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

    this._deleteBookUseCase
      .deleteBook(bookId)
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
