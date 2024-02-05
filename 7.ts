import { Construct } from "constructs";
import { TerraformOutput, TerraformStack } from "cdktf";
import { AwsProvider } from "@cdktf/aws-cdk/lib/aws/provider";

import {
  DEPLOYMENT_REGION,
  DEPLOYMENT_PREFIX,
  EXPORTED_ASSETS_DIR,
  DYNAMODB_BILLING_MODE,
} from "../../awsConfig";

import * as fs from "fs";

import { IamRole } from "@cdktf/aws-cdk/lib/aws/iam-role";
import { IamPolicyAttachment } from "@cdktf/aws-cdk/lib/aws/iam-policy-attachment";
import { IamPolicy } from "@cdktf/aws-cdk/lib/aws/iam-policy";

import { DynamodbTable } from "@cdktf/aws-cdk/lib/aws/dynamodb-table";

import { AppsyncGraphqlApi } from "@cdktf/aws-cdk/lib/aws/appsync-graphql-api";
import { AppsyncDatasource } from "@cdktf/aws-cdk/lib/aws/appsync-datasource";
import { AppsyncFunction } from "@cdktf/aws-cdk/lib/aws/appsync-function";
import { AppsyncResolver } from "@cdktf/aws-cdk/lib/aws/appsync-resolver";

export class AppSyncStack extends TerraformStack {
  refs: { [key: string]: any } = {};
  api: any = null;
  role: any = null;
  table: any = null;
  dataSource: any = null;

  constructor(scope: Construct, name: string) {
    super(scope, name);

    // Construct the AWS Provider - this is updated in the awsConfig.ts file
    // @ahmed: Why is this needed?
    new AwsProvider(this, "AwsConfig", { region: DEPLOYMENT_REGION });

    // Construct the AppSync API based on the Schema file
    this.api = new AppsyncGraphqlApi(this, `${DEPLOYMENT_PREFIX}GraphqlApi`, {
      name: `${DEPLOYMENT_PREFIX}GraphqlApi`,
      authenticationType: "API_KEY",
      schema: fs.readFileSync(
        `${EXPORTED_ASSETS_DIR}/amplify-appsync-files/schema.graphql`,
        "utf8"
      ),
    });

    // @ahmed: Don't you want to save it to a constant? how are you using it?
    new TerraformOutput(this, `${this.api}Output`, {
      value: this.api.id,
    });

    const stackName = "User";
    const cfn = JSON.parse(
      fs.readFileSync(
        `${EXPORTED_ASSETS_DIR}/amplify-appsync-files/stacks/${stackName}.json`,
        "utf8"
      )
    );

    const policies: any = {};
    const functions: any = {};
    const resolvers: any = {};

    for (const [key, res] of Object.entries(cfn.Resources) as [string, any]) {
      const type = (res as any).Type.split("::").pop();

      if (type === "Table")
        this.table = this.createTFTable(key, res.Properties);
      else if (type === "Role")
        this.role = this.createTFRole(key, res.Properties);
      else if (type === "Policy") policies[key] = res;
      else if (type === "FunctionConfiguration") functions[key] = res;
      else if (type === "Resolver") resolvers[key] = res;
    }

    // @ahmed: where are you using this?
    new TerraformOutput(this, `${stackName}TableArn`, {
      value: this.table.arn,
    });

    for (const [key, policy] of Object.entries(policies) as [string, any]) {
      this.refs[key] = this.createTFPolicy(key, policy.Properties, [
        this.table.arn,
        `${this.table.arn}/*`,
      ]);

      new IamPolicyAttachment(this, `${DEPLOYMENT_PREFIX}${key}Attachment`, {
        name: `${DEPLOYMENT_PREFIX}${key}Attachment`,
        policyArn: this.refs[key].arn,
        roles: [this.role.name],
      });
    }

    // @ahmed same question as other outputs here
    new TerraformOutput(this, "iamRoleArn", {
      value: this.role.arn,
    });

    this.dataSource = new AppsyncDatasource(
      this,
      `${DEPLOYMENT_PREFIX}${stackName}DataSource`,
      {
        name: `${DEPLOYMENT_PREFIX}${stackName}DataSource`,
        apiId: this.api.id,
        serviceRoleArn: this.role.arn,
        type: "AMAZON_DYNAMODB",
        dynamodbConfig: { tableName: this.table.name },
      }
    );

    for (const [key, fn] of Object.entries(functions) as [string, any]) {
      this.refs[key] = this.createTFFunction(fn.Properties);
    }

    for (const [key, resolver] of Object.entries(resolvers) as [string, any]) {
      this.createTFResolver(key, resolver.Properties);
    }
  }

