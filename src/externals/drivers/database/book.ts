import {
  BasicBookWithDate,
  BookTitle,
  BasicBook,
} from '@externals/drivers/database/book-interfaces'
import { v4 as uuidv4 } from 'uuid'
import { DynamoDB } from 'aws-sdk'

export class BookDatabaseDriver {
  private static toBasicBookDocument(
    v: DynamoDB.DocumentClient.AttributeMap
  ): BasicBookWithDate {
    return {
      book_id: v.book_id,
      book_title: v.book_title,
      created_at: v.created_at,
      updated_at: v.updated_at,
    }
  }

  constructor(
    private readonly _dynamoDBD = new DynamoDB.DocumentClient({
      apiVersion: '2012-08-10',
    })
  ) {}

  async findBooks(): Promise<BasicBookWithDate[]> {
    const param: DynamoDB.DocumentClient.ScanInput = {
      TableName: process.env.BOOK_TABLE!,
    }

    let itemList: DynamoDB.DocumentClient.ItemList = []
    let response: DynamoDB.DocumentClient.ScanOutput

    do {
      response = await this._dynamoDBD.scan(param).promise()
      param.ExclusiveStartKey = response.LastEvaluatedKey
      if (response.Items) {
        itemList = itemList.concat(response.Items)
      }
      console.log(`ScannedCount: ${response.ScannedCount}`)
    } while (response.LastEvaluatedKey)

    return itemList.map(BookDatabaseDriver.toBasicBookDocument)
  }

  async createBook(bookTitle: BookTitle): Promise<void> {
    const bookId = uuidv4()
    const now = new Date().toISOString()
    const param: DynamoDB.DocumentClient.PutItemInput = {
      ConditionExpression:
        'attribute_not_exists(#MAIN_PK) AND attribute_not_exists(#MAIN_SK)',
      ExpressionAttributeNames: {
        '#MAIN_PK': 'main_pk',
        '#MAIN_SK': 'main_sk',
      },
      Item: {
        main_pk: `book|${bookId}`,
        main_sk: `book|${bookId}`,
        book_id: bookId,
        book_title: bookTitle.book_title,
        created_at: now,
        updated_at: now,
      },
      TableName: process.env.BOOK_TABLE!,
    }
    await this._dynamoDBD.put(param).promise()
  }

  async bookExists(bookId: string): Promise<boolean> {
    const param: DynamoDB.DocumentClient.GetItemInput = {
      ConsistentRead: true,
      Key: {
        main_pk: `book|${bookId}`,
        main_sk: `book|${bookId}`,
      },
      TableName: process.env.BOOK_TABLE!,
    }

    const response: DynamoDB.DocumentClient.GetItemOutput = await this._dynamoDBD
      .get(param)
      .promise()

    if (response.Item) {
      return true
    }

    return false
  }

  async updateBook(basicBook: BasicBook): Promise<void> {
    const now = new Date().toISOString()
    const param: DynamoDB.DocumentClient.UpdateItemInput = {
      Key: {
        main_pk: `book|${basicBook.book_id}`,
        main_sk: `book|${basicBook.book_id}`,
      },
      TableName: process.env.BOOK_TABLE!,
      ConditionExpression:
        'contains(#MAIN_PK, :main_pk) AND contains(#MAIN_SK, :main_sk)',
      ExpressionAttributeNames: {
        '#MAIN_PK': 'main_pk',
        '#MAIN_SK': 'main_sk',
        '#BOOK_ID': 'book_id',
        '#BOOK_TITLE': 'book_title',
        '#UPDATED_AT': 'updated_at',
      },
      ExpressionAttributeValues: {
        ':main_pk': `book|${basicBook.book_id}`,
        ':main_sk': `book|${basicBook.book_id}`,
        ':book_id': basicBook.book_id,
        ':book_title': basicBook.book_title,
        ':updated_at': now,
      },
      UpdateExpression: `
        SET
          #BOOK_ID = :book_id,
          #BOOK_TITLE = :book_title,
          #UPDATED_AT = :updated_at
      `,
    }
    await this._dynamoDBD.update(param).promise()
  }

  async deleteBook(bookId: string): Promise<void> {
    const param: DynamoDB.DocumentClient.DeleteItemInput = {
      ConditionExpression:
        'attribute_exists(#MAIN_PK) AND attribute_exists(#MAIN_SK)',
      ExpressionAttributeNames: {
        '#MAIN_PK': 'main_pk',
        '#MAIN_SK': 'main_sk',
      },
      Key: {
        main_pk: `book|${bookId}`,
        main_sk: `book|${bookId}`,
      },
      TableName: process.env.BOOK_TABLE!,
    }
    await this._dynamoDBD.delete(param).promise()
  }

  async detailBook(bookId: string): Promise<BasicBookWithDate> {
    const param: DynamoDB.DocumentClient.GetItemInput = {
      Key: {
        main_pk: `book|${bookId}`,
        main_sk: `book|${bookId}`,
      },
      TableName: process.env.BOOK_TABLE!,
    }

    return this._dynamoDBD
      .get(param)
      .promise()
      .then((response: DynamoDB.DocumentClient.GetItemOutput) =>
        BookDatabaseDriver.toBasicBookDocument(response.Item!)
      )
  }
}
