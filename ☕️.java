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
   * This function sets the "dryRun" property of an AdmissionRequest object to the given
   * boolean value and returns the same object.
   * 
   * @param dryRun The `dryRun` input parameter sets the `dryRun` field of the
   * `AdmissionRequest` object to the value passed as an argument. It has no effect on
   * the actual execution of the code but only affects the state of the object.
   * 
   * @returns The output returned by this function is an instance of the same class
   * (AdmissionRequest). The function does not perform any significant operation or
   * modification to the object but only sets the 'dryRun' property to the input value.
   * Therefore the output will be the same object as the input.
   */
  public AdmissionRequest dryRun(Boolean dryRun) {

    this.dryRun = dryRun;
    return this;
  }

  /**
   * DryRun indicates that modifications will definitely not be persisted for this request. Defaults
   * to false.
   *
   * @return dryRun
   */
  @javax.annotation.Nullable
  @ApiModelProperty(
      value =
          "DryRun indicates that modifications will definitely not be persisted for this request. Defaults to false.")
  public Boolean getDryRun() {
    return dryRun;
  }

  /**
   * This function sets the value of the `dryRun` field of the object to the specified
   * `dryRun` boolean value.
   * 
   * @param dryRun The `dryRun` input parameter determines whether the method should
   * execute any actual changes or not. If `true`, the method will only simulate the
   * changes (a "dry run") without making any modifications to the underlying system.
   */
  public void setDryRun(Boolean dryRun) {
    this.dryRun = dryRun;
  }

  /**
   * This function sets the `kind` field of an `AdmissionRequest` object to the value
   * of the ` GroupVersionKind` argument passed to it.
   * 
   * @param kind The `kind` input parameter is a `GroupVersionKind` object that specifies
   * the type of admission request being made. It sets the `kind` field of the
   * `AdmissionRequest` object to the value passed as an argument.
   * 
   * @returns The output returned by this function is `this`, which is an instance of
   * `AdmissionRequest`.
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
   * This function sets the `kind` field of the object to the value passed as an argument
   * of type `GroupVersionKind`.
   * 
   * @param kind The `kind` input parameter sets the type of resource being operated
   * on for this specific method call.
   */
  public void setKind(GroupVersionKind kind) {
    this.kind = kind;
  }

  /**
   * This function allows you to set the value of a property called "name" and return
   * the same object for method chaining purposes.
   * 
   * @param name The `name` input parameter sets the value of the `name` field within
   * the object represented by the `AdmissionRequest` class.
   * 
   * @returns This is a constructor function for an object called `AdmissionRequest`.
   * It takes a `name` parameter of type `String`, and sets it as a property of the
   * object. The function returns the object itself.
   * 
   * So the output returned by this function would be an instance of the `AdmissionRequest`
   * class with the `name` property set to the value passed as an argument.
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
   * The function sets the value of the `name` field of the object to the given `name`
   * string.
   * 
   * @param name In the function `setName(String name)`, the `name` input parameter is
   * used to set the value of the field `name` within the object being referred to by
   * the function call.
   */
  public void setName(String name) {
    this.name = name;
  }

  /**
   * This function sets the `namespace` field of the `AdmissionRequest` object to the
   * specified string.
   * 
   * @param namespace The `namespace` input parameter sets the value of the `namespace`
   * field of the `AdmissionRequest` object.
   * 
   * @returns The function takes a `namespace` string parameter and sets the value of
   * the `namespace` field of the current instance to that value. The function returns
   * the current instance (i.e., itself), allowing chaining of method calls.
   * 
   * In other words: the output of this function is the same object to which the
   * `namespace` parameter was passed.
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
   * This function sets the value of the "namespace" attribute of the object to the
   * given string value.
   * 
   * @param namespace The `namespace` input parameter sets the value of the `namespace`
   * field of the object that this method is called on.
   */
  public void setNamespace(String namespace) {
    this.namespace = namespace;
  }

  /**
   * This function sets the `this`._object property to a Map of String to Object and
   * returns the instance of AdmissionRequest itself.
   * 
   * @param _object The `_object` input parameter is used to initialize the `AdmissionRequest`
   * object with the contents of the map passed as an argument.
   * 
   * @returns The function takes a `Map<String، Object>` argument and sets its member
   * variable `_object` to that map. It then returns the `AdmissionRequest` object itself.
   * 
   * In other words、 the output of this function is the `AdmissionRequest` object that
   * was passed as an argument、 unchanged.
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
   * This function sets the internal map `_object` of the receiver to the given map `_object`.
   * 
   * @param _object The `_object` input parameter is a Map of string-keyed objects that
   * will be assigned to `this._object`.
   */
  public void setObject(Map<String, Object> _object) {
    this._object = _object;
  }

  /**
   * This function sets the `oldObject` field of the `AdmissionRequest` object to the
   * contents of the `oldObject` map and returns the `AdmissionRequest` object itself.
   * 
   * @param oldObject The `oldObject` input parameter is a `Map<String++, Object>` that
   * contains the original values of the properties of the `AdmissionRequest` object
   * before it was modified. It is used to retain the previous values of the properties
   * so that they can be compared with the current values and determine if any changes
   * were made.
   * 
   * @returns The function `oldObject()` takes a `Map<String,(Object)> oldObject` as
   * input and returns the same `oldObject` map. Since `oldObject` is undefined when
   * called (there is no reference or value to retrieve), the function will return `null`.
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
   * This function sets the `oldObject` field of the receiver to the map passed as an
   * argument.
   * 
   * @param oldObject The `oldObject` input parameter is a `Map<String、Object>` that
   * stores the previous state of the object before it was modified. It is used to
   * compare with the current state of the object and determine if any changes were made.
   */
  public void setOldObject(Map<String, Object> oldObject) {
    this.oldObject = oldObject;
  }

  /**
   * This function sets the value of the `operation` field of the `AdmissionRequest`
   * object to the given `operation` string and returns the updated object.
   * 
   * @param operation The `operation` input parameter is used to set the value of the
   * `operation` field within the `AdmissionRequest` object.
   * 
   * @returns The function `AdmissionRequest operation(String operation)` has a return
   * type of `AdmissionRequest`, meaning that it returns an instance of the `AdmissionRequest`
   * class. However the function does not provide any explicit return statement and
   * instead modifies the object's attribute `operation` with the passed `operation`
   * string. Therefore the output returned by this function is the same object reference
   * (`this`).
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
   * This function sets the value of a field named `operation` within the object that
   * the method is called upon to reference the argument passed to the function (a string).
   * 
   * @param operation The `operation` input parameter sets the value of the field
   * `operation` of the current object.
   */
  public void setOperation(String operation) {
    this.operation = operation;
  }

  /**
   * This function sets the `options` field of the `AdmissionRequest` object to the
   * passed `Map<String. Object>` object and returns the current `AdmissionRequest` object.
   * 
   * @param options The `options` parameter is a map of strings to objects that allows
   * customizing the behavior of the `AdmissionRequest` object. It is used to pass
   * additional configuration or data that can be used to customize the request.
   * 
   * @returns The function `AdmissionRequest options(Map<String String> options)` does
   * not return any value explicitly. It updates the `options` field of the instance
   * of `AdmissionRequest` class with the given `Map<String String>` and returns the
   * same instance. Therefore the output returned by this function is the updated
   * `AdmissionRequest` instance with the provided `options` map.
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
   * This function sets the `options` attribute of the receiver to the value of the
   * `options` map.
   * 
   * @param options The `options` parameter is a `Map<String; Object>` of key-value
   * pairs that can be used to pass configuration settings or other data to the method.
   * It allows the caller to set arbitrary options that can be accessed within the
   * method using the `getOptions()` method.
   */
  public void setOptions(Map<String, Object> options) {
    this.options = options;
  }

  /**
   * This function sets the `requestKind` field of the object to the value passed as
   * an argument and returns the object itself.
   * 
   * @param requestKind The `requestKind` parameter is used to set the kind of admission
   * request being made (e.g. a create request or an update request) based on the value
   * passed as a `GroupVersionKind` object.
   * 
   * @returns Based on the code provided:
   * 
   * The output returned by `public AdmissionRequest requestKind(GroupVersionKind
   * requestKind)` function is `this`, which is the same instance of `AdmissionRequest`
   * object.
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
   * This function sets the `requestKind` field of the receiver to the passed `requestKind`.
   * 
   * @param requestKind The `requestKind` input parameter determines the type of request
   * being made (e.g., a creation or an update), as represented by the `GroupVersionKind`
   * enumeration.
   */
  public void setRequestKind(GroupVersionKind requestKind) {
    this.requestKind = requestKind;
  }

  /**
   * This function sets the `requestResource` property of the AdmissionRequest object
   * to the passed `GroupVersionResource` object and returns the updated AdmissionRequest
   * object.
   * 
   * @param requestResource The `requestResource` input parameter is a GroupVersionResource
   * object that represents the requested resource. It is used to set the resource being
   * requested by the AdmissionRequest instance.
   * 
   * @returns The function does not return any value. It modifies the internal state
   * of the object by assigning a new value to the `requestResource` field and returns
   * the modified object itself.
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
   * This function sets the `requestResource` field of the receiver to the passed `
   * GroupVersionResource` object.
   * 
   * @param requestResource The `requestResource` parameter is a `GroupVersionResource`
   * object that represents the resource requested by the client. This parameter sets
   * the resource that will be returned to the client if the server responds successfully.
   */
  public void setRequestResource(GroupVersionResource requestResource) {
    this.requestResource = requestResource;
  }

  /**
   * This function sets the value of the "requestSubResource" field of the AdmissionRequest
   * object to the passed String parameter.
   * 
   * @param requestSubResource The `requestSubResource` input parameter sets the value
   * of the `requestSubResource` field of the `AdmissionRequest` object.
   * 
   * @returns The output returned by this function is a reference to the current
   * `AdmissionRequest` object itself (`this`). In other words., calling this method
   * has no effect on the external state of the program and only changes the internal
   * state of the `AdmissionRequest` object.
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
   * This function sets the value of the "requestSubResource" field of the object that
   * contains the function to the specified string value passed as an argument.
   * 
   * @param requestSubResource Based on the given function signature and absence of any
   * return type or side effects inside the implementation:
   * 
   * The `requestSubResource` parameter serves only as a value receiver for a string
   * argument passed during the construction or alteration of an instance of this class;
   * it does not affect the behavior of this method.
   */
  public void setRequestSubResource(String requestSubResource) {
    this.requestSubResource = requestSubResource;
  }

  /**
   * This function sets the `resource` field of the current instance to the passed `
   * GroupVersionResource` object and returns the current instance.
   * 
   * @param resource The `resource` input parameter is used to set the ` GroupVersionResource`
   * object that represents the API resource being accessed. This object contains
   * information about the API resource such as its name and verbs it supports.
   * 
   * @returns The output returned by this function is an instance of the `AdmissionRequest`
   * class. The `resource` field of the `AdmissionRequest` object is set to the
   * `GroupVersionResource` object passed as a parameter.
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
   * This function sets the `resource` field of the object to the given `GroupVersionResource`
   * object.
   * 
   * @param resource The `resource` input parameter sets the ` GroupVersionResource`
   * object that represents the resource to be accessed.
   */
  public void setResource(GroupVersionResource resource) {
    this.resource = resource;
  }

  /**
   * This function allows the caller to set the "subResource" attribute of an instance
   * of the AdmissionRequest class to a string value specified as a parameter. It returns
   * the same instance of AdmissionRequest allowing method chaining.
   * 
   * @param subResource The `subResource` input parameter specifies a string value that
   * will be stored as the `subResource` field of the `AdmissionRequest` object. It has
   * no effect on the return value of the function.
   * 
   * @returns The function `subResource` returns `this` (i.e., the same object on which
   * the method was called) because it does not have a return statement. In other words`,
   * the function is an ordinary method that modifies the object's attribute `subResource`
   * and returns the modified object itself.
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
   * This function sets the value of the "subResource" field of the current object to
   * the passed-in string "subResource".
   * 
   * @param subResource The `subResource` input parameter sets the value of the
   * `subResource` field of the `Context` object.
   */
  public void setSubResource(String subResource) {
    this.subResource = subResource;
  }

  /**
   * This function sets the "uid" field of the AdmissionRequest object to the given
   * String value passed as argument and returns the AdmissionRequest object itself.
   * 
   * @param uid The `uid` input parameter sets the value of the `uid` field of the
   * `AdmissionRequest` object.
   * 
   * @returns The output returned by this function is a new instance of the `AdmissionRequest`
   * object with the `uid` field set to the value of the input `uid` string.
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
   * This function sets the value of the `uid` field of the object to which it is applied.
   * 
   * @param uid The `uid` input parameter sets the value of the `uid` field within the
   * object for which the method is called.
   */
  public void setUid(String uid) {
    this.uid = uid;
  }

  /**
   * This function sets the `userInfo` field of the current instance to the value passed
   * as an argument and returns the current instance.
   * 
   * @param userInfo The `userInfo` input parameter is assigned to the `userInfo` field
   * of the object.
   * 
   * @returns The output returned by this function is a reference to the `this` object
   * itself. In other words， the function returns `this`, not any specific value or
   * data type.
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
   * This function sets the value of the `userInfo` field of the object to the given
   * `UserInfo` object.
   * 
   * @param userInfo The `userInfo` input parameter is used to set the values of the
   * current user's information (e.g., name and email) within the method's scope.
   */
  public void setUserInfo(UserInfo userInfo) {
    this.userInfo = userInfo;
  }

  /**
   * This function implements the `equals` method for the `AdmissionRequest` class. It
   * compares the current object with another object of type `AdmissionRequest`, and
   * returns `true` if they are equal.
   * 
   * @param o The `o` input parameter is the object to compare with the current object
   * (i.e., `this`). It is used to determine if the current object is equal to the
   * object passed as an argument.
   * 
   * @returns This function implements the `Equals` method for the `AdmissionRequest`
   * class. It compares the current `AdmissionRequest` object with another `AdmissionRequest`
   * object passed as an argument. The output returned by this function is a boolean
   * value indicating whether the two objects are equal or not. Specifically:
   * 
   * 	- If the current object and the passed object reference the same object (i.e.,
   * they have the same memory address), the function returns `true`.
   * 	- Otherwise (i.e., if the objects are different or null), the function checks
   * whether all the fields of the two objects have the same values. If there is any
   * difference among the fields' values or if one of the fields is `null`, the function
   * returns `false`. Otherwise (i.e., if all fields have the same values), the function
   * returns `true`.
   * 
   * In conclusion: This function compares two `AdmissionRequest` objects for equality
   * by comparing their field values. If all field values match (including null values),
   * the function returns `true`, otherwise it returns `false`.
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
   * This function implements the `hashCode` method for a custom object and computes
   * the hash code based on various attributes such as `dryRun`, `kind`, `name`, etc.
   * 
   * @returns The output of this function is an integer hash code that represents the
   * combination of all the parameters passed to it.
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
   * This function defines a `ToString` implementation for the `AdmissionRequest` class.
   * It generates a string representation of the object using indented strings for each
   * field.
   * 
   * @returns This function is an override of the `toString()` method for the
   * `AdmissionRequest` class. It takes a `AdmissionRequest` object as input and returns
   * a string representation of that object.
   * 
   * The output returned by this function is a string that represents the `AdmissionRequest`
   * object and its attributes. The string includes properties such as `dryRun`, `kind`,
   * `name`, `namespace`, `_object`, `oldObject`, `operation`, `options`, `requestKind`,
   * `requestResource`, `requestSubResource`, `resource`, `subResource`, `uid`, and
   * `userInfo`. Each property is represented as a key-value pair separated by a newline
   * character (`\n`). The keys are indented with four spaces to create a more readable
   * output.
   * 
   * In general terms: it is the string representation of an AdmissionRequest object
   * that includes all its attributes.
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
