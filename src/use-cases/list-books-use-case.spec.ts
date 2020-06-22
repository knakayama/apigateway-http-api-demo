import { BookDatabaseDriver } from '@externals/drivers/database/book'
import { ErrorCodes } from '@presenters/error-codes'
import { InternalServerErrorResult } from '@presenters/errors'
import { BookTableUtils } from '@test/utils/book-table-utils'
import { ListBooksUseCase } from '@use-cases/list-books-use-case'
import { Chance } from 'chance'

const chance = new Chance.Chance()

describe('ListBooksUseCase', () => {
  const bookDatabaseDriver = new BookDatabaseDriver()
  const listBooksUseCase = new ListBooksUseCase(bookDatabaseDriver)

  describe('listBooks', () => {
    describe('When the method has done successfully', () => {
      const expectedTotalNumber = 3
      const expectedBasicBooks = BookTableUtils.generateBasicBooksWithDate(
        expectedTotalNumber
      )

      test('should return the list of books', async () => {
        jest
          .spyOn(bookDatabaseDriver, 'findBooks')
          .mockResolvedValueOnce(expectedBasicBooks)

        const { bookTotal, books } = await listBooksUseCase.listBooks()
        expect(books).toIncludeAllMembers(expectedBasicBooks)
        expect(bookTotal).toBe(expectedTotalNumber)
      })
    })

    describe('When any data does not exist', () => {
      test('should return empty', async () => {
        jest.spyOn(bookDatabaseDriver, 'findBooks').mockResolvedValueOnce([])

        const { bookTotal, books } = await listBooksUseCase.listBooks()
        expect(books).toStrictEqual([])
        expect(bookTotal).toBe(0)
      })
    })

    describe('When an exception happens', () => {
      const message = chance.string()

      test('should return Promise rejection', async () => {
        jest
          .spyOn(bookDatabaseDriver, 'findBooks')
          .mockImplementationOnce(() => {
            throw new Error(message)
          })

        await listBooksUseCase
          .listBooks()
          .catch((error: InternalServerErrorResult) => {
            expect(error).toBeInstanceOf(InternalServerErrorResult)
            expect(error.code).toEqual(ErrorCodes.InternalServerError)
            expect(error.description).toEqual(message)
          })
      })
    })
  })
})
