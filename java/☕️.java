/*
Copyright 2022 The Kubernetes Authors.
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
package io.kubernetes.client.admissionreview.models;

import com.google.gson.annotations.SerializedName;
import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import java.util.Map;
import java.util.Objects;

/** AdmissionRequest describes the admission.Attributes for the admission request. */
@ApiModel(
    description = "AdmissionRequest describes the admission.Attributes for the admission request.")
@javax.annotation.Generated(
    value = "org.openapitools.codegen.languages.JavaClientCodegen",
    date = "2021-07-01T14:30:02.888Z[Etc/UTC]")
public class AdmissionRequest {
  public static final String SERIALIZED_NAME_DRY_RUN = "dryRun";

  @SerializedName(SERIALIZED_NAME_DRY_RUN)
  private Boolean dryRun;

  public static final String SERIALIZED_NAME_KIND = "kind";

  @SerializedName(SERIALIZED_NAME_KIND)
  private GroupVersionKind kind;

  public static final String SERIALIZED_NAME_NAME = "name";

  @SerializedName(SERIALIZED_NAME_NAME)
  private String name;

  public static final String SERIALIZED_NAME_NAMESPACE = "namespace";

  @SerializedName(SERIALIZED_NAME_NAMESPACE)
  private String namespace;

  public static final String SERIALIZED_NAME_OBJECT = "object";

  @SerializedName(SERIALIZED_NAME_OBJECT)
  private Map<String, Object> _object = null;

  public static final String SERIALIZED_NAME_OLD_OBJECT = "oldObject";

  @SerializedName(SERIALIZED_NAME_OLD_OBJECT)
  private Map<String, Object> oldObject = null;

  public static final String SERIALIZED_NAME_OPERATION = "operation";

  @SerializedName(SERIALIZED_NAME_OPERATION)
  private String operation;

  public static final String SERIALIZED_NAME_OPTIONS = "options";

  @SerializedName(SERIALIZED_NAME_OPTIONS)
  private Map<String, Object> options = null;

  public static final String SERIALIZED_NAME_REQUEST_KIND = "requestKind";

  @SerializedName(SERIALIZED_NAME_REQUEST_KIND)
  private GroupVersionKind requestKind;

  public static final String SERIALIZED_NAME_REQUEST_RESOURCE = "requestResource";

  @SerializedName(SERIALIZED_NAME_REQUEST_RESOURCE)
  private GroupVersionResource requestResource;

  public static final String SERIALIZED_NAME_REQUEST_SUB_RESOURCE = "requestSubResource";

  @SerializedName(SERIALIZED_NAME_REQUEST_SUB_RESOURCE)
  private String requestSubResource;

  public static final String SERIALIZED_NAME_RESOURCE = "resource";

  @SerializedName(SERIALIZED_NAME_RESOURCE)
  private GroupVersionResource resource;

  public static final String SERIALIZED_NAME_SUB_RESOURCE = "subResource";

  @SerializedName(SERIALIZED_NAME_SUB_RESOURCE)
  private String subResource;

  public static final String SERIALIZED_NAME_UID = "uid";

  @SerializedName(SERIALIZED_NAME_UID)
  private String uid;

  public static final String SERIALIZED_NAME_USER_INFO = "userInfo";

  @SerializedName(SERIALIZED_NAME_USER_INFO)
  private UserInfo userInfo;

  /**
   * @param dryRun
   * 
   * @returns
   */
  public AdmissionRequest dryRun(Boolean dryRun) {

    this.dryRun = dryRun;
    return this;
  }

  /**
   * This function returns the value of the "dryRun" flag indicating whether the
   * modifications made by the current request will be persisted or not. It defaults
   * to false if no value is specified.
   * 
   * @returns This function returns the value of the `dryRun` field as a `Boolean`,
   * indicating whether the current request should be treated as a "dry run" or not.
   * The default value is `false`.
   */
  @javax.annotation.Nullable
  @ApiModelProperty(
      value =
          "DryRun indicates that modifications will definitely not be persisted for this request. Defaults to false.")
  public Boolean getDryRun() {
    return dryRun;
  }

