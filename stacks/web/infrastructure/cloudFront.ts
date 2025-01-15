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
                originRequestPolicyId: "b689b0a8-53d0-40ab-baf2-68738e2966ac", // https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/using-managed-origin-request-policies.html
                cachePolicyId: "4135ea2d-6df8-44a3-9df3-4b5a84be39ad", // https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/using-managed-cache-policies.html
                allowedMethods: ["HEAD", "DELETE", "POST", "GET", "OPTIONS", "PUT", "PATCH"],
                cachedMethods: ["GET", "HEAD"],
                targetOriginId: originId,
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