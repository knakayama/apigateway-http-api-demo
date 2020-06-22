import { DynamoDB } from 'aws-sdk'
import { ServiceConfigurationOptions } from 'aws-sdk/lib/service'
import * as fs from 'fs'
import * as path from 'path'

const dynamoDBLocalConfigs: ServiceConfigurationOptions &
  DynamoDB.ClientApiVersions = {
  apiVersion: '2012-08-10',
  endpoint: 'http://localhost:4566',
  region: 'ap-northeast-1',
}

export class DynamoDBUtils {
  static dynamoDB: DynamoDB = new DynamoDB(dynamoDBLocalConfigs)

  static dynamoDBD: DynamoDB.DocumentClient = new DynamoDB.DocumentClient(
    dynamoDBLocalConfigs
  )

  static async createTable(tableName: string): Promise<void> {
    const fixturePath: string = path.join(
      __dirname,
      `../fixtures/tables/${tableName}.json`
    )
    const param: DynamoDB.CreateTableInput = JSON.parse(
      fs.readFileSync(fixturePath).toString()
    )
    await this.dynamoDB.createTable(param).promise()
  }

  static async deleteTable(tableName: string): Promise<void> {
    const param: DynamoDB.DeleteTableInput = {
      TableName: tableName,
    }
    await this.dynamoDB.deleteTable(param).promise()
  }
}
