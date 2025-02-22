const DbConnection = require("../../DbConnection");
const DbSaleOwnerConnection = require("../../DbSaleOwnerConnection");
const lowerCaseKeys = require("../../src/utils/helper");
var moment = require("moment");

class DashboardController {
  index(req, res) {
    var monthString = req.query.month;
    const myDate = moment(monthString, "DD-MM-YYYY");
    const startOfMonth = myDate.startOf("month").format("DD-MM-YYYY");
    const endOfMonth = myDate.endOf("month").format("DD-MM-YYYY");

    let sql = `WITH SHOP_VIEW AS (
                  SELECT * FROM DASHBOARD_KPI_PROVINCE t1
                      WHERE MONTH = ( SELECT MAX(CASE WHEN IN_MONTH <= MAX_MONTH THEN IN_MONTH ELSE MAX_MONTH END) MONTH
                                      FROM ( SELECT MAX(MONTH) MAX_MONTH, to_date('${startOfMonth}', 'dd-mm-yyyy') IN_MONTH FROM DASHBOARD_KPI_PROVINCE ) )
              )
              SELECT '${startOfMonth}' "month", v1.SHOP_CODE "shopCode", v1.SHOP_NAME "shopName", v1.DISPLAY_NAME "displayName", v1.KPI_DOANH_THU "kpiDoanhThu", NVL(v2.DOANH_THU, 0) "doanhThu"
              FROM SHOP_VIEW v1
              LEFT JOIN (
                  SELECT MONTH, SHOP_CODE, SUM(COST) DOANH_THU FROM
                  (
                      SELECT TRUNC(t3.PAYMENT_MONTH, 'MONTH') MONTH, t2.SHOP_CODE, t4.COST
                      FROM MARKET_PLACE.C7_CONTRACT@marketdr t2
                      LEFT JOIN MARKET_PLACE.C7_CONTRACT_PAYMENT_PREPAID@marketdr t3 ON ( t2.CONTRACT_ID = t3.CONTRACT_ID )
                      lEFT JOIN MARKET_PLACE.C7_CONTRACT_PM_PRE_DETAIL@marketdr t4 ON ( t3.CONTRACT_PAYMENT_PREPAID_ID = t4.PAYMENT_PREPAID_ID )    
                      WHERE t2.DU_AN_CTKV = 0 and t2.HOPDONG_NOIBO = 0 and t2.PRODUCT_ID != '1123'
                        and t3.PAYMENT_MONTH >= to_timestamp('${startOfMonth} 00:00:00', 'dd-mm-yyyy hh24:mi:ss')
                        and t3.PAYMENT_MONTH < to_timestamp('${endOfMonth} 23:59:59', 'dd-mm-yyyy hh24:mi:ss')    
                        and t2.SHOP_CODE IN ( SELECT SHOP_CODE FROM SHOP_VIEW )
                      UNION ALL
                      SELECT TRUNC(t1.CHARGING_MONTH, 'MONTH') MONTH, t2.SHOP_CODE, t1.COST
                      FROM MARKET_PLACE.c7_product_charging_record@marketdr t1
                      LEFT JOIN MARKET_PLACE.C7_CONTRACT@marketdr t2 ON ( t2.CUSTOMER_ID = t1.CUSTOMER_ID and t2.TRANSACTION_ID = t1.CONTRACT_ID)
                      WHERE t1.CHARGING_MONTH >= to_timestamp('${startOfMonth} 00:00:00', 'dd-mm-yyyy hh24:mi:ss') 
                        and t1.CHARGING_MONTH < to_timestamp('${endOfMonth} 23:59:59', 'dd-mm-yyyy hh24:mi:ss')
                        and t2.DU_AN_CTKV = 0 and t2.HOPDONG_NOIBO = 0 and t2.PRODUCT_ID != '1123'
                        and t1.PARENT_PRODUCT_CODE IN ( '3c', 'maicallcenter', 'mtracker', 'siptrunkv2' )
                        and t2.SHOP_CODE IN ( SELECT SHOP_CODE FROM SHOP_VIEW )
                  ) GROUP BY MONTH, SHOP_CODE
              ) v2 ON ( v2.SHOP_CODE = v1.SHOP_CODE )
    `;

    DbConnection.getConnected(sql, {}, function (result) {
      if (result) {
        result.map((item, index) => { });
      }
      res.send({ result: result });
    });
  }
  getDashboardByShopCode(req, res) {
    var yearString = req.query.year;

    const myDate = moment(yearString, "DD-MM-YYYY");
    const startOfYear = myDate.startOf("year").format("DD-MM-YYYY");
    const endOfYear = myDate.endOf("year").format("DD-MM-YYYY");
    const shopCode = req.query.shopCode;

    if (yearString && shopCode) {
      let sql = `     SELECT v2.month, v1.SHOP_CODE "shopCode", v1.SHOP_NAME "shopName", v1.DISPLAY_NAME "displayName", v1.KPI_DOANH_THU "kpiDoanhThu", NVL(v2.DOANH_THU, 0) "doanhThu"
              FROM DASHBOARD_KPI_PROVINCE v1
              LEFT JOIN (
              
                  SELECT MONTH, SHOP_CODE, SUM(COST) DOANH_THU FROM
                  (
                      SELECT TRUNC(t3.PAYMENT_MONTH, 'MONTH') MONTH, t2.SHOP_CODE, t4.COST
                      FROM MARKET_PLACE.C7_CONTRACT@marketdr t2
                      LEFT JOIN MARKET_PLACE.C7_CONTRACT_PAYMENT_PREPAID@marketdr t3 ON ( t2.CONTRACT_ID = t3.CONTRACT_ID )
                      lEFT JOIN MARKET_PLACE.C7_CONTRACT_PM_PRE_DETAIL@marketdr t4 ON ( t3.CONTRACT_PAYMENT_PREPAID_ID = t4.PAYMENT_PREPAID_ID )    
                      WHERE t2.DU_AN_CTKV = 0 and t2.HOPDONG_NOIBO = 0 and t2.PRODUCT_ID != '1123'
                        and t3.PAYMENT_MONTH >= to_timestamp('${startOfYear} 00:00:00', 'dd-mm-yyyy hh24:mi:ss')
                        and t3.PAYMENT_MONTH < to_timestamp('${endOfYear} 23:59:59', 'dd-mm-yyyy hh24:mi:ss')    
                        and t2.SHOP_CODE IN ( SELECT SHOP_CODE   FROM DASHBOARD_KPI_PROVINCE   )
                      UNION ALL
                      SELECT TRUNC(t1.CHARGING_MONTH, 'MONTH') MONTH, t2.SHOP_CODE, t1.COST
                      FROM MARKET_PLACE.c7_product_charging_record@marketdr t1
                      LEFT JOIN MARKET_PLACE.C7_CONTRACT@marketdr t2 ON ( t2.CUSTOMER_ID = t1.CUSTOMER_ID and t2.TRANSACTION_ID = t1.CONTRACT_ID)
                      WHERE t1.CHARGING_MONTH >= to_timestamp('${startOfYear} 00:00:00', 'dd-mm-yyyy hh24:mi:ss') 
                        and t1.CHARGING_MONTH < to_timestamp('${endOfYear} 23:59:59', 'dd-mm-yyyy hh24:mi:ss')
                        and t2.DU_AN_CTKV = 0 and t2.HOPDONG_NOIBO = 0 and t2.PRODUCT_ID != '1123'
                        and t1.PARENT_PRODUCT_CODE IN ( '3c', 'maicallcenter', 'mtracker', 'siptrunkv2' )
                        and t2.SHOP_CODE IN ( SELECT SHOP_CODE FROM   DASHBOARD_KPI_PROVINCE  )
                  ) GROUP BY MONTH, SHOP_CODE
                  
                  
              ) v2 ON ( v2.SHOP_CODE = v1.SHOP_CODE and v2.month = v1.month ) where v1.shop_code ='${shopCode}'
    `;

      DbConnection.getConnected(sql, {}, function (result) {
        if (result) {
          result.map((item, index) => { });
        }
        res.send({ result: result });
      });
    }
  }

