import { Stack, App, StackProps } from '@aws-cdk/core'
import { ValidatorConstruct } from '@infrastructures/components/constructs/validator'

interface SSLTLSCertsStackProps extends StackProps {
  domain: string
  hostedZoneId: string
}

export class SSLTLSCertsStack extends Stack {
  readonly staticSiteCert: ValidatorConstruct
  readonly apiCert: ValidatorConstruct

  constructor(
    readonly scope: App,
    readonly name: string,
    readonly props: SSLTLSCertsStackProps
  ) {
    super(scope, name, props)

    this.staticSiteCert = new ValidatorConstruct(this, 'StaticSiteCert', {
      domainName: `app.${props.domain}`,
      hostedZoneId: props.hostedZoneId,
      region: 'us-east-1',
    })

    this.apiCert = new ValidatorConstruct(this, 'ApiCert', {
      domainName: `api.${props.domain}`,
      hostedZoneId: props.hostedZoneId,
    })
  }
}
