import { DeleteBookController } from '@controllers/delete-book-controller'
import { BookDatabaseDriver } from '@externals/drivers/database/book'
import { DeleteBookUseCase } from '@use-cases/delete-book-use-case'

const bookDatabaseDriver = new BookDatabaseDriver()
const deleteBookUseCase = new DeleteBookUseCase(bookDatabaseDriver)
const deleteBookController = new DeleteBookController(deleteBookUseCase)

export const deleteBook = deleteBookController.deleteBook
