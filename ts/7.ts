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
   * @description This function creates an AppSync API, including a GraphQL API, a
   * DynamoDB data source, and several IAM policies and attachments. It also creates
   * TFResources for tables, roles, functions, and resolvers.
   * 
   * @param { Construct } scope - The `scope` input parameter in the `constructor`
   * function of Amplify AppSync defines the scope of the component. It specifies the
   * parent component or top-level component that the new component will be a part of.
   * In this case, the `scope` parameter is set to `Construct`, which means that the
   * new component will be a child component of the `Construct` component. This allows
   * for easier organization and management of components in an Amplify AppSync project.
   * 
   * @param { string } name - The `name` input parameter in the ` constructor` function
   * sets the name of the construct. It is used to create unique names for resources
   * and dependencies, which are necessary for proper functioning of the Amplify AppSync
   * framework.
   */
  constructor(scope: Construct, name: string) {
    super(scope, name);

    new AwsProvider(this, "AwsConfig", { region: DEPLOYMENT_REGION });

    this.api = new AppsyncGraphqlApi(this, `${DEPLOYMENT_PREFIX}GraphqlApi`, {
      name: `${DEPLOYMENT_PREFIX}GraphqlApi`,
      authenticationType: "API_KEY",
      schema: fs.readFileSync(
        `${EXPORTED_ASSETS_DIR}/amplify-appsync-files/schema.graphql`,
        "utf8"
      ),
    });

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
 * @description The provided function 'createTFResolver' takes a 'key' and an object
 * 'props', creates a new resolver object and returns it. The new object has properties:
 * apiId (based on this.api.id), type(string based on props.TypeName), field (based
 * on props.FieldName), kind (based on props.Kind). requestTemplate and responseTemplate
 *   The function creates the pipelin config with a functions property composed of
 * array from the props PipelineConfig object of Functions
 * 
 * @param { string } key - The `key` parameter specifies a unique identifier for the
 * TF Resolver.
 * 
 * @param { any } props - Here's a concise answer:
 * 
 * The 'props' input parameter of the given function takes an object and provides
 * information such as typeName field name kind requestTemplate response Template
 * Pipeline configuration
 * 
 * @returns { any } Function resolves to a new AppsyncResolver instance with a specific
 * API ID and fields for type name and request template.
 */
  createTFResolver(key: string, props: any): any {
/**
 * @description Function returns a map of all function references. It uses 'Function['
 * index dot notation syntax and extracts function id of each function reference using
 * Fn:GetAtt'.
 * 
 * @param { any } fn - MAPS THE FUNCTION INPUT PARAMETER TO THIS REFERENCE
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
 * @description CreateTFFunction creates an AppsyncFunction using props to configure
 * its apiId., dataSource name and request / response VTL.
 * 
 * @param { any } props - The props input parameter provides Name value for use when
 * building request/response templates.
 * 
 * @returns { any } creates an instance of the AppsyncFunction class.
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
 * @description Map Request Velocity Template: Takes a template as an argument and
 * returns a transformed string. The template is processed to replace placeholders
 * with actual values from the function's parameters and class properties. The resulting
 * string is Joined back into a single line minus two newlines added at the end.
 * 
 * @param { any } template - Here is your answer:
 * 
 * Transformed using Fn::Join method of templates containing an array or single value.
 * 
 * Did this address your need?
 * 
 * @returns { string } The function takes a JSON template as input and modifies it
 * to include environment variables for AWS Account ID and Komment role name. The
 * modified template is returned as a string separated by newlines.
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

    template[3 + offset] = "ACCOUNT_ID_CONFIG";
    template[5 + offset] = "KOMMENT_ROLE_NAME_CONFIG";

    template = template.join("").split("\n");
    template.splice(-2, 1);
    return template.join("\n");
  }

/**
 * @description Reads a file from an exported asset directory and escapes special
 * characters found inside.
 * 
 * @param { any } props - The `props` object contains information about request mapping
 * templates and serves as input for the function. Specifically
 * `props.RequestMappingTemplateS3Location["Fn::Join"][1]` fetches data from S3 bucket
 * and `fs.readFileSync` reads files synonymously.
 * 
 * @returns { string } The function gets a path and file content from an object of
 * props and returns the contents of the file after escaping them.
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
 * @description The getResponseVtl function takes an object of props as input and
 * returns a string. If the prop 'ResponseMappingTemplate' exists it will read from
 * an embedded template file otherwise it reads the contents from an external s3 file
 * located at amplify-appsync-files followed by path provided inside the
 * ResponseMappingTemplateS3Location property.
 * 
 * @param { any } props - Okay. The props parameter passes objects that hold any
 * attributes the method wants to process into the getResponseVtl() method.
 * 
 * @returns { string } The function returns a string escape (sanitized) JSON payload
 * derived from either an embedded template or from the location specified.
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
 * @description The createTFTable function creates a new Dynamodb table with specified
 * name and attributes and hashKey
 * 
 * @param { string } key - The `key` input parameter defines the table name prefix
 * for DynamoDB tables.
 * 
 * @param { any } props - Here's your answer:
 * 
 * PROPS: PROPSET.
 * 
 * @returns { any } Function creates a DynamoDB table with given key and properties.
 * Output is a DynamodbTable object with name and hashKey set.
 */
  createTFTable(key: string, props: any): any {
    return new DynamodbTable(this, `${DEPLOYMENT_PREFIX}${key}`, {
      name: `${DEPLOYMENT_PREFIX}${key}`,
      hashKey: props.KeySchema[0].AttributeName,

/**
 * @description maps ( attribute: { AttributeName: any; AttributeType: any } ) to an
 * array of name-type pairs.
 * 
 * @param { object } attr - Here's the response based on the given request:
 * 
 * maps(Function<{ AttributeName: any; AttributeType: any }, { name: any; type: any
 * }>)
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
 * @description Create an IamRole object using the given key and properties. It
 * constructs a new IamRole instance with a specified name that includes the provided
 * key.  It sets assumeRolePolicy property by stringifying the Given AssumeRolePolicyDocument
 * object.
 * 
 * @param { string } key - OK. The `key` parameter passes a string to be incorporated
 * into the construction of an Amazon Resource Name (ARN) that uniquely identifies
 * an IAM role to create.
 * 
 * @param { any } props - Here's the answer you requested:
 * 
 * props serve as the contents of the IAM role policy document
 * 
 * @returns { IamRole } The function creates an IamRole object with name and
 * assumeRolePolicy properties based on input parameters key and props.
 */
  createTFRole(key: string, props: any): IamRole {
    return new IamRole(this, `${DEPLOYMENT_PREFIX}${key}`, {
      name: `${DEPLOYMENT_PREFIX}${key}`,
      assumeRolePolicy: JSON.stringify(props.AssumeRolePolicyDocument),
    });
  }

/**
 * @description createTFPolicy:
 *     • Validates an input object and console logs a resulting JSON string.
 *     • Then constructs an AWS IamPolicy based on those inputs.
 * 
 * @param { string } key - provides a unique identifier for a resource.
 * 
 * @param { any } props - The `props` input parameter defines an object with
 * PolicyDocument that contains policy statements and resources relevant to a service
 * being called within AWS.
 * 
 * @param { string[] } resources - Provides an array of resource identifiers that can
 * be referred to within the policy statement.
 * 
 * @returns { IamPolicy } The function creates an IamPolicy object with name and
 * policy properties. The policy property is a JSON string of the PolicyDocument
 * object passed as a parameter. The console logs the policy document's JSON
 * representation before returning the IamPolicy object.
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
 * @description The _escape(str) function replaces all instances of ${ with $${ to
 * escape dollar signs within a string.
 * 
 * @param { string } str - The `str` input parameter receives a string and returns
 * it with replacements made.
 * 
 * @returns { string } The output returned by this function is a string with all
 * dollar-brace notation replaced with their evaluated value enclosed within triple
 * double dollar signs("$$$$").
 */
  _escape(str: string): string {
    return str.replace(/\$\{/g, "$$${");
  }
}
