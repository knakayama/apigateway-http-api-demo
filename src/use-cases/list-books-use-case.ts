import { BasicBookWithDate } from '@externals/drivers/database/book-interfaces'
import { BookDatabaseDriver } from '@externals/drivers/database/book'
import { ErrorCodes } from '@presenters/error-codes'
import { InternalServerErrorResult } from '@presenters/errors'

export class ListBooksUseCase {
  constructor(private readonly _bookDatabaseDriver: BookDatabaseDriver) {}

  async listBooks(): Promise<{
    bookTotal: number
    books: BasicBookWithDate[]
  }> {
    let basicBooks: BasicBookWithDate[]

    try {
      basicBooks = await this._bookDatabaseDriver.findBooks()
    } catch (error) {
      throw new InternalServerErrorResult(
        ErrorCodes.InternalServerError,
        error.message
      )
    }

    console.log(basicBooks)

    const bookTotal = basicBooks.length

    return {
      bookTotal,
      books: bookTotal ? basicBooks : [],
    }
  }
}
