import { CreateBookController } from '@controllers/create-book-controller'
import { CreateBookUseCase } from '@use-cases/create-book-use-case'
import { BookDatabaseDriver } from '@externals/drivers/database/book'

const bookDatabaseDriver = new BookDatabaseDriver()
const createBookUseCase = new CreateBookUseCase(bookDatabaseDriver)
const createBookController = new CreateBookController(createBookUseCase)

export const createBook = createBookController.createBook
