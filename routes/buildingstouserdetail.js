var express = require('express');
var router = express.Router();
var buildingstouserdetailDataset = require('../models/buildingstouserdetailDB');
var helperFnc = require('../public/javascripts/CalcObjects');
const pg = require('pg');

const config = {
    host: 'azureservergroup3.postgres.database.azure.com',
    // Do not hard code your username and password.
    // Consider using Node environment variables.
    user: 'myadmin@azureservergroup3',
    password: '12Asdfgh',
    database: 'pathfinder',
    port: 5432,
    ssl: true
};

const client = new pg.Client(config);



//router.get('/', function (req, res, next) {

//    buildingstouserdetailDataset.getAllmaterials(function (err, rows) {
//        if (err) {
//            res.json(err);
//        } else {
//            res.json(rows.rows);
//        }
//    });

//});
function createBuildFunc(mainFormula, mainobj, bdsid) {
    var FormulaStr = mainFormula;
    var hFormula = "";
    var chatpos = "";
    var fFacts = "";
    var tmpFact = "";
    var mainFact = mainobj;
    var FuncStr = "CREATE OR REPLACE FUNCTION public.calcbuild_" + bdsid + "( " +
        "    detailid1 integer) " +
        "RETURNS INTEGER " +
        "LANGUAGE 'plpgsql' " +
        "COST 100 " +
        "VOLATILE " +
        "AS $BODY$ " +
        "DECLARE \n";
    FuncStr = FuncStr + "retval INTEGER:=0;\n";
    FuncStr = FuncStr + "detailid INTEGER:=" + bdsid + ";\n";
    //FuncStr = FuncStr + "K000 NUMERIC = getobjectvalue(detailid, 'K000');\n ";
    for (var i = 0; i < FormulaStr.length; i++) {
        chatpos = FormulaStr.charAt(i);
        if (chatpos == "@") {
            tmpFact = FormulaStr.substring(i, i + 5);
            if (fFacts.indexOf(tmpFact) < 0) {
                if (tmpFact.substring(1, 2) == "B") {
                    fFacts = fFacts + tmpFact.substring(1, 5) + " NUMERIC :=0; \n";
                }
                else if (tmpFact.substring(1, 2) == "T") {
                    fFacts = fFacts + tmpFact.substring(1, 5) + " NUMERIC =coalesce(getobjectvalue(detailid, " + "'" + tmpFact + "'" + "),0); \n";
                    fFacts = fFacts + 'K' + tmpFact.substring(2, 5) + " NUMERIC =coalesce(getobjectvalue(detailid, " + "'K" + tmpFact.substring(2, 5) + "'" + "),0); \n";
                }
                else {
                    fFacts = fFacts + tmpFact.substring(1, 5) + " NUMERIC =coalesce(getobjectvalue(detailid, " + "'" + tmpFact + "'" + "),0); \n";

                }
            }

        }
    }
    FuncStr = FuncStr + fFacts + "\n";
    FuncStr = FuncStr + "BEGIN\n";
    FuncStr = FuncStr + FormulaStr + "\n";
    FuncStr = FuncStr + "UPDATE buildingstouser SET  presentvalue=" + mainFact + " WHERE buildingstouserid=detailid;\n";
    FuncStr = FuncStr + mainFact + "=0;\n";
    hFormula = FormulaStr.replace(/@T/g, '@K');
    FuncStr = FuncStr + hFormula + "\n";
    FuncStr = FuncStr + "UPDATE buildingstouser SET  newvalue=" + mainFact + " WHERE buildingstouserid=detailid;\n";
    FuncStr = FuncStr + "RETURN retval;\n";
    FuncStr = FuncStr + "END; $BODY$;\n";
    //alert(FuncStr);
    FuncStr = FuncStr.replace(/@/g, '');

    return FuncStr;
}

