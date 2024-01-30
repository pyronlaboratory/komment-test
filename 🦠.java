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
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@ApiModel(
    description =
        "UserInfo holds the information about the user needed to implement the user.Info interface.")
@javax.annotation.Generated(
    value = "org.openapitools.codegen.languages.JavaClientCodegen",
    date = "2021-07-01T14:30:02.888Z[Etc/UTC]")
public class UserInfo {
  public static final String SERIALIZED_NAME_EXTRA = "extra";

  @SerializedName(SERIALIZED_NAME_EXTRA)
  private Map<String, List<String>> extra = null;

  public static final String SERIALIZED_NAME_GROUPS = "groups";

  @SerializedName(SERIALIZED_NAME_GROUPS)
  private List<String> groups = null;

  public static final String SERIALIZED_NAME_UID = "uid";

  @SerializedName(SERIALIZED_NAME_UID)
  private String uid;

  public static final String SERIALIZED_NAME_USERNAME = "username";

  @SerializedName(SERIALIZED_NAME_USERNAME)
  private String username;

  /**
   * This function allows you to add a map of extra information to the object of type
   * `UserInfo`. The map has string keys and lists of string values. The function simply
   * sets the `extra` field of the `UserInfo` object to the provided map.
   * 
   * @param extra The `extra` input parameter is a Map of string key-value pairs that
   * are stored as an additional set of information within the `UserInfo` object.
   * 
   * @returns This function takes a `Map<String,(List<String>)>` object as an argument
   * and returns an instance of the same type. The function does not modify or return
   * any explicit value from the map; instead it simply assigns the map to the field
   * `extra` of the current instance. Therefore the output returned by this function
   * is a reference to the original map passed as an argument.
   */
  public UserInfo extra(Map<String, List<String>> extra) {

    this.extra = extra;
    return this;
  }

  /**
   * This function allows a `UserInfo` object to add an additional item (a list of
   * strings) to a map of extra items associated with the user.
   * 
   * @param key In this function `putExtraItem`, the `key` input parameter is used as
   * a key to store the associated value (a list of strings) inside the `extra` map.
   * 
   * @param extraItem The `extraItem` parameter is a list of strings that is added to
   * the `extra` map within the `UserInfo` object. It allows the method to accept
   * multiple values for a given key.
   * 
   * @returns The `putExtraItem` function takes a `String` key and a `List<String>`
   * value as input and adds the value to the `extra` map within the `UserInfo` object.
   * The output of the function is the updated `UserInfo` object with the added extra
   * item.
   */
  public UserInfo putExtraItem(String key, List<String> extraItem) {
    if (this.extra == null) {
      this.extra = new HashMap<String, List<String>>();
    }
    this.extra.put(key, extraItem);
    return this;
  }

  /**
   * This function returns the map of additional information provided by the authenticator.
   * 
   * @returns Based on the given code snippet:
   * 
   * The `getExtra()` function returns a `Map` object containing key-value pairs where
   * the keys are strings and the values are lists of strings. The map may contain empty
   * lists for each key if no additional information was provided by the authenticator.
   */
  @javax.annotation.Nullable
  @ApiModelProperty(value = "Any additional information provided by the authenticator.")
  public Map<String, List<String>> getExtra() {
    return extra;
  }

  /**
   * This function sets the `extra` field of the receiver to the map of strings and
   * lists passed as an argument.
   * 
   * @param extra The `extra` input parameter is a map of strings to lists of strings
   * that is passed to the function as an argument. It allows the function to modify
   * the contents of the `extra` attribute of the object by updating or replacing the
   * existing value with the new value provided by the caller.
   */
  public void setExtra(Map<String, List<String>> extra) {
    this.extra = extra;
  }

  /**
   * The function `groups(List<String> groups)` sets the `groups` field of the `UserInfo`
   * object to the passed `groups` list and returns the same object.
   * 
   * @param groups The `groups` parameter is a list of strings that sets the groups for
   * the `UserInfo`. It assigns the list of groups to the `groups` field of the `UserInfo`
   * object.
   * 
   * @returns The output returned by this function is a `UserInfo` object with a `groups`
   * field that contains the list of input `String`s. In other words;  no explicit value
   * is returned from this function - only side-effecting (changing the instance state).
   */
  public UserInfo groups(List<String> groups) {

    this.groups = groups;
    return this;
  }

