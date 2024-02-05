var AutoServiceUtils = Class.create();
AutoServiceUtils.prototype = Object.extendsObject(AbstractAjaxProcessor, {
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
  addTime: function () {
    var expectedTime = this.getParameter("sysparm_expected");
    if (expectedTime == "immediately") {
      var dt = new GlideDateTime(gs.nowDateTime());
      dt.addSeconds(900);
    }
    return dt;
  },
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
  getCostCenterValue: function (cc) {
    var costCenter = "";
    var grCC = new GlideRecord("cm_cost_center");
    if (grCC.get(cc)) {
      costCenter = grCC.code.toString();
    }
    return costCenter;
  },
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
