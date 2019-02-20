var callbacks = {};

/// Execute callback
var execCallback = function (id) {
  if (!callbacks[id])
    return;
  callbacks[id].call();
};

/*
 var timeConvert = function(v){
 if(!v||(v=="")){
 return 0;
 }else{
 debugger;
 var sr = v.split(':');
 if(sr && (sr.length==2)){
 return ((parseInt(sr[0])*60)+parseInt(sr[1]));
 }else{
 return 0;
 }
 }
 }
 */

var timeConvert = function(v){
  if(!v||(v=="")){
    return 0;
  }else{
    debugger;
    var sr = v.split(':');
    if(sr && (sr.length==2)){
      return ((parseInt(sr[0])*60*60)+(parseInt(sr[1])*60));
    }else{
      return 0;
    }
  }
};

(function ($) {
  var units = {};
  var master_resource = null;
  var report_id = null;
  var dom_globals;
  var calculated = 0; //report tables

  var clear_data = [];
  var header_total_data = {};

  var results_reports = {};

  var cunit = null;

  var ctimes = null;

  var deltaTime = 0;

  var ctrips = null;

  var LANG = "";

  var PRINT_URL = "ax";

  // var resources = []; //reports

  /// Time format
  var en_format_time = ''; //"yyyy-MM-dd HH:mm";

  /// options for date
  var initDatepickerOpt;

  /// format for address
//    var address_format;

  var TODAY = {
    from: 0,
    to: 0
  };

  var LOCAL_STATE = {
    time_from: 0,
    time_to: 0,
    time_custom: null,
    time_type: 0
  };

  var changeTimeTimeout;

  /// Translate function
  var translate = function (txt) {
    var result = txt;
    if (typeof TRANSLATIONS !== "undefined" && typeof TRANSLATIONS === "object" && TRANSLATIONS[txt]) {
      result = TRANSLATIONS[txt];
    }
    return result;
  };

  /// IE check
  function ie() {
    return (navigator.appVersion.indexOf("MSIE 6") != -1 || navigator.appVersion.indexOf("MSIE 7") != -1 || navigator.appVersion.indexOf("MSIE 8") != -1);
  }

  /// Wrap callback
  function wrapCallback(callback) {
    var id = (new Date()).getTime();
    callbacks[id] = callback;
    return id;
  }

  /// Fetch varable from 'GET' request
  function getHtmlVar(name) {
    if (!name)
      return null;
    var pairs = decodeURIComponent(document.location.search.substr(1)).split("&");
    for (var i = 0; i < pairs.length; i++) {
      var pair = pairs[i].split("=");
      if (pair[0] == name) {
        pair.splice(0, 1);
        return pair.join("=");
      }
    }
    return null;
  }

  /// Load script
  function loadScript(src, callback) {
    var script = document.createElement("script");
    script.setAttribute("type", "text/javascript");
    script.setAttribute("charset", "UTF-8");
    script.setAttribute("src", src);
    if (callback && typeof callback == "function") {
      wrapCallback(callback);
      if (ie())
        script.onreadystatechange = function () {
          if (this.readyState == 'complete' || this.readyState == 'loaded')
            callback();
        };
      else
        script.setAttribute("onLoad", "execCallback(" + wrapCallback(callback) + ")");
    }
    document.getElementsByTagName("head")[0].appendChild(script);
  }

  /// Login result
  function login(code) {

//
//        console.log(translate("login") + ": " + code);
    if (code) {
      alert(translate("Login error"));
      return;
    }

    disableui();
//        wialon.core.Session.getInstance().loadLibrary("resourceDrivers");
    wialon.core.Session.getInstance().loadLibrary("unitTripDetector");
    wialon.core.Session.getInstance().loadLibrary("unitEventRegistrar");
    wialon.core.Session.getInstance().loadLibrary("resourceReports");
    wialon.core.Session.getInstance().loadLibrary("unitReportSettings");
    wialon.core.Session.getInstance().loadLibrary("resourceZones");
    wialon.core.Session.getInstance().loadLibrary("unitEvents");
    wialon.core.Session.getInstance().loadLibrary("unitSensors");
    wialon.core.Session.getInstance().loadLibrary("itemCustomFields");
//        wialon.core.Session.getInstance().loadLibrary("resourceReports"); // load Reports Library


    wialon.core.Remote.getInstance().startBatch();
    var fd,
      items;
    var spec_resource = {
      itemsType: "avl_resource",
      propName: "sys_name",
      propValueMask: "*",
      sortType: "sys_name"
    };

    var flags_resource = wialon.item.Item.dataFlag.base | wialon.item.Resource.dataFlag.reports;

    wialon.core.Session.getInstance().searchItems(spec_resource, true, flags_resource, 0, 0, function (code, data) {
      if (code === 0 && data && data.items && data.items.length > 0) {
        var reports;

        for (var i = 0, len = data.items.length; i < len; i++) {
          var item = data.items[i];
          if (!item) {
            return;
          }

          reports = item.getReports();
          var report_name = 'Report_SDK';
          for (var j in reports) {
            if (Object.prototype.hasOwnProperty.call(reports, j)) {
              if ("avl_unit" != reports[j].ct)continue;
              if (report_name == reports[j].n) {
                report_id = reports[j].id;
                master_resource = item;
              }
            }
          }


        }
        if (!report_id) {
          alert(translate("РќРµ РЅР°Р№РґРµРЅ РѕС‚С‡РµС‚ ") + ' ' + report_name);
        }
      }
    });

    wialon.core.Session.getInstance().getCurrUser().getLocale(function (arg, locale) {
      fd = (locale && locale.fd) ? locale.fd : '%Y-%m-%E_%H:%M:%S'; // check for users who have never changed the parameters of the metric

//            if(locale.wd){}
      initDatepickerOpt = {
        wd: (locale && locale.wd && locale.wd > 1) ? 0 : 1,
        wd_orig: locale.wd,
        fd: fd
      };
    });
//        address_format = wialon.core.Session.getInstance().getCurrUser().getCustomProperty("us_addr_fmt", "");
//        debugger;
    var spec_unit = {
      itemsType: "avl_unit",
      propName: "sys_name",
      propValueMask: "*",
      sortType: "sys_name"
    };
    var flags_unit = wialon.item.Item.dataFlag.base | wialon.item.Unit.dataFlag.sensors;
    wialon.core.Session.getInstance().searchItems(spec_unit, true, flags_unit, 0, 0, function (code, data) {
      //$("#table-wrap").activity(false);
      if (code || !data) {
        alert(translate("List of units empty."));
      } else if (!data.items || data.items.length < 1) {
        alert(translate("List of units empty."));
      } else {
        items = data.items;
      }
    });


    wialon.core.Remote.getInstance().finishBatch(qx.lang.Function.bind(function () {

      en_format_time = wialon.util.DateTime.convertFormat(fd, true).replace(/_/, '<br>').replace(/ /, '&nbsp;');

      // set default regional settings
      var regional = $.datepicker.regional[LANG];
      if (regional) {
        $.datepicker.setDefaults(regional);
        // also wialon locale
        wialon.util.DateTime.setLocale(
          regional.dayNames,
          regional.monthNames,
          regional.dayNamesShort,
          regional.monthNamesShort
        );
      }
//
      fill_units_select(items);
      fill_timezone_info();
//            checkReport(resources);
//
      initDatepicker(initDatepickerOpt.fd, initDatepickerOpt.wd_orig);

//            debugger;
      addEventsListeners();


    })); // finishBatch

  }

  /// Change href to sid user
  function addSid(code) {
    if (code) {

      return;
    }
    var sid = wialon.core.Session.getInstance().getId();
    var user = wialon.core.Session.getInstance().getCurrUser().getName();

    var pathArray = window.location.href.split('/');
    var protocol = pathArray[0];
    var host = pathArray[2];
    var url = protocol + '//' + host;
    window.location.href = url + '/app/simple/?sid=' + sid + '&user_name=' + user + '&lang=' + LANG;
  }

  function fill_timezone_info() {
    var minutes = parseInt(wialon.util.DateTime.getTimezoneOffset() % (3600)/60);
    var hours = parseInt(wialon.util.DateTime.getTimezoneOffset() / 3600);
    var plus = (hours > 0) ? "+" : "-";
    if (hours == 0) {
      plus = (minutes >= 0) ? "+" : "-";
    }
    minutes = (Math.abs(minutes) < 10) ? "0" + Math.abs(minutes) : Math.abs(minutes) + "";
    hours = (Math.abs(hours) < 10) ? "0" + Math.abs(hours) : Math.abs(hours) + "";
    $('#time-zone-info').html($.localise.tr('Timezone') + ": UTC " + plus + hours + ":" + minutes);
//        debugger;



  }

  /// Fill in the interface 'select' html for control unit selection
  function fill_units_select(items) {
    units = {}; // update global variable
    var html = "";
    for (var i = 0, len = items.length; i < len; i++) {
      var item = items[i];
      if (!item) {
        continue;
      }
      var access = item.getUserAccess();
//            debugger;
      if (wialon.util.Number.and(wialon.item.Unit.accessFlag.monitorState, access)) {
        units[item.getId()] = item;
        html += "<option value='" + item.getId() + "'>" + item.getName() + "</option>";
      }
      if (!units || units.length < 1) {
        alert(translate("List of units empty."));
      }
    }
    $("#units-select").html(html);
  }

  var currentType, currentInterval;
  /// init initDatepicker
  function initDatepicker(setDateFormat, firstDayOrig) {
    var rangingTimeWrap = $("#ranging-time-wrap");
    var options = {
      template: $('#ranging-time-tpl').html(),
      labels: {
        yesterday: $.localise.tr("Yesterday"),
        today: $.localise.tr("Today"),
        week: $.localise.tr("Week"),
        month: $.localise.tr("Month"),
        custom: $.localise.tr("Custom"),
        ok: "OK"
      },
      datepicker: {
        prevText: '',
        nextText: ''
      },
      onInit: function () {
        rangingTimeWrap.intervalWialon('set', 0);
        currentType = rangingTimeWrap.intervalWialon('type');
      },
      onChange: function (data) {
        changeTime.apply(this, data);
        currentType = rangingTimeWrap.intervalWialon('type');
        if (currentType == 4) {
          currentInterval = rangingTimeWrap.intervalWialon('get');
        }

      },
      onAfterClick: function () {
        $(".date-time-content").resize();
      },
      tzOffset: wialon.util.DateTime.getTimezoneOffset(),
      now: wialon.core.Session.getInstance().getServerTime()
    };

    options.dateFormat = wialon.util.DateTime.convertFormat(setDateFormat.split('_')[0], true);
    options.firstDay = firstDayOrig;

    rangingTimeWrap.intervalWialon(options);

    $('#datetimepicker-from').datetimepicker({
      datepicker:false,
      format:'H:i',
      step:15
    });
    $('#datetimepicker-to').datetimepicker({
      datepicker:false,
      format:'H:i',
      step:15
    });
  }

  /// set Date
  /*function setDateToDatepicker(from, to) {
   if (from) {
   $("#date-from").datepicker("option", "defaultDate", from).datepicker("setDate", from);
   }
   if (to) {
   $("#date-to").datepicker("option", "defaultDate", to).datepicker("setDate", to);
   }
   }*/

  function changeTime(value, interval) {
//
    if (!interval)
      return;
    value = parseInt(value, 10);
    // var interval = get_time_from_input();
    if (value == 4 && LOCAL_STATE.time_custom === null) {
      LOCAL_STATE.time_custom = interval;
    }
    LOCAL_STATE.time_type = value;

//

//        $('#execute-btn').hide();
    if (changeTimeTimeout !== null) {
      clearTimeout(changeTimeTimeout);
    }
    changeTimeTimeout = setTimeout(function () {
      execute();
      clearTimeout(changeTimeTimeout);
      changeTimeTimeout = null;
    }, 1000);

    activateTimeTemplate(value);
  }

  function activateTimeTemplate(value) {
    $("#time-select").find(".time-template.active").removeClass("active");

    var obj = $("#time_" + value);
    if (!obj && !obj.length) return false;

    if (value === 0 || value === 1) {
      if ((LOCAL_STATE.time_from == TODAY.from - 86400 && LOCAL_STATE.time_to == TODAY.to - 86400 * 2 + 1) ||
        (LOCAL_STATE.time_from == TODAY.from && LOCAL_STATE.time_to == TODAY.to - 86399)) {
        obj.addClass("active");
      }
    } else {
      obj.addClass("active");
    }


    $(".date-time-content").resize();
    return true;
  }

  function exportxls() {
//        debugger;
    console.log(clear_data);
    console.log(header_total_data);
//        disableui();
//        debugger;

    if (clear_data.length > 0) {
      $.ajax({
        type: "POST",
        url: PRINT_URL + '/download.php',
        data: {data: JSON.stringify(clear_data), total: JSON.stringify(header_total_data), user: wialon.core.Session.getInstance().getCurrUser().getName()},
        success: function (response, status) {
          undisableui();
          if (response && status == "success") {
//
            response = jQuery.parseJSON(response);
            console.log(response);
            debugger;
            if (response.url) {

              window.location.href = PRINT_URL + response.url;
            }
          } else {
            alert($.localise.tr("Error while export to xls"));

          }
        },
        error: function () {
          undisableui();
          alert($.localise.tr("Error while export to xls"));
        },
        timeout: 90000

      });
    } else {
      alert($.localise.tr('No data to export'));
    }

  }


  function execute() {
    var unit = getUnitFromInput();
    if (!unit) {
      alert($.localise.tr("Please select unit."));
      return;
    }
    disableui();


    var times = $("#ranging-time-wrap").intervalWialon('get', true);
    if (!times) {
      //alert($.localise.tr("Please select time interval."));
      return;
    }

    times[0] = times[0] - wialon.util.DateTime.getDSTOffset(times[0]);
    times[1] = times[1] - wialon.util.DateTime.getDSTOffset(times[1]);
//        deltaTime = wialon.util.DateTime.getTimezoneOffset() + (new Date()).getTimezoneOffset() * 60;
    ctimes = times;
    cunit = unit;
//
    getHeaderData(unit, times);
  }

//    function apply(input) {
//        console.log('apply')
//        console.log(input)
//
//    }

  function isHolidays(time) {
//
    var delta = wialon.util.DateTime.getTimezoneOffset() + (new Date()).getTimezoneOffset() * 60;
    var k = new Date((time + delta) * 1000);

    var nmb = k.getDay();
    var result = false;
    if (nmb < 1 || nmb > 5) {
      result = true;
    }

    return result;
  }

  function parseDateWialonTimezone(time) {
//
    var delta = wialon.util.DateTime.getTimezoneOffset() + (new Date()).getTimezoneOffset() * 60;
    var k = new Date((time + delta) * 1000);
    var result = {};
    result.year = k.getFullYear();
//        result.year = result.year.substr(result.year.length - 2);

    result.month = k.getMonth() + 1;
    result.month = (result.month < 10) ? "0" + result.month : result.month;
    result.date = k.getDate();


    return result;
  }

  function getHeaderTypeFromHeader(header,keytable){
    var headerToHeaderType = null;
    switch (keytable){
      case "unit_custom_fields":
        headerToHeaderType = {
          "РРјСЏ":"name",
          "Р—РЅР°С‡РµРЅРёРµ":"value"
        };
        break;
      case "unit_trips":
        headerToHeaderType = {
          "РќР°С‡Р°Р»Рѕ":"time_begin",
          "РљРѕРЅРµС†":"time_end",
          "Р”Р»РёС‚РµР»СЊРЅРѕСЃС‚СЊ":"duration",
          "РќР°С‡. РїРѕР»РѕР¶РµРЅРёРµ":"location_begin",
          "РљРѕРЅРµС‡. РїРѕР»РѕР¶РµРЅРёРµ":"location_end",
          "РџСЂРѕР±РµРі (СЃРєРѕСЂСЂРµРєС‚РёСЂРѕРІР°РЅРЅС‹Р№)":"correct_mileage",
          "РљРѕРЅРµС‡РЅС‹Р№ РїСЂРѕР±РµРі":"absolute_mileage_end",
          "РџСЂРѕР±РµРі": "mileage",
          "РџРѕС‚СЂР°С‡РµРЅРѕ":"fuel_consumption_all",
          "РџРѕС‚СЂР°С‡РµРЅРѕ РїРѕ Р”РЈРў":"fuel_consumption_fls",
          "РџРѕС‚СЂР°С‡РµРЅРѕ РїРѕ Р”РР Рў":"fuel_consumption_imp",
          "РџРѕС‚СЂР°С‡РµРЅРѕ РїРѕ Р”РђР Рў":"fuel_consumption_abs",
          "РџРѕС‚СЂР°С‡РµРЅРѕ РїРѕ Р”РњР Рў":"fuel_consumption_ins",
          "РџРѕС‚СЂР°С‡РµРЅРѕ РїРѕ СЂР°СЃС‡РµС‚Сѓ":"fuel_consumption_math",
          "РџРѕС‚СЂР°С‡РµРЅРѕ РїРѕ РЅРѕСЂРјР°Рј":"fuel_consumption_rates",
          "РќР°С‡Р°Р»СЊРЅС‹Р№ РїСЂРѕР±РµРі":"absolute_mileage_begin",
          "РќР°С‡. СЃС‡РµС‚С‡РёРє":"initial_counter_sensors",
          "РљРѕРЅ. СЃС‡РµС‚С‡РёРє":"final_counter_sensors",
          "РњРѕС‚РѕС‡Р°СЃС‹":"eh_duration",
          "Р’СЂРµРјСЏ РґРѕ СЃР»РµРґСѓСЋС‰РµР№":"duration_next"
        };
        break;
      case "unit_engine_hours":
        headerToHeaderType = {
          "РќР°С‡Р°Р»Рѕ":"time_begin",
          "РќР°С‡. РїРѕР»РѕР¶РµРЅРёРµ":"location_begin",
          "РљРѕРЅРµС†":"time_end",
          "РљРѕРЅ. РїРѕР»РѕР¶РµРЅРёРµ":"location_end",
          "РњРѕС‚РѕС‡Р°СЃС‹":"duration",
          "РџСЂРѕР±РµРі (СЃРєРѕСЂСЂРµРєС‚РёСЂРѕРІР°РЅРЅС‹Р№)":"correct_mileage",
          "РџРѕС‚СЂР°С‡РµРЅРѕ": "fuel_consumption_all",
          "Р”Р»РёС‚РµР»СЊРЅРѕСЃС‚СЊ РїСЂРѕСЃС‚РѕСЏ (Р”Р°С‚С‡РёРє РїРѕР»РµР·РЅРѕР№ СЂР°Р±РѕС‚С‹ РґРІРёРіР°С‚РµР»СЏ (РјР°СЃС‚РµСЂ))"
            :"sensor_duration_idling",
          "Р’СЂРµРјСЏ РјРµР¶РґСѓ"
            :"duration_prev"

        };
        break;

    }
    //"unit_custom_fields"


    if(headerToHeaderType && header && header.length){
      return $.map( header, function( n, i ) {
        debugger;
        return ( headerToHeaderType[n] );
      });
    }else{
      return [];
    }
  }

  function execMyReport(time) {
    calculated = 0;

    var report = master_resource.getReport(report_id);
//        console.log(slice_time[key][0] + ': ' + wialon.util.DateTime.formatTime(slice_time[key][0]) + ' - ' + wialon.util.DateTime.formatTime(slice_time[key][1]));
    results_reports.data[time[0]] = {};
    var interval = { "from": time[0], "to": time[1], "flags": wialon.item.MReport.intervalFlag.absolute };

//        console.log("Р’С‹С…РѕРґРЅРѕР№: "+isHolidays(interval.to));

    master_resource.execReport(report, cunit.getId(), 0, interval, // execute selected report
      qx.lang.Function.bind(function (keytime, code, data) { // execReport template

        if (code)return;
//                results_reports.data[keytime]['isHolidays'] = isHolidays(keytime);
//                debugger;
        var tables = data.getTables();
        //update global
        if (tables && tables.length == 0) {
//                    keytime += 86400;
//                    if (slice_time[keytime]) {
//                        execMyReport(slice_time, keytime);
//                    } else {
          prepareData();
//                    }
        }else{
          debugger;
        }
        for (var table_id in  tables) {
          if (Object.prototype.hasOwnProperty.call(tables, table_id))
            data.getTableRows(table_id, 0, tables[table_id].rows, // get Table rows
              qx.lang.Function.bind(function (keytable,header_type,header, keytime, nmb, length, code, data) {
                debugger;
                results_reports.data[time[0]][keytable] = {};
                results_reports.data[time[0]][keytable].data = data;
                results_reports.data[time[0]][keytable].header_type = (header_type && header_type[0] && header_type[0]!=="")? header_type : getHeaderTypeFromHeader(header,keytable);


                calculated++;
                if (calculated > length - 1) {

//                                    keytime += 86400;
//                                    if (slice_time[keytime]) {
//                                        execMyReport(slice_time, keytime);
//                                    } else {
                  prepareData();
//                                    }
                }

//

              }, this, tables[table_id].name, tables[table_id].header_type,tables[table_id].header,keytime, table_id, tables.length)

            );
        }

//
      }, this, time[0])


    );


  }

  function getHeaderData(unit, times) {

    var spec_resource = {
      itemsType: "avl_unit",
      propName: "sys_id",
      propValueMask: unit.getId(),
      sortType: "sys_id "
    };
//        debugger;
//        var flags_resource = wialon.item.Item.dataFlag.base | wialon.item.Item.dataFlag.customFields;
    var flags_resource = "0x00000509";
    header_total_data.extraFields = {};
    header_total_data.extraFields.oil = '';
    header_total_data.extraFields.cag = '';
//        header_total_data.extraFields.brand = '';
    header_total_data.extraFields.veh_number = '';
    header_total_data.extraFields.name = unit.getName()||'';

    wialon.core.Session.getInstance().searchItems(spec_resource, true, flags_resource, 0, 0, function (code, data) {
      if (code === 0 && data && data.items && data.items.length > 0) {
//                console.log(code)
        var customProps = data.items[0].getCustomFields();
//                var temp = {};
        for (var ck in customProps) {
          if (!Object.prototype.hasOwnProperty.call(customProps, ck))continue;
          switch (customProps[ck].n) {
            case 'РњР°СЂРєР° РіРѕСЂСЋС‡РµРіРѕ':
              header_total_data.extraFields['oil'] = customProps[ck].v;
              break;
            case 'РћСЂРіР°РЅРёР·Р°С†РёСЏ':
              header_total_data.extraFields['cag'] = customProps[ck].v;
              break;
            case 'РњР°СЂРєР° Р°РІС‚РѕРјРѕР±РёР»СЏ':
              header_total_data.extraFields['model'] = customProps[ck].v;
              break;
            case 'Р“РѕСЃСѓРґР°СЂСЃС‚РІРµРЅРЅС‹Р№ РЅРѕРјРµСЂРЅРѕР№ Р·РЅР°Рє':
              header_total_data.extraFields['veh_number'] = customProps[ck].v;
              break;
          }
        }
//
//                debugger;
      }
      results_reports = {};
      results_reports.total_data = {};
      var interval = { "from": times[0], "to": times[1], "flags": wialon.item.MReport.intervalFlag.absolute };
      var report = master_resource.getReport(report_id);
      master_resource.execReport(report, unit.getId(), 0, interval, // execute selected report
        qx.lang.Function.bind(function (code, data) { // execReport template
          if (code)return;
          var stats = data.getStatistics();
//                    debugger;
          header_total_data.tank_from = parseFloat(stats[0][1]);
          header_total_data.tank_to = parseFloat(stats[1][1]);
          header_total_data.fillings_total_reg = parseFloat(stats[6][1]);
          header_total_data.fillings_total = parseFloat(stats[10][1]);
          header_total_data.fuel_total = parseFloat(stats[2][1]);
          header_total_data.fuel_total_norm = parseFloat(stats[7][1]);
          header_total_data.date_from = parseDateWialonTimezone(times[0]);
          header_total_data.date_to = parseDateWialonTimezone(times[1]);
          header_total_data.odo_from = parseFloat(stats[4][1]);
          header_total_data.odo_to = parseFloat(stats[5][1]);
          header_total_data.odo_delta = parseFloat(stats[3][1]);
          header_total_data.oc = parseFloat(stats[12][1]);
//                    debugger;
          header_total_data.motoh = (stats[9][1]);
          debugger;
          if((header_total_data.odo_delta>0)&&((header_total_data.odo_from/header_total_data.odo_delta)>900)){
            header_total_data.odo_from = (header_total_data.odo_from/1000);
            header_total_data.odo_to = (header_total_data.odo_to/1000);
          }

          var tables = data.getTables();
          var hasFillings = false;
          for (var table_id in  tables) {
            if (!Object.prototype.hasOwnProperty.call(tables, table_id))continue;
            if (tables[table_id].name == 'unit_fillings') {
              hasFillings = true;
              data.getTableRows(table_id, 0, tables[table_id].rows, // get Table rows
                qx.lang.Function.bind(function (keytable, nmb, length, code, data) {
                  results_reports.total_data[keytable] = data;
                  loadMainData(cunit, ctimes);
                }, this, tables[table_id].name, table_id, tables.length)
              );
            }
          }
          if (!hasFillings)loadMainData(cunit, ctimes);
        }, this)
      );
    });


  }

  function prepareData() {
    debugger;
    var raw_data, firstR, secondR;
    clear_data = [];
//        var hollidayData = {odo: 0, fillings: 0, from: null, to: null};
    for (var key in results_reports.data) {
      debugger;
      if (!Object.prototype.hasOwnProperty.call(results_reports.data, key))continue;
      raw_data = results_reports.data[key];

      if (raw_data['unit_trips'] && raw_data['unit_trips'].data && raw_data['unit_trips'].data.length > 0) {
        for (var trk in raw_data['unit_trips'].data) {
          firstR = getClearData(raw_data['unit_trips'].data[trk],raw_data['unit_trips'].header_type);
          results_reports.total.odo += firstR.odo;
          results_reports.total.fuel += firstR.fuel;
          clear_data.push(firstR);
        }





        /* for (var trk in raw_data['unit_trips']) {
         if (!Object.prototype.hasOwnProperty.call(raw_data['unit_trips'], trk))continue;
         if (parseInt(trk) == 0) {
         firstR = getClearData(raw_data['unit_trips'][trk]);
         secondR = null;
         } else if (parseInt(trk) != raw_data['unit_trips'].length - 1) {
         secondR = getClearData(raw_data['unit_trips'][trk]);
         firstR.to = secondR.to;
         firstR.odo += secondR.odo;
         firstR.t2 = secondR.t2;
         } else {
         secondR = getClearData(raw_data['unit_trips'][trk]);
         }
         }
         if (firstR) {

         firstR = addFillings(firstR, results_reports.total_data.unit_fillings);
         //                    firstR.odo = (firstR.odo);
         if (secondR) {
         addFillings(secondR, results_reports.total_data.unit_fillings);
         //                        secondR.odo = (secondR.odo);
         }
         if (results_reports.data[key].isHolidays) {
         //
         if (secondR) {
         firstR.to = secondR.to;
         firstR.odo += secondR.odo;
         //firstR.odo = (firstR.odo);
         firstR.t2 = secondR.t2;
         firstR.fillings += secondR.fillings;
         }
         //                        hollidayData.odo += firstR.odo;
         //                        hollidayData.fillings += firstR.fillings;
         //                        if (!hollidayData.from)hollidayData.from = firstR.from;
         //                        hollidayData.to = firstR.to;
         } else {
         if (hollidayData.to) {
         if (clear_data[clear_data.length - 1]) {
         //                                clear_data[clear_data.length - 1].odo += hollidayData.odo;
         //                                clear_data[clear_data.length - 1].fillings += hollidayData.fillings;
         //                                clear_data[clear_data.length - 1].to.address = hollidayData.to.address;
         //                                results_reports.total.odo += hollidayData.odo;
         //                                results_reports.total.fillings += hollidayData.fillings;

         } else {
         //                                firstR.odo += hollidayData.odo;
         //                                firstR.fillings += hollidayData.fillings;
         //                                firstR.from.address = hollidayData.to.address;
         }
         //                            hollidayData = {odo: 0, fillings: 0, from: null, to: null};
         }

         //                    }
         results_reports.total.odo += firstR.odo;
         results_reports.total.fillings += firstR.fillings;
         clear_data.push(firstR);
         if (secondR) {
         results_reports.total.odo += secondR.odo;
         results_reports.total.fillings += secondR.fillings;
         clear_data.push(secondR);
         }
         }
         }*/
      }
    }
    /* if ((hollidayData.to) && (clear_data[clear_data.length - 1])) {
     clear_data[clear_data.length - 1].odo += hollidayData.odo;
     clear_data[clear_data.length - 1].fillings += hollidayData.fillings;
     clear_data[clear_data.length - 1].to.address = hollidayData.to.address;
     results_reports.total.odo += hollidayData.odo;
     results_reports.total.fillings += hollidayData.fillings;
     }*/
    updateDom(clear_data);
  }

  function updateDom(data) {
    var domEl = {};
    if ("undefined" == typeof dom_globals) {
      dom_globals = domEl;
    }
    domEl.main = dom_globals.main || document.createElement('div');
    domEl.main.setAttribute("class", "p-main");

    domEl.total = dom_globals.total || document.createElement('div');
    domEl.total.setAttribute("class", "p-total");

    domEl.table = dom_globals.table || document.createElement('table');
    domEl.table.setAttribute("id", "report-res");
    domEl.table.setAttribute("class", "tbl");

    var rowL = [];
    dom_globals.rowL = rowL;
    var topT = document.createElement('tr');
    topT.innerHTML = '<th class="td-date">' + $.localise.tr('Date') + '</th>' +
      '<th class="td-from-time">' + $.localise.tr('Departure time') + '</th>' +
      '<th class="td-from-address">' + $.localise.tr('Departure point') + '</th>' +
      '<th class="td-to-time">' + $.localise.tr('Arrival time') + '</th>' +
      '<th class="td-to-address">' + $.localise.tr('Arrival point') + '</th>' +
      '<th class="td-odo">' + $.localise.tr('Kilometers') + '</th>' +
      '<th class="td-fuel">' + $.localise.tr('Fuel consumption') + '</th>';
    rowL.push(topT);
    data.forEach(function (el) {
      var rowEl = {};
      rowEl.tdL = [];
      rowEl.tr = document.createElement('tr');
      rowEl.tr.setAttribute("id", "row-" + el.t1);

      var date = document.createElement('td');
      date.setAttribute("class", "td-date");
      date.innerHTML = el.date;
      rowEl.tdL.push(date);

      var time_from = document.createElement('td');
      time_from.setAttribute("class", "td-from-time");
      time_from.innerHTML = el.from.time;
      rowEl.tdL.push(time_from);

      var address_from = document.createElement('td');
      address_from.setAttribute("class", "td-from-address");
      address_from.innerHTML = el.from.address;
      rowEl.tdL.push(address_from);

      var time_to = document.createElement('td');
      time_to.setAttribute("class", "td-to-time");
      time_to.innerHTML = el.to.time;
      rowEl.tdL.push(time_to);

      var address_to = document.createElement('td');
      address_to.setAttribute("class", "td-to-address");
      address_to.innerHTML = el.to.address;
      rowEl.tdL.push(address_to);

      var odo = document.createElement('td');
      odo.setAttribute("class", "td-odo");
      debugger;
      odo.innerHTML = el.odo;
      rowEl.tdL.push(odo);

      var fuel = document.createElement('td');
      fuel.setAttribute("class", "td-fuel");
      fuel.innerHTML = el.fuel;
      rowEl.tdL.push(fuel);

      rowEl.tdL.forEach(function (td) {
        rowEl.tr.appendChild(td);
      });
      rowL.push(rowEl.tr);

    });
    var bottomTotal = document.createElement('tr');
    bottomTotal.innerHTML = '<th colspan="5"></th>' +
      '<th class="td-odo">' + Math.round(results_reports.total.odo) + '</th>' +
      '<th class="td-fuel">' + Math.round(results_reports.total.fuel) + '</th>';
    rowL.push(bottomTotal);
    printDom();
  }

  function printDom() {
    if (dom_globals.table) {
      while (dom_globals.table.firstChild) {
        dom_globals.table.removeChild(dom_globals.table.firstChild);
      }
      dom_globals.rowL.forEach(function (tr) {
        dom_globals.table.appendChild(tr);
      });
      $('#content-tbl').append(dom_globals.table);
    }
    undisableui();
  }

  function getClearData(data,header) {
//        debugger;
    var result = {};
    result.t1 = data.t1 || '-----';
    result.t2 = data.t2 || '-----';
    result.from = {};
    result.to = {};
    result.from.time = wialon.util.DateTime.formatTime(result.t1, 1, "HH:mm:ss");//data.c[0].t.slice(11);
    result.from.date = wialon.util.DateTime.formatTime(result.t1, 1, "dd.MM.yyyy");//data.c[0].t.slice(11);
    result.to.date = wialon.util.DateTime.formatTime(result.t2, 1, "dd.MM.yyyy");
    result.to.time = wialon.util.DateTime.formatTime(result.t2, 1, "HH:mm:ss");

    result.date = wialon.util.DateTime.formatTime(result.t1, 1, "dd.MM.yyyy");
    for (var key in header){
      switch (header[key]){
        case 'location_begin':
          result.from.address = data.c[key].t || '-----';

          break;
        case 'location_end':
          result.to.address = data.c[key].t || '-----';
          break;
        case 'correct_mileage':
          result.odo = parseFloat(data.c[key])|| '-----';
          break;
        case 'fuel_consumption_fls':
          if(!result.fuel)result.fuel = 0;
          result.fuel = parseFloat(result.fuel) + (parseFloat(data.c[key]) || 0);
//                    result.fuel +=" lt";
          break;

      }
    }
    if (LANG == 'ru') {
      result.from.address = result.from.address.replace('from', 'РѕС‚').replace('km', 'РєРј');
      result.to.address = result.to.address.replace('from', 'РѕС‚').replace('km', 'РєРј');
    }


//        debugger;




//        result.odo = parseFloat(data.c[5] || 0);
//        result.odos = parseFloat(data.c[6] || 0);
    return result;
  }

  function addFillings(data, fillings) {

    data.fillings = 0;
    if (fillings) {
      for (var flk in fillings) {
        if (!Object.prototype.hasOwnProperty.call(fillings, flk))continue;
        if (fillings[flk] && (((fillings[flk].t2 >= data.t1) && (fillings[flk].t2 <= data.t2))
          || ( Math.abs(fillings[flk].t2 - data.t1) <= 300))) {
          if (!Number.isNaN(parseFloat(fillings[flk].c[3]))) {
            data.fillings += (parseFloat(fillings[flk].c[3]));
          }
          fillings[flk] = null;
        }
      }
    }

    return data;
  }

  function loadMainData(unit, times) {
    if (!unit)return;
    cunit = unit;
    ctrips = [];
    var temp_time = times[0];
    var slice_time = {};

    results_reports.data = {};
    results_reports.total = {odo: 0, fuel: 0};
    results_reports.top = {};
    /*while (temp_time < times[1]) {
     slice_time[temp_time] = [];
     slice_time[temp_time].push(temp_time);
     slice_time[temp_time].push(temp_time + 86400 - 1);

     temp_time = slice_time[temp_time][1] + 1;
     }*/
    execMyReport(times);

  }

  function addEventsListeners() {
    /*        $(window).on('updateData', function (e, input) {
     apply(input);
     });*/

    $("#time-select").on("click", ".time-template", function () {
      //            if ($(this).hasClass('active')) return;
      changeTime(this.id.split("_")[1]);
    });

    (function () {
      var previous;
      $("#units-select").on('focus',function () {
        // Store the current value on focus and on change
        previous = this.value;
      }).change(function () {

        execute();

        // Make sure the previous value is updated
        previous = this.value;
      });
    })();
    $("#export-xls-btn").click(exportxls);

  }


  /// Init SDK
  function initSdk() {
//        console.log(translate("initialize sdk"));

    var url = getHtmlVar("baseUrl") || getHtmlVar("hostUrl") || "https://hst-api.wialon.com";
    var user = getHtmlVar("user_name") || "";
    wialon.core.Session.getInstance().initSession(url);
    //	wialon.core.Session.getInstance().duplicate(getHtmlVar("sid"), user, true, login);
    var hash = getHtmlVar("access_hash");
    var token = getHtmlVar("access_token");
    var sid = getHtmlVar("sid");
    $('#app-name').text($.localise.tr("Waybill"));
    if (hash) {
      if (!sid) {
        wialon.core.Session.getInstance().loginAuthHash(hash, addSid);
      }
    } else if (sid) {
      wialon.core.Session.getInstance().duplicate(sid, user, true, login);
    } else if (token) {
      wialon.core.Session.getInstance().loginToken(token, addSid);
    } else {
      login(101);
    }
  }

  function disableui() {
    $('#loading').addClass('show');
    $('#export-xls-btn').hide();
  }

  function undisableui() {
    $('#export-xls-btn').show();
    $('#loading').removeClass('show');
  }


  /// Get unit html input
  function getUnitFromInput() {
    var unit_id = $("#units-select").val();
    return units[unit_id];
  }

  /// We are ready now
  function onLoad() {
    // load translations
    LANG = getHtmlVar("lang") || "en";
    if (["en", "ru"].indexOf(LANG) == -1) {
      LANG = "en";
    }

    $.localise("lang/", {language: LANG});
    translate = $.localise.tr;


    // load wialon.js
    if (LANG == "ru") {
      loadScript('lang/datepicker/ru.js', function () {
        var url = getHtmlVar("baseUrl") || getHtmlVar("hostUrl") || "https://hst-api.wialon.com";
        loadScript(url + "/wsdk/script/wialon.js", initSdk);
      });
    } else {
      var url = getHtmlVar("baseUrl") || getHtmlVar("hostUrl") || "https://hst-api.wialon.com";
      loadScript(url + "/wsdk/script/wialon.js", initSdk);
    }
  }


  $(document).ready(onLoad);

})($);