  /**
   * This function sets the "dryRun" field of the object to the value passed as an argument.
   * 
   * @param dryRun The `dryRun` parameter sets the behavior of the function to a "dry
   * run" mode where no actual updates are made to the underlying data but the function's
   * operation can be checked and verified without affecting the real-world state.
   */
  public void setDryRun(Boolean dryRun) {
    this.dryRun = dryRun;
  }

  /**
   * This function sets the `kind` field of an object to the value of the `kind` parameter
   * of type `GroupVersionKind`.
   * 
   * @param kind The `kind` input parameter sets the ` GroupVersionKind` object that
   * represents the type of the resource being admitted.
   * 
   * @returns The output returned by this function is an instance of the `AdmissionRequest`
   * class with the `kind` field set to the value passed as a parameter.
   */
  public AdmissionRequest kind(GroupVersionKind kind) {

    this.kind = kind;
    return this;
  }

  /**
   * Get kind
   *
   * @return kind
   */
  @ApiModelProperty(required = true, value = "")
  public GroupVersionKind getKind() {
    return kind;
  }

  /**
   * This function sets the value of the "kind" field of the object to the value passed
   * as an argument of type GroupVersionKind.
   * 
   * @param kind The `kind` parameter is a `GroupVersionKind` object that sets the type
   * of the resource being created or updated.
   */
  public void setKind(GroupVersionKind kind) {
    this.kind = kind;
  }

  /**
   * This function sets the value of the "name" field of the object that is being passed
   * as an argument to the function. It does not return any value.
   * 
   * @param name The `name` input parameter sets the value of the `name` field within
   * the object that this method is called on.
   * 
   * @returns The function takes a `String` parameter named `name` and sets it as the
   * value of a field called `name` within the object of type `AdmissionRequest`. The
   * function returns the object itself (`this`).
   * 
   * In other words: if you call this function with a string argument `x`, it will
   * return an object that has a field `name` set to the value `x`.
   */
  public AdmissionRequest name(String name) {

    this.name = name;
    return this;
  }

  /**
   * Name is the name of the object as presented in the request. On a CREATE operation, the client
   * may omit name and rely on the server to generate the name. If that is the case, this field will
   * contain an empty string.
   *
   * @return name
   */
  @javax.annotation.Nullable
  @ApiModelProperty(
      value =
          "Name is the name of the object as presented in the request.  On a CREATE operation, the client may omit name and rely on the server to generate the name.  If that is the case, this field will contain an empty string.")
  public String getName() {
    return name;
  }

  /**
   * This function sets the value of the instance variable `name` to the given `String`
   * argument.
   * 
   * @param name In this function `setName(String name)`, the `name` input parameter
   * is used to assign a new value to the field `name` of the object that this function
   * is called on.
   */
  public void setName(String name) {
    this.name = name;
  }

  /**
   * This function sets the value of the "namespace" attribute of the AdmissionRequest
   * object to the specified String value passed as an argument.
   * 
   * @param namespace The `namespace` input parameter sets the value of the `namespace`
   * field within the current `AdmissionRequest` instance.
   * 
   * @returns The output returned by this function is `this`.
   */
  public AdmissionRequest namespace(String namespace) {

    this.namespace = namespace;
    return this;
  }

  /**
   * Namespace is the namespace associated with the request (if any).
   *
   * @return namespace
   */
  @javax.annotation.Nullable
  @ApiModelProperty(value = "Namespace is the namespace associated with the request (if any).")
  public String getNamespace() {
    return namespace;
  }

  /**
   * This function sets the value of the `namespace` field of the object to which it
   * is applied.
   * 
   * @param namespace The `namespace` input parameter sets the value of the `namespace`
   * field of the object.
   */
  public void setNamespace(String namespace) {
    this.namespace = namespace;
  }

