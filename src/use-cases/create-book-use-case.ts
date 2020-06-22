import { ErrorCodes } from '@presenters/error-codes'
import { InternalServerErrorResult } from '@presenters/errors'
import { BookTitle } from '@externals/drivers/database/book-interfaces'
import { BookDatabaseDriver } from '@externals/drivers/database/book'

export class CreateBookUseCase {
  constructor(private readonly _bookDatabaseDriver: BookDatabaseDriver) {}

  async createBook(basicBook: BookTitle): Promise<void> {
    try {
      await this._bookDatabaseDriver.createBook(basicBook)
    } catch (error) {
      throw new InternalServerErrorResult(
        ErrorCodes.InternalServerError,
        error.message
      )
    }
  }
}
