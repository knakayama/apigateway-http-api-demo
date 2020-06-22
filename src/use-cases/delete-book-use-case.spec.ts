import { BookDatabaseDriver } from '@externals/drivers/database/book'
import { ErrorCodes } from '@presenters/error-codes'
import { InternalServerErrorResult, NotFoundResult } from '@presenters/errors'
import { DeleteBookUseCase } from '@use-cases/delete-book-use-case'
import { Chance } from 'chance'

const chance = new Chance()

describe('DeleteBookUseCase', () => {
  const bookDatabaseDriver = new BookDatabaseDriver()
  const deleteBookUseCase = new DeleteBookUseCase(bookDatabaseDriver)

  describe('deleteBook', () => {
    describe('When there is nothing wrong', () => {
      test('should return empty', async () => {
        const bookId = 'book'

        jest.spyOn(bookDatabaseDriver, 'bookExists').mockResolvedValueOnce(true)
        jest.spyOn(bookDatabaseDriver, 'deleteBook').mockResolvedValueOnce()

        const actual = await deleteBookUseCase.deleteBook(bookId)

        expect(actual).toBeUndefined()
      })
    })

    describe('When an exception happens on checking if a book exists', () => {
      test('should return an Internal Server Error', async () => {
        const bookId = 'book'
        const message = chance.string()
        jest
          .spyOn(bookDatabaseDriver, 'bookExists')
          .mockImplementationOnce(() => {
            throw new Error(message)
          })

        try {
          await deleteBookUseCase.deleteBook(bookId)
        } catch (error) {
          expect(error).toBeInstanceOf(InternalServerErrorResult)
          expect(error.code).toEqual(ErrorCodes.InternalServerError)
          expect(error.description).toEqual(message)
        }
      })
    })

    describe('When an exception happens on deleting a book', () => {
      test('should return an Internal Server Error', async () => {
        const bookId = 'book'
        const message = chance.string()
        jest.spyOn(bookDatabaseDriver, 'bookExists').mockResolvedValueOnce(true)
        jest
          .spyOn(bookDatabaseDriver, 'deleteBook')
          .mockImplementationOnce(() => {
            throw new Error(message)
          })

        try {
          await deleteBookUseCase.deleteBook(bookId)
        } catch (error) {
          expect(error).toBeInstanceOf(InternalServerErrorResult)
          expect(error.code).toEqual(ErrorCodes.InternalServerError)
          expect(error.description).toEqual(message)
        }
      })
    })

    describe('When there is no book', () => {
      test('should return Not found error', async () => {
        const bookId = 'book'

        jest
          .spyOn(bookDatabaseDriver, 'bookExists')
          .mockResolvedValueOnce(false)

        try {
          await deleteBookUseCase.deleteBook(bookId)
        } catch (error) {
          expect(error).toBeInstanceOf(NotFoundResult)
          expect(error.code).toEqual(ErrorCodes.NotFound)
          expect(error.description).toContain(bookId)
        }
      })
    })
  })
})
