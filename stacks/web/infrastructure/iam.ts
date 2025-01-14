import { IamPolicy } from "@cdktf/provider-aws/lib/iam-policy";
import { IamRole } from "@cdktf/provider-aws/lib/iam-role";
import { IamRolePolicyAttachment } from "@cdktf/provider-aws/lib/iam-role-policy-attachment";
import { Construct } from "constructs"

export class Iam extends Construct {
    private _roles: any = {}
    private _policies: any = {}

    public get roles() {return this._roles}

    constructor(scope: Construct, name: string) {
        super(scope, name);
        this._roles['lambdaServiceRole'] = new IamRole(this, name+'_lambda_service_role', {
            name: name+'-lambda_service_role' ,
            path: "/",
            assumeRolePolicy: JSON.stringify({
                Version: "2012-10-17",
                Statement: [
                    {
                        Effect: "Allow",
                        Principal: {
                            Service: ["lambda.amazonaws.com", "edgelambda.amazonaws.com"]
                        },
                        Action: ["sts:AssumeRole"],
                    }
                ]
            }),
            tags: {
                name: name
            }
        })
        
        this._policies['lambdaPolicy'] = new IamPolicy(this, name+'_lambda_policy', {
            name: name+'_lambda_policy',
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
                name: name
            }
        });
    
        new IamRolePolicyAttachment(this,  name+'_lambda_policy_attachment', {
            role: this._roles['lambdaServiceRole'].name as string,
            policyArn: this._policies['lambdaPolicy'].arn
        });
    }
}