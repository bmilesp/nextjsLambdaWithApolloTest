import { App } from "cdktf";
import { WebStack } from "./stacks/web/webStack";
import { TFStateBackupStack } from "./stacks/tfStateBackup/TFStateBackupStack";
import { join } from "path";

const defaultRegion = "us-east-2";
const tfStatebucketName = "nextjs-lambda-apollo-test-tf-state-backup-bucket"

const app = new App();

new TFStateBackupStack(
  app,
  "tfStateBackupStack",
  tfStatebucketName,
  defaultRegion,
  true
);

new WebStack(
  app, 
  "nextJsLambdaApolloTest", 
  tfStatebucketName, 
  defaultRegion,
   join(__dirname, "./my-app/.next/standalone")
);

app.synth();
