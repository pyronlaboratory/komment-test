var AutoServiceUtils = Class.create();
AutoServiceUtils.prototype = Object.extendsObject(AbstractAjaxProcessor, {
/**
* @description Here is the answer to your request.
* 
* getApplicationID retrieves an application identifier and returns it. First this
* method searches for a CI business application glide record associated with the
* sysparm_appname parameter using GlideRecord then checks if a matching record exists.
* Next this method tries to find the application identification from  this associated
* record by using number. If there's data use string concatenation and the resulting
* value log into pipeline under appid as well as setting returned var equal to log.
* If an error occur a blank (empty string) is returned
* 
* @returns { string } The getApplicationID() function returns a string value of the
* application ID (appID) derived from a record fetched from the 'cmdb_ci_business_app'
* table based on the value stored within the sysparm_appname parameter; this string
* value is returned after logging relevant information about the record retrieval
* process through GlideLogging infrastructure for pipeline log reporting purposes.
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
* @description Adds 15 minutes to a date-time object.
* 
* @returns { object } Function 'addTime' returns a GlideDateTime object with the
* current time plus 15 minutes.
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
* @description Here is a concise answer to your request:
* 
* Returns object with appID application attributes (business app CI ID): {objectID=value}.
*    obj = {};        grAppID: GlideRecord('cmdb_ci_business_app');  
* if(grAppID.get(sysparam_appName)) {'obj':   appID : grAppID.number.toString(),
* primaryOwner  :   grAppID.managed_by.toString();secondOwner   : grAppID.u_info_resource_owner.toString();
* rsms:         grAppID.u_info_resource_owner.toString(); appOwner   
* :grAppID.managed_by.toString(); sysExecReport  :  grAppID.it_application_owner.toString();
*      costCenter   :  getCostCenterValue(grAppID.cost_center);     dataClassification
*     :  grAppID.data_classification
*                  }  var json      = new JSON;  var     data         =   json.encode(obj);
*        return        data       ;
* 
* @returns { string } Output: An object containing application ID and several related
* party owner strings obtained from a GlideRecord representing an app ID of type
* number with various other details
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
* @description Retrieves the value of a cost center by its identifier (cc).
* 
* @param { string } cc - The `cc` input parameter is passed as an argument to the
* `getCostCenterValue()` function and sets the ID of the value requested for a
* specified Cost Center record within the `cm_cost_center` table.
* 
* @returns { string } function output: A string value representing the Cost Center
* code.
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
* @description retrieve AWS account information by calling an API and returning the
* results as JSON-encoded data
* 
* @returns { string } Output: A JSON string representing the AWS account information
* for the specified app ID.
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
