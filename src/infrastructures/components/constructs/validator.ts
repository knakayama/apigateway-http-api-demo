import { Construct, Stack } from '@aws-cdk/core'
import * as route53 from '@aws-cdk/aws-route53'
import * as acm from '@aws-cdk/aws-certificatemanager'

interface ValidatorConstructProps {
  domainName: string
  hostedZoneId: string
  region?: string
}

export class ValidatorConstruct extends Construct {
  readonly hostedZone: route53.IHostedZone
  readonly dnsValidatedCert: acm.DnsValidatedCertificate

  constructor(
    readonly scope: Construct,
    readonly id: string,
    readonly props: ValidatorConstructProps
  ) {
    super(scope, id)

    this.hostedZone = route53.HostedZone.fromHostedZoneAttributes(
      this,
      'HostedZone',
      {
        hostedZoneId: props.hostedZoneId,
        zoneName: props.domainName,
      }
    )

    this.dnsValidatedCert = new acm.DnsValidatedCertificate(
      this,
      'DnsValidatedCert',
      {
        domainName: this.hostedZone.zoneName,
        hostedZone: this.hostedZone,
        region: props.region || Stack.of(this).region,
        subjectAlternativeNames: [`*.${this.hostedZone.zoneName}`],
      }
    )
  }
}
