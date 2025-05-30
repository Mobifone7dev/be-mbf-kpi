
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
class DashboardThiduaController {
    index(req, res) {
        res.send({ result: "hello wolrd" });

    }
    getSoluongPTMThiduaMobiAgri(req, res) {
        const query = `select count(isdn) quantity, province_pt, active_date
        from(
        select * from db01_owner.TH_TB_PTM_KPI_2025 t1
        where t1.ACTIVE_DATE >= to_date('23-05-2025', 'dd-mm-yyyy') 
            and t1.ACTIVE_DATE < to_date('01-07-2025', 'dd-mm-yyyy')
            and t1.NEN_TANG_NDS = 'mobiAgri'
        )
        group by province_pt,active_date
        order by province_pt,active_date`;
        sequelize.query(query, {
            replacements: {},
            type: sequelize.QueryTypes.SELECT
        })
            .then(data => {
                res.json({ data });
            })
            .catch(err => {
                console.error("Error fetching Thidua MobiAgri data:", err);
                res.status(500).json({ error: "Internal Server Error" });
            });
    }
    getDoanhthuPTMThiduaMobiAgri(req, res) {
        const query = `select sum(VALUE_NUMBER) dt, province_pt, active_date
        from(
        select t1.*, TEN_CHUONG_TRINH, NOI_DUNG, KEY, VALUE_NUMBER
        from db01_owner.TH_TB_PTM_KPI_2025 t1
        left join ( select * from an_owner.DU_LIEU_CHUONG_TRINH_THI_DUA
                    where TEN_CHUONG_TRINH = 'THI_DUA_QUY_II/2025' and NOI_DUNG = 'PTM_TB_Platform_Mobi_Agri'
        ) t2 ON ( t2.MONTH = t1.MONTH and t2.ISDN = t1.ISDN and t2.SUB_ID = t1.SUB_ID )
        where t1.ACTIVE_DATE >= to_date('23-05-2025', 'dd-mm-yyyy') and t1.ACTIVE_DATE < to_date('01-07-2025', 'dd-mm-yyyy')
            and t1.NEN_TANG_NDS = 'mobiAgri'
        )
        group by province_pt,active_date
        order by province_pt,active_date`;
        sequelize.query(query, {
            replacements: {},
            type: sequelize.QueryTypes.SELECT
        })
            .then(data => {
                res.json({ data });
            })
            .catch(err => {
                console.error("Error fetching Thidua MobiAgri data:", err);
                res.status(500).json({ error: "Internal Server Error" });
            });
    }

    getSoluongPTMThiduaM2M(req, res) {
        const query = `select count(isdn), province_pt, active_date
        from(
        select t1.*, TEN_CHUONG_TRINH, NOI_DUNG, ISSUE_DATE, KEY, VALUE_STRING
        from db01_owner.TH_TB_PTM_KPI_2025 t1
        inner join (
            select * from an_owner.DU_LIEU_CHUONG_TRINH_THI_DUA
            where NOI_DUNG = 'PTM_TB_M2M'
        ) t2 ON ( t2.LOAITB = t1.LOAITB and t2.MONTH = t1.MONTH and t2.ISDN = t1.ISDN and t2.SUB_ID = t1.SUB_ID )
        WHERE t1.ACTIVE_DATE >= to_date('26-05-2025', 'dd-mm-yyyy') 
            and t1.ACTIVE_DATE < to_date('01-07-2025', 'dd-mm-yyyy') 
        )
        group by province_pt,active_date
        order by province_pt,active_date`;
        sequelize.query(query, {
            replacements: {},
            type: sequelize.QueryTypes.SELECT
        })
            .then(data => {
                res.json({ data });
            })
            .catch(err => {
                console.error("Error fetching Thidua MobiAgri data:", err);
                res.status(500).json({ error: "Internal Server Error" });
            });
    }
}
module.exports = new DashboardThiduaController();
