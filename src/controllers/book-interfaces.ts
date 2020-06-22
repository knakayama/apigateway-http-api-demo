import { BasicBookWithDate } from '@externals/drivers/database/book-interfaces'

export interface BasicBooksResponse {
  books: BasicBookWithDate[]
  book_total: number
}

export interface BasicBookResponse {
  book: BasicBookWithDate
}
