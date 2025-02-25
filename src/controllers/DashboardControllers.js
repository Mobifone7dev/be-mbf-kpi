const DbConnection = require("../../DbConnection");
const DbSaleOwnerConnection = require("../../DbSaleOwnerConnection");
const lowerCaseKeys = require("../../src/utils/helper");
var moment = require("moment");

class DashboardController {
  index(req, res) {
    res.send({ result: "hello dashboard" });

    // var monthString = req.query.month;
    // const myDate = moment(monthString, "DD-MM-YYYY");
    // const startOfMonth = myDate.startOf("month").format("DD-MM-YYYY");
    // const endOfMonth = myDate.endOf("month").format("DD-MM-YYYY");

    // let sql = `WITH SHOP_VIEW AS (
    //               SELECT * FROM DASHBOARD_KPI_PROVINCE t1
    //                   WHERE MONTH = ( SELECT MAX(CASE WHEN IN_MONTH <= MAX_MONTH THEN IN_MONTH ELSE MAX_MONTH END) MONTH
    //                                   FROM ( SELECT MAX(MONTH) MAX_MONTH, to_date('${startOfMonth}', 'dd-mm-yyyy') IN_MONTH FROM DASHBOARD_KPI_PROVINCE ) )
    //           )
    //           SELECT '${startOfMonth}' "month", v1.SHOP_CODE "shopCode", v1.SHOP_NAME "shopName", v1.DISPLAY_NAME "displayName", v1.KPI_DOANH_THU "kpiDoanhThu", NVL(v2.DOANH_THU, 0) "doanhThu"
    //           FROM SHOP_VIEW v1
    //           LEFT JOIN (
    //               SELECT MONTH, SHOP_CODE, SUM(COST) DOANH_THU FROM
    //               (
    //                   SELECT TRUNC(t3.PAYMENT_MONTH, 'MONTH') MONTH, t2.SHOP_CODE, t4.COST
    //                   FROM MARKET_PLACE.C7_CONTRACT@marketdr t2
    //                   LEFT JOIN MARKET_PLACE.C7_CONTRACT_PAYMENT_PREPAID@marketdr t3 ON ( t2.CONTRACT_ID = t3.CONTRACT_ID )
    //                   lEFT JOIN MARKET_PLACE.C7_CONTRACT_PM_PRE_DETAIL@marketdr t4 ON ( t3.CONTRACT_PAYMENT_PREPAID_ID = t4.PAYMENT_PREPAID_ID )    
    //                   WHERE t2.DU_AN_CTKV = 0 and t2.HOPDONG_NOIBO = 0 and t2.PRODUCT_ID != '1123'
    //                     and t3.PAYMENT_MONTH >= to_timestamp('${startOfMonth} 00:00:00', 'dd-mm-yyyy hh24:mi:ss')
    //                     and t3.PAYMENT_MONTH < to_timestamp('${endOfMonth} 23:59:59', 'dd-mm-yyyy hh24:mi:ss')    
    //                     and t2.SHOP_CODE IN ( SELECT SHOP_CODE FROM SHOP_VIEW )
    //                   UNION ALL
    //                   SELECT TRUNC(t1.CHARGING_MONTH, 'MONTH') MONTH, t2.SHOP_CODE, t1.COST
    //                   FROM MARKET_PLACE.c7_product_charging_record@marketdr t1
    //                   LEFT JOIN MARKET_PLACE.C7_CONTRACT@marketdr t2 ON ( t2.CUSTOMER_ID = t1.CUSTOMER_ID and t2.TRANSACTION_ID = t1.CONTRACT_ID)
    //                   WHERE t1.CHARGING_MONTH >= to_timestamp('${startOfMonth} 00:00:00', 'dd-mm-yyyy hh24:mi:ss') 
    //                     and t1.CHARGING_MONTH < to_timestamp('${endOfMonth} 23:59:59', 'dd-mm-yyyy hh24:mi:ss')
    //                     and t2.DU_AN_CTKV = 0 and t2.HOPDONG_NOIBO = 0 and t2.PRODUCT_ID != '1123'
    //                     and t1.PARENT_PRODUCT_CODE IN ( '3c', 'maicallcenter', 'mtracker', 'siptrunkv2' )
    //                     and t2.SHOP_CODE IN ( SELECT SHOP_CODE FROM SHOP_VIEW )
    //               ) GROUP BY MONTH, SHOP_CODE
    //           ) v2 ON ( v2.SHOP_CODE = v1.SHOP_CODE )
    // `;

    DbConnection.getConnected(sql, {}, function (result) {
      if (result) {
        result.map((item, index) => { });
      }
      res.send({ result: result });
    });
  }
  getDashBoardPlanKpi(req, res) {
    var monthString = req.query.month;
    const myDate = moment(monthString, "DD-MM-YYYY");
    const startOfMonth = myDate.startOf("month").format("DD-MM-YYYY");
    if (monthString && startOfMonth) {
      let sql = `select * from db01_owner.chitieu_kpi_2025 where thang= to_date('${startOfMonth}','DD-MM-RRRR')`;

      DbConnection.getConnected(sql, {}, function (result) {
        if (result) {
          result.map((item, index) => { });
        }
        res.send({ result: result });
      });
    }
    else {
      res.send({ error: "Có lỗi xảy ra" });

    }
  }

  getDashBoardExecKpi(req, res) {
    var monthString = req.query.month;
    const myDate = moment(monthString, "DD-MM-YYYY");
    const startOfMonth = myDate.startOf("month").format("DD-MM-YYYY");
    if (monthString && startOfMonth) {
      let sql = `
        select v1.*, (v1.KHO + v1.DLA + v1.GLA + v1.PYE + v1.DNO + v1.KON) CTY7 from (
      SELECT * FROM
      (
          select ten_chi_tieu,province_code,sum(THUC_HIEN) th
          from db01_owner.thuc_hien_kpi_2025 
          where thang = to_date('${startOfMonth}','DD-MM-RRRR')
          group by ten_chi_tieu,province_code
      )
      PIVOT
      (
        sum(th)
        FOR province_code IN ('KHO' KHO, 'DLA' DLA, 'GLA' GLA, 'PYE' PYE, 'DNO' DNO, 'KON' KON)
      )
      ) v1
        `;
      DbConnection.getConnected(sql, {}, function (result) {
        if (result) {
          result.map((item, index) => { });
        }
        res.send({ result: result });
      });
    } else {
      res.send({ error: "Có lỗi xảy ra" });
    }
  }


  show(req, res) {
    res.send("detail");
  }
}
module.exports = new DashboardController();
