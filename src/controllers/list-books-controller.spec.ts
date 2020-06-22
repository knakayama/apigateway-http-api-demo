import { BasicBooksResponse } from '@controllers/book-interfaces'
import { ListBooksController } from '@controllers/list-books-controller'
import { ErrorCodes } from '@presenters/error-codes'
import { ErrorResult, InternalServerErrorResult } from '@presenters/errors'
import { ApiHandler } from '@presenters/interfaces'
import { HttpStatusCodes } from '@presenters/status-codes'
import { BookTableUtils } from '@test/utils/book-table-utils'
import { callFailure, callSuccess } from '@test/utils/caller'
import {
  ApiErrorResponseParsed,
  ApiResponseParsed,
} from '@test/utils/interfaces'
import { ListBooksUseCase } from '@use-cases/list-books-use-case'
import { BookDatabaseDriver } from '@externals/drivers/database/book'
import { Chance } from 'chance'

const chance = new Chance.Chance()

describe('ListBooksController', () => {
  const listBooksUseCase = new ListBooksUseCase(new BookDatabaseDriver())
  const listBooksController = new ListBooksController(listBooksUseCase)

  async function callAndCheckError(
    handler: ApiHandler,
    expectedHttpStatusCode: number,
    errorResult: ErrorResult
  ): Promise<void> {
    const response: ApiErrorResponseParsed = await callFailure(handler)
    expect(response.statusCode).toBe(expectedHttpStatusCode)
    expect(response.parsedBody.error.code).toBe(errorResult.code)
    expect(response.parsedBody.error.description).toBe(errorResult.description)
  }

  describe('listBooks', () => {
    describe('Unexpected internal situations', () => {
      const message = chance.string()
      test('should return Internal Server Error', async () => {
        const errorResult = new InternalServerErrorResult(
          ErrorCodes.InternalServerError,
          message
        )
        jest
          .spyOn(listBooksUseCase, 'listBooks')
          .mockRejectedValueOnce(
            new InternalServerErrorResult(
              ErrorCodes.InternalServerError,
              message
            )
          )

        await callAndCheckError(
          listBooksController.listBooks,
          HttpStatusCodes.InternalServerError,
          errorResult
        )
      })
    })

    describe('When it succeeds', () => {
      test('should return HTTP 200 ok', async () => {
        const itemCount = 1
        const expected = BookTableUtils.generateBasicBooksResponse(itemCount)
        jest.spyOn(listBooksUseCase, 'listBooks').mockResolvedValueOnce({
          bookTotal: expected.book_total,
          books: expected.books,
        })
        const actual: ApiResponseParsed<BasicBooksResponse> = await callSuccess<
          BasicBooksResponse
        >(listBooksController.listBooks)
        expect(actual.statusCode).toBe(HttpStatusCodes.OK)
        expect(actual.parsedBody.books).toIncludeSameMembers(expected.books)
      })
    })
  })
})
