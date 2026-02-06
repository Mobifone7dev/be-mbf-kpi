const DbConnection = require("../../DbConnection");
const DbSaleOwnerConnection = require("../../DbSaleOwnerConnection");
const lowerCaseKeys = require("../utils/helper");
var moment = require("moment");
const oracledb = require("oracledb");
oracledb.autoCommit = true;
const db = require("../models");
const fs = require("fs");
const ManualKpi = db.manualKpi;
const { sequelize } = require('../models'); // Import s
const { query, validationResult } = require("express-validator");

class ReportController {
  index(req, res) {
    res.send({ result: "hello wolrd " + req.path });
  }

  async getReportCodeByMonth(req, res) {
    var monthString = req.query.month;
    const tempDate = moment(monthString, "DD-MM-YYYY");
    const startOfMonth = tempDate.startOf("month").format("DD-MM-YYYY");

    if (monthString && startOfMonth) {
      let sql;
      sql = `
            WITH base_kpi AS (
                SELECT
                    a.thang,
                    a.goi_cuoc,
                    b.area_code,
                    SUM(NVL(a.trong_tinh,0))  AS trong_tinh,
                    SUM(NVL(a.ngoai_tinh,0)) AS ngoai_tinh
                FROM db01_owner.th_tb_ptsl_th_bc03_show a
                LEFT JOIN (
                    SELECT ward_code, MIN(area_code) area_code
                    FROM db01_owner.map_area_ward_new
                    GROUP BY ward_code
                ) b
                  ON a.precinct_code = b.ward_code
                WHERE a.thang = TO_DATE('${startOfMonth}','dd/mm/rrrr')
                GROUP BY
                    a.thang,
                    a.goi_cuoc,
                    b.area_code
            ),

            total_kpi AS (
                SELECT
                    thang,
                    goi_cuoc,
                    SUM(trong_tinh)  AS tong_trong_tinh,
                    SUM(ngoai_tinh) AS tong_ngoai_tinh
                FROM base_kpi
                GROUP BY thang, goi_cuoc
            )

            SELECT
                p.*,
                t.tong_trong_tinh,
                t.tong_ngoai_tinh
            FROM base_kpi
            PIVOT (
                SUM(trong_tinh)  AS trong_tinh,
                SUM(ngoai_tinh) AS ngoai_tinh
                FOR area_code IN (
                    'DLA_T01' AS DLA_T01,
                    'DLA_T02' AS DLA_T02,
                    'DLA_T03' AS DLA_T03,
                    'DLA_T04' AS DLA_T04,
                    'DLA_T05' AS DLA_T05,
                    'DLA_T06' AS DLA_T06,
                    'DLA_T07' AS DLA_T07,
                    'DLA_T08' AS DLA_T08,
                    'DLA_T09' AS DLA_T09,
                    'DLA_T10' AS DLA_T10,
                    'DLA_T11' AS DLA_T11,
                    'DLA_T12' AS DLA_T12,
                    'DLA_T13' AS DLA_T13,
                    'DLA_D01' AS DLA_D01,
                    'DLA_D02' AS DLA_D02,
                    'DLA_D03' AS DLA_D03,
                    'DLA_D04' AS DLA_D04,
                    'DLA_D05' AS DLA_D05,
                    'DLA_D06' AS DLA_D06
                )
            ) p
            JOIN total_kpi t
              ON p.thang = t.thang
            AND p.goi_cuoc = t.goi_cuoc
            where p.thang = TO_DATE('${startOfMonth}','dd/mm/rrrr')
            ORDER BY p.thang, p.goi_cuoc
          `;



      DbConnection.getConnected(sql, {}, function (result) {
        if (result) {
          res.send({ result: result });
        }
      });
    } else {
      res.send({ error: "Có lỗi xảy ra" });
    }
  }


  async getReportCodeByMonthDetail(req, res) {
    var monthString = req.query.month;
    const tempDate = moment(monthString, "DD-MM-YYYY");
    const startOfMonth = tempDate.startOf("month").format("DD-MM-YYYY");
    const startOfNextMonth = tempDate
      .add(1, "month")
      .startOf("month")
      .format("DD-MM-YYYY");
    if (monthString && startOfMonth) {
      let sql;
      sql = `
            SELECT * from  db01_owner.th_tb_ptsl_ts_detail
            where active_date >= TO_DATE('${startOfMonth}','dd/mm/rrrr')
            and active_date < TO_DATE('${startOfNextMonth}','dd/mm/rrrr')
           union all 
           select * from db01_owner.th_tb_ptsl_tt_detail
           where active_date = TO_DATE('${startOfMonth}','dd/mm/rrrr')
           and active_date < TO_DATE('${startOfNextMonth}','dd/mm/rrrr')

          `;

      DbConnection.getConnected(sql, {}, function (result) {
        if (result) {
          res.send({ result: result });
        }
      });
    } else {
      res.send({ error: "Có lỗi xảy ra" });
    }
  }
}
module.exports = new ReportController();