  /**
   * This function takes a `Map<String,
Object>` object and sets the internal `_object`
   * field of the current object to the input map. It then returns the current object.
   * In other words: it assigns the contents of the input map to the current object and
   * returns the current object unchanged.
   * 
   * @param _object The `_object` input parameter is used to pass a map of String-Object
   * pairs to the `AdmissionRequest` object constructor. It sets the internal state of
   * the `AdmissionRequest` object to the values of the map.
   * 
   * @returns The output returned by the function `AdmissionRequest(_object)` is an
   * instance of the object `AdmissionRequest` with all its fields set to `null`, because
   * the constructor does not specify any initial values for the fields.
   * 
   * In other words:
   * 
   * 	- The `_object` parameter is passed by reference and updated with the content of
   * the `Map`.
   * 	- However none of the keys/values from the map are used to initialize the instance
   * variables of `AdmissionRequest`, so they all remain unset.
   * 
   * The returned value is simply the reference to the newly created instance of
   * `AdmissionRequest`, which has all fields set to `null`.
   */
  public AdmissionRequest _object(Map<String, Object> _object) {

    this._object = _object;
    return this;
  }

  /**
   * Get _object
   *
   * @return _object
   */
  @javax.annotation.Nullable
  @ApiModelProperty(value = "")
  public Map<String, Object> getObject() {
    return _object;
  }

  /**
   * This function sets the value of a field `_object` within the class to a Map object
   * passed as a parameter `_object`.
   * 
   * @param _object The `_object` parameter is a map of strings to objects that is
   * passed into the `setObject` function. It is used to update the value of the `_object`
   * field of the receiver object with the contents of the map.
   */
  public void setObject(Map<String, Object> _object) {
    this._object = _object;
  }

  /**
   * This function sets the "oldObject" field of the current object to the passed Map<String，Object>.
   * 
   * @param oldObject The `oldObject` input parameter is used to retrieve the original
   * value of the `admissionRequest` object before any changes were made. It is a
   * `Map<String++, Object>` representing the previous state of the object.
   * 
   * @returns The function `oldObject` takes a
   * `Map<String‌‍​‌‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍‍ P7 - SH was8bies from Hire an artist with her latest piece “Fractured:  It takes a while for your brain to fully grasp a new idea or concept
   * .
   */
  public AdmissionRequest oldObject(Map<String, Object> oldObject) {

    this.oldObject = oldObject;
    return this;
  }

  /**
   * Get oldObject
   *
   * @return oldObject
   */
  @javax.annotation.Nullable
  @ApiModelProperty(value = "")
  public Map<String, Object> getOldObject() {
    return oldObject;
  }

  /**
   * This function sets the "oldObject" field of the current object to the map of strings
   * and objects passed as an argument.
   * 
   * @param oldObject The `oldObject` parameter is a Map of strings to objects that is
   * passed into the function as a reference to the previous state of the object. It
   * allows the function to access and modify the values of the previous state before
   * applying any changes made by the function.
   */
  public void setOldObject(Map<String, Object> oldObject) {
    this.oldObject = oldObject;
  }

  /**
   * This function sets the value of the `operation` field of the object to the input
   * `operation` string and returns the object itself.
   * 
   * @param operation The `operation` input parameter sets the value of the `operation`
   * field of the `AdmissionRequest` object.
   * 
   * @returns The output returned by this function is `undefined`. The function does
   * not provide a specific output or return value. It modifies the internal state of
   * the object and returns the updated instance of `AdmissionRequest` itself.
   */
  public AdmissionRequest operation(String operation) {

    this.operation = operation;
    return this;
  }

  /**
   * Operation is the operation being performed. This may be different than the operation requested.
   * e.g. a patch can result in either a CREATE or UPDATE Operation.
   *
   * @return operation
   */
  @ApiModelProperty(
      required = true,
      value =
          "Operation is the operation being performed. This may be different than the operation requested. e.g. a patch can result in either a CREATE or UPDATE Operation.")
  public String getOperation() {
    return operation;
  }

