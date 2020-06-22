import { BookDatabaseDriver } from '@externals/drivers/database/book'
import { ErrorCodes } from '@presenters/error-codes'
import { InternalServerErrorResult, NotFoundResult } from '@presenters/errors'
import { BookTableUtils } from '@test/utils/book-table-utils'
import { UpdateBookUseCase } from '@use-cases/update-book-use-case'
import { Chance } from 'chance'

const chance = new Chance()

describe('UpdateBookUseCase', () => {
  const bookDatabaseDriver = new BookDatabaseDriver()
  const updateBookUseCase = new UpdateBookUseCase(bookDatabaseDriver)

  describe('updateBook', () => {
    describe('When an exception happens on checking if a book exists', () => {
      const message = chance.string()
      const basicBooks = BookTableUtils.generateBasicBooks()

      test('should return an internal server error', async () => {
        jest
          .spyOn(bookDatabaseDriver, 'bookExists')
          .mockImplementationOnce(() => {
            throw new Error(message)
          })

        await updateBookUseCase
          .updateBook(basicBooks[0])
          .catch((error: InternalServerErrorResult) => {
            expect(error).toBeInstanceOf(InternalServerErrorResult)
            expect(error.code).toEqual(ErrorCodes.InternalServerError)
            expect(error.description).toEqual(message)
          })
      })
    })

    describe('When an exception happens on updating a book', () => {
      const message = chance.string()
      const basicBooks = BookTableUtils.generateBasicBooks()

      test('should return an internal server error', async () => {
        jest.spyOn(bookDatabaseDriver, 'bookExists').mockResolvedValueOnce(true)

        jest
          .spyOn(bookDatabaseDriver, 'updateBook')
          .mockImplementationOnce(() => {
            throw new Error(message)
          })

        await updateBookUseCase
          .updateBook(basicBooks[0])
          .catch((error: InternalServerErrorResult) => {
            expect(error).toBeInstanceOf(InternalServerErrorResult)
            expect(error.code).toEqual(ErrorCodes.InternalServerError)
            expect(error.description).toEqual(message)
          })
      })
    })

    describe('When a book does not exist', () => {
      const basicBooks = BookTableUtils.generateBasicBooks()

      test('should return a not found error', async () => {
        jest
          .spyOn(bookDatabaseDriver, 'bookExists')
          .mockResolvedValueOnce(false)

        await updateBookUseCase
          .updateBook(basicBooks[0])
          .catch((error: NotFoundResult) => {
            expect(error).toBeInstanceOf(NotFoundResult)
            expect(error.code).toEqual(ErrorCodes.NotFound)
            expect(error.description).toContain(basicBooks[0].book_id)
          })
      })
    })

    describe('When everything is ok', () => {
      const basicBooks = BookTableUtils.generateBasicBooks()

      test('should return ok', async () => {
        jest.spyOn(bookDatabaseDriver, 'bookExists').mockResolvedValueOnce(true)
        jest.spyOn(bookDatabaseDriver, 'updateBook').mockResolvedValueOnce()

        const actual = await updateBookUseCase.updateBook(basicBooks[0])
        expect(actual).toBeUndefined()
      })
    })
  })
})
