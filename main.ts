import { App } from "cdktf";
import { WebStack } from "./stacks/web/webStack";
import { TFStateStack } from "./stacks/tfState/TFStateStack";
import { join } from "path";

const defaultRegion = "us-east-2";
const tfStatebucketName = "nextjs-lambda-apollo-test-tf-state-bucket"

const app = new App();

new TFStateStack(
  app,
  "tfStateStack",
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
