import { App, Construct } from '@aws-cdk/core'

export class ContextUtils {
  static getContext(cdkCore: App | Construct, key: string): string {
    const awsEnv: string = cdkCore.node.tryGetContext('awsEnv')
    return cdkCore.node.tryGetContext(awsEnv)[key]
  }

  static getCommonContext(cdkCore: App | Construct, key: string): string {
    return cdkCore.node.tryGetContext(key)
  }

  static getAwsEnv(cdkCore: App | Construct): string {
    return cdkCore.node.tryGetContext('awsEnv')
  }
}
