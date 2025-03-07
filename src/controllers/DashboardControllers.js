const DbConnection = require("../../DbConnection");
const DbSaleOwnerConnection = require("../../DbSaleOwnerConnection");
const lowerCaseKeys = require("../../src/utils/helper");
var moment = require("moment");
const oracledb = require("oracledb");
oracledb.autoCommit = true;
const db = require("../models");
const fs = require("fs");
const ManualKpi = db.manualKpi;
const { sequelize } = require('../models'); // Import s
const { query, validationResult } = require("express-validator");

class DashboardController {
  index(req, res) {
    res.send({ result: "hello wolrd" });

  }
  async getDashBoardPlanKpi(req, res) {
    var monthString = req.query.month;
    const myDate = moment(monthString, "DD-MM-YYYY");
    const startOfMonth = myDate.startOf("month").format("DD-MM-YYYY");
    let sql = `select * from db01_owner.chitieu_kpi_2025 where thang= to_date('${startOfMonth}','DD-MM-RRRR')`;
    if (monthString && startOfMonth) {
      DbConnection.getConnected(sql, {}, function (data) {

        if (data) {
          data.map((item, index) => { });
          res.status(200).json({ result: data }); // This runs as well.
        }
      });
    } else {
      res.status(401).json({ error: "có lỗi xảy ra" }); // This runs as well.

    }

  }
  async createManualKpi(req, res) {
    const result = validationResult(req);
    if (result.isEmpty()) {
      var monthString = req.body.month;
      const myDate = moment(monthString, "DD-MM-YYYY");
      const startOfMonth = myDate.startOf("month").format("DD-MM-YYYY");
      let info = {
        nameKpi: req.body.nameKpi,
        kpi: req.body.kpi,
        month: startOfMonth,
        province: req.body.province

      }
      let orderNumber = returnOrderNumber(info.nameKpi);


      try {

        const existingKpi = await sequelize.query(
          `SELECT * FROM db01_owner.thuc_hien_kpi_2025 WHERE ten_chi_tieu = :nameKpi
           and thang = to_date(:month,'dd-mm-rrrr')
           and province_code = :provinceCode
           `,
          {
            replacements: { nameKpi: info.nameKpi, month: info.month, provinceCode: info.province },
            type: sequelize.QueryTypes.SELECT,
          }
        );
        if (existingKpi.length > 0) {
          const result = await sequelize.query(
            `update db01_owner.thuc_hien_kpi_2025 
            set ten_chi_tieu =:nameKpi,
            thang = to_date(:month,'dd-mm-rrrr'),
            last_date =:lastDate,
            province_code =:provinceCode,
            thuc_hien =:kpi,
            order_number =:orderNumber
            WHERE ten_chi_tieu = :nameKpi and thang = to_date(:month,'dd-mm-rrrr')
            `,
            {
              replacements: {
                nameKpi: info.nameKpi,
                month: info.month,
                lastDate: new Date(),
                provinceCode: info.province,
                kpi: info.kpi,
                orderNumber: orderNumber
              },
              type: sequelize.QueryTypes.UPDATE,
            }
          );
          res.send({ data: result })

        } else {
          const result = await sequelize.query(
            `insert into  db01_owner.thuc_hien_kpi_2025 
          (ten_chi_tieu, thang, last_date, province_code, district_code,thuc_hien, order_number)
          values
          (
          :nameKpi,
           to_date(:month,'dd-mm-rrrr'),
          :lastDate,
          :provinceCode,
          '',
          :kpi,
          :orderNumber
          )
            `,
            {
              replacements: {
                nameKpi: info.nameKpi,
                month: info.month,
                lastDate: new Date(),
                provinceCode: info.province,
                kpi: info.kpi,
                orderNumber: orderNumber
              },
              type: sequelize.QueryTypes.INSERT,
            }
          );
          res.send({ data: result })


        }


      } catch (error) {
        throw new Error(`Có lỗi xảy ra:  ${error}`)

      }
    }
  }

