const oracledb = require("oracledb");
oracledb.autoCommit = true;
const fs = require("fs");
const { sequelize } = require('../models'); // Import s
const { query, validationResult } = require("express-validator");

class DashboardThiduaT08Controller {
    index(req, res) {
        res.send({ result: "hello wolrd" });

    }
    async createManualListLTT(req, res) {

        const result = validationResult(req);
        if (result.isEmpty()) {
            const kpiList = req.body.kpiList;
            if (kpiList && kpiList.length > 0) {
                try {
                    console.log("kpiList", kpiList);
                    for (const object of kpiList) {
                        let info = {
                            amount: object.amount ?? 0,
                            date: object.date,
                            province: object.province

                        }

                        const existingKpi = await sequelize.query(
                            `SELECT * from thidua_ltt_082025 WHERE issue_date =  to_date(:date,'dd-mm-rrrr')
                                    and province = :province
                                    `,
                            {
                                replacements: { date: info.date, province: info.province },
                                type: sequelize.QueryTypes.SELECT,
                            }
                        );

                        console.log("existingKpi", existingKpi)
                        if (existingKpi.length > 0) {
                            await sequelize.query(
                                `delete from thidua_ltt_082025 
                                            WHERE  issue_date = to_date(:date,'dd-mm-rrrr')
                                        and province = :province
                                            `,
                                {
                                    replacements: {
                                        date: info.date,
                                        province: info.province,
                                    },
                                    type: sequelize.QueryTypes.DELETE,
                                }
                            );
                            await sequelize.query(
                                `insert into  thidua_ltt_082025 
                                    (issue_date, province, amount)
                                    values
                                    (
                                    to_date(:date,'dd-mm-rrrr'),
                                    :province,
                                    :amount
                                        )
                                    `,
                                {
                                    replacements: {
                                        date: info.date,
                                        province: info.province,
                                        amount: info.amount
                                    },
                                    type: sequelize.QueryTypes.INSERT,
                                }
                            );

                            // console.log("check ne", result);

                        } else {

                            await sequelize.query(
                                `insert into  thidua_ltt_082025 
                                        (issue_date, province, amount)
                                        values
                                        (
                                        to_date(:date,'dd-mm-rrrr'),
                                        :province,
                                        :amount
                                            )
                                        `,
                                {
                                    replacements: {
                                        date: info.date,
                                        province: info.province,
                                        amount: info.amount
                                    },
                                    type: sequelize.QueryTypes.INSERT,
                                }
                            );

                        };
                    }
                    res.send({ data: { sussess: true } })
                } catch (error) {
                    throw new Error(`Có lỗi xảy ra:  ${error}`)

                }
            }
        }
    }

    async createManualListCamera(req, res) {

        const result = validationResult(req);
        if (result.isEmpty()) {
            const kpiList = req.body.kpiList;
            if (kpiList && kpiList.length > 0) {
                try {
                    console.log("kpiList", kpiList);
                    for (const object of kpiList) {
                        let info = {
                            amount: object.amount ?? 0,
                            date: object.date,
                            province: object.province

                        }

                        const existingKpi = await sequelize.query(
                            `SELECT * from thidua_camera_082025 WHERE issue_date =  to_date(:date,'dd-mm-rrrr')
                                    and province = :province
                                    `,
                            {
                                replacements: { date: info.date, province: info.province },
                                type: sequelize.QueryTypes.SELECT,
                            }
                        );

                        console.log("existingKpi", existingKpi)
                        if (existingKpi.length > 0) {
                            await sequelize.query(
                                `delete from thidua_camera_082025 
                                            WHERE  issue_date = to_date(:date,'dd-mm-rrrr')
                                        and province = :province
                                            `,
                                {
                                    replacements: {
                                        date: info.date,
                                        province: info.province,
                                    },
                                    type: sequelize.QueryTypes.DELETE,
                                }
                            );
                            await sequelize.query(
                                `insert into  thidua_camera_082025 
                                    (issue_date, province, amount)
                                    values
                                    (
                                    to_date(:date,'dd-mm-rrrr'),
                                    :province,
                                    :amount
                                        )
                                    `,
                                {
                                    replacements: {
                                        date: info.date,
                                        province: info.province,
                                        amount: info.amount
                                    },
                                    type: sequelize.QueryTypes.INSERT,
                                }
                            );

                            // console.log("check ne", result);

                        } else {

                            await sequelize.query(
                                `insert into  thidua_camera_082025 
                                        (issue_date, province, amount)
                                        values
                                        (
                                        to_date(:date,'dd-mm-rrrr'),
                                        :province,
                                        :amount
                                            )
                                        `,
                                {
                                    replacements: {
                                        date: info.date,
                                        province: info.province,
                                        amount: info.amount
                                    },
                                    type: sequelize.QueryTypes.INSERT,
                                }
                            );

                        };
                    }
                    res.send({ data: { sussess: true } })
                } catch (error) {
                    throw new Error(`Có lỗi xảy ra:  ${error}`)

                }
            }
        }
    }

    getDoanhthuLTTDetail(req, res) {
        const date = req.query.date;
        if (date) {
            const query = `select province, issue_date, amount   from thidua_ltt_082025
            where issue_date =  to_date(:date,'dd/mm/rrrr')
            order by  issue_date, province  `;
            sequelize.query(query, {
                replacements: { date: date },
                type: sequelize.QueryTypes.SELECT
            })
                .then(data => {
                    res.json({ data });
                })
                .catch(err => {
                    console.error("Error fetching Thidua  data:", err);
                    res.status(500).json({ error: "Internal Server Error" });
                });
        } else {
            res.status(500).json({ error: "Thiếu thông tin ngày" });
        }

    }

    getDoanhthuCameraDetail(req, res) {
        const date = req.query.date;
        if (date) {
            const query = `select province, issue_date, amount   from thidua_camera_082025
            where issue_date =  to_date(:date,'dd/mm/rrrr')
            order by  issue_date, province  `;
            sequelize.query(query, {
                replacements: { date: date },
                type: sequelize.QueryTypes.SELECT
            })
                .then(data => {
                    res.json({ data });
                })
                .catch(err => {
                    console.error("Error fetching Thidua  data:", err);
                    res.status(500).json({ error: "Internal Server Error" });
                });
        } else {
            res.status(500).json({ error: "Thiếu thông tin ngày" });
        }

    }

    getDoanhthuLTT(req, res) {
        const query = `select province, issue_date, amount   from thidua_ltt_082025
            where issue_date >=  to_date('01/08/2025','dd/mm/rrrr')
            and issue_date <  to_date('01/09/2025','dd/mm/rrrr')
            order by  issue_date, province`;
        sequelize.query(query, {
            replacements: {},
            type: sequelize.QueryTypes.SELECT
        })
            .then(data => {
                res.json({ data });
            })
            .catch(err => {
                console.error("Error fetching Thidua  data:", err);
                res.status(500).json({ error: "Internal Server Error" });
            });
    }

    getDoanhthuCamera(req, res) {
        const query = `select province, issue_date, amount   from thidua_camera_082025
            where issue_date >=  to_date('01/08/2025','dd/mm/rrrr')
            and issue_date <  to_date('01/09/2025','dd/mm/rrrr')
            order by  issue_date, province`;
        sequelize.query(query, {
            replacements: {},
            type: sequelize.QueryTypes.SELECT
        })
            .then(data => {
                res.json({ data });
            })
            .catch(err => {
                console.error("Error fetching Thidua  data:", err);
                res.status(500).json({ error: "Internal Server Error" });
            });
    }
}

module.exports = new DashboardThiduaT08Controller();
