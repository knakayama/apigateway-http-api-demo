import { BookValidator } from '@controllers/book-validator'
import { ErrorCodes } from '@presenters/error-codes'
import { ErrorResult } from '@presenters/errors'
import {
  ApiCallback,
  ApiContext,
  ApiEvent,
  ApiHandler,
} from '@presenters/interfaces'
import { ResponseBuilder } from '@presenters/response-builder'
import { CreateBookUseCase } from '@use-cases/create-book-use-case'
import { BookTitle } from '@externals/drivers/database/book-interfaces'

export class CreateBookController {
  constructor(private readonly _createBookUseCase: CreateBookUseCase) {}

  createBook: ApiHandler = (
    event: ApiEvent,
    context: ApiContext,
    callback: ApiCallback
  ): void => {
    if (!event.body) {
      return ResponseBuilder.badRequest(
        ErrorCodes.BadRequest,
        'Please specify a request body!',
        callback
      )
    }

    const requestBody: BookTitle = JSON.parse(event.body) as BookTitle

    console.log(requestBody)
    if (!requestBody.book_title) {
      ResponseBuilder.badRequest(
        ErrorCodes.BadRequest,
        'Please specify a valid request body!',
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

    this._createBookUseCase
      .createBook(requestBody)
      .then(() => {
        ResponseBuilder.noContent(callback)
      })
      .catch((error: ErrorResult) => {
        ResponseBuilder.internalServerError(
          error.code,
          error.description,
          callback
        )
      })
  }
}