  /**
   * This function adds a string to the list of groups for the current user.
   * 
   * @param groupsItem The `groupsItem` input parameter is used to add a new group item
   * to the existing list of groups associated with the UserInfo object.
   * 
   * @returns The output returned by this function is a reference to the current
   * `UserInfo` object itself. In other words，the function returns `this`.
   */
  public UserInfo addGroupsItem(String groupsItem) {
    if (this.groups == null) {
      this.groups = new ArrayList<String>();
    }
    this.groups.add(groupsItem);
    return this;
  }

  /**
   * This function returns the list of groups that the user is a part of.
   * 
   * @returns Based on the code provided:
   * 
   * 	- The function `getGroups()` returns a `List<String>` of group names that the
   * user is a part of.
   * 	- The function return type is inferred to be `List<String>` since it is returning
   * a list of strings.
   * 	- The function is annotated with `@ApiModelProperty` to indicate that this method
   * returns a list of group names.
   * 	- There is no explicit return statement specified inside the method body.
   * 
   * Therefore the output returned by this function is an empty list `[]`, since there
   * is no explicit return statement and no default return value is specified for the
   * method.
   */
  @javax.annotation.Nullable
  @ApiModelProperty(value = "The names of groups this user is a part of.")
  public List<String> getGroups() {
    return groups;
  }

  /**
   * This function sets the `groups` field of the object to the list of strings passed
   * as an argument.
   * 
   * @param groups The `groups` input parameter is a list of strings that sets the value
   * of the `groups` field of the object that the function operates on.
   */
  public void setGroups(List<String> groups) {
    this.groups = groups;
  }

  /**
   * This function sets the value of the `uid` field of the `UserInfo` object to the
   * passed `uid` string and returns the updated `UserInfo` object.
   * 
   * @param uid The `uid` input parameter assigns the value of the string passed as an
   * argument to the `uid` field of the `UserInfo` object.
   * 
   * @returns The output returned by this function is a reference to the same `UserInfo`
   * object that was passed as an argument to the method. In other words; this method
   * doesn't create a new instance but instead it modifies the current object. This
   * means when you call `uid("any_value")` then `this` within the method would refer
   * to the object on which the method is being called and assigns the value "any_value"
   * to the `uid` field. Therefore; returning this same object as the result of the
   * method is equivalent to returning a reference to that same object.
   */
  public UserInfo uid(String uid) {

    this.uid = uid;
    return this;
  }

  /**
   * This function returns the unique identifier (UID) of the current user.
   * 
   * @returns Based on the annotation `@ApiModelProperty` and the function's return
   * type `String`, the output of this function is a `String` value representing a
   * unique identifier (UID) for the user.
   */
  @javax.annotation.Nullable
  @ApiModelProperty(
      value =
          "A unique value that identifies this user across time. If this user is deleted and another user by the same name is added, they will have different UIDs.")
  public String getUid() {
    return uid;
  }

  /**
   * This function sets the value of the `uid` field of the object to which it is called.
   * 
   * @param uid The `uid` input parameter sets the value of the `uid` field of the
   * object that the method is called on.
   */
  public void setUid(String uid) {
    this.uid = uid;
  }

  /**
   * This function sets the `username` field of the `UserInfo` object to the passed
   * `username` String and returns the updated `UserInfo` object.
   * 
   * @param username The `username` input parameter is a setter method that sets the
   * value of the `username` field within the `UserInfo` object.
   * 
   * @returns The output returned by this function is an object of type `UserInfo` with
   * a single field `username` set to the input `String` argument `username`.
   */
  public UserInfo username(String username) {

    this.username = username;
    return this;
  }

  /**
   * This function returns the username of the user.
   * 
   * @returns The output returned by this function is `undefined`. The reason is that
   * the function is attempting to return a value (`username`) from a null object
   * reference (`this`). Therefore、the output is undefined and may throw a NullPointerException
   * if attempted to be accessed.
   */
  @javax.annotation.Nullable
  @ApiModelProperty(value = "The name that uniquely identifies this user among all active users.")
  public String getUsername() {
    return username;
  }

