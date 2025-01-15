import { Construct } from "constructs";
import { AwsProvider } from '@cdktf/provider-aws/lib/provider'
import { S3Backend, TerraformStack } from "cdktf";

import { Iam } from "./infrastructure/iam";
import { Lambda } from "./infrastructure/lambda";
import { CloudFront } from "./infrastructure/cloudFront";
import { LambdaPermission } from "@cdktf/provider-aws/lib/lambda-permission";
import { S3 } from "./infrastructure/s3";


export class WebStack extends TerraformStack {
  constructor(scope: Construct, name: string, backendStateS3BucketName: string, region: string, runtimePath: string) {
    super(scope, name);

    new S3Backend(this, {
        bucket: backendStateS3BucketName,
        key: name,
        region: region
    })

    new AwsProvider(this, "aws");
    
    const iam = new Iam(this, name+"_iam")
    const lambdaServiceRoleArn = iam.roles["lambdaServiceRole"].arn
    const lambdaAdapterLayerArn = "arn:aws:lambda:"+region+":753240598075:layer:LambdaAdapterLayerX86:23"
    const handler = "run.sh"
    const envVars = {
        AWS_LAMBDA_EXEC_WRAPPER: "/opt/bootstrap",
        PORT: 3000,
        NODE_ENV: "production"
    }
    
    const lambda = new Lambda(this, name+"_lambda", runtimePath,  lambdaServiceRoleArn, [lambdaAdapterLayerArn], envVars, handler)
    const domainUrl = lambda.lambdaFunctionUrl.urlId+".lambda-url."+region+".on.aws"
    const cloudFront = new CloudFront(this, name+"_cloudfront", lambda.lambdaFunction.id, domainUrl)
    
    new LambdaPermission(this, "allow_cloudwatch_only", {
        action: "lambda:InvokeFunctionUrl",
        functionName: lambda.lambdaFunction.functionName,
        principal: "cloudfront.amazonaws.com",
        sourceArn: cloudFront.cloudfrontDistribution.arn,
        statementId: "AllowCloudFrontServicePrincipal",
    });

    const assetBucket = new S3(this, name+"_s3")
    assetBucket.createAssetHostingBucket("nexyjs-app-asset-hosting-bucket", name)
  }
}