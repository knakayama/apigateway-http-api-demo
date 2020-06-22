import { DeleteBookController } from '@controllers/delete-book-controller'
import { ErrorCodes } from '@presenters/error-codes'
import {
  BadRequestResult,
  ErrorResult,
  InternalServerErrorResult,
  NotFoundResult,
} from '@presenters/errors'
import { ApiHandler } from '@presenters/interfaces'
import { HttpStatusCodes } from '@presenters/status-codes'
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
import { DeleteBookUseCase } from '@use-cases/delete-book-use-case'
import { Chance } from 'chance'
import { BookDatabaseDriver } from '@externals/drivers/database/book'

const chance: Chance.Chance = new Chance()

describe('DeleteBookController', () => {
  const deleteBookUseCase = new DeleteBookUseCase(new BookDatabaseDriver())
  const deleteBookController = new DeleteBookController(deleteBookUseCase)

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

  describe('deleteBook', () => {
    describe('The book that a user is deleting does not exist', () => {
      test('should return not found error', async () => {
        const bookId = 'book'
        const message = chance.string()
        const errorResult = new NotFoundResult(ErrorCodes.NotFound, message)
        jest
          .spyOn(deleteBookUseCase, 'deleteBook')
          .mockRejectedValueOnce(
            new NotFoundResult(ErrorCodes.NotFound, message)
          )

        const pathParameters: PathParameter = {
          book_id: bookId,
        }
        await callAndCheckError(
          deleteBookController.deleteBook,
          HttpStatusCodes.NotFound,
          errorResult,
          pathParameters
        )
      })
    })

    describe('Unexpected errors happened', () => {
      test('should return Internal Server Error', async () => {
        const bookId = 'book'
        const message = chance.string()
        const errorResult = new InternalServerErrorResult(
          ErrorCodes.InternalServerError,
          message
        )
        jest
          .spyOn(deleteBookUseCase, 'deleteBook')
          .mockRejectedValueOnce(
            new InternalServerErrorResult(
              ErrorCodes.InternalServerError,
              message
            )
          )

        const pathParameters: PathParameter = {
          book_id: bookId,
        }
        await callAndCheckError(
          deleteBookController.deleteBook,
          HttpStatusCodes.InternalServerError,
          errorResult,
          pathParameters
        )
      })
    })

    describe('Invalid book id', () => {
      test('should return Bad Request', async () => {
        const pathParameters: PathParameter = {
          book_id: 'invalid@book@id',
        }
        const errorResult: BadRequestResult = new BadRequestResult(
          ErrorCodes.BadRequest,
          'Please specify a valid book id!'
        )
        await callAndCheckError(
          deleteBookController.deleteBook,
          HttpStatusCodes.BadRequest,
          errorResult,
          pathParameters
        )
      })
    })

    describe('When it succeeds', () => {
      test('should return HTTP 204 no content', async () => {
        jest.spyOn(deleteBookUseCase, 'deleteBook').mockResolvedValueOnce()

        const bookId = 'book'
        const pathParameters: PathParameter = {
          book_id: bookId,
        }
        const actualResponse: ApiResponseParsed<unknown> = await callSuccessForParameter<
          unknown
        >(deleteBookController.deleteBook, pathParameters)
        expect(actualResponse.statusCode).toBe(HttpStatusCodes.NoContent)
        expect(actualResponse.parsedBody).toBeEmpty()
      })
    })
  })
})