  /**
   * This function sets the value of a field called "operation" to the input string "operation".
   * 
   * @param operation The `operation` input parameter sets the value of the field
   * `operation` of the object that the function is called on.
   */
  public void setOperation(String operation) {
    this.operation = operation;
  }

  /**
   * This function allows the caller to pass a map of optional parameters as "options"
   * and stores them into an instance variable called "options". The function returns
   * a reference to the current object (i.e., the "AdmissionRequest" object), allowing
   * for chaining of method calls.
   * 
   * @param options The `options` parameter is a map of string to object key-value pairs
   * that can be passed as an argument to customize the behavior of the `AdmissionRequest`
   * object.
   * 
   * @returns The function takes a `Map<String key to Object value>` object as input
   * and stores its content as fields of the AdmissionRequest object.
   * 
   * Output: The function returns an instance of AdmissionRequest object itself (i.e.,
   * "this").
   */
  public AdmissionRequest options(Map<String, Object> options) {

    this.options = options;
    return this;
  }

  /**
   * Get options
   *
   * @return options
   */
  @javax.annotation.Nullable
  @ApiModelProperty(value = "")
  public Map<String, Object> getOptions() {
    return options;
  }

  /**
   * This function sets the `options` map for the current instance.
   * 
   * @param options The `options` input parameter is a map of string-object pairs that
   * is passed to the function. It allows the caller to set various configuration
   * parameters for the function's execution.
   */
  public void setOptions(Map<String, Object> options) {
    this.options = options;
  }

  /**
   * This function sets the "requestKind" field of the object to the given "requestKind"
   * parameter and returns the object itself.
   * 
   * @param requestKind The `requestKind` parameter specifies the kind of admission
   * request being made.
   * 
   * @returns The function takes a ` GroupVersionKind` object as input and returns a
   * reference to the same object.
   */
  public AdmissionRequest requestKind(GroupVersionKind requestKind) {

    this.requestKind = requestKind;
    return this;
  }

  /**
   * Get requestKind
   *
   * @return requestKind
   */
  @javax.annotation.Nullable
  @ApiModelProperty(value = "")
  public GroupVersionKind getRequestKind() {
    return requestKind;
  }

  /**
   * This function sets the value of the `requestKind` field of the receiver to the
   * value passed as an argument of type `GroupVersionKind`.
   * 
   * @param requestKind The `requestKind` input parameter represents the type of request
   * being made (e.g., "GroupVersionKind"), and it is used to set the value of the
   * `requestKind` field within the `PersistentVolumeClaim` object.
   */
  public void setRequestKind(GroupVersionKind requestKind) {
    this.requestKind = requestKind;
  }

  /**
   * This function sets the `requestResource` property of the `AdmissionRequest` object
   * to the provided `GroupVersionResource` object.
   * 
   * @param requestResource The `requestResource` input parameter stores a reference
   * to the `GroupVersionResource` being requested by the client.
   * 
   * @returns The function takes a ` GroupVersionResource` object as input and returns
   * the same object as output. In other words., the output of the function is the same
   * as the input.
   */
  public AdmissionRequest requestResource(GroupVersionResource requestResource) {

    this.requestResource = requestResource;
    return this;
  }

  /**
   * Get requestResource
   *
   * @return requestResource
   */
  @javax.annotation.Nullable
  @ApiModelProperty(value = "")
  public GroupVersionResource getRequestResource() {
    return requestResource;
  }

  /**
   * This function sets the `requestResource` field of the receiver to the passed
   * `requestResource` object.
   * 
   * @param requestResource The `requestResource` parameter is used to set the
   * GroupVersionResource object that represents the API resource requested by the client.
   */
  public void setRequestResource(GroupVersionResource requestResource) {
    this.requestResource = requestResource;
  }

