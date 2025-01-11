import { Construct } from "constructs";
import { App, TerraformStack } from "cdktf";
import { DataArchiveFile } from "@cdktf/provider-archive/lib/data-archive-file";
import { join } from "path";
import { LambdaFunction } from "@cdktf/provider-aws/lib/lambda-function";
import { IamRole } from "@cdktf/provider-aws/lib/iam-role";
import { IamPolicy } from "@cdktf/provider-aws/lib/iam-policy";
import { IamRolePolicyAttachment } from "@cdktf/provider-aws/lib/iam-role-policy-attachment";
import { AwsProvider } from '@cdktf/provider-aws/lib/provider'

// lambda.ts
import { ArchiveProvider } from "@cdktf/provider-archive/lib/provider"

class MyStack extends TerraformStack {
  constructor(scope: Construct, id: string) {
    super(scope, id);
    new AwsProvider(this, "aws");

    //lambda 
    new ArchiveProvider(this, id+"_archive_provider")
    const role = this.lambdaServiceRole(id);
    this.CreateLambda(id, "my-app", id, role.arn);
  }
    // define resources here
  

  /* iam.ts */

  private _roles: any = {}
  private _policies: any = {}
  public lambdaServiceRole(stackName:string){
    this._roles['lambdaServiceRole'] = new IamRole(this, stackName+'_lambda_generic_service_role', {
      name: stackName+'-lambda_generic_service_role' ,
      path: "/",
      assumeRolePolicy: JSON.stringify({
          Version: "2012-10-17",
          Statement: [{
              Effect: "Allow",
              Principal: {
                  Service: ["lambda.amazonaws.com", "edgelambda.amazonaws.com"]
              },
              Action: ["sts:AssumeRole"],
          }]
      }),
      tags: {
          name: stackName
      }
    })
  
    this._policies['lambdaPolicy'] = new IamPolicy(this, stackName+'_lambda_policy', {
      name: stackName+'_lambda_policy',
      policy: JSON.stringify({
          Version: "2012-10-17",
          Statement: [{
              Effect: "Allow",
              Action: [
                  "logs:CreateLogGroup",
                  "logs:CreateLogStream",
                  "logs:PutLogEvents",
                  'states:StartSyncExecution',
                  'states:StartExecution',
                  'dynamodb:GetItem',
                  'dynamodb:Query'
              ],
              Resource: "*"
          }]
      }),
      tags: {
          name: stackName
      }
    });
  
    new IamRolePolicyAttachment(this,  stackName+'-lambda', {
      role: this._roles['lambdaServiceRole'].name as string,
      policyArn: this._policies['lambdaPolicy'].arn
    });

    return this._roles['lambdaServiceRole']
  }



  /* lambda.ts */

  public CreateLambda(stackName:string, dirName:string, name: string, iamServiceRoleArn:any): any {
    const zipFileName = "my-app.zip"
    var dataArchive = new DataArchiveFile(this,name+"_webhooklambda_archive",{
      type: "zip",
      sourceDir : join(__dirname, dirName),
      outputPath: zipFileName
    })
    
    new LambdaFunction(this, stackName+"-"+name, {
      functionName: "nextJsLambdaApolloTest",
      handler: "app.lambda_handler",
      runtime: "python3.8",
      filename: zipFileName,
      sourceCodeHash : dataArchive.outputBase64Sha256,
      role: iamServiceRoleArn,
    })
  }
}



const app = new App();
new MyStack(app, "nextJsLambdaApolloTest");
app.synth();
