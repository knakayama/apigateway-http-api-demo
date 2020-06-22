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
import { DetailBookUseCase } from '@use-cases/detail-book-use-case'
import { BasicBookWithDate } from '@externals/drivers/database/book-interfaces'
import { BasicBookResponse } from '@controllers/book-interfaces'

export class DetailBookController {
  constructor(private readonly _detailBookUseCase: DetailBookUseCase) {}

  detailBook: ApiHandler = (
    event: ApiEvent,
    context: ApiContext,
    callback: ApiCallback
  ): void => {
    const bookId = event.pathParameters?.book_id

    if (!bookId) {
      return ResponseBuilder.badRequest(
        ErrorCodes.BadRequest,
        'Please specify a path parameter!',
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

    this._detailBookUseCase
      .detailBook(bookId)
      .then((book: BasicBookWithDate) => {
        const response: BasicBookResponse = {
          book,
        }
        console.log(response)
        ResponseBuilder.ok<BasicBookResponse>(response, callback)
      })
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
