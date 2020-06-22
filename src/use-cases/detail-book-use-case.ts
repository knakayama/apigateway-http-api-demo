import { ErrorCodes } from '@presenters/error-codes'
import { InternalServerErrorResult, NotFoundResult } from '@presenters/errors'
import { BookDatabaseDriver } from '@externals/drivers/database/book'
import { BasicBookWithDate } from '@externals/drivers/database/book-interfaces'

export class DetailBookUseCase {
  constructor(private readonly _bookDatabaseDriver: BookDatabaseDriver) {}

  async detailBook(bookId: string): Promise<BasicBookWithDate> {
    try {
      if (!(await this._bookDatabaseDriver.bookExists(bookId))) {
        return Promise.reject(
          new NotFoundResult(
            ErrorCodes.NotFound,
            `The book does not exist: ${bookId}`
          )
        )
      }
      return this._bookDatabaseDriver.detailBook(bookId)
    } catch (error) {
      throw new InternalServerErrorResult(
        ErrorCodes.InternalServerError,
        error.message
      )
    }
  }
}