  getDashboardEmployee(req, res) {
    var yearString = req.query.year;

    const myDate = moment(yearString, "DD-MM-YYYY");
    const startOfYear = myDate.startOf("year").format("DD-MM-YYYY");
    const endOfYear = myDate.endOf("year").format("DD-MM-YYYY");

    if (yearString) {
      let sql = `WITH AM_VIEW AS (
                    SELECT DISTINCT AM_CODE, AM_NAME FROM MARKET_PLACE.C7_CONTRACT@marketdr 
                    WHERE AM_CODE IN ( '7GLAC10A1017', '7DLAC12A1049', '3PYEC02A1020', '7KHOC01A1011', '7KONC11A1024', '7KHOC01A1016')
                )
                SELECT v2.month, v1.AM_CODE "amCode", v1.AM_NAME "amName", NVL(v2.DOANH_THU, 0) "doanhThu", NVL(DOANH_THU_VAT, 0) "doanhThuVAT", NVL(NUMBER_CONTRACT, 0) "numberContract"
                FROM AM_VIEW v1
                LEFT JOIN (
                    SELECT MONTH, AM_CODE, AM_NAME, SUM(COST) DOANH_THU, SUM(COST_VAT) DOANH_THU_VAT, count(1) NUMBER_CONTRACT
                    FROM (
                        SELECT TRUNC(t3.PAYMENT_MONTH, 'MONTH') MONTH, t2.CONTRACT_ID, t2.AM_CODE, t2.AM_NAME, t4.COST, t4.COST_VAT
                        FROM MARKET_PLACE.C7_CONTRACT@marketdr t2
                        LEFT JOIN MARKET_PLACE.C7_CONTRACT_PAYMENT_PREPAID@marketdr t3 ON ( t2.CONTRACT_ID = t3.CONTRACT_ID )
                        lEFT JOIN MARKET_PLACE.C7_CONTRACT_PM_PRE_DETAIL@marketdr t4 ON ( t3.CONTRACT_PAYMENT_PREPAID_ID = t4.PAYMENT_PREPAID_ID )
                        WHERE t2.DU_AN_CTKV = 0 and t2.HOPDONG_NOIBO = 0 and t2.PRODUCT_ID != '1123'
                            and t3.PAYMENT_MONTH >= to_timestamp('${startOfYear} 00:00:00', 'dd-mm-yyyy hh24:mi:ss')
                            and t3.PAYMENT_MONTH < to_timestamp('${endOfYear} 23:59:59', 'dd-mm-yyyy hh24:mi:ss')    
                            and t2.AM_CODE IN ( SELECT AM_CODE FROM AM_VIEW )
                        UNION ALL
                        SELECT TRUNC(t1.CHARGING_MONTH, 'MONTH') MONTH, t2.CONTRACT_ID, t2.AM_CODE, t2.AM_NAME, t1.COST, t1.COST_VAT
                        FROM MARKET_PLACE.c7_product_charging_record@marketdr t1
                        LEFT JOIN MARKET_PLACE.C7_CONTRACT@marketdr t2 ON ( t2.CUSTOMER_ID = t1.CUSTOMER_ID and t2.TRANSACTION_ID = t1.CONTRACT_ID)
                        WHERE t1.CHARGING_MONTH >= to_timestamp('${startOfYear} 00:00:00', 'dd-mm-yyyy hh24:mi:ss') 
                            and t1.CHARGING_MONTH < to_timestamp('${endOfYear} 23:59:59', 'dd-mm-yyyy hh24:mi:ss')
                            and t2.DU_AN_CTKV = 0 and t2.HOPDONG_NOIBO = 0 and t2.PRODUCT_ID != '1123'
                            and t1.PARENT_PRODUCT_CODE IN ( '3c', 'maicallcenter', 'mtracker', 'siptrunkv2' )
                            and t2.AM_CODE IN ( SELECT AM_CODE FROM AM_VIEW )
                    ) GROUP BY AM_CODE, AM_NAME, MONTH
                ) v2 ON ( v2.AM_CODE = v1.AM_CODE )
                ORDER BY "doanhThu" DESC 
    `;

      DbConnection.getConnected(sql, {}, function (result) {
        if (result) {
          result.map((item, index) => { });
        }
        res.send({ result: result });
      });
    }
  }