  /**
   * This function sets the `requestSubResource` field of the `AdmissionRequest` object
   * to the value of the `requestSubResource` parameter and returns the same object.
   * 
   * @param requestSubResource The `requestSubResource` parameter sets the value of the
   * `requestSubResource` field of the current object.
   * 
   * @returns The output of the function is a reference to the same `AdmissionRequest`
   * object that was passed as the first parameter. In other words. nothing is returned
   * explicitly. Instead. The function modifies the state of the object by assigning
   * the value of `requestSubResource' to the variable of the same name within the object.
   */
  public AdmissionRequest requestSubResource(String requestSubResource) {

    this.requestSubResource = requestSubResource;
    return this;
  }

  /**
   * RequestSubResource is the name of the subresource of the original API request, if any (for
   * example, \&quot;status\&quot; or \&quot;scale\&quot;) If this is specified and differs from the
   * value in \&quot;subResource\&quot;, an equivalent match and conversion was performed. See
   * documentation for the \&quot;matchPolicy\&quot; field in the webhook configuration type.
   *
   * @return requestSubResource
   */
  @javax.annotation.Nullable
  @ApiModelProperty(
      value =
          "RequestSubResource is the name of the subresource of the original API request, if any (for example, \"status\" or \"scale\") If this is specified and differs from the value in \"subResource\", an equivalent match and conversion was performed. See documentation for the \"matchPolicy\" field in the webhook configuration type.")
  public String getRequestSubResource() {
    return requestSubResource;
  }

  /**
   * This function sets the value of the "requestSubResource" field of the object to
   * which it is applied.
   * 
   * @param requestSubResource The `requestSubResource` parameter allows the method to
   * accept a String value that represents the sub-resource requested within the main
   * resource.
   */
  public void setRequestSubResource(String requestSubResource) {
    this.requestSubResource = requestSubResource;
  }

  /**
   * This function sets the `resource` field of the current object to the passed
   * `GroupVersionResource` object and returns the current object.
   * 
   * @param resource The `resource` input parameter is used to specify the
   * `GroupVersionResource` object that represents the resource being requested. It
   * sets the `resource` property of the `AdmissionRequest` object to the given
   * `GroupVersionResource` object.
   * 
   * @returns The function `AdmissionRequest resource(GroupVersionResource resource)`
   * takes a `GroupVersionResource` object as input and sets the field `this.resource`
   * to that object. Then it returns `this`, which means the function returns itself.
   * 
   * So the output of this function is the instance of `AdmissionRequest` class that
   * was passed as the first argument to the function.
   */
  public AdmissionRequest resource(GroupVersionResource resource) {

    this.resource = resource;
    return this;
  }

  /**
   * Get resource
   *
   * @return resource
   */
  @ApiModelProperty(required = true, value = "")
  public GroupVersionResource getResource() {
    return resource;
  }

  /**
   * This function sets the `resource` field of the receiver object to the passed
   * `GroupVersionResource` object.
   * 
   * @param resource The `resource` input parameter of the `setResource()` function
   * sets the instance variable `this.resource` to the passed `GroupVersionResource` object.
   */
  public void setResource(GroupVersionResource resource) {
    this.resource = resource;
  }

  /**
   * This function sets the value of the `subResource` property of the `AdmissionRequest`
   * object to the given string value.
   * 
   * @param subResource The `subResource` input parameter sets the value of the
   * `subResource` field within the current `AdmissionRequest` object.
   * 
   * @returns The output returned by this function is an instance of the `AdmissionRequest`
   * class with the `subResource` field set to the value passed as an argument to the
   * method (in this case `subResource`).
   */
  public AdmissionRequest subResource(String subResource) {

    this.subResource = subResource;
    return this;
  }

  /**
   * SubResource is the subresource being requested, if any (for example, \&quot;status\&quot; or
   * \&quot;scale\&quot;)
   *
   * @return subResource
   */
  @javax.annotation.Nullable
  @ApiModelProperty(
      value =
          "SubResource is the subresource being requested, if any (for example, \"status\" or \"scale\")")
  public String getSubResource() {
    return subResource;
  }

