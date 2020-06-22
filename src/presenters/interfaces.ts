import { ErrorResult } from '@presenters/errors'
import {
  APIGatewayEvent,
  Context,
  ProxyCallback,
  ProxyResult,
} from 'aws-lambda'

export type ApiCallback = ProxyCallback
export type ApiEvent = APIGatewayEvent
export type ApiContext = Context
export type ApiHandler = (
  event: APIGatewayEvent,
  context: Context,
  callback: ApiCallback
) => void
export type ApiResponse = ProxyResult

export interface ErrorResponseBody {
  error: ErrorResult
}
