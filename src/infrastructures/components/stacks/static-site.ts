import { Stack, App, StackProps } from '@aws-cdk/core'
import { StaticSite } from '@infrastructures/components/constructs/static-site'

interface AdminStaticSiteProps extends StackProps {
  domain: string
  hostedZoneId: string
  certArn: string
}

export class AdminStaticSite extends Stack {
  readonly staticSite: StaticSite

  constructor(
    readonly scope: App,
    readonly name: string,
    readonly props: AdminStaticSiteProps
  ) {
    super(scope, name, props)

    this.staticSite = new StaticSite(this, 'StaticSite', {
      domainName: props.domain,
      hostedZoneId: props.hostedZoneId,
      certArn: props.certArn,
    })
  }
}
