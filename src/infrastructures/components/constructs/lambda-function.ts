import { Construct, RemovalPolicy } from '@aws-cdk/core'
import * as lambda from '@aws-cdk/aws-lambda'
import * as logs from '@aws-cdk/aws-logs'
import * as apigatewayv2 from '@aws-cdk/aws-apigatewayv2'

export class LambdaFunction extends Construct {
  readonly lambdaFunction: lambda.Function

  constructor(
    readonly scope: Construct,
    readonly id: string,
    readonly props: lambda.FunctionProps & logs.LogGroupProps
  ) {
    super(scope, id)

    this.lambdaFunction = new lambda.Function(this, 'Lambda', props)
    new logs.LogGroup(this, 'LogGroup', {
      logGroupName: `/aws/lambda/${this.lambdaFunction.functionName}`,
      retention: props.retention || 14,
      removalPolicy: RemovalPolicy.DESTROY,
    })
  }

  toLambdaProxyIntegration(
    lambdaFunction: LambdaFunction
  ): apigatewayv2.LambdaProxyIntegration {
    return new apigatewayv2.LambdaProxyIntegration({
      handler: lambdaFunction.lambdaFunction,
    })
  }
}