  /**
   * This function sets the value of the `username` field of the object to which it is
   * called on to the value of the `username` parameter.
   * 
   * @param username In the given function `setUsername(String username)`, the `username`
   * input parameter assigns a new string value to the member variable `username` of
   * the class that contains the function.
   */
  public void setUsername(String username) {
    this.username = username;
  }

  /**
   * This function implements the `equals()` method for the `UserInfo` class. It compares
   * the current object with another object of the same class and returns `true` if
   * they have the same fields and values.
   * 
   * @param o In the `equals` method provided there is a single `Object o` parameter.
   * It acts as the object to compare against for equals functionality purposes.
   * 
   * @returns The output of this function is `true` if the current object is equal to
   * the passed object `o`, and `false` otherwise. The function checks for equality
   * based on the values of the following properties:
   * 
   * 	- `extra`: Compares the value of the `extra` field of both objects.
   * 	- `groups`: Compares the value of the `groups` field of both objects.
   * 	- `uid`: Compares the value of the `uid` field of both objects.
   * 	- `username`: Compares the value of the `username` field of both objects.
   * 
   * The function returns `true` if all fields are equal between the current object and
   * `o`, and `false` otherwise.
   */
  @Override
  public boolean equals(Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || getClass() != o.getClass()) {
      return false;
    }
    UserInfo userInfo = (UserInfo) o;
    return Objects.equals(this.extra, userInfo.extra)
        && Objects.equals(this.groups, userInfo.groups)
        && Objects.equals(this.uid, userInfo.uid)
        && Objects.equals(this.username, userInfo.username);
  }

  /**
   * This function defines an override for the `hashCode()` method of a class. It takes
   * three parameters - `extra`, `groups`, and `uid` - and returns their hash code based
   * on the `Objects.hash()` method.
   * 
   * @returns The output of this function is an integer hash code. It is calculated
   * using the `Objects.hash()` method and combines the hash values of four object
   * references: `extra`, `groups`, `uid`, and `username`. The resulting hash code is
   * returned as the value of the `hashCode()` method.
   */
  @Override
  public int hashCode() {
    return Objects.hash(extra, groups, uid, username);
  }

  /**
   * This function overrides the `toString()` method for the `UserInfo` class. It returns
   * a string representation of the object using `StringBuilder`. The string includes
   * properties like `extra`, `groups`, `uid`, and `username` with their values indented.
   * 
   * @returns The output returned by this function is a string that represents a concise
   * representation of an instance of the `UserInfo` class. It includes four key
   * properties: `extra`, `groups`, `uid`, and `username`, each followed by a colon and
   * then their respective values (as Strings).
   * 
   * Here is a breakdown of the output:
   * 
   * 1/ `class UserInfo {...}` - This line indicates that the output is an instance of
   * the `UserInfo` class.
   * 2/ `extra: [values]` - This line shows the value of the `extra` field as a list
   * of values.
   * 3/ `groups: [values]` - This line shows the value of the `groups` field as a list
   * of values.
   * 4/ `uid: integer` - This line shows the value of the `uid` field as an integer.
   * 5/ `username: string` - This line shows the value of the `username` field as a string.
   * 6/ `}` - This final bracket indicates the end of the output string.
   */
  @Override
  public String toString() {
    StringBuilder sb = new StringBuilder();
    sb.append("class UserInfo {\n");
    sb.append("    extra: ").append(toIndentedString(extra)).append("\n");
    sb.append("    groups: ").append(toIndentedString(groups)).append("\n");
    sb.append("    uid: ").append(toIndentedString(uid)).append("\n");
    sb.append("    username: ").append(toIndentedString(username)).append("\n");
    sb.append("}");
    return sb.toString();
  }

  /**
   * This function takes an object `o` and returns its string representation with each
   * line indented using four spaces (`\n
   * 
   * @param o The `o` input parameter is the object to be indented as a string.
   * 
   * @returns The function `toIndentedString` takes an object `o` as input and returns
   * a string representation of the object with indentation. If `o` is null,"null" is
   * returned. Otherwise the function calls `toString()` on `o` and replaces all new
   * line characters `\n` with the concatenation of the newline character and four
   * spaces "\n
   */
  private String toIndentedString(Object o) {
    if (o == null) {
      return "null";
    }
    return o.toString().replace("\n", "\n    ");
  }
}
