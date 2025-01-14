import { CloudfrontDistribution } from "@cdktf/provider-aws/lib/cloudfront-distribution";
import { CloudfrontOriginAccessControl } from "@cdktf/provider-aws/lib/cloudfront-origin-access-control";
import { Construct } from "constructs"

export class CloudFront extends Construct {
    private _cloudFrontDistribution: CloudfrontDistribution
    public get cloudfrontDistribution() {return this._cloudFrontDistribution}

    constructor(scope: Construct, name: string, originId:string, domainName:string) {
        super(scope, name);
        const originAccessControl = new CloudfrontOriginAccessControl(this, "LambdaOriginAccessControl", {
            name: "lambdaOriginAccessControl",
            originAccessControlOriginType: "lambda",
            signingBehavior: "always",
            signingProtocol: "sigv4",
        });

        this._cloudFrontDistribution = new CloudfrontDistribution(this, name+"_cloudfront", {
            enabled : true,
            origin: [{
                originAccessControlId: originAccessControl.id,
                originId: originId, 
                domainName: domainName,
                customOriginConfig: {
                    httpPort: 80,
                    httpsPort: 443,
                    originProtocolPolicy: "http-only",
                    originSslProtocols:["TLSv1.2"]
                }
            }],
            defaultCacheBehavior: {
                allowedMethods: ["GET", "HEAD"],
                cachedMethods: ["GET", "HEAD"],
                targetOriginId: originId,
                forwardedValues: {
                    queryString : true,
                    cookies: {
                        forward:"none"
                    }
                },
                viewerProtocolPolicy: "redirect-to-https"
            },
            restrictions: {
                geoRestriction: {
                    restrictionType: "none"
                }
            },
            viewerCertificate: {
                cloudfrontDefaultCertificate: true
            },
        })
    }
}