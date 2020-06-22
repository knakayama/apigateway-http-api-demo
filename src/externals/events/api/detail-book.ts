import { DetailBookController } from '@controllers/detail-book-controller'
import { BookDatabaseDriver } from '@externals/drivers/database/book'
import { DetailBookUseCase } from '@use-cases/detail-book-use-case'

const bookDatabaseDriver = new BookDatabaseDriver()
const detailBookUseCase = new DetailBookUseCase(bookDatabaseDriver)
const detailBookController = new DetailBookController(detailBookUseCase)

export const detailBook = detailBookController.detailBook