  getTopEmployees(req, res) {
    var monthString = req.query.month;

    const myDate = moment(monthString, "DD-MM-YYYY");
    const startOfMonth = myDate.startOf("month").format("DD-MM-YYYY");
    const endOfMonth = myDate.endOf("month").format("DD-MM-YYYY");

    let sql = `WITH AM_VIEW AS (
                    SELECT DISTINCT AM_CODE, AM_NAME FROM MARKET_PLACE.C7_CONTRACT@marketdr 
                    WHERE AM_CODE IN ( '7GLAC10A1017', '7DLAC12A1049', '3PYEC02A1020', '7KHOC01A1011', '7KONC11A1024', '7KHOC01A1016')
                )
                SELECT '${startOfMonth}' "month", v1.AM_CODE "amCode", v1.AM_NAME "amName", NVL(v2.DOANH_THU, 0) "doanhThu", NVL(DOANH_THU_VAT, 0) "doanhThuVAT", NVL(NUMBER_CONTRACT, 0) "numberContract"
                FROM AM_VIEW v1
                LEFT JOIN (
                    SELECT AM_CODE, AM_NAME, SUM(COST) DOANH_THU, SUM(COST_VAT) DOANH_THU_VAT, count(1) NUMBER_CONTRACT
                    FROM (
                        SELECT t2.CONTRACT_ID, t2.AM_CODE, t2.AM_NAME, t4.COST, t4.COST_VAT
                        FROM MARKET_PLACE.C7_CONTRACT@marketdr t2
                        LEFT JOIN MARKET_PLACE.C7_CONTRACT_PAYMENT_PREPAID@marketdr t3 ON ( t2.CONTRACT_ID = t3.CONTRACT_ID )
                        lEFT JOIN MARKET_PLACE.C7_CONTRACT_PM_PRE_DETAIL@marketdr t4 ON ( t3.CONTRACT_PAYMENT_PREPAID_ID = t4.PAYMENT_PREPAID_ID )
                        WHERE t2.DU_AN_CTKV = 0 and t2.HOPDONG_NOIBO = 0 and t2.PRODUCT_ID != '1123'
                            and t3.PAYMENT_MONTH >= to_timestamp('${startOfMonth} 00:00:00', 'dd-mm-yyyy hh24:mi:ss')
                            and t3.PAYMENT_MONTH < to_timestamp('${endOfMonth} 23:59:59', 'dd-mm-yyyy hh24:mi:ss')    
                            and t2.AM_CODE IN ( SELECT AM_CODE FROM AM_VIEW )
                        UNION ALL
                        SELECT t2.CONTRACT_ID, t2.AM_CODE, t2.AM_NAME, t1.COST, t1.COST_VAT
                        FROM MARKET_PLACE.c7_product_charging_record@marketdr t1
                        LEFT JOIN MARKET_PLACE.C7_CONTRACT@marketdr t2 ON ( t2.CUSTOMER_ID = t1.CUSTOMER_ID and t2.TRANSACTION_ID = t1.CONTRACT_ID)
                        WHERE t1.CHARGING_MONTH >= to_timestamp('${startOfMonth} 00:00:00', 'dd-mm-yyyy hh24:mi:ss') 
                            and t1.CHARGING_MONTH < to_timestamp('${endOfMonth} 23:59:59', 'dd-mm-yyyy hh24:mi:ss')
                            and t2.DU_AN_CTKV = 0 and t2.HOPDONG_NOIBO = 0 and t2.PRODUCT_ID != '1123'
                            and t1.PARENT_PRODUCT_CODE IN ( '3c', 'maicallcenter', 'mtracker', 'siptrunkv2' )
                            and t2.AM_CODE IN ( SELECT AM_CODE FROM AM_VIEW )
                    ) GROUP BY AM_CODE, AM_NAME
                ) v2 ON ( v2.AM_CODE = v1.AM_CODE )
                ORDER BY "doanhThu" DESC
    `;

    DbConnection.getConnected(sql, {}, function (result) {
      if (result) {
        result.map((item, index) => { });
      }
      res.send({ result: result });
    });
  }

