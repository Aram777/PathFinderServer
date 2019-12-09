var express = require('express');
var router = express.Router();
var buildingstouserdetailDataset = require('../models/buildingstouserdetailDB');
var helperFnc = require('../public/javascripts/CalcObjects');


//router.get('/', function (req, res, next) {

//    buildingstouserdetailDataset.getAllmaterials(function (err, rows) {
//        if (err) {
//            res.json(err);
//        } else {
//            res.json(rows.rows);
//        }
//    });

//});

function getAndCreate(xrows, detId) {
    var fErr = "";
    xrows.forEach(function (xrow) {
        var tt = 0;
        helperFnc.createFunc(xrow.formula, xrow.abbreviation, xrow.bdsid, function (xx) {
            buildingstouserdetailDataset.executestr(xx, function (err) {
                if (err) {
                    fErr = err;
                    return fErr;
                    //res.json(err);
                }
                else {
                    buildingstouserdetailDataset.executestr("select calcobjects_" + xrow.bdsid + "(0) as dd;", function (err) {
                        if (err) {
                            fErr = err;
                            return fErr;
                        }
                    });
                }
            });
        });
    });
    buildingstouserdetailDataset.getbuildingFormula(detId, function (berr, brows) {
        if (berr) {
            fErr = err;
            return fErr;
        } else {
            brows.rows.forEach(function (xrow) {
                var tt = 0;
                helperFnc.createBuildFunc(xrow.formula, xrow.abbreviation, xrow.bdsid, function (xx) {
                    buildingstouserdetailDataset.executestr(xx, function (bcerr) {
                        if (bcerr) {
                            fErr = bcerr;
                            return fErr;
                        }
                        else {
                            buildingstouserdetailDataset.executestr("select calcbuild_" + xrow.bdsid + "(0) as dd;", function (kerr) {
                                if (kerr) {
                                    fErr = kerr;
                                    return fErr;
                                }
                            });
                        }
                    });
                });
            });
            // res.json(rows.rows);
        }
    });

    return fErr;
}
router.get('/bdusrclc/:buildingstouserid', function (req, res, next) {
    if (req.params.buildingstouserid) {
        var buid = req.params.buildingstouserid;
       
        buildingstouserdetailDataset.getobjectsFormula(buid, function (err, rows) {
            if (err) {
                res.json(err);
            } else {
                getAndCreate(rows.rows, buid);
                res.json(rows.rows);
            }
        });


    }



});

