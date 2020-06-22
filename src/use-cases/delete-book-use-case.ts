import { ErrorCodes } from '@presenters/error-codes'
import { InternalServerErrorResult, NotFoundResult } from '@presenters/errors'
import { BookDatabaseDriver } from '@externals/drivers/database/book'

export class DeleteBookUseCase {
  constructor(private readonly _bookDatabaseDriver: BookDatabaseDriver) {}

  async deleteBook(bookId: string): Promise<void> {
    try {
      if (!(await this._bookDatabaseDriver.bookExists(bookId))) {
        return Promise.reject(
          new NotFoundResult(
            ErrorCodes.NotFound,
            `The book does not exist: ${bookId}`
          )
        )
      }
      await this._bookDatabaseDriver.deleteBook(bookId)
    } catch (error) {
      throw new InternalServerErrorResult(
        ErrorCodes.InternalServerError,
        error.message
      )
    }
  }
}
