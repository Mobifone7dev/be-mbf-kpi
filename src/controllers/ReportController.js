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
          SELECT
                t.*,

                (NVL(DLA_T01,0)+NVL(DLA_T02,0)+NVL(DLA_T03,0)+NVL(DLA_T04,0)+NVL(DLA_T05,0)+
                NVL(DLA_T06,0)+NVL(DLA_T07,0)+NVL(DLA_T08,0)+NVL(DLA_T09,0)+NVL(DLA_T10,0)+
                NVL(DLA_T11,0)+NVL(DLA_T12,0)+NVL(DLA_T13,0)) AS tong_trong_tinh,

                (NVL(DLA_D01,0)+NVL(DLA_D02,0)+NVL(DLA_D03,0)+NVL(DLA_D04,0)+
                NVL(DLA_D05,0)+NVL(DLA_D06,0)) AS tong_ngoai_tinh

            FROM (   
            SELECT *
            FROM (
                SELECT
                    a.thang,
                    a.goi_cuoc,
                    b.area_code,
                    NVL(a.trong_tinh,0) + NVL(a.ngoai_tinh,0) AS sl_tb
                FROM th_tb_ptsl_th_bc03_show a
                LEFT JOIN map_area_ward_new b
                    ON a.precinct_code = b.ward_code
            )
            PIVOT (
                SUM(sl_tb)
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
            )
            where month = TO_DATE('${startOfMonth}','dd/mm/rrrr')
            ORDER BY thang, goi_cuoc
            ) t
            ORDER BY thang, goi_cuoc
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
