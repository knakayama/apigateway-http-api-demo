import { Construct, CfnOutput } from '@aws-cdk/core'
import * as route53 from '@aws-cdk/aws-route53'
import * as alias from '@aws-cdk/aws-route53-targets'
import * as s3 from '@aws-cdk/aws-s3'
import * as cloudfront from '@aws-cdk/aws-cloudfront'

interface StaticSiteProps {
  domainName: string
  hostedZoneId: string
  certArn: string
}

export class StaticSite extends Construct {
  readonly bucket: s3.Bucket
  readonly distribution: cloudfront.CloudFrontWebDistribution

  constructor(
    readonly scope: Construct,
    readonly id: string,
    readonly props: StaticSiteProps
  ) {
    super(scope, id)

    const hostedZone: route53.IHostedZone = route53.HostedZone.fromHostedZoneAttributes(
      this,
      'HostedZone',
      {
        hostedZoneId: props.hostedZoneId,
        zoneName: props.domainName,
      }
    )
    const loggingBucket: s3.Bucket = new s3.Bucket(this, 'LoggingBucket')

    const oas = new cloudfront.OriginAccessIdentity(this, 'OAS', {
      comment: this.id,
    })
    this.bucket = new s3.Bucket(this, 'Bucket')

    new CfnOutput(this, 'BucketName', { value: this.bucket.bucketName })

    this.distribution = new cloudfront.CloudFrontWebDistribution(
      this,
      'Distribution',
      {
        aliasConfiguration: {
          acmCertRef: props.certArn,
          names: [hostedZone.zoneName],
          sslMethod: cloudfront.SSLMethod.SNI,
          securityPolicy: cloudfront.SecurityPolicyProtocol.TLS_V1_1_2016,
        },
        originConfigs: [
          {
            s3OriginSource: {
              s3BucketSource: this.bucket,
              originAccessIdentity: oas,
            },
            behaviors: [
              {
                isDefaultBehavior: true,
                forwardedValues: {
                  queryString: true,
                  cookies: {
                    forward: 'all',
                  },
                  headers: [
                    'Origin',
                    'Access-Control-Request-Headers',
                    'Access-Control-Request-Method',
                  ],
                },
                allowedMethods: cloudfront.CloudFrontAllowedMethods.ALL,
              },
            ],
          },
        ],
        loggingConfig: {
          includeCookies: true,
          bucket: loggingBucket,
        },
        defaultRootObject: 'index.html',
        priceClass: cloudfront.PriceClass.PRICE_CLASS_200,
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.HTTPS_ONLY,
        errorConfigurations: [
          {
            errorCode: 404,
            errorCachingMinTtl: 0,
            responseCode: 200,
            responsePagePath: '/index.html',
          },
          {
            errorCode: 403,
            errorCachingMinTtl: 0,
            responseCode: 200,
            responsePagePath: '/index.html',
          },
        ],
      }
    )

    new route53.ARecord(this, 'AliasRecord', {
      recordName: hostedZone.zoneName,
      target: route53.AddressRecordTarget.fromAlias(
        new alias.CloudFrontTarget(this.distribution)
      ),
      zone: hostedZone,
    })
  }
}
