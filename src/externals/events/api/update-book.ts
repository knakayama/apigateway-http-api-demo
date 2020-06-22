import { UpdateBookController } from '@controllers/update-book-controller'
import { BookDatabaseDriver } from '@externals/drivers/database/book'
import { UpdateBookUseCase } from '@use-cases/update-book-use-case'

const bookDatabaseDriver = new BookDatabaseDriver()
const updateBookUseCase = new UpdateBookUseCase(bookDatabaseDriver)
const updateBookController = new UpdateBookController(updateBookUseCase)

export const updateBook = updateBookController.updateBook
