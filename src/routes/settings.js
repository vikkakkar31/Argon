let express = require("express");
let router = express.Router();
let api = require("../libs/settings/api");
let settingsDb = require("../libs/settings/schema");
let validations = require("./validations");

router.post("/addSettings", 
    function (req, res, next) {
        try {
            var data = req.body;
            if (data && Object.keys(data).length) {
                api.findOne(
                    { s_id: data.s_id },
                    {},
                    {},
                    function (err, settings) {
                        if (err) {
                            res.status(500).send({
                            error: err,
                            });
                        } else {
                            if(settings) { // update settings if exist
                                api.update(
                                    {s_id: data.s_id },
                                    data,
                                    {},
                                    function (err, response) {
                                    if (err) {
                                        res.status(500).send({
                                        error: err,
                                        });
                                    } else {
                                        response = JSON.parse(JSON.stringify(response));
                                        res.status(200).send(response);
                                    }
                                    }
                                );
                            }else{ //add settings if not exist
                                api.add(data, function (err, response) {
                                    if (err) {
                                        res.status(500).send({ error: err });
                                    } else {
                                        res.status(200).send(response);
                                    }
                                });
                            }
                        }
                    }
                );
            } else {
                res.status(422).send({
                    message: "Required fields are missing.",
                });
            }
        } catch (err) {
            console.log(err.stack);
            res.status(500).send({ error: err });
        }
});

router.get(
    "/getSettings",
    function (req, res, next) {
        try {
            var queryString = req.query;
            let query;
            query = {
                s_id: (queryString.s_id) ? queryString.s_id : 0,
            };
            api.findAll(
                query,
                {},
                {},
                function (err, response) {
                    if (err) {
                        res.status(500).send({
                            error: err,
                        });
                    } else {
                        res.status(200).send(response);
                    }
                }
            );
          
        } catch (err) {
            console.log(err.stack);
            res.status(500).send(err);
        }
    }
);


module.exports = router;