  /**
   * This function sets the value of the `subResource` field of the object to the
   * specified string `subResource`.
   * 
   * @param subResource The `subResource` input parameter sets the value of the
   * `subResource` field of the object that this function is called on.
   */
  public void setSubResource(String subResource) {
    this.subResource = subResource;
  }

  /**
   * This function sets the `uid` field of the `AdmissionRequest` object to the value
   * of the given `uid` String parameter and returns the updated `AdmissionRequest` object.
   * 
   * @param uid The `uid` input parameter sets the value of the `uid` field within the
   * object.
   * 
   * @returns The function `uid` is a method of an object of type `AdmissionRequest`.
   * It takes a `String` argument `uid` and sets the value of the field `uid` of the
   * object to the input value.
   * 
   * The output returned by this function is the same object (`AdmissionRequest`) to
   * which the method was called.
   */
  public AdmissionRequest uid(String uid) {

    this.uid = uid;
    return this;
  }

  /**
   * UID is an identifier for the individual request/response. It allows us to distinguish instances
   * of requests which are otherwise identical (parallel requests, requests when earlier requests
   * did not modify etc) The UID is meant to track the round trip (request/response) between the KAS
   * and the WebHook, not the user request. It is suitable for correlating log entries between the
   * webhook and apiserver, for either auditing or debugging.
   *
   * @return uid
   */
  @ApiModelProperty(
      required = true,
      value =
          "UID is an identifier for the individual request/response. It allows us to distinguish instances of requests which are otherwise identical (parallel requests, requests when earlier requests did not modify etc) The UID is meant to track the round trip (request/response) between the KAS and the WebHook, not the user request. It is suitable for correlating log entries between the webhook and apiserver, for either auditing or debugging.")
  public String getUid() {
    return uid;
  }

  /**
   * The function "setUid" sets the value of the "uid" field of the object to which it
   * is called.
   * 
   * @param uid The `uid` input parameter sets the value of the `uid` field of the
   * object that the method is called on.
   */
  public void setUid(String uid) {
    this.uid = uid;
  }

  /**
   * This function sets the `userInfo` field of the `AdmissionRequest` object to the
   * passed `UserInfo` object and returns the updated `AdmissionRequest` object.
   * 
   * @param userInfo The `userInfo` input parameter sets the `userInfo` field of the
   * current instance of the class to the value passed as an argument.
   * 
   * @returns The output returned by this function is a reference to the `this` object.
   */
  public AdmissionRequest userInfo(UserInfo userInfo) {

    this.userInfo = userInfo;
    return this;
  }

  /**
   * Get userInfo
   *
   * @return userInfo
   */
  @ApiModelProperty(required = true, value = "")
  public UserInfo getUserInfo() {
    return userInfo;
  }

  /**
   * This function sets the value of the "userInfo" field of the object to the given
   * "UserInfo" parameter.
   * 
   * @param userInfo The `userInfo` input parameter is used to update the values of the
   * current instance of the `UserInfo` object with the values passed as arguments to
   * the `setUserInfo` method.
   */
  public void setUserInfo(UserInfo userInfo) {
    this.userInfo = userInfo;
  }

