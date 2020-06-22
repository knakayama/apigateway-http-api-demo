import { ListBooksController } from '@controllers/list-books-controller'
import { BookDatabaseDriver } from '@externals/drivers/database/book'
import { ListBooksUseCase } from '@use-cases/list-books-use-case'

const bookDatabaseDriver = new BookDatabaseDriver()
const listBooksUseCase = new ListBooksUseCase(bookDatabaseDriver)
const listBooksController = new ListBooksController(listBooksUseCase)

export const listBooks = listBooksController.listBooks