router.get('/bdusrclcfg/:buildingstouserid', function (req, res, next) {
    if (req.params.buildingstouserid) {
        var buid = req.params.buildingstouserid;
        buildingstouserdetailDataset.getobjectsFormula(req.params.buildingstouserid, function (err, rows) {
            if (err) {
                res.json(err);
            } else {
                rows.rows.forEach(function (xrow) {
                    var tt = 0;
                    helperFnc.createFunc(xrow.formula, xrow.abbreviation, xrow.bdsid, function (xx) {
                        buildingstouserdetailDataset.executestr(xx, function (err) {
                            if (err) {
                                res.json(err);
                            }
                            else {
                                buildingstouserdetailDataset.executestr("select calcobjects_" + xrow.bdsid + "(0) as dd;", function (err) {
                                    if (err) {
                                        res.json(err);
                                    }
                                    //else {
                                    //    res.json(req.body); //or return count for 1 & 0
                                    //}
                                });
                            }
                        });
                    });
                });

                var kl = 10;
                buildingstouserdetailDataset.getbuildingFormula(buid, function (berr, brows) {
                    if (berr) {
                        res.json(berr);
                    } else {
                        brows.rows.forEach(function (xrow) {
                            var tt = 0;
                            helperFnc.createBuildFunc(xrow.formula, xrow.abbreviation, xrow.bdsid, function (xx) {
                                buildingstouserdetailDataset.executestr(xx, function (bcerr) {
                                    if (bcerr) {
                                        res.json(bcerr);
                                    }
                                    else {
                                        buildingstouserdetailDataset.executestr("select calcbuild_" + xrow.bdsid + "(0) as dd;", function (kerr) {
                                            if (kerr) {
                                                res.json(kerr);
                                            }
                                        });
                                    }
                                });
                            });
                        });
                        // res.json(rows.rows);
                    }
                });
                var tt1 = 110;
                res.json(rows.rows);
            }
        });

        //buildingstouserdetailDataset.getbuildingFormula(buid, function (berr, brows) {
        //    if (berr) {
        //        res.json(berr);
        //    } else {
        //        brows.rows.forEach(function (bxrow) {

        //            var tt = 0;
        //            helperFnc.createBuildFunc(bxrow.formula, bxrow.abbreviation, bxrow.bdsid, function (xx) {
        //                buildingstouserdetailDataset.executestr(xx, function (err) {
        //                    if (err) {
        //                        res.json(err);
        //                    }
        //                    else {

        //                        buildingstouserdetailDataset.executestr("select calcbuild_" + xrow.bdsid + "(0) as dd;", function (err) {
        //                            if (err) {
        //                                res.json(err);
        //                            }
        //                            //else {
        //                            //    res.json(req.body); //or return count for 1 & 0
        //                            //}
        //                        });


        //                    }
        //                });


        //            });

        //        });
        //        res.json(rows.brows);
        //    }
        //});


    }



});
router.get('/bdusrclcd/:buildingstouserid', function (req, res, next) {
    if (req.params.buildingstouserid) {
        var buid = req.params.buildingstouserid;
        buildingstouserdetailDataset.getbuildingFormula(buid, function (err, rows) {
            if (err) {
                res.json(err);
            } else {
                rows.rows.forEach(function (xrow) {
                    var tt = 0;
                    helperFnc.createBuildFunc(xrow.formula, xrow.abbreviation, xrow.bdsid, function (xx) {
                        buildingstouserdetailDataset.executestr(xx, function (err) {
                            if (err) {
                                res.json(err);
                            }
                            else {
                                buildingstouserdetailDataset.executestr("select calcbuild_" + xrow.bdsid + "(0) as dd;", function (err) {
                                    if (err) {
                                        res.json(err);
                                    }
                                    //else {
                                    //    res.json(req.body); //or return count for 1 & 0
                                    //}
                                });
                            }
                        });
                    });
                });

                res.json(rows.rows);
            }
        });

        //buildingstouserdetailDataset.getbuildingFormula(buid, function (berr, brows) {
        //    if (berr) {
        //        res.json(berr);
        //    } else {
        //        brows.rows.forEach(function (bxrow) {

        //            var tt = 0;
        //            helperFnc.createBuildFunc(bxrow.formula, bxrow.abbreviation, bxrow.bdsid, function (xx) {
        //                buildingstouserdetailDataset.executestr(xx, function (err) {
        //                    if (err) {
        //                        res.json(err);
        //                    }
        //                    else {

        //                        buildingstouserdetailDataset.executestr("select calcbuild_" + xrow.bdsid + "(0) as dd;", function (err) {
        //                            if (err) {
        //                                res.json(err);
        //                            }
        //                            //else {
        //                            //    res.json(req.body); //or return count for 1 & 0
        //                            //}
        //                        });


        //                    }
        //                });


        //            });

        //        });
        //        res.json(rows.brows);
        //    }
        //});


    }



});












//router.post('/', function (req, res, next) {
//buildingstouserdetailDataset.addbuildingstouser(req.body, function (err, count) {
//    if (err) {
//        res.json(err);
//    } else {
//        res.json(req.body); //or return count for 1 & 0
//    }
//});
//});

//router.delete('/:buildingstouserid', function (req, res, next) {
//    buildingstouserdetailDataset.deletebuildingstouser(req.params.buildingstouserid, function (err, count) {
//        if (err) {
//            res.json(err);
//        } else {
//            res.json(count);
//        }
//    });
//});
//router.put('/:buildingstouserid', function (req, res, next) {
//    //console.log(req.body);
//    buildingstouserdetailDataset.updatebuildingstouser(req.params.buildingstouserid, req.body, function (err, rows) {
//        if (err) {
//            res.json(err);
//        } else {
//            res.json(rows);
//        }
//    });
//});
module.exports = router;