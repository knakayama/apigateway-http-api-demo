import { UpdateBookController } from '@controllers/update-book-controller'
import { ErrorCodes } from '@presenters/error-codes'
import {
  BadRequestResult,
  ErrorResult,
  InternalServerErrorResult,
} from '@presenters/errors'
import { ApiHandler } from '@presenters/interfaces'
import { HttpStatusCodes } from '@presenters/status-codes'
import { BookTableUtils } from '@test/utils/book-table-utils'
import {
  callSuccessForRequestBodyAndParameter,
  callFailureForRequestBodyAndParameter,
} from '@test/utils/caller'
import {
  ApiErrorResponseParsed,
  ApiResponseParsed,
  PathParameter,
} from '@test/utils/interfaces'
import { BasicBook } from '@externals/drivers/database/book-interfaces'
import { UpdateBookUseCase } from '@use-cases/update-book-use-case'
import { BookDatabaseDriver } from '@externals/drivers/database/book'
import { Chance } from 'chance'

const chance = new Chance()

describe('UpdateBookController', () => {
  const updateBookUseCase = new UpdateBookUseCase(new BookDatabaseDriver())
  const updateBookController = new UpdateBookController(updateBookUseCase)

  async function callAndCheckError(
    handler: ApiHandler,
    expectedHttpStatusCode: number,
    errorResult: ErrorResult,
    requestBody: BasicBook,
    parameters: PathParameter
  ): Promise<void> {
    const response: ApiErrorResponseParsed = await callFailureForRequestBodyAndParameter(
      handler,
      requestBody,
      parameters
    )
    expect(response.statusCode).toBe(expectedHttpStatusCode)
    expect(response.parsedBody.error.code).toBe(errorResult.code)
    expect(response.parsedBody.error.description).toBe(errorResult.description)
  }

  describe('createBook method', () => {
    describe('When there is no request body', () => {
      test('should return Bad Request', async () => {
        const unexpectedRequestBody: BasicBook = (undefined as unknown) as BasicBook
        const errorResult: BadRequestResult = new BadRequestResult(
          ErrorCodes.BadRequest,
          'Please specify a request body!'
        )
        const parameters: PathParameter = {
          book_title: 'book',
        }
        await callAndCheckError(
          updateBookController.updateBook,
          HttpStatusCodes.BadRequest,
          errorResult,
          unexpectedRequestBody,
          parameters
        )
      })
    })

    describe('When book id is missing', () => {
      let unexpectedRequestBody: BasicBook[] = []
      beforeEach(() => {
        unexpectedRequestBody = BookTableUtils.generateBasicBooks()
        unexpectedRequestBody[0].book_id = ''
      })
      test('should return Bad Request', async () => {
        const errorResult: BadRequestResult = new BadRequestResult(
          ErrorCodes.BadRequest,
          'Please specify a valid request body!'
        )
        const parameters: PathParameter = {
          book_title: 'book',
        }
        await callAndCheckError(
          updateBookController.updateBook,
          HttpStatusCodes.BadRequest,
          errorResult,
          unexpectedRequestBody[0],
          parameters
        )
      })
    })

    describe('When book title is missing', () => {
      let unexpectedRequestBody: BasicBook[] = []
      beforeEach(() => {
        unexpectedRequestBody = BookTableUtils.generateBasicBooks()
        unexpectedRequestBody[0].book_title = ''
      })
      test('should return Bad Request', async () => {
        const errorResult: BadRequestResult = new BadRequestResult(
          ErrorCodes.BadRequest,
          'Please specify a valid request body!'
        )
        const parameters: PathParameter = {
          book_title: 'book',
        }
        await callAndCheckError(
          updateBookController.updateBook,
          HttpStatusCodes.BadRequest,
          errorResult,
          unexpectedRequestBody[0],
          parameters
        )
      })
    })

    describe('When a book title is not valid', () => {
      let testRequestBody: BasicBook[] = []
      beforeEach(() => {
        testRequestBody = BookTableUtils.generateBasicBooks()
        testRequestBody[0].book_title = 'invalid-bookid'
      })

      test('should return Bad Request', async () => {
        const errorResult: BadRequestResult = new BadRequestResult(
          ErrorCodes.BadRequest,
          'Please specify a valid book title!'
        )
        const parameters: PathParameter = {
          book_id: 'book',
        }

        await callAndCheckError(
          updateBookController.updateBook,
          HttpStatusCodes.BadRequest,
          errorResult,
          testRequestBody[0],
          parameters
        )
      })
    })

    describe('When an unexpected error occured', () => {
      let testRequestBody: BasicBook[] = []
      beforeEach(() => {
        testRequestBody = BookTableUtils.generateBasicBooks()
      })
      test('should return Internal Server Error', async () => {
        const message = chance.string()
        const errorResult: InternalServerErrorResult = new InternalServerErrorResult(
          ErrorCodes.InternalServerError,
          message
        )
        jest
          .spyOn(updateBookUseCase, 'updateBook')
          .mockRejectedValueOnce(
            new InternalServerErrorResult(
              ErrorCodes.InternalServerError,
              message
            )
          )

        const parameters: PathParameter = {
          book_id: 'book',
        }
        await callAndCheckError(
          updateBookController.updateBook,
          HttpStatusCodes.InternalServerError,
          errorResult,
          testRequestBody[0],
          parameters
        )
      })
    })

    describe('When it succeeds', () => {
      let testRequestBody: BasicBook[] = []
      beforeEach(() => {
        testRequestBody = BookTableUtils.generateBasicBooks()
      })
      test('should return 200 with an empty response', async () => {
        jest.spyOn(updateBookUseCase, 'updateBook').mockResolvedValueOnce()
        const bookId = 'book'
        const pathParameters: PathParameter = {
          book_id: bookId,
        }

        const actualResponse: ApiResponseParsed<unknown> = await callSuccessForRequestBodyAndParameter<
          unknown
        >(updateBookController.updateBook, testRequestBody[0], pathParameters)
        expect(actualResponse.statusCode).toBe(HttpStatusCodes.NoContent)
        expect(actualResponse.parsedBody).toBeEmpty()
      })
    })
  })
})
