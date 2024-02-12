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

  public UserInfo extra(Map<String, List<String>> extra) {

    this.extra = extra;
    return this;
  }

  /**
   * This function adds an extra item to the list of extra items associated with the
   * current user. It takes a string key and a list of string values as input and stores
   * the values for the specified key under the extra attribute as a list.
   * 
   * @param key In this function `key` is a parameter that serves as the key for the
   * map where the list of strings will be stored. It represents the name of the extra
   * item that is being added to the UserInfo object.
   * 
   * @param extraItem The `extraItem` input parameter is a list of strings that is added
   * to the `extra` map within the `UserInfo` object. It allows the user to add multiple
   * extra items with the same key.
   * 
   * @returns The `putExtraItem()` method takes a `String` key and a list of `String`
   * values as input and adds them to the `extra` map if it is null or overwrites the
   * existing value for that key if it is not null. The output returned by this function
   * is a reference to the updated `UserInfo` object.
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
   * @returns This function returns a `Map<String!, List<String>>` object called `extra`,
   * which contains additional information provided by the authenticator. The value of
   * each key-value pair is a list of strings. In other words:
   * 
   * Return type: `Map<String!, List<String>>`
   * 
   * Output: A map containing any additional information provided by the authenticator
   * as key-value pairs.
   */
  @javax.annotation.Nullable
  @ApiModelProperty(value = "Any additional information provided by the authenticator.")
  public Map<String, List<String>> getExtra() {
    return extra;
  }

  /**
   * This function sets the `extra` field of the object to the provided `Map<String(),
   * List<String>>` map.
   * 
   * @param extra The `extra` input parameter is a Map of String keys to Lists of String
   * values that are assigned to the object's `extra` field.
   */
  public void setExtra(Map<String, List<String>> extra) {
    this.extra = extra;
  }

  /**
   * This function allows a `UserInfo` object to set a list of groups for the user. It
   * takes a list of strings representing the group names and stores them as a list of
   * strings within the `groups` attribute of the `UserInfo` object.
   * 
   * @param groups The `groups` input parameter is used to set the list of groups that
   * a `UserInfo` object belongs to.
   * 
   * @returns The output of this function is a reference to the `UserInfo` object itself.
   * The function takes a list of string group names as input and stores them into the
   * `groups` field of the `UserInfo` object. Then it returns the updated `UserInfo`
   * object. In other words;
   * 
   * ```output = UserInfo(groups: [group1/, group2/, ...]);```
   */
  public UserInfo groups(List<String> groups) {

    this.groups = groups;
    return this;
  }

  /**
   * This function adds a string 'groupsItem' to the list of groups associated with the
   * UserInfo object.
   * 
   * @param groupsItem The `groupsItem` parameter adds a single group item to the
   * existing list of groups stored inside the `groups` attribute of the `UserInfo` object.
   * 
   * @returns The output returned by this function is a reference to the `UserInfo`
   * object itself. In other words. it returns the `UserInfo` instance that was passed
   * as an argument to the method. This is called "self-referential" or "reference-style"
   * return type.
   */
  public UserInfo addGroupsItem(String groupsItem) {
    if (this.groups == null) {
      this.groups = new ArrayList<String>();
    }
    this.groups.add(groupsItem);
    return this;
  }

  /**
   * This function returns a list of strings representing the groups that the user is
   * a part of.
   * 
   * @returns The output returned by this function is a list of strings representing
   * the groups that the user is a part of.
   */
  @javax.annotation.Nullable
  @ApiModelProperty(value = "The names of groups this user is a part of.")
  public List<String> getGroups() {
    return groups;
  }

  /**
   * This function sets the "groups" field of the object to the given list of strings.
   * 
   * @param groups The `groups` parameter is a list of strings that is being passed to
   * the `setGroups` method. It is used to update the value of the `groups` field of
   * the object that contains the method.
   */
  public void setGroups(List<String> groups) {
    this.groups = groups;
  }

  /**
   * This function sets the `uid` field of the `UserInfo` object to the given `uid`
   * string and returns the `UserInfo` object itself.
   * 
   * @param uid The `uid` input parameter assigns a value to the `uid` field of the
   * `UserInfo` object.
   * 
   * @returns This function takes a `uid` parameter of type `String` and does not return
   * any value. Instead it simply sets the field `uid` of the object to the value passed
   * as argument and returns the current object reference (`this`). Therefore the output
   * returned by this function is `null`.
   */
  public UserInfo uid(String uid) {

    this.uid = uid;
    return this;
  }

  /**
   * This function returns the "unique identifier" (UID) of a user.
   * 
   * @returns The output of this function is a `String` value that represents a unique
   * identifier (UID) for the user. The UID is used to identify the user across time
   * and differentiate them from other users with the same name if they are deleted and
   * re-added.
   */
  @javax.annotation.Nullable
  @ApiModelProperty(
      value =
          "A unique value that identifies this user across time. If this user is deleted and another user by the same name is added, they will have different UIDs.")
  public String getUid() {
    return uid;
  }

  /**
   * The function sets the value of the field "uid" to the given String "uid".
   * 
   * @param uid The `uid` input parameter sets the value of the `uid` field for the
   * object that this method is called on.
   */
  public void setUid(String uid) {
    this.uid = uid;
  }

  /**
   * This function sets the `username` field of the `UserInfo` object to the given
   * `username` and returns the same `UserInfo` object.
   * 
   * @param username The `username` input parameter sets the value of the `username`
   * field of the `UserInfo` object being constructed.
   * 
   * @returns The output returned by this function is `UserInfo` object itself.
   * 
   * Concisely: the function returns a reference to the current `UserInfo` object.
   */
  public UserInfo username(String username) {

    this.username = username;
    return this;
  }

  /**
   * This function returns the unique username of the user.
   * 
   * @returns Based on the information provided:
   * 
   * The `getUsername()` method returns the value of the `username` field of the object.
   * The `username` field is defined as `nullable` and is annotated with `@ApiModelProperty`,
   * indicating that it is a property that should be exposed to external APIs. Therefore:
   * 
   * Output: The return value is `null` if the `username` field is not set (i.e., `null`).
   */
  @javax.annotation.Nullable
  @ApiModelProperty(value = "The name that uniquely identifies this user among all active users.")
  public String getUsername() {
    return username;
  }

  /**
   * The function `setUsername(String username)` sets the value of the field `username`
   * to the given `String` value.
   * 
   * @param username In this function `setUsername(String username)`, the `username`
   * parameter assigns a new value to the `username` field of the object that this
   * method belongs to.
   */
  public void setUsername(String username) {
    this.username = username;
  }

  /**
   * This function implements the `equals` method for the `UserInfo` class and compares
   * the current object with another `UserInfo` object passed as an argument. It returns
   * `true` if the two objects are equal (based on their attributes), and `false` otherwise.
   * 
   * @param o In this function implementation of the `equals` method for the `UserInfo`
   * class:
   * 
   * 	- `o` is the object to be compared with the current instance.
   * 	- It serves as a reference to the other object that needs to be matched for equality.
   * 
   * @returns This function returns a boolean value indicating whether two `UserInfo`
   * objects are equal. It compares the values of their attributes (`extra`, `groups`,
   * `uid`, and `username`) using the `Objects.equals()` method. If all of the attributes
   * are the same values for both objectsives then the function will return `true`.
   * Otherwise it will return `false`.
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
   * This function overridden from the parent class , returns the hashcode for an object
   * based on four attributes - extra , groups , uid and username .
   * 
   * @returns The output of this function is an integer value that represents the hash
   * code of the object. The hash code is generated using the `Objects.hash()` method
   * and combines the values of four properties (`extra`, `groups`, `uid`, and `username`)
   * to produce a unique integer value for each object instance.
   */
  @Override
  public int hashCode() {
    return Objects.hash(extra, groups, uid, username);
  }

  /**
   * This function overrides the `toString()` method for the `UserInfo` class. It
   * generates a string representation of the object by appending information about its
   * fields (i.e., `extra`, `groups`, `uid`, and `username`) to a `StringBuilder` instance.
   * 
   * @returns This function is an override of the `toString()` method for a class called
   * `UserInfo`. It takes a `StringBuilder` object as its argument and returns a `String`
   * representation of the `UserInfo` object.
   * 
   * The output returned by this function is a string that describes the properties of
   * the `UserInfo` object. The string includes four key-value pairs:
   * 
   * 	- `extra`: the value of the `extra` field
   * 	- `groups`: the value of the `groups` field
   * 	- `uid`: the value of the `uid` field
   * 	- `username`: the value of the `username` field
   * 
   * Each key-value pair is displayed on a separate line within the string. The string
   * ends with a closing curly brace `}`.
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
   * This function takes an object as input and returns a string representation of the
   * object with each line indented with four spaces. If the input is null(), the
   * function returns the string "null".
   * 
   * @param o The `o` parameter is the object for which the function is generating an
   * indented string representation.
   * 
   * @returns This function takes an Object input and returns a String representation
   * of it with indentation. If the input is null(), it returns "null". Otherwise,"it
   * returnesthe string representation of the input object without any indentation(
   * i.e., o.toString()),but replaces every occurrence of a new line (\n) characterwith
   * the sequence "\n
   */
  private String toIndentedString(Object o) {
    if (o == null) {
      return "null";
    }
    return o.toString().replace("\n", "\n    ");
  }
}
