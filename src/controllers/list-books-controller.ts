import { BasicBooksResponse } from '@controllers/book-interfaces'
import { ErrorResult } from '@presenters/errors'
import {
  ApiCallback,
  ApiContext,
  ApiEvent,
  ApiHandler,
} from '@presenters/interfaces'
import { ResponseBuilder } from '@presenters/response-builder'
import { ListBooksUseCase } from '@use-cases/list-books-use-case'

export class ListBooksController {
  constructor(private readonly _listBooksUseCase: ListBooksUseCase) {}

  listBooks: ApiHandler = (
    event: ApiEvent,
    context: ApiContext,
    callback: ApiCallback
  ): void => {
    this._listBooksUseCase
      .listBooks()
      .then(({ bookTotal, books }) => {
        const response: BasicBooksResponse = {
          book_total: bookTotal,
          books,
        }
        ResponseBuilder.ok<BasicBooksResponse>(response, callback)
      })
      .catch((error: ErrorResult) =>
        ResponseBuilder.internalServerError(
          error.code,
          error.description,
          callback
        )
      )
  }
}
