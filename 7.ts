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

/**
* @description This constructor function initiates the construction of an AWS
* cloudformation stack for AppSync API with graphql schema and resolvers. It creates
* various resources like DynamoDB table and IAM role/policy attachments and output
* them to be used by other resources.
* 
* Note: Responses are limited to less than 100 words and answer directly starting
* with a verb. Here the first verb is "constructs".
* 
* @param { Construct } scope - The scope parameter is passed to the super constructor
* of the AWS provider when creating a new AppSync API. It is not used or modified
* within the given implementation. Therefore scope has no effect on the constructors
* functionality and can be removed without changing how it operates
* 
* @param { string } name - The name parameter is passed to the super() constructor
* and sets the scope and name of the Constructor.
*/
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

/**
* @description The function creates an AppsyncResolver object for a specific GraphQL
* API key. It takes a map of PipelineConfig Functions and returns the constructed
* AppsyncResolver with the correct API ID.
* 
* @param { string } key - No problem. Here is the answer to your question about the
* 'key' parameter.
* 
* The key parameter sets the identifier that will be attached to an AWS AppSync
* resolver object for a schema customization. It can accept a string value.
* 
* @param { any } props - The `props` input parameter passes property bag values to
* the resolver constructors as named functions within the container that reference
* each property of an AppSync type
* 
* @returns { any } Function resolver for AppSync type-field. Input parameters are:
* key string and object prop that has 7 properties each. It creates a new Appsync
* Resolver with eight setter-method arguments and no returns from inside. This returns
* AppSyncResolver
*/
  createTFResolver(key: string, props: any): any {
/**
* @description It calls Function['getAtt'](); it gets an att and maps the functions.
* 
* @param { any } fn - MAPS THE FUNCTION TO BE APPLIED TO EACH FUNCTION IN THE PIPELINE.
*/
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

/**
* @description Create an AppSync function.
* 
* @param { any } props - PROPS PASSED TO THE FUNCTION CONTAIN INFORMATION SUCH AS
* API_ID AND DATA_SOURCE.
* 
* @returns { any } creates an AppSyncFunction object.
*/
  createTFFunction(props: any): any {
    return new AppsyncFunction(this, `${DEPLOYMENT_PREFIX}${props.Name}`, {
      apiId: this.api.id,
      dataSource: this.dataSource.name,
      name: props.Name,
      requestMappingTemplate: this.getRequestVtl(props),
      responseMappingTemplate: this.getResponseVtl(props),
    });
  }

/**
* @description Modifies a VTL template by injecting config data into the template
* and returns the modified template as a string. The config data is determined based
* on the value of a variable 'dataSourceType'.
* 
* @param { any } template - The `template` input parameter receives a JSON object
* that will be rendered by the `template` engine as a string of joined-together VTL
* snippets.
* 
* @returns { string } Here's the description:
* 
* This method takes an argument template as an object and returns a string of VTL
* (Velocity Template Language) code after manipulating it to suit the specific requirements.
*/
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

/**
* @description The getRequestVtl() function reads a file synchronously and returns
* its content as a string after escaping special characters.
* 
* @param { any } props - Here is the answer to your question:
* 
* The props input parameter provides mapping templates S3 location path and contents
* for the GET request VTL file processing.
* 
* @returns { string } The output of this function is a string obtained from reading
* a file synchronously using `fs.readFileSync()`. The file path and content are
* obtained from template interpolation.
*/
  getRequestVtl(props: any): string {
    const path = props.RequestMappingTemplateS3Location["Fn::Join"][1].pop();
    const content = fs.readFileSync(
      `${EXPORTED_ASSETS_DIR}/amplify-appsync-files/${path}`,
      "utf8"
    );
    return this._escape(content);
  }

/**
* @description Generates a response VTL by first checking if an input prop is defined
* for ResponseMappingTemplate. If it is it simply returns the escaped contents of
* that template string. otherwise it checks another prop ResponseMappingTemplateS3Location
* and the reads  files sync from there joins path using Fn:Join array with path being
* second index (at index[1].pop()). After joining it escapes that file content using
* _escape function
* 
* @param { any } props - props provides property values to the template and may
* contain a ResponseMappingTemplate for an embedded resource
* 
* @returns { string } The function getResponseVtl takes an object of props as input
* and returns a string of escaped content.
*/
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

/**
* @description Creating a Dynamodb table: The given function produces a DynamoDB
* table object.
* It accepts key and properties as inputs and uses them to construct a new table
* with the specified name and hashKey attribute definitions using DYNAMODB_BILLING_MODE.
* 
* @param { string } key - Here's the answer to your request:
* 
* key: Provides the name of a DynamoDB table with attribute values
* 
* @param { any } props - No problem at all - here's your answer:
* 
* Props provides the necessary key and schema definitions.
* 
* @returns { any } The output of this function is an instance of the DynamodbTable
* class with name ${DEPLOYMENT_PREFIX}${key}, hashKey attributes key schema[0].attributeName
* and attributes representing the attributeDefinitions of the input schema.
*/
  createTFTable(key: string, props: any): any {
    return new DynamodbTable(this, `${DEPLOYMENT_PREFIX}${key}`, {
      name: `${DEPLOYMENT_PREFIX}${key}`,
      hashKey: props.KeySchema[0].AttributeName,

/**
* @description Function transforms {object}(({attr}{:obj)} ) to {{name(string),type(string)}}
* object
* 
* @param { any } attr - The `attr` input parameter is a part of an array of attribute
* definitions that get processed by the function.
*/
      attribute: props.AttributeDefinitions.map(
        (attr: { AttributeName: any; AttributeType: any }) => ({
          name: attr.AttributeName,
          type: attr.AttributeType,
        })
      ),
      billingMode: DYNAMODB_BILLING_MODE,
    });
  }

/**
* @description Create an IamRole object from a key string and properties object
* containing an assumeRolePolicy document as a json-string.
* 
* @param { string } key - The key input parameter assigns a name to the newly created
* IAM Role.
* 
* @param { any } props - Accepts an object whose properties are used to define a
* JSON document representing an IAM policy.
* 
* @returns { IamRole } Creates an IamRole object with name and assume role policy.
*/
  createTFRole(key: string, props: any): IamRole {
    return new IamRole(this, `${DEPLOYMENT_PREFIX}${key}`, {
      name: `${DEPLOYMENT_PREFIX}${key}`,
      assumeRolePolicy: JSON.stringify(props.AssumeRolePolicyDocument),
    });
  }

/**
* @description createTFPolicy takes a string key parameter and two object parameters
* with an array of strings (resource) and an object with properties like PolicyDocument
* and prefix string parameters that defines IAM policies to deploy. This function
* consoles logs a JSON.stringfied version of the policy document created from these
* parameters. Then returns new IAMPolicy instances defining deployment name and an
* exact JSON representation as passed of the updated policy document.
* 
* @param { string } key - Okay. The `key` input parameter provides a unique identifier
* for the IAM policy being created. It is used as part of the name of the IAM resource
* being created and included within the JSON stringification of the policy document.
* 
* @param { any } props - props contain PolicyDocument information.
* 
* @param { string[] } resources - Resources specified as an input are used to set
* the value of statement objects’ ‘resource’ field.
* 
* @returns { IamPolicy } The output is an IamPolicy object.
*/
  createTFPolicy(key: string, props: any, resources: string[]): IamPolicy {
    const policyDocument = props.PolicyDocument;
    policyDocument.Statement[0].Resource = resources;

    console.log(JSON.stringify(policyDocument));

    return new IamPolicy(this, `${DEPLOYMENT_PREFIX}${key}`, {
      name: `${DEPLOYMENT_PREFIX}${key}`,
      policy: JSON.stringify(policyDocument),
    });
  }

/**
* @description The function _escape(str: string) takes a string as input and returns
* an escaped version of the string by replacing all $\$ syntax with double $$ syntax.
* 
* @param { string } str - OK. Here's the answer you requested:
* 
* The str parameter is a string value that is being modified by this function.
* 
* @returns { string } The output returned by this function is a modified copy of the
* input string with all instances of $\{} replaced by $\${\} .
*/
  _escape(str: string): string {
    return str.replace(/\$\{/g, "$$${");
  }
}