  async createManualListKpi(req, res) {
    const result = validationResult(req);
    if (result.isEmpty()) {
      var monthString = req.body.month;
      const myDate = moment(monthString, "DD-MM-YYYY");
      const startOfMonth = myDate.startOf("month").format("DD-MM-YYYY");
      const kpiList = req.body.kpiList;
      if (kpiList && kpiList.length > 0) {
        try {
          console.log("kpiList", kpiList);
          for (const object of kpiList) {
            let info = {
              nameKpi: object.id,
              kpi: object.value,
              month: startOfMonth,
              province: object.province

            }
            let orderNumber = returnOrderNumber(info.nameKpi);

            const existingKpi = await sequelize.query(
              `SELECT * FROM db01_owner.thuc_hien_kpi_2025 WHERE ten_chi_tieu = :nameKpi
               and thang = to_date(:month,'dd-mm-rrrr')
               and province_code = :provinceCode
               `,
              {
                replacements: { nameKpi: info.nameKpi, month: info.month, provinceCode: info.province },
                type: sequelize.QueryTypes.SELECT,
              }
            );
            if (existingKpi.length > 0) {
              const resultDelete = await sequelize.query(
                `delete from db01_owner.thuc_hien_kpi_2025 
                WHERE ten_chi_tieu = :nameKpi and thang = to_date(:month,'dd-mm-rrrr')
                and province_code =:provinceCode
                `,
                {
                  replacements: {
                    nameKpi: info.nameKpi,
                    month: info.month,
                    lastDate: new Date(),
                    provinceCode: info.province,
                    kpi: info.kpi,
                    orderNumber: orderNumber
                  },
                  type: sequelize.QueryTypes.DELETE,
                }
              );
              await sequelize.query(
                `insert into  db01_owner.thuc_hien_kpi_2025 
                (ten_chi_tieu, thang, last_date, province_code, district_code,thuc_hien, order_number)
                values
                (
                :nameKpi,
                 to_date(:month,'dd-mm-rrrr'),
                :lastDate,
                :provinceCode,
                '',
                :kpi,
                :orderNumber
                )
                  `,
                {
                  replacements: {
                    nameKpi: info.nameKpi,
                    month: info.month,
                    lastDate: new Date(),
                    provinceCode: info.province,
                    kpi: info.kpi,
                    orderNumber: orderNumber
                  },
                  type: sequelize.QueryTypes.INSERT,
                }
              );

              console.log("check ne", result);

            } else {
              const result = await sequelize.query(
                `insert into  db01_owner.thuc_hien_kpi_2025 
              (ten_chi_tieu, thang, last_date, province_code, district_code,thuc_hien, order_number)
              values
              (
              :nameKpi,
               to_date(:month,'dd-mm-rrrr'),
              :lastDate,
              :provinceCode,
              '',
              :kpi,
              :orderNumber
              )
                `,
                {
                  replacements: {
                    nameKpi: info.nameKpi,
                    month: info.month,
                    lastDate: new Date(),
                    provinceCode: info.province,
                    kpi: info.kpi,
                    orderNumber: orderNumber
                  },
                  type: sequelize.QueryTypes.INSERT,
                }
              );

            }
            console.log("check ne", result);
          };
          res.send({ data: { sussess: true } })
        } catch (error) {
          throw new Error(`Có lỗi xảy ra:  ${error}`)


        }

      }

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
              select ten_chi_tieu,province_code,sum(THUC_HIEN) th, max(last_date) last_date
              from db01_owner.thuc_hien_kpi_2025 
              where thang = to_date('${startOfMonth}','DD-MM-RRRR')
              and ten_chi_tieu not in ( 'TILE_MNP','TI_LE_N_1_DAIKY','TILE_N_1_DONKY',
              'TILE_N_1_GOI','TB_PLAT_TT','TI_LE_DN_SU_DUNG_GP_MBF' )
              group by ten_chi_tieu,province_code,last_date
          )
          PIVOT
          (
            sum(th)
            FOR province_code IN ('KHO' KHO, 'DLA' DLA, 'GLA' GLA, 'PYE' PYE, 'DNO' DNO, 'KON' KON)
          )
          ) v1
          union all
          SELECT * FROM
          (
              select ten_chi_tieu,province_code,sum(THUC_HIEN) th, max(last_date) last_date
              from db01_owner.thuc_hien_kpi_2025 
              where thang = to_date('${startOfMonth}','DD-MM-RRRR')
              and ten_chi_tieu  in ( 'TILE_MNP','TI_LE_N_1_DAIKY','TILE_N_1_DONKY',
              'TILE_N_1_GOI','TB_PLAT_TT','TI_LE_DN_SU_DUNG_GP_MBF' )
              group by ten_chi_tieu,province_code, last_date
          )
          PIVOT
          (
            sum(th)
            FOR province_code IN ('KHO' KHO, 'DLA' DLA, 'GLA' GLA, 'PYE' PYE, 'DNO' DNO, 'KON' KON, 'CTY7' CTY7)
          )
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


  show(req, res) {
    res.send("detail");
  }
}
const returnOrderNumber = (nameKpi) => {
  switch (nameKpi) {
    case 'DTHU_FIBER':
      return '2';
    case 'DTHU_MASS':
      return '3.1';
    case 'DTHU_DUAN':
      return '3.2';
    case 'DTHU_GPS':
      return '6';
    case 'TB_PLAT_TT':
      return '8.2';
    default: '0';

  }
}
module.exports = new DashboardController();
