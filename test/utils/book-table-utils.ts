import {
  BasicBooksResponse,
  BasicBookResponse,
} from '@controllers/book-interfaces'
import { DynamoDBUtils } from '@test/utils/dynamodb-table-utils'
import {
  BasicBook,
  BookTitle,
  BasicBookWithDate,
  BasicBookDocument,
} from '@externals/drivers/database/book-interfaces'
import { DynamoDB } from 'aws-sdk'
import { Chance } from 'chance'

const chance: Chance.Chance = new Chance()

export class BookTableUtils {
  static toBookPK(bookId: string): string {
    return `book|${bookId}`
  }

  static toBasicBook(v: BasicBook): BasicBook {
    return {
      book_id: v.book_id,
      book_title: v.book_title,
    }
  }

  static generateBasicBook(): BasicBook {
    const bookId: string = chance.string({ pool: 'abcde1234' })
    return {
      book_id: bookId,
      book_title: chance.string({ pool: 'abcde', length: 20 }),
    }
  }

  static generateBasicBooks(itemCount = 1): BasicBook[] {
    const basicBooks: BasicBook[] = []
    for (let i: number = itemCount; i > 0; i -= 1) {
      basicBooks.push(this.generateBasicBook())
    }
    return basicBooks
  }

  static generateBookTitle(): BookTitle {
    return { book_title: chance.string({ pool: 'abcde', length: 20 }) }
  }

  static generateBookTitles(itemCount = 1): BookTitle[] {
    const bookTitles: BookTitle[] = []
    for (let i: number = itemCount; i > 0; i -= 1) {
      bookTitles.push(this.generateBookTitle())
    }
    return bookTitles
  }

  static generateBasicBookWithDate(): BasicBookWithDate {
    const bookId: string = chance.string({ pool: 'abcde1234' })
    return {
      book_id: bookId,
      book_title: chance.string({ pool: 'abcde', length: 20 }),
      created_at: chance.date().toISOString(),
      updated_at: chance.date().toISOString(),
    }
  }

  static generateBasicBookDocument(): BasicBookDocument {
    const bookId: string = chance.string({ pool: 'abcde1234' })
    return {
      main_pk: BookTableUtils.toBookPK(bookId),
      main_sk: BookTableUtils.toBookPK(bookId),
      book_id: bookId,
      book_title: chance.string({ pool: 'abcde', length: 20 }),
      created_at: chance.date().toISOString(),
      updated_at: chance.date().toISOString(),
    }
  }

  static generateBasicBooksWithDate(itemCount = 1): BasicBookWithDate[] {
    const basicBooksWithDate: BasicBookWithDate[] = []
    for (let i: number = itemCount; i > 0; i -= 1) {
      basicBooksWithDate.push(this.generateBasicBookWithDate())
    }
    return basicBooksWithDate
  }

  static generateBasicBookDocuments(itemCount = 1): BasicBookDocument[] {
    const basicBooksDocuments: BasicBookDocument[] = []
    for (let i: number = itemCount; i > 0; i -= 1) {
      basicBooksDocuments.push(this.generateBasicBookDocument())
    }
    return basicBooksDocuments
  }
  static generateBasicBookResponse(): BasicBookResponse {
    return {
      book: this.generateBasicBookWithDate(),
    }
  }

  static generateBasicBooksResponse(itemCount = 1): BasicBooksResponse {
    return {
      book_total: chance.integer({ min: 0, max: 100 }),
      books: this.generateBasicBooksWithDate(itemCount),
    }
  }

  static toWriteRequests<T>(
    items: T[]
  ): DynamoDB.DocumentClient.WriteRequest[] {
    const writeRequests: DynamoDB.DocumentClient.WriteRequest[] = []

    for (const item of items.values()) {
      writeRequests.push({
        PutRequest: {
          Item: item,
        },
      })
    }

    return writeRequests
  }

  dynamoDBD: DynamoDB.DocumentClient

  tableName: string

  constructor(tableName: string) {
    this.tableName = tableName
    this.dynamoDBD = DynamoDBUtils.dynamoDBD
  }

  async batchWriteItems<T>(items: T[]): Promise<void> {
    const bookWriteRequests: DynamoDB.DocumentClient.WriteRequest[] = BookTableUtils.toWriteRequests(
      items
    )
    const param: DynamoDB.DocumentClient.BatchWriteItemInput = {
      RequestItems: {
        [this.tableName]: bookWriteRequests,
      },
    }
    await this.dynamoDBD.batchWrite(param).promise()
  }

  async createTable(): Promise<void> {
    await DynamoDBUtils.createTable(this.tableName)
  }

  async deleteTable(): Promise<void> {
    await DynamoDBUtils.deleteTable(this.tableName)
  }

  async findBooks(): Promise<BasicBookDocument[]> {
    const param: DynamoDB.DocumentClient.ScanInput = {
      TableName: this.tableName,
    }
    return this.dynamoDBD
      .scan(param)
      .promise()
      .then(
        (data: DynamoDB.DocumentClient.ScanOutput) =>
          data.Items as BasicBookDocument[]
      )
  }
}