  createTFResolver(key: string, props: any): any {
    const functions = props.PipelineConfig.Functions.map(
      (fn: any) => this.refs[fn["Fn::GetAtt"][0]].functionId
    );

    return new AppsyncResolver(this, `${DEPLOYMENT_PREFIX}${key}`, {
      apiId: this.api.id,
      type: props.TypeName,
      field: props.FieldName,
      kind: props.Kind,
      requestTemplate: this.mapRequestVtl(props.RequestMappingTemplate),
      responseTemplate: props.ResponseMappingTemplate,
      pipelineConfig: { functions: functions },
    });
  }

  createTFFunction(props: any): any {
    return new AppsyncFunction(this, `${DEPLOYMENT_PREFIX}${props.Name}`, {
      apiId: this.api.id,
      dataSource: this.dataSource.name,
      name: props.Name,
      requestMappingTemplate: this.getRequestVtl(props),
      responseMappingTemplate: this.getResponseVtl(props),
    });
  }

  mapRequestVtl(template: any): string {
    template = template["Fn::Join"][1];
    const dataSourceType = /(?<="dataSourceType",\s")[^"]*/g.exec(
      template[0]
    )[0];
    template[1] = this.api.id;

    let offset = 0;
    if (dataSourceType !== "NONE") {
      template[3] = this.table.name;
      offset = 2;
    }

    // TODO: declare top level config
    template[3 + offset] = "ACCOUNT_ID_CONFIG";
    template[5 + offset] = "KOMMENT_ROLE_NAME_CONFIG";

    template = template.join("").split("\n");
    template.splice(-2, 1);
    return template.join("\n");
  }

  getRequestVtl(props: any): string {
    const path = props.RequestMappingTemplateS3Location["Fn::Join"][1].pop();
    const content = fs.readFileSync(
      `${EXPORTED_ASSETS_DIR}/amplify-appsync-files/${path}`,
      "utf8"
    );
    return this._escape(content);
  }

  getResponseVtl(props: any): string {
    const isEmbedded = props.hasOwnProperty("ResponseMappingTemplate");
    if (isEmbedded) return this._escape(props.ResponseMappingTemplate);

    const path = props.ResponseMappingTemplateS3Location["Fn::Join"][1].pop();
    const content = fs.readFileSync(
      `${EXPORTED_ASSETS_DIR}/amplify-appsync-files${path}`,
      "utf8"
    );
    return this._escape(content);
  }

  createTFTable(key: string, props: any): any {
    return new DynamodbTable(this, `${DEPLOYMENT_PREFIX}${key}`, {
      name: `${DEPLOYMENT_PREFIX}${key}`,
      hashKey: props.KeySchema[0].AttributeName,

      attribute: props.AttributeDefinitions.map(
        (attr: { AttributeName: any; AttributeType: any }) => ({
          name: attr.AttributeName,
          type: attr.AttributeType,
        })
      ),
      billingMode: DYNAMODB_BILLING_MODE,
    });
  }

  createTFRole(key: string, props: any): IamRole {
    return new IamRole(this, `${DEPLOYMENT_PREFIX}${key}`, {
      name: `${DEPLOYMENT_PREFIX}${key}`,
      assumeRolePolicy: JSON.stringify(props.AssumeRolePolicyDocument),
    });
  }

  createTFPolicy(key: string, props: any, resources: string[]): IamPolicy {
    const policyDocument = props.PolicyDocument;
    policyDocument.Statement[0].Resource = resources;

    console.log(JSON.stringify(policyDocument));

    return new IamPolicy(this, `${DEPLOYMENT_PREFIX}${key}`, {
      name: `${DEPLOYMENT_PREFIX}${key}`,
      policy: JSON.stringify(policyDocument),
    });
  }

  _escape(str: string): string {
    return str.replace(/\$\{/g, "$$${");
  }
}
