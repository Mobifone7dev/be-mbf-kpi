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

    res.send({ result: "hello wolrd " + req.path });

  }
  async getDashBoardPlanKpi(req, res) {
    let monthString = req.query.month;
    let province = req.query.province ? req.query.province : '';

    const myDate = moment(monthString, "DD-MM-YYYY");
    const startOfMonth = myDate.startOf("month").format("DD-MM-YYYY");
    let sql;
    if (province && province.length > 0) {
      if (province == 'CTY7') {
        sql = `select * from db01_owner.chitieu_kpi_2025 where thang= to_date('${startOfMonth}','DD-MM-RRRR')`
      } else {
        sql = `select THANG, STT, TEN_CHI_TIEU, ${province}, DONVI from db01_owner.chitieu_kpi_2025 where thang= to_date('${startOfMonth}','DD-MM-RRRR')`
      }
    } else {
      sql = `select * from db01_owner.chitieu_kpi_2025 where thang= to_date('${startOfMonth}','DD-MM-RRRR')`;

    }

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

  async getDashBoardPlanKpiDLA(req, res) {
    let monthString = req.query.month;
    const myDate = moment(monthString, "DD-MM-YYYY");
    const startOfMonth = myDate.startOf("month").format("DD-MM-YYYY");
    let sql;
    if (startOfMonth) {
      sql = `select * from db01_owner.chitieu_kpi_dla where thang= to_date('${startOfMonth}','DD-MM-RRRR')`;
      console.log("chekc ne", sql)
    }
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

  async getPtmWithWard(req, res) {
    let monthString = req.query.month;
    const myDate = moment(monthString, "DD-MM-YYYY");
    const startOfMonth = myDate.startOf("month").format("DD-MM-YYYY");
    let sql;
    if (startOfMonth) {
      sql = `
            SELECT 
          a.new_precinct_code,
          COUNT(a.isdn) AS isdn_count,
          b.ward_name,
          c.ma_vung  as area_code,
          c.old_district_name
      FROM (
              SELECT isdn, new_precinct_code
              FROM db01_owner.tb_ptm_tt_new_precinct
              WHERE TRUNC(active_date, 'MM') = to_date('${startOfMonth}','DD-MM-RRRR')

              UNION ALL
              
              SELECT isdn, new_precinct_code
              FROM db01_owner.tb_ptm_ts_new_precinct
              WHERE TRUNC(active_date, 'MM') = to_date('${startOfMonth}','DD-MM-RRRR')
      ) a
      LEFT JOIN db01_owner.map_area_ward_new b 
          ON b.ward_code = a.new_precinct_code
       left join an_owner.DLA_MAP_XA_VUNG c 
     on c.precinct_code =  a.new_precinct_code
      
      GROUP BY 
          a.new_precinct_code, b.ward_name, c.ma_vung, c.old_district_name
      ORDER BY 
          a.new_precinct_code
      `;
    }
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

  async getDashBoardPlanKpiDLAEmployee(req, res) {
    let monthString = req.query.month;
    let matchSearch = req.query.matchSearch;
    const myDate = moment(monthString, "DD-MM-YYYY");
    const startOfMonth = myDate.startOf("month").format("DD-MM-YYYY");
    let sql;
    if (startOfMonth && matchSearch) {
      sql = `select * from db01_owner.chitieu_kpi_dla_nhan_vien 
      where thang= to_date('${startOfMonth}','DD-MM-RRRR')
      and emp_code like '${matchSearch}'
      `;
    }
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

  async getDashBoardExecKpi(req, res) {
    var monthString = req.query.month;
    const myDate = moment(monthString, "DD-MM-YYYY");
    const startOfMonth = myDate.startOf("month").format("DD-MM-YYYY");
    let province = req.query.province ? req.query.province : '';

    if (monthString && startOfMonth) {
      let sql;
      if (province && province.length > 0) {
        if (province == 'CTY7') {
          sql = `
          select v1.*, (v1.KHO + v1.DLA + v1.GLA + v1.PYE + v1.DNO + v1.KON) CTY7 from (
          SELECT * FROM
          (
              select ten_chi_tieu,province_code,sum(THUC_HIEN) th, max(last_date) last_date
              from db01_owner.thuc_hien_kpi_2025 
              where thang = to_date('${startOfMonth}','DD-MM-RRRR')
              and ten_chi_tieu not in ( 'TILE_MNP','TI_LE_N_1_DAIKY','TILE_N_1_DONKY',
              'TILE_N_1_GOI','TB_PLAT_TT','TI_LE_DN_SU_DUNG_GP_MBF','TYLE_GD_C2C' )
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
              'TILE_N_1_GOI','TB_PLAT_TT','TI_LE_DN_SU_DUNG_GP_MBF','TYLE_GD_C2C' )
              group by ten_chi_tieu,province_code, last_date
          )
          PIVOT
          (
            sum(th)
            FOR province_code IN ('KHO' KHO, 'DLA' DLA, 'GLA' GLA, 'PYE' PYE, 'DNO' DNO, 'KON' KON, 'CTY7' CTY7)
          )
        `;
        } else {
          sql = `
          select v1.* from (
          SELECT * FROM
          (
              select ten_chi_tieu,province_code,sum(THUC_HIEN) th, max(last_date) last_date
              from db01_owner.thuc_hien_kpi_2025 
              where thang = to_date('${startOfMonth}','DD-MM-RRRR')
              and ten_chi_tieu not in ( 'TILE_MNP','TI_LE_N_1_DAIKY','TILE_N_1_DONKY',
              'TILE_N_1_GOI','TB_PLAT_TT','TI_LE_DN_SU_DUNG_GP_MBF','TYLE_GD_C2C' )
              group by ten_chi_tieu,province_code,last_date
          )
          PIVOT
          (
            sum(th)
            FOR province_code IN ('${province}' ${province})
          )
          ) v1
          union all
          SELECT * FROM
          (
              select ten_chi_tieu,province_code,sum(THUC_HIEN) th, max(last_date) last_date
              from db01_owner.thuc_hien_kpi_2025 
              where thang = to_date('${startOfMonth}','DD-MM-RRRR')
              and ten_chi_tieu  in ( 'TILE_MNP','TI_LE_N_1_DAIKY','TILE_N_1_DONKY',
              'TILE_N_1_GOI','TB_PLAT_TT','TI_LE_DN_SU_DUNG_GP_MBF','TYLE_GD_C2C' )
              group by ten_chi_tieu,province_code, last_date
          )
          PIVOT
          (
            sum(th)
            FOR province_code IN ('${province}' ${province})
          )
        `;
        }
        console.log("sql", sql)
      } else {
        sql = `
          select v1.*, (v1.KHO + v1.DLA + v1.GLA + v1.PYE + v1.DNO + v1.KON) CTY7 from (
          SELECT * FROM
          (
              select ten_chi_tieu,province_code,sum(THUC_HIEN) th, max(last_date) last_date
              from db01_owner.thuc_hien_kpi_2025 
              where thang = to_date('${startOfMonth}','DD-MM-RRRR')
              and ten_chi_tieu not in ( 'TILE_MNP','TI_LE_N_1_DAIKY','TILE_N_1_DONKY',
              'TILE_N_1_GOI','TB_PLAT_TT','TI_LE_DN_SU_DUNG_GP_MBF','TYLE_GD_C2C' )
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
              'TILE_N_1_GOI','TB_PLAT_TT','TI_LE_DN_SU_DUNG_GP_MBF','TYLE_GD_C2C' )
              group by ten_chi_tieu,province_code, last_date
          )
          PIVOT
          (
            sum(th)
            FOR province_code IN ('KHO' KHO, 'DLA' DLA, 'GLA' GLA, 'PYE' PYE, 'DNO' DNO, 'KON' KON, 'CTY7' CTY7)
          )
        `;

      }

      DbConnection.getConnected(sql, {}, function (result) {
        if (result) {
          res.send({ result: result });
        }
      });
    } else {
      res.send({ error: "Có lỗi xảy ra" });
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
            let lastDate = new Date();
            lastDate = returnLastDate(info.nameKpi, req.body)


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
                    provinceCode: info.province,
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
                    lastDate: lastDate,
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



  exportExcelExecKpi(req, res) {
    console.log("==== API exportRawDashBoardExecKpi ĐÃ ĐƯỢC GỌI ====");

    const { month, kpiType, provincePt } = req.query;

    console.log("📌 Tham số nhận được từ FE:", { month, kpiType, provincePt });

    console.log("Tham số nhận được:", { month, kpiType, provincePt });

    if (!month || !kpiType) {
      console.log("Thiếu tham số đầu vào!");
      return res.status(400).json({ error: "Thiếu tham số đầu vào" });
    }

    const formattedMonth = moment(month, "DD-MM-YYYY").format("MM/YYYY");

    // Xây dựng câu lệnh SQL tùy vào điều kiện có provincePt hay không
    let sql = `
        SELECT to_char(MONTH, 'dd-mm-yyyy') MONTH, to_char(FILE_DATE, 'dd-mm-yyyy') FILE_DATE, LOAITB, ISDN, SUB_ID, to_char(ACTIVE_DATE, 'dd-mm-yyyy') ACTIVE_DATE, 
STATUS, ACT_STATUS, SUB_TYPE, CUS_TYPE, REG_TYPE, REG_REASON_ID, PROVINCE_PT, DISTRICT_PT, SHOP_CODE_PT, NV_PT, LOAI_HINH_TB, 
    KPI_PTM_HTS, KPI_PTM_TBTS_THOAI, KPI_PTM_NDS, KPI_PTM_M2M, KPI_PTM_SAYMEE, GOI_CUOC_KPI, to_char(NGAY_DKY_GOI_KPI, 'dd-mm-yyyy') NGAY_DKY_GOI_KPI, GIA_GOI_CUOC_KPI, NEN_TANG_NDS, VASP_REG_CODE 
        FROM db01_owner.th_tb_ptm_kpi_2025
        WHERE TO_CHAR(MONTH, 'MM/YYYY') = '${formattedMonth}'
          AND ${kpiType} = '1'
    `;

    if (provincePt) {
      sql += ` AND province_pt = '${provincePt}'`;
    }

    console.log("Executing SQL:", sql);

    DbConnection.getConnected(sql, {}, function (result) {
      if (result) {
        console.log("Query thành công, số bản ghi:", result.length);
        res.json({ result });
      } else {
        console.log("Lỗi truy vấn dữ liệu!");
        res.status(500).json({ error: "Lỗi truy vấn dữ liệu" });
      }
    });
  }

  show(req, res) {
    res.send("detail");
  }

  async getDashBoardExecKpiDLA(req, res) {
    var monthString = req.query.month;
    const myDate = moment(monthString, "DD-MM-YYYY");
    const startOfMonth = myDate.startOf("month").format("DD-MM-YYYY");

    if (monthString && startOfMonth) {

      let sql = `
        SELECT v1.*,
          NVL(v1.DLA_T01,0) + NVL(v1.DLA_T02,0) + NVL(v1.DLA_T03,0)
        + NVL(v1.DLA_T04,0) + NVL(v1.DLA_T05,0) + NVL(v1.DLA_T06,0)
        + NVL(v1.DLA_T07,0) + NVL(v1.DLA_T08,0) + NVL(v1.DLA_T09,0)
        + NVL(v1.DLA_T10,0) + NVL(v1.DLA_T11,0) + NVL(v1.DLA_T12,0)
        + NVL(v1.DLA_T13,0)
        + NVL(v1.DLA_D01,0) + NVL(v1.DLA_D02,0) + NVL(v1.DLA_D03,0)
        + NVL(v1.DLA_D04,0) + NVL(v1.DLA_D05,0) + NVL(v1.DLA_D06,0)
        + NVL(v1.TTKDVT,0)  + NVL(v1.TTKDGPS,0) AS DLA,
          ld.last_date
        FROM (
        SELECT *
        FROM (
            SELECT ten_chi_tieu,
                  area,
                  SUM(thuc_hien) th
            FROM db01_owner.thuc_hien_kpi_dla
            WHERE thang = TO_DATE('${startOfMonth}','dd/mm/rrrr')
            GROUP BY ten_chi_tieu, area
        )
        PIVOT (
            SUM(th)
            FOR area IN (
                'DLA_T01' DLA_T01, 'DLA_T02' DLA_T02,
                'DLA_T03' DLA_T03, 'DLA_T04' DLA_T04,
                'DLA_T05' DLA_T05, 'DLA_T06' DLA_T06,
                'DLA_T07' DLA_T07, 'DLA_T08' DLA_T08,
                'DLA_T09' DLA_T09, 'DLA_T10' DLA_T10,
                'DLA_T11' DLA_T11, 'DLA_T12' DLA_T12,
                'DLA_T13' DLA_T13,
                'DLA_D01' DLA_D01, 'DLA_D02' DLA_D02,
                'DLA_D03' DLA_D03, 'DLA_D04' DLA_D04,
                'DLA_D05' DLA_D05, 'DLA_D06' DLA_D06,
                'TTKDVT'  TTKDVT,
                'TTKDGPS' TTKDGPS
              )
            )
            ) v1
            LEFT JOIN (
                SELECT ten_chi_tieu,
                      MAX(last_date) last_date
                FROM db01_owner.thuc_hien_kpi_dla
                WHERE thang = TO_DATE('${startOfMonth}','dd/mm/rrrr')
                GROUP BY ten_chi_tieu
            ) ld
            ON v1.ten_chi_tieu = ld.ten_chi_tieu `;
      DbConnection.getConnected(sql, {}, function (result) {
        res.send({ result: result });
      });
    } else {
      res.send({ error: "Có lỗi xảy ra" });
    }


  }
  async getDashBoardExecKpiDLAEmployee(req, res) {
    const monthString = req.query.month;
    const area = req.query.area;
    const matchSearch = req.query.matchSearch;
    const myDate = moment(monthString, "DD-MM-YYYY");
    const startOfMonth = myDate.startOf("month").format("DD-MM-YYYY");

    if (monthString && startOfMonth && matchSearch) {

      let sql = `
       SELECT v1.*,
          ld.last_date
        FROM (
                SELECT ten_chi_tieu,
                      area,
                      shop_code,
                      emp_code,
                      SUM(thuc_hien) thuc_hien
                FROM db01_owner.thuc_hien_kpi_dla_nhan_vien
                WHERE thang = to_date('${startOfMonth}','dd/mm/rrrr')
                GROUP BY ten_chi_tieu, area, shop_code, emp_code  
        ) v1
            LEFT JOIN (
                SELECT ten_chi_tieu,
                      MAX(last_date) last_date
                FROM db01_owner.thuc_hien_kpi_dla_nhan_vien
                WHERE thang = TO_DATE('${startOfMonth}','dd/mm/rrrr')
                GROUP BY ten_chi_tieu
            ) ld
            ON v1.ten_chi_tieu = ld.ten_chi_tieu
            where emp_code like '${matchSearch}'
            `;
      if (area) {
        sql += ` and v1.area = '${area}'`
      }
      DbConnection.getConnected(sql, {}, function (result) {
        res.send({ result: result });
      });
    } else {
      res.send({ error: "Có lỗi xảy ra", monthString, startOfMonth, matchSearch });
    }


  }
  async createManualListKpiDLA(req, res) {
    const result = validationResult(req);
    if (result.isEmpty())
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
            area: object.area

          }
          let lastDate = new Date();
          lastDate = returnLastDate(info.nameKpi, req.body)


          const existingKpi = await sequelize.query(
            `SELECT * FROM db01_owner.thuc_hien_kpi_dla WHERE ten_chi_tieu = :nameKpi
               and thang = to_date(:month,'dd-mm-rrrr')
               and area = :area
               `,
            {
              replacements: { nameKpi: info.nameKpi, month: info.month, area: info.area },
              type: sequelize.QueryTypes.SELECT,
            }
          );
          if (existingKpi.length > 0) {
            await sequelize.query(
              `delete from db01_owner.thuc_hien_kpi_dla 
                WHERE ten_chi_tieu = :nameKpi and thang = to_date(:month,'dd-mm-rrrr')
                and area =:area
                `,
              {
                replacements: {
                  nameKpi: info.nameKpi,
                  month: info.month,
                  area: info.area,
                },
                type: sequelize.QueryTypes.DELETE,
              }
            );
            await sequelize.query(
              `insert into  db01_owner.thuc_hien_kpi_dla 
                (ten_chi_tieu, thang, last_date, area,thuc_hien)
                values
                (
                :nameKpi,
                 to_date(:month,'dd-mm-rrrr'),
                :lastDate,
                :area,
                :kpi
                )
                  `,
              {
                replacements: {
                  nameKpi: info.nameKpi,
                  month: info.month,
                  lastDate: lastDate,
                  area: info.area,
                  kpi: info.kpi
                },
                type: sequelize.QueryTypes.INSERT,
              }
            );

            console.log("check result", result);

          } else {
            const result = await sequelize.query(
              `insert into  db01_owner.thuc_hien_kpi_dla 
              (ten_chi_tieu, thang, last_date, area,thuc_hien)
              values
              (
              :nameKpi,
               to_date(:month,'dd-mm-rrrr'),
              :lastDate,
              :area,
              :kpi
              )
                `,
              {
                replacements: {
                  nameKpi: info.nameKpi,
                  month: info.month,
                  lastDate: new Date(),
                  area: info.area,
                  kpi: info.kpi,
                },
                type: sequelize.QueryTypes.INSERT,
              }
            );

          }
          console.log("check result", result);
        };
        res.send({ data: { sussess: true } })
      } catch (error) {
        throw new Error(`Có lỗi xảy ra:  ${error}`)
      }
    }
  }
  async createManualListKpiDLAEmployee(req, res) {
    const result = validationResult(req);
    if (result.isEmpty())
      var monthString = req.body.month;
    const myDate = moment(monthString, "DD-MM-YYYY");
    const startOfMonth = myDate.startOf("month").format("DD-MM-YYYY");
    const kpiList = req.body.kpiList;
    if (kpiList && kpiList.length > 0) {
      try {
        // console.log("kpiList", kpiList);
        for (const object of kpiList) {

          if (object && object.TEN_CHI_TIEU && object.EMP_CODE) {
            let info = {
              TEN_CHI_TIEU: object.TEN_CHI_TIEU,
              THUC_HIEN: object.THUC_HIEN,
              MONTH: startOfMonth,
              EMP_CODE: object.EMP_CODE

            }
            const existingKpi = await sequelize.query(
              `SELECT * FROM db01_owner.chitieu_kpi_dla_nhan_vien WHERE ten_chi_tieu = :TEN_CHI_TIEU
               and thang = to_date(:MONTH,'dd-mm-rrrr')
               and emp_code = :EMP_CODE
               `,
              {
                replacements: { TEN_CHI_TIEU: info.TEN_CHI_TIEU, MONTH: info.MONTH, EMP_CODE: info.EMP_CODE },
                type: sequelize.QueryTypes.SELECT,
              }
            );
            if (existingKpi.length > 0) {
              await sequelize.query(
                `delete from db01_owner.chitieu_kpi_dla_nhan_vien 
                WHERE ten_chi_tieu = :TEN_CHI_TIEU and thang = to_date(:MONTH,'dd-mm-rrrr')
                and emp_code =:EMP_CODE
                `,
                {
                  replacements: {
                    TEN_CHI_TIEU: info.TEN_CHI_TIEU,
                    MONTH: info.MONTH,
                    EMP_CODE: info.EMP_CODE,
                  },
                  type: sequelize.QueryTypes.DELETE,
                }
              );
              await sequelize.query(
                `insert into  db01_owner.chitieu_kpi_dla_nhan_vien 
                (ten_chi_tieu, thang, emp_code,thuc_hien)
                values
                (
                :TEN_CHI_TIEU,
                 to_date(:MONTH,'dd-mm-rrrr'),
                :EMP_CODE,
                :THUC_HIEN
                )
                  `,
                {
                  replacements: {
                    TEN_CHI_TIEU: info.TEN_CHI_TIEU,
                    MONTH: info.MONTH,
                    EMP_CODE: info.EMP_CODE,
                    THUC_HIEN: info.THUC_HIEN
                  },
                  type: sequelize.QueryTypes.INSERT,
                }
              );

              // console.log("check result", result);

            } else {
              const result = await sequelize.query(
                `insert into  db01_owner.chitieu_kpi_dla_nhan_vien 
              (ten_chi_tieu, thang, emp_code,thuc_hien)
              values
              (
              :TEN_CHI_TIEU,
               to_date(:MONTH,'dd-mm-rrrr'),
              :EMP_CODE,
              :THUC_HIEN
              )
                `,
                {
                  replacements: {
                    TEN_CHI_TIEU: info.TEN_CHI_TIEU,
                    MONTH: info.MONTH,
                    EMP_CODE: info.EMP_CODE,
                    THUC_HIEN: info.THUC_HIEN,
                  },
                  type: sequelize.QueryTypes.INSERT,
                }
              );

            }

          } else {
            res.status(400).send({ error: "Có lỗi xảy ra - thieu truong bat buoc" });
            return;
          }

          // console.log("check result", result);
        };
        res.send({ data: { sussess: true } })
      } catch (error) {
        throw new Error(`Có lỗi xảy ra:  ${error}`)
      }
    }
  }

  async createManualListKpiDLAEmployeeExec(req, res) {
    const result = validationResult(req);
    if (result.isEmpty())
      var monthString = req.body.month;
    const myDate = moment(monthString, "DD-MM-YYYY");
    const startOfMonth = myDate.startOf("month").format("DD-MM-YYYY");
    const kpiList = req.body.kpiList;
    if (kpiList && kpiList.length > 0) {
      try {
        // console.log("kpiList", kpiList);
        for (const object of kpiList) {

          if (startOfMonth && object && object.TEN_CHI_TIEU && object.EMP_CODE && object.SHOP_CODE && object.AREA) {
            let info = {
              TEN_CHI_TIEU: object.TEN_CHI_TIEU,
              THUC_HIEN: object.THUC_HIEN,
              MONTH: startOfMonth,
              EMP_CODE: object.EMP_CODE,
              AREA: object.AREA,
              SHOP_CODE: object.SHOP_CODE

            }
            const existingKpi = await sequelize.query(
              `SELECT * FROM db01_owner.thuc_hien_kpi_dla_nhan_vien WHERE ten_chi_tieu = :TEN_CHI_TIEU
               and thang = to_date(:MONTH,'dd-mm-rrrr')
               and emp_code = :EMP_CODE
               `,
              {
                replacements: { TEN_CHI_TIEU: info.TEN_CHI_TIEU, MONTH: info.MONTH, EMP_CODE: info.EMP_CODE },
                type: sequelize.QueryTypes.SELECT,
              }
            );
            if (existingKpi.length > 0) {
              await sequelize.query(
                `delete from db01_owner.thuc_hien_kpi_dla_nhan_vien 
                WHERE ten_chi_tieu = :TEN_CHI_TIEU and thang = to_date(:MONTH,'dd-mm-rrrr')
                and emp_code =:EMP_CODE
                `,
                {
                  replacements: {
                    TEN_CHI_TIEU: info.TEN_CHI_TIEU,
                    MONTH: info.MONTH,
                    EMP_CODE: info.EMP_CODE,
                  },
                  type: sequelize.QueryTypes.DELETE,
                }
              );
              await sequelize.query(
                `insert into  db01_owner.thuc_hien_kpi_dla_nhan_vien 
                (ten_chi_tieu, thang, emp_code,thuc_hien, area, shop_code)
                values
                (
                :TEN_CHI_TIEU,
                 to_date(:MONTH,'dd-mm-rrrr'),
                :EMP_CODE,
                :THUC_HIEN,
                :AREA,
                :SHOP_CODE
                )
                  `,
                {
                  replacements: {
                    TEN_CHI_TIEU: info.TEN_CHI_TIEU,
                    MONTH: info.MONTH,
                    EMP_CODE: info.EMP_CODE,
                    THUC_HIEN: info.THUC_HIEN,
                    AREA: info.AREA,
                    SHOP_CODE: info.SHOP_CODE
                  },
                  type: sequelize.QueryTypes.INSERT,
                }
              );

              // console.log("check result", result);

            } else {
              const result = await sequelize.query(
                `insert into  db01_owner.thuc_hien_kpi_dla_nhan_vien 
              (ten_chi_tieu, thang, emp_code,thuc_hien, area, shop_code)
              values
              (
              :TEN_CHI_TIEU,
               to_date(:MONTH,'dd-mm-rrrr'),
              :EMP_CODE,
              :THUC_HIEN,
              :AREA,
              :SHOP_CODE
              )
                `,
                {
                  replacements: {
                    TEN_CHI_TIEU: info.TEN_CHI_TIEU,
                    MONTH: info.MONTH,
                    EMP_CODE: info.EMP_CODE,
                    THUC_HIEN: info.THUC_HIEN,
                    AREA: info.AREA,
                    SHOP_CODE: info.SHOP_CODE
                  },
                  type: sequelize.QueryTypes.INSERT,
                }
              );

            }

          } else {
            res.status(400).send({ error: "Có lỗi xảy ra - thieu truong bat buoc" });
            return;
          }

          // console.log("check result", result);
        };
        res.send({ data: { sussess: true } })
      } catch (error) {
        throw new Error(`Có lỗi xảy ra:  ${error}`)
      }
    }
  }
  async searcEmployeebyArea(req, res) {
    const area = req.query.area;
    const matchSearch = req.query.matchSearch;
    if (area && matchSearch) {

      try {

        sequelize.query(
          ` SELECT a.emp_code,
       a.emp_name,
       a.shop_code,
       b.shop_name,
       b.area_code,
       b.ward_code,
       c.phone,
       c.email
            FROM db01_owner.v_employee a
            INNER JOIN (
                SELECT shop_code,
                      MAX(shop_name) AS shop_name,
                      MAX(area_code) AS area_code,
                      MAX(ward_code) AS ward_code
                FROM db01_owner.map_shopcode_area_ward_new
                GROUP BY shop_code
            ) b ON a.shop_code = b.shop_code
            LEFT JOIN (
                SELECT emp_code,
                      MAX(phone) AS phone,
                      MAX(email) AS email
                FROM db01_owner.danh_sach_dv
                GROUP BY emp_code
            ) c ON c.emp_code = a.emp_code
            WHERE a.status = 1
            and a.shop_code in 
            (select shop_code from db01_owner.map_shopcode_area_ward_new where area_code =:area )
            and  a.emp_code like :matchSearch
              `,
          {
            replacements: { area: area, matchSearch: matchSearch },
            type: sequelize.QueryTypes.SELECT,
          }
        ).then(data => {
          res.json({ data });
        })
          .catch(err => {
            console.error("Error fetching  data:", err);
            res.status(500).json({ error: "Internal Server Error" });
          });;


      } catch (error) {
        throw new Error(`Có lỗi xảy ra:  ${error}`)

      }
    } else {
      res.statu(400).send({ data: { error: 'thieu thong tin area code' } })
    }
  }
  async searcEmployeeByEmpcode(req, res) {
    const matchSearch = req.query.matchSearch;
    if (matchSearch) {

      try {

        sequelize.query(
          `SELECT a.emp_code,
       a.emp_name,
       a.shop_code,
       b.shop_name,
       b.area_code,
       b.ward_code,
       c.phone,
       c.email
            FROM db01_owner.v_employee a
            INNER JOIN (
                SELECT shop_code,
                      MAX(shop_name) AS shop_name,
                      MAX(area_code) AS area_code,
                      MAX(ward_code) AS ward_code
                FROM db01_owner.map_shopcode_area_ward_new
                GROUP BY shop_code
            ) b ON a.shop_code = b.shop_code
            LEFT JOIN (
                SELECT emp_code,
                      MAX(phone) AS phone,
                      MAX(email) AS email
                FROM db01_owner.danh_sach_dv
                GROUP BY emp_code
            ) c ON c.emp_code = a.emp_code
            WHERE a.status = 1
            and a.shop_code like 'DLA%'
            and  a.emp_code like :matchSearch
           `,
          {
            replacements: { matchSearch: matchSearch },
            type: sequelize.QueryTypes.SELECT,
          }
        ).then(data => {
          res.json({ data });
        })
          .catch(err => {
            console.error("Error fetching  data:", err);
            res.status(500).json({ error: "Internal Server Error" });
          });

      } catch (error) {
        throw new Error(`Có lỗi xảy ra:  ${error}`)

      }
    } else {
      res.status(400).send({ data: { error: 'thieu thong tin matchSearch' } })
    }
  }

  async get_PTM_EmployeeCode(req, res) {
    const matchSearch = req.query.matchSearch;
    var monthString = req.query.month;
    const myDate = moment(monthString, "DD-MM-YYYY");
    const startOfMonth = myDate.startOf("month").format("DD-MM-YYYY");
    if (matchSearch && startOfMonth) {
      try {

        sequelize.query(
          `select * from db01_owner.th_tb_ptm_kpi_dla a
            WHERE a.month = TO_DATE(:month,'dd/mm/rrrr')
            and  a.nv_pt like :matchSearch
           `,
          {
            replacements: { matchSearch: matchSearch, month: startOfMonth },
            type: sequelize.QueryTypes.SELECT,
          }
        ).then(data => {
          res.json({ data });
        })
          .catch(err => {
            console.error("Error fetching  data:", err);
            res.status(500).json({ error: "Internal Server Error", err });
          });

      } catch (error) {
        throw new Error(`Có lỗi xảy ra:  ${error}`)

      }
    } else {
      res.status(400).send({ data: { error: 'thieu thong tin matchSearch va month' } })
    }
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
    case 'SL_C2C':
      return '7.1';
    case 'TYLE_GD_C2C':
      return '7.3';
    case 'TI_LE_DN_SU_DUNG_GP_MBF':
      return '8.2';
    default: return '0';

  }
}

const returnLastDate = (nameKpi, object) => {
  switch (nameKpi) {
    case 'DTHU_FIBER':
      return object.dateUpdateFiber ? new Date(object.dateUpdateFiber) : new Date();
    case 'DTHU_CLOUD_DC':
      return object.dateUpdateCloudDC ? new Date(object.dateUpdateCloudDC) : new Date();
    case 'DTHU_MASS':
      return object.dateUpdateDthuMass ? new Date(object.dateUpdateDthuMass) : new Date();
    case 'DTHU_DUAN':
      return object.dateUpdateDthuDuan ? new Date(object.dateUpdateDthuDuan) : new Date();
    case 'DTHU_GPS':
      return object.dateUpdateDthuGps ? new Date(object.dateUpdateDthuGps) : new Date();
    case 'TB_PLAT_TT':
      return object.dateUpdateTbPlatTT ? new Date(object.dateUpdateTbPlatTT) : new Date();
    case 'SL_C2C':
      return object.dateUpdateSLC2C ? new Date(object.dateUpdateSLC2C) : new Date();
    case 'TYLE_GD_C2C':
      return object.dateUpdateTYLEGDC2C ? new Date(object.dateUpdateTYLEGDC2C) : new Date();
    case 'TI_LE_DN_SU_DUNG_GP_MBF':
      return object.dateUpdateGpMbf ? new Date(object.dateUpdateGpMbf) : new Date();
    case 'SL_HD_GPS_KHDN':
      return object.dateUpdate_SL_HD_GPS_KHDN ? new Date(object.dateUpdate_SL_HD_GPS_KHDN) : new Date();
    default: return new Date();

  }
}







module.exports = new DashboardController();
