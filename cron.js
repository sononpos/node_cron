var cron = require('node-cron');
var request = require("request");
var cheerio = require("cheerio");
var iconv  = require('iconv-lite');
var mysql  = require('mysql');
var htmlencode = require('htmlencode');


cron.schedule('*/120 * * * *', function() {
    issuegot(1);
    issuegot(2);
    issuegot(3);
});

//cron.schedule('*/1 * * * * *', etoland);
//issuegot();
//etoland();

var user_agent_pc = "Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36";
var user_agent_m = "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Mobile Safari/537.36";

String.prototype.replaceAll = function(org, dest) {
    return this.split(org).join(dest);
}

function getParameterByName(name, url) {
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
    results = regex.exec(url);

    if (!results) return null;
    if (!results[2]) return '';

    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function issuegot(page) {
    console.log('issuegot 작업 실행');

    var url = "http://issuegot.co.kr/index.php?mid=issue&page="+page;
    var cookie = "";
  
    var requestOptions  = {
        method: "GET",
        uri: url,
        headers: {
            "User-Agent": user_agent_m,
            "Cookie": cookie,
        },
        encoding: null,
        timeout:5000,
    };

    // URL 호출부
    request(requestOptions, function(error, response, body) {
        try {

            if (error) {
                console.log(err);
            }

            var strContents = new Buffer(body);

            var $ = cheerio.load(iconv.decode(strContents, "UTF-8").toString());

            const con = mysql.createConnection({
                host: '54.180.197.184',
                user: 'sono',
                password: 'shekq123!',
                database: 'humor'
            });
            
            $(".bd_lst_wrp .bd_lst tr").each(async function() {
                var site_id = 5;
                var content_no = $(this).find("td.no").text().trim();
                var content_url = "http://issuegot.co.kr" + $(this).find("td.title").find("a").attr("href");
                var content_subject = $(this).find("td.title").text().trim();
                content_subject = content_subject.replaceAll('"', '""');

                if(content_no != '') {
                    let row = await con.query('CALL cronCheckContent('+site_id+', '+content_no+')', (err, rows) => {
    
                        if(err) throw err;

                        var exists_result = rows[0][0].result;

                        if(exists_result == '1') {

                            var requestOptionsView  = {
                                method: "GET",
                                uri: content_url,
                                headers: {
                                    "User-Agent": user_agent_m,
                                    "Cookie": cookie,
                                },
                                encoding: null,
                                timeout:5000,
                            };

                            request(requestOptionsView, async function(error, response, body) {
                                try {

                                    if (error) {
                                        console.log(err);
                                    }
                                    
                                    const conView = mysql.createConnection({
                                        host: '54.180.197.184',
                                        user: 'sono',
                                        password: 'shekq123!',
                                        database: 'humor'
                                    });

                                    var strContentsView = new Buffer(body);
                                    var $ = cheerio.load(iconv.decode(strContentsView, "UTF-8").toString());

                                    var content_body = $(".xe_content").html();

                                    if(content_body != null) {
                                        if(content_body.length < 4000) {
                                            content_body = escape(content_body);

                                            let rowView = await conView.query('CALL cronAddContent('+site_id+', '+content_no+', "'+content_url+'", "'+content_subject+'", "'+content_body+'")', (err, rows) => {

                                                if(err) throw err;
                                                console.log('insert complete - site_id : '+site_id+' , content_no : '+content_no);

                                            });
                                        }
                                    }
                                } catch(err) {
                                    console.log(err);
                                }
                            });
                        }
                    });
                }
            });

            con.end();
            
        } catch(err) {
            console.log(err);
        }
    });
}

// function etoland() {
//     console.log('etoland 작업 실행');

//     var url = "http://www.etoland.co.kr/plugin/mobile/board.php?bo_table=etohumor02";
//     var cookie = "";
  
//     var requestOptions  = {
//         method: "GET",
//         uri: url,
//         headers: {
//             "User-Agent": user_agent_m,
//             "Cookie": cookie,
//         },
//         encoding: null,
//         timeout:5000,
//     };

//     // URL 호출부
//     request(requestOptions, function(error, response, body) {
//         try {

//             if (error) {
//                 console.log(err);
//             }

//             var strContents = new Buffer(body);

//             var $ = cheerio.load(iconv.decode(strContents, "EUC-KR").toString());

//             const con = mysql.createConnection({
//                 host: '54.180.197.184',
//                 user: 'sono',
//                 password: 'shekq123!',
//                 database: 'humor'
//             });
            
//             $(".board_list .subject").each(async function() {
//                 var site_id = 6;

//                 var link = $(this).find("a").attr("href") + "";
//                 var content_no = getParameterByName("wr_id", link);
//                 var content_url = "http://www.etoland.co.kr/plugin/mobile/board.php?bo_table=etohumor02&wr_id="+content_no+"&sca=";

//                 var content_subject = $(this).find("div").eq(0).text();
//                 var comment_str = $(this).find(".comment").text();
                
//                 content_subject = content_subject.replace('"', '""');
//                 content_subject = content_subject.replace(comment_str, "");

//                 if(content_no != '') {
                    
//                     let row = await con.query('CALL cronCheckContent('+site_id+', '+content_no+')', (err, rows) => {
    
//                         if(err) throw err;

//                         var exists_result = rows[0][0].result;

//                         if(exists_result == '1') {

//                             var requestOptionsView  = {
//                                 method: "GET",
//                                 uri: content_url,
//                                 headers: {
//                                     "User-Agent": user_agent_m,
//                                     "Cookie": cookie,
//                                 },
//                                 encoding: null,
//                                 timeout:5000,
//                             };

//                             request(requestOptionsView, async function(error, response, body) {
//                                 try {

//                                     if (error) {
//                                         console.log(err);
//                                     }
                                    
//                                     const conView = mysql.createConnection({
//                                         host: '54.180.197.184',
//                                         user: 'sono',
//                                         password: 'shekq123!',
//                                         database: 'humor'
//                                     });

//                                     var strContentsView = new Buffer(body);
//                                     var $ = cheerio.load(iconv.decode(strContentsView, "EUC-KR").toString());

//                                     var content_body = $(".write_content").html();

                                    
//                                     content_body = content_body.replaceAll("/data/", "http://www.etoland.co.kr/data/"); 
//                                     content_body = content_body.replaceAll("../../", ""); 
//                                     content_body = content_body.replaceAll("../..", ""); 
                                    

//                                     if(content_body != null) {

//                                         console.log(content_body.length);

//                                         if(content_body.length < 6000) {
//                                             // console.log(content_no);
                                            
//                                             content_body = escape(content_body);

//                                             let rowView = await conView.query('CALL cronAddContent('+site_id+', '+content_no+', "'+content_url+'", "'+content_subject+'", "'+content_body+'")', (err, rows) => {
                                                
//                                                 console.log(content_no);
//                                                 console.log(content_url);
//                                                 console.log(content_subject);

//                                                 if(err) throw err;
//                                                 console.log('insert complete - site_id : '+site_id+' , content_no : '+content_no);
//                                             });
//                                         }
//                                     }
//                                 } catch(err) {
//                                     console.log(err);
//                                 }
//                             });
//                         }
//                     });
//                 }
//             });

//             con.end();
            
//         } catch(err) {
//             console.log(err);
//         }
//     });
    
// }

