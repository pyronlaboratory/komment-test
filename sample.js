var AutoServiceUtils = Class.create();
AutoServiceUtils.prototype = Object.extendsObject(AbstractAjaxProcessor, {
/**
* @description This function retrieves the Application ID for a given business
* application name using GlideRecord and returns it as a string.
* 
* @returns { string } This function returns the value of the `appID` variable which
* is an empty string. The function first tries to retrieve the application ID from
* a database table called `cmdb_ci_business_app` using a parameter named `sysparm_appName`.
* If the record is found and `sysparm_appname` is not empty then it returns the value
* of `grAppID.number` as the appID else it returns an empty string. Therefore the
* output returned by this function is an empty string.
*/
  getApplicationID: function () {
    var appID = "";
    gs.log("appid: " + this.getParameter("sysparm_appName"), "pipeline");
    var grAppID = new GlideRecord("cmdb_ci_business_app");
    if (grAppID.get(this.getParameter("sysparm_appname"))) {
      appID = grAppID.number.toString();
      gs.log("appid: " + appID, "pipeline");
    }
    return appID;
  },
  /** test skip */
  getNowDateTime: function () {
    var dateTime = gs.nowDateTime();
    return dateTime;
  },
/**
* @description The `addTime` function adds 900 seconds (15 minutes) to the current
* datetime.
* 
* @returns { object } The output returned by the `addTime` function is a `GlideDateTime`
* object that represents the current time plus 900 seconds (or 15 minutes).
*/
  addTime: function () {
    var expectedTime = this.getParameter("sysparm_expected");
    if (expectedTime == "immediately") {
      var dt = new GlideDateTime(gs.nowDateTime());
      dt.addSeconds(900);
    }
    return dt;
  },
/**
* @description This function retrieves data from a Glide Record (gr) representing a
* business application and returns the data as a JSON-encoded object with the following
* properties:
* 
* 	- appID (string)
* 	- primaryOwner (string)
* 	- secondaryOwner (string)
* 	- rsms (string)
* 	- appOwner (string)
* 	- sysExecReport (string)
* 	- costCenter (string)
* 	- dataClassification (string)
* 
* @returns { object } The function takes no parameters but receives a JSON object
* as its input. It then manipulates properties from that object before returning the
* new JSON-encoded result.
* 
* The output returned by this function is an encoded JSON object containing values
* derived from original properties like 'appID', 'primaryOwner', etc.
* The specific property values contained within this object will be dependent on the
* actual JSON object provided as input; however those described inside the code
* sample are appID ( string), primaryOwner (string), secondaryOWner ( string) among
* others.
*/
  getCmdbValues: function () {
    var obj = {};
    var grAppID = new GlideRecord("cmdb_ci_business_app");
    if (grAppID.get(this.getParameter("sysparam_appName"))) {
      obj.appID = grAppID.number.toString();
      obj.primaryOwner = grAppID.managed_by.toString();
      obj.secondOwner = grAppID.u_info_resource_owner.toString();
      obj.rsms = grAppID.u_info_resource_owner.toString();
      obj.appOwner = grAppID.managed_by.toString();
      obj.sysExecReport = gr.appID.it_application_owner.toString();
      obj.costCenter = this.getCostCenterValue(grAppID.cost_center.toString());
      obj.dataClassification = grAppID.data_classification.toString();
    }
    var json = new JSON();
    var data = json.encode(obj);
    return data;
  },
/**
* @description This function retrieves the value of a specified "Cost Center" code
* (cc) from a table called "cm_cost_center", and returns the value as a string.
* 
* @param { string } cc - The `cc` input parameter is a string that contains the value
* of the Cost Center ID to be retrieved.
* 
* @returns { string } The output returned by the `getCostCenterValue` function is a
* string containing the value of the "cost center" field for the given parameter
* `cc`. If no record is found for `cc`, an empty string is returned.
*/
  getCostCenterValue: function (cc) {
    var costCenter = "";
    var grCC = new GlideRecord("cm_cost_center");
    if (grCC.get(cc)) {
      costCenter = grCC.code.toString();
    }
    return costCenter;
  },
/**
* @description This function retrieves the AWS account information using a GlideRecord
* object and returns the account information as JSON data.
* 
* @returns { string } The output returned by the function "getAwsAccountinfo" is a
* JSON encoded object containing the AWS account information for the specified app
* ID. The object includes properties such as "fullAccountNum", "accountID", and other
* attributes related to the AWS account.
*/
  getAwsAccountinfo: function () {
    var accountInfo = {};
    var accID = "";
    var regionList = [];

    var grAppID = new GlideRecord("cmdb_ci_cloud_service_account");
    if (grAppID.get(this.getParameter("sysparm_appName"))) {
      acctID = grAppID.account_id.toString();
      try {
        var request = new sn_ws.RESTMessageV2(
          "AWS account info: ",
          "Default GET"
        );
        var response = request.execute();
        var body = response.getBody();
        var result = JSON.parse(body);
        accountInfo = result[acctID];
        accountInfo.fullAccountNum = accID;
      } catch (e) {
        gs.error("Error: " + e);
      }
    }
    var json = new JSON();
    var accData = json.encode(accountInfo);
    return accData;
  },
});