  getTopServices(req, res) {
    var monthString = req.query.month;

    const myDate = moment(monthString, "DD-MM-YYYY");
    const startOfMonth = myDate.startOf("month").format("DD-MM-YYYY");
    const endOfMonth = myDate.endOf("month").format("DD-MM-YYYY");

    let sql = ` SELECT * FROM (
                  SELECT '${startOfMonth}' "month", t2.PARENT_PRODUCT_CODE "serviceCode", NVL(t2.PRODUCT_NAME, t2.PARENT_PRODUCT_CODE) "serviceName", t2.PRODUCT_ID "productID", NVL(v1.DOANH_THU, 0) "doanhThu", NVL(v1.SL, 0) "numberOfContract"
                  FROM DASHBOARD_PRODUCT t2
                  LEFT JOIN (
                    SELECT MONTH, PRODUCT_ID, SUM(COST) DOANH_THU, count(1) sl
                    FROM (
                        SELECT TRUNC(t3.PAYMENT_MONTH, 'MONTH') MONTH, t2.PRODUCT_ID, t4.COST
                        FROM MARKET_PLACE.C7_CONTRACT@marketdr t2
                        LEFT JOIN MARKET_PLACE.C7_CONTRACT_PAYMENT_PREPAID@marketdr t3 ON ( t2.CONTRACT_ID = t3.CONTRACT_ID )
                        lEFT JOIN MARKET_PLACE.C7_CONTRACT_PM_PRE_DETAIL@marketdr t4 ON ( t3.CONTRACT_PAYMENT_PREPAID_ID = t4.PAYMENT_PREPAID_ID )
                        WHERE t2.DU_AN_CTKV = 0 and t2.HOPDONG_NOIBO = 0 and t2.PRODUCT_ID != '1123'
                            and t3.PAYMENT_MONTH >= to_timestamp('${startOfMonth} 00:00:00', 'dd-mm-yyyy hh24:mi:ss')
                            and t3.PAYMENT_MONTH < to_timestamp('${endOfMonth} 23:59:59', 'dd-mm-yyyy hh24:mi:ss')
                        UNION ALL
                        SELECT TRUNC(t1.CHARGING_MONTH, 'MONTH') MONTH, t2.PRODUCT_ID, t1.COST
                        FROM MARKET_PLACE.c7_product_charging_record@marketdr t1
                        LEFT JOIN MARKET_PLACE.C7_CONTRACT@marketdr t2 ON ( t2.CUSTOMER_ID = t1.CUSTOMER_ID and t2.TRANSACTION_ID = t1.CONTRACT_ID)
                        WHERE t1.CHARGING_MONTH >= to_timestamp('${startOfMonth} 00:00:00', 'dd-mm-yyyy hh24:mi:ss') 
                              and t1.CHARGING_MONTH < to_timestamp('${endOfMonth} 23:59:59', 'dd-mm-yyyy hh24:mi:ss')
                              and t2.DU_AN_CTKV = 0 and t2.HOPDONG_NOIBO = 0 and t2.PRODUCT_ID != '1123'            
                              and t1.PARENT_PRODUCT_CODE IN ( '3c', 'maicallcenter', 'mtracker', 'siptrunkv2' )   
                    ) GROUP BY MONTH, PRODUCT_ID
                  ) v1 ON (t2.PRODUCT_ID = v1.PRODUCT_ID) 
                  ORDER BY NVL(v1.DOANH_THU, 0) DESC
                ) WHERE ROWNUM <= 6      
    `;

    DbConnection.getConnected(sql, {}, function (result) {
      if (result) {
        result.map((item, index) => { });
      }
      res.send({ result: result });
    });
  }