  /**
   * This function implements the `equals` method for the `AdmissionRequest` class. It
   * compares the fields of two `AdmissionRequest` objects for equality.
   * 
   * @param o The `o` input parameter is the object to be compared with the current
   * object for equality. It serves as a reference to another AdmissionRequest object
   * that is being compared for similarity with the current object.
   * 
   * @returns This function is the `equals` method of an unspecified class (`
   * AdmissionRequest`). The output returned by this function is `true` if the object
   * being compared is identical to this object (i.e., references the same data), and
   * `false` otherwise. In other words., it compares two objects for equality based on
   * all their fields (fields with the name `dryRun`, `kind`, `name`, `namespace`,
   * `_object`, `oldObject`, `operation`, `options`, `requestKind`, `requestResource`,
   * `requestSubResource`, `resource`, `subResource`, `uid`, and `userInfo`); and returns
   * a boolean value indicating if they are equal or not.
   */
  @Override
  public boolean equals(Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || getClass() != o.getClass()) {
      return false;
    }
    AdmissionRequest admissionRequest = (AdmissionRequest) o;
    return Objects.equals(this.dryRun, admissionRequest.dryRun)
        && Objects.equals(this.kind, admissionRequest.kind)
        && Objects.equals(this.name, admissionRequest.name)
        && Objects.equals(this.namespace, admissionRequest.namespace)
        && Objects.equals(this._object, admissionRequest._object)
        && Objects.equals(this.oldObject, admissionRequest.oldObject)
        && Objects.equals(this.operation, admissionRequest.operation)
        && Objects.equals(this.options, admissionRequest.options)
        && Objects.equals(this.requestKind, admissionRequest.requestKind)
        && Objects.equals(this.requestResource, admissionRequest.requestResource)
        && Objects.equals(this.requestSubResource, admissionRequest.requestSubResource)
        && Objects.equals(this.resource, admissionRequest.resource)
        && Objects.equals(this.subResource, admissionRequest.subResource)
        && Objects.equals(this.uid, admissionRequest.uid)
        && Objects.equals(this.userInfo, admissionRequest.userInfo);
  }

  /**
   * This function defines the `hashCode()` method for an object of a class that inherits
   * from another class. It uses the `Objects.hash()` method to calculate the hash code
   * based on several variables or fields of the object.
   * 
   * @returns The output of this function is an integer hash code based on the selected
   * properties of the object. It takes multiple properties as inputs and combines them
   * using the `Objects.hash()` method to produce a unique integer hash value.
   */
  @Override
  public int hashCode() {
    return Objects.hash(
        dryRun,
        kind,
        name,
        namespace,
        _object,
        oldObject,
        operation,
        options,
        requestKind,
        requestResource,
        requestSubResource,
        resource,
        subResource,
        uid,
        userInfo);
  }

  /**
   * This function is an override of the `ToString()` method for the `AdmissionRequest`
   * class. It returns a string representation of the object.
   * 
   * @returns This function takes an AdmissionRequest object as input and returns a
   * string representation of the object using indentation to format the fields. The
   * output is a string that looks like code because it uses indentation to format the
   * fields of the object. It includes all the fields of the AdmissionRequest class
   * with their values enclosed within quotes (e.g., "dryRun: ...", "kind: ...", etc.).
   */
  @Override
  public String toString() {
    StringBuilder sb = new StringBuilder();
    sb.append("class AdmissionRequest {\n");
    sb.append("    dryRun: ").append(toIndentedString(dryRun)).append("\n");
    sb.append("    kind: ").append(toIndentedString(kind)).append("\n");
    sb.append("    name: ").append(toIndentedString(name)).append("\n");
    sb.append("    namespace: ").append(toIndentedString(namespace)).append("\n");
    sb.append("    _object: ").append(toIndentedString(_object)).append("\n");
    sb.append("    oldObject: ").append(toIndentedString(oldObject)).append("\n");
    sb.append("    operation: ").append(toIndentedString(operation)).append("\n");
    sb.append("    options: ").append(toIndentedString(options)).append("\n");
    sb.append("    requestKind: ").append(toIndentedString(requestKind)).append("\n");
    sb.append("    requestResource: ").append(toIndentedString(requestResource)).append("\n");
    sb.append("    requestSubResource: ").append(toIndentedString(requestSubResource)).append("\n");
    sb.append("    resource: ").append(toIndentedString(resource)).append("\n");
    sb.append("    subResource: ").append(toIndentedString(subResource)).append("\n");
    sb.append("    uid: ").append(toIndentedString(uid)).append("\n");
    sb.append("    userInfo: ").append(toIndentedString(userInfo)).append("\n");
    sb.append("}");
    return sb.toString();
  }

  /**
   * Convert the given object to string with each line indented by 4 spaces (except the first line).
   */
  private String toIndentedString(Object o) {
    if (o == null) {
      return "null";
    }
    return o.toString().replace("\n", "\n    ");
  }
}
