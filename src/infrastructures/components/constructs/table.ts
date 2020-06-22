import { Construct } from '@aws-cdk/core'
import * as dynamodb from '@aws-cdk/aws-dynamodb'

export class Table extends Construct {
  readonly table: dynamodb.Table

  constructor(readonly scope: Construct, readonly id: string) {
    super(scope, id)

    this.table = new dynamodb.Table(this, 'Table', {
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      partitionKey: {
        name: 'main_pk',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'main_sk',
        type: dynamodb.AttributeType.STRING,
      },
      stream: dynamodb.StreamViewType.KEYS_ONLY,
    })
  }
}