function createFunc(mainFormula, mainobj, bdsid, callback) {
    var FormulaStr = mainFormula;
    var hFormula = "";
    var chatpos = "";
    var fFacts = "";
    var tmpFact = "";
    var mainFact = mainobj;
    var FuncStr = "CREATE OR REPLACE FUNCTION public.calcobjects_" + bdsid + "( " +
        "    detailid1 integer) " +
        "RETURNS INTEGER " +
        "LANGUAGE 'plpgsql' " +
        "COST 100 " +
        "VOLATILE " +
        "AS $BODY$ " +
        "DECLARE \n";
    FuncStr = FuncStr + "retval INTEGER:=0;\n";
    FuncStr = FuncStr + "detailid INTEGER:=" + bdsid + ";\n";
    FuncStr = FuncStr + "H000 NUMERIC = getobjectvalue(detailid, 'H000');\n ";
    //var FormulaStr = "IF @B000 > 50 THEN \n" +
    //    "    @T001 = @A001 * @N001 * @M000*@M000;\n" +
    //    "Else\n" +
    //    "    @T001 = @A001 * @N001 * @M000 * 2;\n" +
    //    "END IF;\n";
    //alert(FormulaStr.length);
    for (var i = 0; i < FormulaStr.length; i++) {
        chatpos = FormulaStr.charAt(i);
        if (chatpos == "@") {
            tmpFact = FormulaStr.substring(i, i + 5);
            if (fFacts.indexOf(tmpFact) < 0) {
                if (tmpFact.substring(1, 2) == "T") {
                    fFacts = fFacts + tmpFact.substring(1, 5) + " NUMERIC :=0; \n";
                }
                else {
                    fFacts = fFacts + tmpFact.substring(1, 5) + " NUMERIC =coalesce(getobjectvalue(detailid, " + "'" + tmpFact + "'" + "),0); \n";

                }
            }

        }
    }
    FuncStr = FuncStr + fFacts + "\n";
    FuncStr = FuncStr + "BEGIN\n";
    FuncStr = FuncStr + FormulaStr + "\n";
    FuncStr = FuncStr + "UPDATE buildingstouserdetail SET  presentvalue=" + mainFact + " WHERE buildingstouserdetailid=detailid;\n";
    FuncStr = FuncStr + mainFact + "=0;\n";
    hFormula = FormulaStr.replace(/@M000/g, '@H000');
    FuncStr = FuncStr + hFormula + "\n";
    FuncStr = FuncStr + "UPDATE buildingstouserdetail SET  newvalue=" + mainFact + " WHERE buildingstouserdetailid=detailid;\n";
    FuncStr = FuncStr + "RETURN retval;\n";
    FuncStr = FuncStr + "END; $BODY$;\n";
    //alert(FuncStr);
    FuncStr = FuncStr.replace(/@/g, '');

    return FuncStr;
}

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
router.get('/bdusrclcnew/:buildingstouserid', function (req, res, next) {
    var ttt = "";
    if (req.params.buildingstouserid) {
        var buid = req.params.buildingstouserid;
        var queryString = 'Select obj.abbreviation, obj.formula, bdts.buildingstouserdetailid as bdsid ,bdts.presentvalue, bdts.newvalue ' +
            ' from buildingstouserdetail bdts inner join objects obj ' +
            'on obj.objectsid = bdts.objectsid ' +
            'where bdts.buildingstouserid = ' + buid + '  order by bdts.buildingstouserdetailid;';
        client.connect();
        rows = client.query(queryString, function (err, rows) {
            rows.rows.forEach(function (xrow) {
                var xFr = createFunc(xrow.formula, xrow.abbreviation, xrow.bdsid);
                client.query(xFr, function (err) {
                    if (err) {
                        res.json(err);
                    }
                    else {
                        client.query("select calcobjects_" + xrow.bdsid + "(0) as dd;", function (err) {
                            if (err) {
                                res.json(err);
                            }
                        });

                    }

                });

            });

        });
        queryString = 'select bds.buildingstouserid as bdsid, btp.abbreviation, btp.formula from buildingstouser bds  ' +
            ' inner join buildingtype btp on btp.buildingtypeid = bds.buildingtypeid ' +
            'where bds.buildingstouserid = ' + buid + ';';

        brows = client.query(queryString, function (err, rows) {
            ttt = queryString;
            rows.rows.forEach(function (xrow) {

                var xFr = createBuildFunc(xrow.formula, xrow.abbreviation, xrow.bdsid);

                client.query(xFr, function (err) {
                    if (err) {
                        res.json(err);
                    }
                    else {
                        client.query("select calcbuild_" + xrow.bdsid + "(0) as dd;", function (err) {
                            if (err) {
                                res.json(err);
                            }
                        });

                    }
                });

            });

        });



        res.json(rows.rows);
    }
    else {

    res.json("dd");
    }

    //buildingstouserdetailDataset.getobjectsFormula(buid, function (err, rows) {
    //    if (err) {
    //        res.json(err);
    //    } else {
    //        getAndCreate(rows.rows, buid);
    //        res.json(rows.rows);
    //    }
    //});


});
router.get('/gtdet/:buildingstouserid', function (req, res, next) {
    console.log(req);
    if (req.params.buildingstouserid) {
        buildingstouserdetailDataset.getbuildingstouserdetailByMasterid(req.params.buildingstouserid, function (err, rows) {
            if (err) {
                res.json(err);
            } else {
                res.json(rows.rows);
            }
        });

    }
});
router.delete('/:buildingstouserdetailid', function (req, res, next) {
    buildingstouserdetailDataset.deletebuildingstouserdetail(req.params.buildingstouserdetailid, function (err, count) {
        if (err) {
            res.json(err);
        } else {
            res.json(count);
        }
    });
});

router.post('/', function (req, res, next) {
    buildingstouserdetailDataset.addbuildingstouserdetail(req.body, function (err, count) {
        if (err) {
            res.json(err);
        } else {
            res.json(req.body); //or return count for 1 & 0
        }
    });
});


router.put('/:buildingstouserdetailid', function (req, res, next) {
    //console.log(req.body);
    buildingstouserdetailDataset.updatebuildingstouserdetail(req.params.buildingstouserdetailid, req.body, function (err, rows) {
        if (err) {
            res.json(err);
        } else {
            res.json(rows);
        }
    });
});



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













module.exports = router;