  getSummaryOfYear(req, res) {
    var monthString = req.query.year;

    const myDate = moment(monthString, "DD-MM-YYYY");
    const startOfYear = myDate.startOf("year").format("DD-MM-YYYY");
    const startOfNextYear = myDate
      .add(1, "years")
      .startOf("year")
      .format("DD-MM-YYYY");

    const kpiDoanhThu = 809000000;

    let sql = ` SELECT to_char(YEAR, 'DD-MM-YYYY') "year", SUM(DOANH_THU) "doanhThu", COUNT(1) "numberOfContract", ${kpiDoanhThu} "kpiDoanhThu" 
                FROM (
                    SELECT YEAR, CONTRACT_ID, SUM(COST) DOANH_THU
                    FROM (
                        SELECT TRUNC(t3.PAYMENT_MONTH, 'YEAR') YEAR, t4.COST, t2.CONTRACT_ID
                        FROM MARKET_PLACE.C7_CONTRACT@marketdr t2
                        LEFT JOIN MARKET_PLACE.C7_CONTRACT_PAYMENT_PREPAID@marketdr t3 ON ( t2.CONTRACT_ID = t3.CONTRACT_ID )
                        LEFT JOIN MARKET_PLACE.C7_CONTRACT_PM_PRE_DETAIL@marketdr t4 ON ( t3.CONTRACT_PAYMENT_PREPAID_ID = t4.PAYMENT_PREPAID_ID )    
                        WHERE t2.DU_AN_CTKV = 0 and t2.HOPDONG_NOIBO = 0 and t2.PRODUCT_ID != '1123'
                            and t3.PAYMENT_MONTH >= to_timestamp('${startOfYear} 00:00:00', 'dd-mm-yyyy hh24:mi:ss')
                            and t3.PAYMENT_MONTH < to_timestamp('${startOfNextYear} 00:00:00', 'dd-mm-yyyy hh24:mi:ss')
                        UNION ALL
                        SELECT TRUNC(t1.CHARGING_MONTH, 'YEAR') YEAR, t1.COST, t2.CONTRACT_ID
                        FROM MARKET_PLACE.c7_product_charging_record@marketdr t1
                        LEFT JOIN MARKET_PLACE.C7_CONTRACT@marketdr t2 ON ( t2.CUSTOMER_ID = t1.CUSTOMER_ID and t2.TRANSACTION_ID = t1.CONTRACT_ID)
                        WHERE t1.CHARGING_MONTH >= to_timestamp('${startOfYear} 00:00:00', 'dd-mm-yyyy hh24:mi:ss')
                            and t1.CHARGING_MONTH < to_timestamp('${startOfNextYear} 00:00:00', 'dd-mm-yyyy hh24:mi:ss')
                            and t2.DU_AN_CTKV = 0 and t2.HOPDONG_NOIBO = 0 and t2.PRODUCT_ID != '1123'            
                            and t1.PARENT_PRODUCT_CODE IN ( '3c', 'maicallcenter', 'mtracker', 'siptrunkv2' )   
                    ) GROUP BY YEAR, CONTRACT_ID    
                ) GROUP BY YEAR
    `;

    DbConnection.getConnected(sql, {}, function (result) {
      if (result) {
        result.map((item, index) => { });
      }
      res.send({ result });
    });
  }

