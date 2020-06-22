import { BookDatabaseDriver } from '@externals/drivers/database/book'
import { BookTableUtils } from '@test/utils/book-table-utils'
import { Chance } from 'chance'
import { BasicBookDocument, BookTitle } from './book-interfaces'

const chance = new Chance()

process.env.BOOK_TABLE = 'Book'

describe('BookDatabaseDriver', () => {
  const dtsTableUtils = new BookTableUtils(process.env.BOOK_TABLE!)
  const bookDatabaseDriver = new BookDatabaseDriver(dtsTableUtils.dynamoDBD)

  describe('findBooks', () => {
    beforeEach(async () => {
      await dtsTableUtils.createTable()
    })

    afterEach(async () => {
      await dtsTableUtils.deleteTable()
    })

    describe('When there is no book', () => {
      test('should return empty', async () => {
        const actual = await bookDatabaseDriver.findBooks()

        expect(actual).toEqual([])
      })
    })

    describe('When there is a book', () => {
      const itemCount = 1
      let basicBookDocuments: BasicBookDocument[] = []
      beforeEach(async () => {
        basicBookDocuments = BookTableUtils.generateBasicBookDocuments()
        await dtsTableUtils.batchWriteItems(basicBookDocuments)
      })

      test('should return a book', async () => {
        const actual = await bookDatabaseDriver.findBooks()

        expect(actual.length).toBe(itemCount)
        // https://github.com/jest-community/jest-extended/issues/230
        expect(basicBookDocuments).toContainAllEntries(Object.assign(actual))
      })
    })

    describe('When there are books', () => {
      const itemCount = 3
      let basicBookDocuments: BasicBookDocument[] = []
      beforeEach(async () => {
        basicBookDocuments = BookTableUtils.generateBasicBookDocuments(
          itemCount
        )
        await dtsTableUtils.batchWriteItems(basicBookDocuments)
      })

      test('should return books', async () => {
        const actual = await bookDatabaseDriver.findBooks()

        expect(actual.length).toBe(itemCount)
        expect(basicBookDocuments).toContainAllEntries(Object.assign(actual))
      })
    })
  })

  describe('bookExists', () => {
    beforeEach(async () => {
      await dtsTableUtils.createTable()
    })

    afterEach(async () => {
      await dtsTableUtils.deleteTable()
    })

    describe('A book exists', () => {
      let basicBooksDocuments: BasicBookDocument[] = []
      const expected = true

      beforeEach(async () => {
        basicBooksDocuments = BookTableUtils.generateBasicBookDocuments()
        await dtsTableUtils.batchWriteItems(basicBooksDocuments)
      })

      test('should return true', async () => {
        const actual = await bookDatabaseDriver.bookExists(
          basicBooksDocuments[0].book_id
        )

        expect(actual).toBe(expected)
      })
    })

    describe('A book does not exist', () => {
      const expected = false

      test('should return false', async () => {
        const actual = await bookDatabaseDriver.bookExists(chance.string())

        expect(actual).toBe(expected)
      })
    })
  })

  describe('createBook', () => {
    const itemCount = 1
    beforeEach(async () => {
      await dtsTableUtils.createTable()
    })

    afterEach(async () => {
      await dtsTableUtils.deleteTable()
    })

    describe('When everything is ok', () => {
      let bookTitles: BookTitle[] = []
      beforeEach(async () => {
        bookTitles = BookTableUtils.generateBookTitles(itemCount)
      })

      test('should create a book', async () => {
        await bookDatabaseDriver.createBook(bookTitles[0])
        const actual = await dtsTableUtils.findBooks()

        expect(actual.length).toBe(itemCount)
        expect(actual[0].book_title).toBe(bookTitles[0].book_title)
      })
    })
  })
})
