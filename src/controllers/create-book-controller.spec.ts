import { CreateBookController } from '@controllers/create-book-controller'
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
  callFailureForRequestBody,
  callSuccessForRequestBody,
} from '@test/utils/caller'
import {
  ApiErrorResponseParsed,
  ApiResponseParsed,
} from '@test/utils/interfaces'
import { CreateBookUseCase } from '@use-cases/create-book-use-case'
import { BookTitle } from '@externals/drivers/database/book-interfaces'
import { BookDatabaseDriver } from '@externals/drivers/database/book'
import { Chance } from 'chance'

const chance = new Chance.Chance()

describe('CreateBookController', () => {
  const createBookUseCase = new CreateBookUseCase(new BookDatabaseDriver())
  const createBookController = new CreateBookController(createBookUseCase)

  async function callAndCheckError(
    handler: ApiHandler,
    expectedHttpStatusCode: number,
    errorResult: ErrorResult,
    requestBody: BookTitle
  ): Promise<void> {
    const response: ApiErrorResponseParsed = await callFailureForRequestBody(
      handler,
      requestBody
    )
    expect(response.statusCode).toBe(expectedHttpStatusCode)
    expect(response.parsedBody.error.code).toBe(errorResult.code)
    expect(response.parsedBody.error.description).toBe(errorResult.description)
  }

  describe('createBook', () => {
    describe('When there is no request body', () => {
      test('should return Bad Request', async () => {
        const unexpectedRequestBody = (undefined as unknown) as BookTitle
        const errorResult = new BadRequestResult(
          ErrorCodes.BadRequest,
          'Please specify a request body!'
        )
        await callAndCheckError(
          createBookController.createBook,
          HttpStatusCodes.BadRequest,
          errorResult,
          unexpectedRequestBody
        )
      })
    })

    describe('When book title is missing', () => {
      let unexpectedRequestBody: BookTitle[] = []
      beforeEach(() => {
        unexpectedRequestBody = BookTableUtils.generateBookTitles()
        unexpectedRequestBody[0].book_title = ''
      })
      test('should return Bad Request', async () => {
        const errorResult = new BadRequestResult(
          ErrorCodes.BadRequest,
          'Please specify a valid request body!'
        )
        await callAndCheckError(
          createBookController.createBook,
          HttpStatusCodes.BadRequest,
          errorResult,
          unexpectedRequestBody[0]
        )
      })
    })

    describe('Unexpected internal situations', () => {
      let testRequestBody: BookTitle[] = []
      const message = chance.string()
      beforeEach(() => {
        testRequestBody = BookTableUtils.generateBookTitles()
      })
      test('should return Internal Server Error', async () => {
        const errorResult = new InternalServerErrorResult(
          ErrorCodes.InternalServerError,
          message
        )
        jest
          .spyOn(createBookUseCase, 'createBook')
          .mockRejectedValueOnce(
            new InternalServerErrorResult(
              ErrorCodes.InternalServerError,
              message
            )
          )

        await callAndCheckError(
          createBookController.createBook,
          HttpStatusCodes.InternalServerError,
          errorResult,
          testRequestBody[0]
        )
      })
    })

    describe('When a book title is not valid', () => {
      let testRequestBody: BookTitle[] = []
      beforeEach(() => {
        testRequestBody = BookTableUtils.generateBookTitles()
        testRequestBody[0].book_title = 'invalid-book-title'
      })

      test('should return Bad Request', async () => {
        const errorResult = new BadRequestResult(
          ErrorCodes.BadRequest,
          'Please specify a valid book title!'
        )

        await callAndCheckError(
          createBookController.createBook,
          HttpStatusCodes.BadRequest,
          errorResult,
          testRequestBody[0]
        )
      })
    })

    describe('When it suceeds', () => {
      let testRequestBody: BookTitle[] = []
      beforeEach(() => {
        testRequestBody = BookTableUtils.generateBookTitles()
      })
      test('should return 202', async () => {
        jest.spyOn(createBookUseCase, 'createBook').mockResolvedValue()

        const actualResponse: ApiResponseParsed<unknown> = await callSuccessForRequestBody<
          unknown
        >(createBookController.createBook, testRequestBody[0])
        expect(actualResponse.statusCode).toBe(HttpStatusCodes.NoContent)
        expect(actualResponse.parsedBody).toBeEmpty()
      })
    })
  })
})