  getSummaryOfMonth(req, res) {
    var monthString = req.query.month;

    const myDate = moment(monthString, "DD-MM-YYYY");
    const startOfMonth = myDate.startOf("month").format("DD-MM-YYYY");
    const endOfMonth = myDate.endOf("month").format("DD-MM-YYYY");

    let sql = ` WITH SHOP_VIEW AS (
                    SELECT to_date('${startOfMonth}', 'dd-mm-yyyy') IN_MONTH, MONTH, SUM(KPI_DOANH_THU) KPI_DOANH_THU 
                    FROM DASHBOARD_KPI_PROVINCE t1
                    WHERE MONTH = ( SELECT MAX(CASE WHEN IN_MONTH <= MAX_MONTH THEN IN_MONTH ELSE MAX_MONTH END) MONTH 
                                    FROM ( SELECT MAX(MONTH) MAX_MONTH, to_date('${startOfMonth}', 'dd-mm-yyyy') IN_MONTH FROM DASHBOARD_KPI_PROVINCE ) )
                        and SHOP_CODE != '7KHOC01A099' 
                    GROUP BY MONTH    
                )
                SELECT '${startOfMonth}' "month", v1.KPI_DOANH_THU "kpiDoanhThu", NVL(v2.DOANH_THU, 0) "doanhThu", NVL(v2.SL, 0) "numberContract"
                FROM SHOP_VIEW v1
                LEFT JOIN (
                    SELECT MONTH, SUM(COST) DOANH_THU, COUNT(1) SL
                    FROM (
                        SELECT TRUNC(t3.PAYMENT_MONTH, 'MONTH') MONTH, t4.COST, t2.CONTRACT_ID
                        FROM MARKET_PLACE.C7_CONTRACT@marketdr t2
                        LEFT JOIN MARKET_PLACE.C7_CONTRACT_PAYMENT_PREPAID@marketdr t3 ON ( t2.CONTRACT_ID = t3.CONTRACT_ID )
                        LEFT JOIN MARKET_PLACE.C7_CONTRACT_PM_PRE_DETAIL@marketdr t4 ON ( t3.CONTRACT_PAYMENT_PREPAID_ID = t4.PAYMENT_PREPAID_ID )
                        WHERE t2.DU_AN_CTKV = 0 and t2.HOPDONG_NOIBO = 0 and t2.PRODUCT_ID != '1123'
                            and t3.PAYMENT_MONTH >= to_timestamp('${startOfMonth} 00:00:00', 'dd-mm-yyyy hh24:mi:ss')
                            and t3.PAYMENT_MONTH < to_timestamp('${endOfMonth} 23:59:59', 'dd-mm-yyyy hh24:mi:ss')
                        UNION ALL
                        SELECT TRUNC(t1.CHARGING_MONTH, 'MONTH') MONTH, t1.COST, t2.CONTRACT_ID
                        FROM MARKET_PLACE.c7_product_charging_record@marketdr t1
                        LEFT JOIN MARKET_PLACE.C7_CONTRACT@marketdr t2 ON ( t2.CUSTOMER_ID = t1.CUSTOMER_ID and t2.TRANSACTION_ID = t1.CONTRACT_ID)
                        WHERE t1.CHARGING_MONTH >= to_timestamp('${startOfMonth} 00:00:00', 'dd-mm-yyyy hh24:mi:ss')
                            and t1.CHARGING_MONTH < to_timestamp('${endOfMonth} 23:59:59', 'dd-mm-yyyy hh24:mi:ss')
                            and t2.DU_AN_CTKV = 0 and t2.HOPDONG_NOIBO = 0 and t2.PRODUCT_ID != '1123'
                            and t1.PARENT_PRODUCT_CODE IN ( '3c', 'maicallcenter', 'mtracker', 'siptrunkv2' )
                    ) GROUP BY MONTH    
                ) v2 ON ( v2.MONTH = v1.IN_MONTH )    
    `;

    DbConnection.getConnected(sql, {}, function (result) {
      if (result) {
        result.map((item, index) => { });
      }
      res.send({ result });
    });
  }
  getDashBoardViewCount(req, res) {
    const myDate = moment(new Date());
    const startOfMonth = myDate.startOf("month").format("DD-MM-YYYY");
    const endOfMonth = myDate.endOf("month").format("DD-MM-YYYY");
    const startOfDate = moment().format("DD-MM-YYYY");
    const endOfDate = moment().format("DD-MM-YYYY");
    const startOfYear = moment().format("YYYY");
    const endOfYear = moment().format("YYYY");
    let sql = `select ( SELECT count(pageId) as countMonth from sale_owner.dashboard_view_count t1 where t1.pageId ='${req.query.pageId}'
    and t1.datetime >= to_timestamp('${startOfMonth} 00:00:00', 'dd-mm-yyyy hh24:mi:ss') 
                            and t1.datetime < to_timestamp('${endOfMonth} 23:59:59', 'dd-mm-yyyy hh24:mi:ss')
                            ) as countMonth,
                            (
    SELECT count(pageId) as countDate from sale_owner.dashboard_view_count t2 where t2.pageId ='${req.query.pageId}'
    and t2.datetime >= to_timestamp('${startOfDate} 00:00:00', 'dd-mm-yyyy hh24:mi:ss') 
                            and t2.datetime < to_timestamp('${endOfDate} 23:59:59', 'dd-mm-yyyy hh24:mi:ss')                         
                            ) as  countDate,
                             (
    SELECT count(pageId) as countDate from sale_owner.dashboard_view_count t3 where t3.pageId ='${req.query.pageId}'
    and t3.datetime >= to_timestamp('01-01-${startOfYear} 00:00:00', 'dd-mm-yyyy hh24:mi:ss') 
                            and t3.datetime < to_timestamp('31-12-${endOfYear} 23:59:59', 'dd-mm-yyyy hh24:mi:ss')                  
                            ) as  countYear
                            from sale_owner.dashboard_view_count
    `;

    DbSaleOwnerConnection.getConnected(sql, {}, function (result) {
      if (result) {
        result.map((item, index) => { });
      }
      res.send({ result: lowerCaseKeys(result[0]) });
    });
  }
  addCountToDashboard(req, res) {
    let sql = ` insert into  sale_owner.dashboard_view_count (count, pageId, datetime)
    values ('${parseInt(req.body.count) + 1}' , '${req.body.pageId}',sysdate )
    `;

    DbSaleOwnerConnection.getConnected(sql, {}, function (result) {
      if (result) {
        result.map((item, index) => { });
      }
      res.send({ result });
    });
  }

  show(req, res) {
    res.send("detail");
  }
}
module.exports = new DashboardController();
