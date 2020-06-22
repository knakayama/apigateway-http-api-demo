import { Construct, Duration } from '@aws-cdk/core'
import { LambdaFunction } from '@infrastructures/components/constructs/lambda-function'
import * as path from 'path'
import * as lambda from '@aws-cdk/aws-lambda'
import * as dynamodb from '@aws-cdk/aws-dynamodb'
import * as acm from '@aws-cdk/aws-certificatemanager'
import * as apigatewayv2 from '@aws-cdk/aws-apigatewayv2'

interface DemoApi {
  stageName: string
  table: dynamodb.Table
  allowedOrigin: string
  cert: acm.Certificate
  domain: string
  hostedZoneId: string
}

export class ApiConstruct extends Construct {
  constructor(
    readonly scope: Construct,
    readonly id: string,
    readonly props: DemoApi
  ) {
    super(scope, id)

    const pathToDist = '../../../../dist'

    const listBooks = new LambdaFunction(this, 'ListBooks', {
      code: lambda.Code.asset(path.join(__dirname, `${pathToDist}/list-books`)),
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: 'index.listBooks',
      environment: {
        BOOK_TABLE: props.table.tableName,
        ALLOWED_ORIGIN: props.allowedOrigin,
      },
    })
    props.table.grantReadData(listBooks.lambdaFunction)

    const createBook = new LambdaFunction(this, 'createBook', {
      code: lambda.Code.asset(
        path.join(__dirname, `${pathToDist}/create-book`)
      ),
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: 'index.createBook',
      environment: {
        BOOK_TABLE: props.table.tableName,
        ALLOWED_ORIGIN: props.allowedOrigin,
      },
    })
    props.table.grantWriteData(createBook.lambdaFunction)

    const updateBook = new LambdaFunction(this, 'updateBook', {
      code: lambda.Code.asset(
        path.join(__dirname, `${pathToDist}/update-book`)
      ),
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: 'index.updateBook',
      environment: {
        BOOK_TABLE: props.table.tableName,
        ALLOWED_ORIGIN: props.allowedOrigin,
      },
    })
    props.table.grantReadWriteData(updateBook.lambdaFunction)

    const deleteBook = new LambdaFunction(this, 'deleteBook', {
      code: lambda.Code.asset(
        path.join(__dirname, `${pathToDist}/delete-book`)
      ),
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: 'index.deleteBook',
      environment: {
        BOOK_TABLE: props.table.tableName,
        ALLOWED_ORIGIN: props.allowedOrigin,
      },
    })
    props.table.grantReadWriteData(deleteBook.lambdaFunction)

    const detailBook = new LambdaFunction(this, 'detailBook', {
      code: lambda.Code.asset(
        path.join(__dirname, `${pathToDist}/detail-book`)
      ),
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: 'index.detailBook',
      environment: {
        BOOK_TABLE: props.table.tableName,
        ALLOWED_ORIGIN: props.allowedOrigin,
      },
    })
    props.table.grantReadWriteData(detailBook.lambdaFunction)

    const api = new apigatewayv2.HttpApi(this, 'HttpApi', {
      corsPreflight: {
        allowCredentials: props.allowedOrigin === '*' ? false : true,
        allowHeaders: ['Authorization'],
        allowMethods: [
          apigatewayv2.HttpMethod.GET,
          apigatewayv2.HttpMethod.HEAD,
          apigatewayv2.HttpMethod.OPTIONS,
          apigatewayv2.HttpMethod.POST,
          apigatewayv2.HttpMethod.PATCH,
          apigatewayv2.HttpMethod.PUT,
        ],
        allowOrigins: [props.allowedOrigin],
        maxAge: Duration.days(10),
      },
    })

    api.addRoutes({
      path: '/books',
      methods: [apigatewayv2.HttpMethod.GET],
      integration: new apigatewayv2.LambdaProxyIntegration({
        handler: listBooks.lambdaFunction,
      }),
    })

    api.addRoutes({
      path: '/books',
      methods: [apigatewayv2.HttpMethod.POST],
      integration: new apigatewayv2.LambdaProxyIntegration({
        handler: createBook.lambdaFunction,
      }),
    })

    api.addRoutes({
      path: '/books/{book_id}',
      methods: [apigatewayv2.HttpMethod.PATCH],
      integration: new apigatewayv2.LambdaProxyIntegration({
        handler: updateBook.lambdaFunction,
      }),
    })

    api.addRoutes({
      path: '/books/{book_id}',
      methods: [apigatewayv2.HttpMethod.DELETE],
      integration: new apigatewayv2.LambdaProxyIntegration({
        handler: deleteBook.lambdaFunction,
      }),
    })

    api.addRoutes({
      path: '/books/{book_id}',
      methods: [apigatewayv2.HttpMethod.GET],
      integration: new apigatewayv2.LambdaProxyIntegration({
        handler: detailBook.lambdaFunction,
      }),
    })

    const httpApiStage = api.addStage('HttpApiStage', {
      autoDeploy: true,
      stageName: props.stageName,
    })

    const httpApiDomainName = new apigatewayv2.CfnDomainName(
      this,
      'HttpApiDomainName',
      {
        domainName: props.domain,
        domainNameConfigurations: [
          {
            certificateArn: props.cert.certificateArn,
            endpointType: 'REGIONAL',
          },
        ],
      }
    )
    new apigatewayv2.CfnApiMapping(this, 'HttpApiMapping', {
      apiId: api.httpApiId,
      domainName: httpApiDomainName.domainName,
      stage: httpApiStage.stageName,
      apiMappingKey: httpApiStage.stageName,
    })

    // TODO: not compatible yet
    //const hostedZone = route53.HostedZone.fromHostedZoneAttributes(
    //  this,
    //  'HostedZone',
    //  {
    //    hostedZoneId: props.hostedZoneId,
    //    zoneName: props.adminDomain
    //  }
    //)

    //new route53.ARecord(this, 'AliasRecord', {
    //  recordName: 'api',
    //  zone: hostedZone,
    //  target: route53.AddressRecordTarget.fromAlias(
    //    new alias.ApiGatewayDomain(apiDomain)
    //  )
    //})
  }
}
