import { BasicBook } from '@externals/drivers/database/book-interfaces'
import { ApiResponse, ErrorResponseBody } from '@presenters/interfaces'

export interface ApiResponseParsed<T> extends ApiResponse {
  parsedBody: T
}

export interface ApiErrorResponseParsed extends ApiResponse {
  parsedBody: ErrorResponseBody
}

interface StringObject {
  [name: string]: string
}

export type PathParameter = StringObject
export type QueryParameter = StringObject
export type Headers = StringObject

export interface Keys {
  main_pk: string
  main_sk: string
}

export type BasicBookWithKeys = BasicBook & Keys
