import { DetailBookController } from '@controllers/detail-book-controller'
import { BasicBookResponse } from '@controllers/book-interfaces'
import { ErrorCodes } from '@presenters/error-codes'
import {
  BadRequestResult,
  ErrorResult,
  InternalServerErrorResult,
  NotFoundResult,
} from '@presenters/errors'
import { ApiHandler } from '@presenters/interfaces'
import { HttpStatusCodes } from '@presenters/status-codes'
import { BookTableUtils } from '@test/utils/book-table-utils'
import {
  callFailureForParameter,
  callSuccessForParameter,
} from '@test/utils/caller'
import {
  ApiErrorResponseParsed,
  ApiResponseParsed,
  PathParameter,
  QueryParameter,
} from '@test/utils/interfaces'
import { DetailBookUseCase } from '@use-cases/detail-book-use-case'
import { BookDatabaseDriver } from '@externals/drivers/database/book'

describe('DetailBookController', () => {
  const detailBookUseCase = new DetailBookUseCase(new BookDatabaseDriver())
  const detailBookController = new DetailBookController(detailBookUseCase)

  async function callAndCheckError(
    handler: ApiHandler,
    expectedHttpStatusCode: number,
    errorResult: ErrorResult,
    parameters: QueryParameter | PathParameter
  ): Promise<void> {
    const response: ApiErrorResponseParsed = await callFailureForParameter(
      handler,
      parameters
    )
    expect(response.statusCode).toBe(expectedHttpStatusCode)
    expect(response.parsedBody.error.code).toBe(errorResult.code)
    expect(response.parsedBody.error.description).toBe(errorResult.description)
  }

  describe('detailBook method', () => {
    describe('When the book that a user details does not exist', () => {
      test('should return 404 error', async () => {
        const bookId = 'book'
        const errorResult: NotFoundResult = new NotFoundResult(
          ErrorCodes.NotFound,
          'error'
        )
        jest
          .spyOn(detailBookUseCase, 'detailBook')
          .mockRejectedValueOnce(
            new NotFoundResult(ErrorCodes.NotFound, 'error')
          )

        const pathParameters: PathParameter = {
          book_id: bookId,
        }
        await callAndCheckError(
          detailBookController.detailBook,
          HttpStatusCodes.NotFound,
          errorResult,
          pathParameters
        )
      })
    })

    describe('When an unexpected error occured', () => {
      test('should return Internal Server Error', async () => {
        const bookId = 'book'
        const errorResult = new InternalServerErrorResult(
          ErrorCodes.InternalServerError,
          'error'
        )
        jest
          .spyOn(detailBookUseCase, 'detailBook')
          .mockRejectedValueOnce(
            new InternalServerErrorResult(
              ErrorCodes.InternalServerError,
              'error'
            )
          )

        const pathParameters: PathParameter = {
          book_id: bookId,
        }
        await callAndCheckError(
          detailBookController.detailBook,
          HttpStatusCodes.InternalServerError,
          errorResult,
          pathParameters
        )
      })
    })

    describe('Unexpected path parameters', () => {
      test('should return Bad Request for a missing book_id', async () => {
        const pathParameters: PathParameter = {
          book_id: '',
        }
        const errorResult: BadRequestResult = new BadRequestResult(
          ErrorCodes.BadRequest,
          'Please specify a path parameter!'
        )
        await callAndCheckError(
          detailBookController.detailBook,
          HttpStatusCodes.BadRequest,
          errorResult,
          pathParameters
        )
      })
    })

    describe('When everything is ok', () => {
      test('should return HTTP 200 ok', async () => {
        const basicBookWithDate = BookTableUtils.generateBasicBookWithDate()

        jest
          .spyOn(detailBookUseCase, 'detailBook')
          .mockResolvedValueOnce(basicBookWithDate)

        const bookId = 'book'
        const pathParameters: PathParameter = {
          book_id: bookId,
        }
        const actualDetailedBookResponse: ApiResponseParsed<BasicBookResponse> = await callSuccessForParameter<
          BasicBookResponse
        >(detailBookController.detailBook, pathParameters)
        expect(actualDetailedBookResponse.statusCode).toBe(HttpStatusCodes.OK)
        expect(actualDetailedBookResponse.parsedBody.book).toEqual(
          basicBookWithDate
        )
      })
    })
  })
})
