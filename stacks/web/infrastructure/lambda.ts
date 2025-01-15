import { DataArchiveFile } from "@cdktf/provider-archive/lib/data-archive-file"
import { ArchiveProvider } from "@cdktf/provider-archive/lib/provider";
import { LambdaFunction } from "@cdktf/provider-aws/lib/lambda-function";
import { LambdaFunctionUrl } from "@cdktf/provider-aws/lib/lambda-function-url";
import { Construct } from "constructs"


export class Lambda extends Construct {
    private _lambdaFunction:LambdaFunction;
    private _lambdaFunctionUrl:LambdaFunctionUrl;
    public get lambdaFunctionUrl() {return this._lambdaFunctionUrl}
    public get lambdaFunction() {return this._lambdaFunction}

    constructor(scope: Construct, name: string, runtimePath:string, iamServiceRoleArn:any, lambdaLayersArns:string[], envVars:any, handler:string) {
        super(scope, name);
        new ArchiveProvider(this, name+"_archive_provider")
     
        const zipFileName = "my-app.zip"
        var dataArchive = new DataArchiveFile(this,name+"_webhooklambda_archive",{
        type: "zip",
        sourceDir :runtimePath,
        outputPath: zipFileName
        })

        const lambdaFunction = new LambdaFunction(this, name+"_lambda_funtion", {
            layers: lambdaLayersArns,
            functionName: "nextJsLambdaApolloTest",
            handler: handler,
            runtime: "nodejs22.x",
            filename: zipFileName,
            sourceCodeHash : dataArchive.outputBase64Sha256,
            role: iamServiceRoleArn,
            environment: {
              variables: envVars
            }
        })
        const functionUrl = new LambdaFunctionUrl(this, "test_live", {
            authorizationType: "AWS_IAM",
            cors: {
                allowCredentials: true,
                allowHeaders: ["date", "keep-alive"],
                allowMethods: ["*"],
                allowOrigins: ["*"],
                exposeHeaders: ["keep-alive", "date"],
                maxAge: 86400,
            },
            functionName: lambdaFunction.functionName,
        });
        this._lambdaFunctionUrl = functionUrl
        this._lambdaFunction = lambdaFunction
    }

}