import { ErrorCodes } from '@presenters/error-codes'
import { InternalServerErrorResult, NotFoundResult } from '@presenters/errors'
import { BookDatabaseDriver } from '@externals/drivers/database/book'
import { BasicBook } from '@externals/drivers/database/book-interfaces'

export class UpdateBookUseCase {
  constructor(private readonly _bookDatabaseDriver: BookDatabaseDriver) {}

  async updateBook(basicBook: BasicBook): Promise<void> {
    try {
      if (!(await this._bookDatabaseDriver.bookExists(basicBook.book_id))) {
        return Promise.reject(
          new NotFoundResult(
            ErrorCodes.NotFound,
            `The book does not exist: ${basicBook.book_id}`
          )
        )
      }
      await this._bookDatabaseDriver.updateBook(basicBook)
    } catch (error) {
      throw new InternalServerErrorResult(
        ErrorCodes.InternalServerError,
        error.message
      )
    }
  }
}
