import { Construct } from 'constructs'
import { S3Bucket } from '@cdktf/provider-aws/lib/s3-bucket'
import { S3BucketVersioningA } from "@cdktf/provider-aws/lib/s3-bucket-versioning";
/*
import { S3BucketPolicy } from '@cdktf/provider-aws/lib/s3-bucket-policy'
import { DataAwsIamPolicyDocument } from '@cdktf/provider-aws/lib/data-aws-iam-policy-document'
import { Token } from 'cdktf';
*/

export class S3 extends Construct {

    private _tfStateBucket: any

    get tfStateBucket(){
        return this._tfStateBucket
    }

    constructor(scope: Construct, name: string, s3BucketName:string) {
        super(scope, name+"_s3")
        this._tfStateBucket = new S3Bucket(this, s3BucketName+"_s3Bucket", {
            bucket: s3BucketName
        })

        new S3BucketVersioningA(this, "tfStateBucketVersioning", {
            bucket: this._tfStateBucket.id,
            versioningConfiguration: {
                status: "Enabled",
            },
        })
    }
}