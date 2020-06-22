import { ErrorCodes } from '@presenters/error-codes'
import { InternalServerErrorResult } from '@presenters/errors'
import { BookTableUtils } from '@test/utils/book-table-utils'
import { CreateBookUseCase } from '@use-cases/create-book-use-case'
import { BookDatabaseDriver } from '@externals/drivers/database/book'
import { Chance } from 'chance'

const chance = new Chance.Chance()

describe('CreateBookUseCase', () => {
  const bookDatabaseDriver = new BookDatabaseDriver()
  const createBookUseCase = new CreateBookUseCase(bookDatabaseDriver)

  describe('createBook', () => {
    describe('When an exception happens on checking the existance of a book', () => {
      const bookTitles = BookTableUtils.generateBookTitles()
      const message = chance.string()

      test('should return Promise rejection', async () => {
        jest
          .spyOn(bookDatabaseDriver, 'createBook')
          .mockImplementationOnce(() => {
            throw new Error(message)
          })

        await createBookUseCase
          .createBook(bookTitles[0])
          .catch((error: InternalServerErrorResult) => {
            expect(error).toBeInstanceOf(InternalServerErrorResult)
            expect(error.code).toEqual(ErrorCodes.InternalServerError)
            expect(error.description).toEqual(message)
          })
      })
    })

    describe('When everthing is ok', () => {
      const bookTitles = BookTableUtils.generateBookTitles()

      test('should return a book', async () => {
        jest.spyOn(bookDatabaseDriver, 'createBook').mockResolvedValueOnce()

        const actual = await createBookUseCase.createBook(bookTitles[0])
        expect(actual).toBeUndefined()
      })
    })
  })
})
