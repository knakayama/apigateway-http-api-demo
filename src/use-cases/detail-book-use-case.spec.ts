import { BookDatabaseDriver } from '@externals/drivers/database/book'
import { ErrorCodes } from '@presenters/error-codes'
import { InternalServerErrorResult, NotFoundResult } from '@presenters/errors'
import { BookTableUtils } from '@test/utils/book-table-utils'
import { DetailBookUseCase } from '@use-cases/detail-book-use-case'
import { Chance } from 'chance'

const chance = new Chance.Chance()

describe('DetailBookUseCase', () => {
  const bookDatabaseDriver = new BookDatabaseDriver()
  const detailBookUseCase = new DetailBookUseCase(bookDatabaseDriver)

  describe('detailBook', () => {
    describe('When an expected response is passed', () => {
      const expected = BookTableUtils.generateBasicBooksWithDate()

      test('should return a book', async () => {
        jest.spyOn(bookDatabaseDriver, 'bookExists').mockResolvedValueOnce(true)
        jest
          .spyOn(bookDatabaseDriver, 'detailBook')
          .mockResolvedValueOnce(expected[0])

        const actual = await detailBookUseCase.detailBook(expected[0].book_id)
        expect(actual).toEqual(expected[0])
      })
    })

    describe('When an unknown exception occured on checking if a book exists', () => {
      const bookId = 'book'
      const message = chance.string()

      test('should return an Internal server error', async () => {
        jest
          .spyOn(bookDatabaseDriver, 'bookExists')
          .mockImplementationOnce(() => {
            throw new Error(message)
          })

        try {
          await detailBookUseCase.detailBook(bookId)
        } catch (error) {
          expect(error).toBeInstanceOf(InternalServerErrorResult)
          expect(error.code).toEqual(ErrorCodes.InternalServerError)
          expect(error.description).toEqual(message)
        }
      })
    })

    describe('When an unknown exception occured on deleting a book', () => {
      const bookId = 'book'
      const message = chance.string()

      test('should return an Internal server error', async () => {
        jest.spyOn(bookDatabaseDriver, 'bookExists').mockResolvedValueOnce(true)
        jest
          .spyOn(bookDatabaseDriver, 'detailBook')
          .mockImplementationOnce(() => {
            throw new Error(message)
          })

        try {
          await detailBookUseCase.detailBook(bookId)
        } catch (error) {
          expect(error).toBeInstanceOf(InternalServerErrorResult)
          expect(error.code).toEqual(ErrorCodes.InternalServerError)
          expect(error.description).toEqual(message)
        }
      })
    })

    describe('When the book that a user looks for does not exist', () => {
      const bookId = 'book'
      test('should return a 404 error', async () => {
        jest
          .spyOn(bookDatabaseDriver, 'bookExists')
          .mockResolvedValueOnce(false)

        try {
          await detailBookUseCase.detailBook(bookId)
        } catch (error) {
          expect(error).toBeInstanceOf(NotFoundResult)
          expect(error.code).toEqual(ErrorCodes.NotFound)
          expect(error.description).toContain(bookId)
        }
      })
    })
  })
})
