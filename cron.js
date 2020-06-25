var cron = require('node-cron');
var request = require("request");
var cheerio = require("cheerio");
var iconv  = require('iconv-lite');
var mysql  = require('mysql');
var htmlencode = require('htmlencode');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

console.log("app start");

issuegot(1);
issuegot(2);
issuegot(3);
issuegot(4);
issuegot(5);

ssumup(1);
ssumup(2);
ssumup(3);

issuelink();
aagag();

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

            var strContents = Buffer.from(body);

            var $ = cheerio.load(iconv.decode(strContents, "UTF-8").toString());

            const con = mysql.createConnection({
                host: '127.0.0.1',
                user: 'humor',
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

                            request(requestOptionsView, function(error, response, body) {
                                try {

                                    if (error) {
                                        console.log(err);
                                    }
                                    
                                    const conView = mysql.createConnection({
                                        host: '127.0.0.1',
                                        user: 'humor',
                                        password: 'shekq123!',
                                        database: 'humor'
                                    });

                                    var strContentsView = Buffer.from(body);
                                    var $ = cheerio.load(iconv.decode(strContentsView, "UTF-8").toString());

                                    var content_body = $(".xe_content").html();

                                    if(content_body != null) {
                                        if(content_body.length < 4000) {
                                            content_body = escape(content_body);

                                            conView.query('CALL cronAddContent('+site_id+', '+content_no+', "'+content_url+'", "'+content_subject+'", "'+content_body+'")', (err, rows) => {

                                                if(err) throw err;
                                                console.log('insert complete - site_id : '+site_id+' , content_no : '+content_no);
                                            });
                                        }
                                    }

                                    conView.end();
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

function ssumup(page) {
    console.log('ssumup 작업 실행');

    var url = "https://ssumup.com/api/posts?filter=cl&filter=pp&filter=oh&filter=hu&filter=dz&filter=sl&filter=ml&filter=fm&filter=rw&filter=iv&filter=bd&filter=iz&filter=dq&filter=dc&filter=ck&filter=bz&filter=pk&&sort=count&datetime=3&page="+page;
    var cookie = "";
  
    var requestOptions  = {
        method: "GET",
        uri: url,
        headers: {
            "User-Agent": user_agent_pc,
            "Cookie": cookie,
        },
        encoding: null,
        timeout:5000,
    };

    

    // URL 호출부
    request(requestOptions, function(error, response, body) {
        try {

            if (error) {
                console.log(error);
            }

            var strContents = Buffer.from(body);

            var $ = cheerio.load(iconv.decode(strContents, "UTF-8").toString());

            const con = mysql.createConnection({
                host: '127.0.0.1',
                user: 'humor',
                password: 'shekq123!',
                database: 'humor'
            });

            var result = [];
            var list = [];

            var all_text = $.text();
            var json_data = JSON.parse(all_text);

            json_data = json_data.data.posts;

            //console.log(json_data);

            json_data.forEach(async function(key, index) {

                var site = key.site;
                var sitename = "";
                
                switch(site) {
                case "pk" : 
                    sitename = "파코즈"
                    break;
                case "bz" : 
                    sitename = "베스티즈"
                    break;
                case "ck" : 
                    sitename = "82쿡"
                    break;
                case "dc" : 
                    sitename = "디씨"
                    break;
                case "dq" : 
                    sitename = "더쿠"
                    break;
                case "iz" : 
                    sitename = "인스티즈"
                    break;
                case "bd" : 
                    sitename = "보배드림"
                    break;
                case "iv" : 
                    sitename = "인벤"
                    break;
                case "rw" : 
                    sitename = "루리웹"
                    break;
                case "fm" : 
                    sitename = "에펨코리아"
                    break;
                case "ml" : 
                    sitename = "MLB파크"
                    break;
                case "sl" : 
                    sitename = "SLR클럽"
                    break;
                case "dz" : 
                    sitename = "딴지일보"
                    break;
                case "hu" : 
                    sitename = "웃긴대학"
                    break;
                case "oh" : 
                    sitename = "오유"
                    break;
                case "pp" : 
                    sitename = "뽐뿌"
                    break;
                case "cl" : 
                    sitename = "클리앙"
                    break;
                }

                var title = "[" + sitename + "] " + key.title;
                var id = key.id;
                var link = key.url;

                var regdate = key.createdAt;
                regdate = regdate.replace("T", " ").replace(".000Z", "");
                var viewcnt = key.hit;
                var commentcnt = key.reply;

                
                if(link != null) {
                    link = link.replace("http://www.bobaedream.co.kr/view?code=strange&No=", "https://m.bobaedream.co.kr/board/bbs_view/strange/");
                    link = link.replace("&bm=1", "");
                    link = link.replace("http://m.ruliweb.com", "https://m.ruliweb.com");
                    link = link.replace("http://theqoo.net", "https://theqoo.net");
                }

                var site_id = 6;
                var content_no = id;
                var content_url = link;
                var content_subject = title;
                content_subject = content_subject.replaceAll('"', '""');

                if(content_no != null && content_url != null && content_subject != null) {
                    let row = await con.query('CALL cronCheckContent('+site_id+', '+content_no+')', (err, rows) => {
        
                        if(err) throw err;

                        var exists_result = rows[0][0].result;

                        if(exists_result == '1') {

                            const conView = mysql.createConnection({
                                host: '127.0.0.1',
                                user: 'humor',
                                password: 'shekq123!',
                                database: 'humor'
                            });

                            conView.query('CALL cronAddContent('+site_id+', '+content_no+', "'+content_url+'", "'+content_subject+'", " ")', (err, rows) => {
                                if(err) throw err;
                                console.log('insert complete - site_id : '+site_id+' , content_no : '+content_no);
                            });
                            conView.end();
                        }
                    });
                }



            });

            // for(key in json_data) {
            
            // }
            
            
            con.end();
            
        } catch(err) {
            console.log(err);
        }
    });
}

function issuelink() {
    console.log('issuelink 작업 실행');

    var url = "https://www.issuelink.co.kr/community/listview/all/3/adj/_self/blank/blank/blank/";
    var cookie = "";
  
    var requestOptions  = {
        method: "GET",
        uri: url,
        headers: {
            "User-Agent": user_agent_pc,
            "Cookie": cookie,
        },
        encoding: null,
        timeout:5000,
    };

    

    // URL 호출부
    request(requestOptions, function(error, response, body) {
        try {

            if (error) {
                console.log(error);
            }

            var strContents = Buffer.from(body);

            var $ = cheerio.load(iconv.decode(strContents, "UTF-8").toString());

            const con = mysql.createConnection({
                host: '127.0.0.1',
                user: 'humor',
                password: 'shekq123!',
                database: 'humor'
            });

            
            $(".ibox-content").find("tr").each(async function(index) {
                var site_id = 7;
                var content_no = index;
                
                var content_url = $(this).find(".first_title").find(".title").find("a").attr("href");
                var head = $(this).find(".rank_bg").find("small").text().trim();
                var content_subject = "[" + head + "] " + $(this).find(".first_title").find(".title").find("a").text().trim();

                var commentcnt = $(this).find(".first_title").find(".title").find("a").find("small").text().trim();
                content_subject = content_subject.replace(commentcnt, "").trim();
                content_subject = content_subject.replaceAll('"', '""');
                commentcnt = commentcnt.replace("[", "").replace("]", "");

                if(content_url != undefined) {
                    
                    var yyyy = new Date().getYear().toString();
                    var mm = new Date().getMonth().toString();
                    var dd = new Date().getDate().toString();
                    var hh = new Date().getHours().toString();
 
                    content_no = yyyy + mm + dd + hh + content_no;
    
                    var username = $(this).find(".second_etc").find(".nick").text().trim();
                    var viewcnt = $(this).find(".second_etc").find(".hit").text().trim().replace(",", "");
                    //var regdate = $(this).find(".second_date").find("span").eq(0).text().trim();
    
                    if(content_no != '' && content_no.length <= 10 && username.length <= 20) {
                        let row = await con.query('CALL cronCheckContent('+site_id+', '+content_no+')', (err, rows) => {
        
                            if(err) throw err;
    
                            var exists_result = rows[0][0].result;
    
                            if(exists_result == '1') {
    
                                const conView = mysql.createConnection({
                                    host: '127.0.0.1',
                                    user: 'humor',
                                    password: 'shekq123!',
                                    database: 'humor'
                                });
    
                                conView.query('CALL cronAddContent2('+site_id+', '+content_no+', "'+content_url+'", "'+content_subject+'", " ", "노답", '+viewcnt+', '+commentcnt+')', (err, rows) => {
                                    if(err) throw err;
                                    console.log('insert complete - site_id : '+site_id+' , content_no : '+content_no);
                                });
                                conView.end();
                            }
                        });
                    }
                }

                
            });
            
            
            con.end();
            
        } catch(err) {
            console.log(err);
        }
    });
}

function aagag() {
    console.log('aagag 작업 실행');

    var url = "https://aagag.com/mirror/";
    var cookie = "";
  
    var requestOptions  = {
        method: "GET",
        uri: url,
        headers: {
            "User-Agent": user_agent_pc,
            "Cookie": cookie,
        },
        encoding: null,
        timeout:5000,
    };

    // URL 호출부
    request(requestOptions, function(error, response, body) {
        try {

            if (error) {
                console.log(error);
            }

            var strContents = Buffer.from(body);

            var $ = cheerio.load(iconv.decode(strContents, "UTF-8").toString());

            const con = mysql.createConnection({
                host: '127.0.0.1',
                user: 'humor',
                password: 'shekq123!',
                database: 'humor'
            });

            $("#mList .article").each(async function(index) {

                var head = $(this).find(".rank").attr("class").replace("rank bc_", "");
            
                switch(head) {
                  case "clien":
                    head = "클리앙"
                    break;
                  case "ou":
                    head = "오유"
                    break;
                  case "slrclub":
                    head = "SLR"
                    break;
                  case "ppomppu":
                    head = "뽐뿌"
                    break;
                  case "82cook":
                    head = "82쿡"
                    break;
                  case "mlbpark":
                    head = "엠팍"
                    break;
                  case "bobae":
                    head = "보배"
                    break;
                  case "inven":
                    head = "인벤"
                    break;
                  case "ruli":
                    head = "루리"
                    break;
                  case "humor":
                    head = "웃대"
                    break;
                  case "ddanzi":
                    head = "딴지"
                    break;
                  case "fmkorea":
                    head = "펨코"
                    break;
                  default:
                    head = "유머"
                }

                var site_id = 8;
                
                var content_url = $(this).attr("href");
                content_url = "https://aagag.com" + content_url;

                var content_subject = "[" + head + "] " + $(this).find(".title").text().trim();
                content_subject = content_subject.replaceAll('"', '""');
                

                var notice = $(this).find(".list-symph").text().trim();
            
                var username = $(this).find(".nick").text().trim();
                var regdate = $(this).find(".date").text().trim();
                var viewcnt = $(this).find(".hit").text().trim();
                var commentcnt = $(this).find(".cmt").text().trim();
                
                content_subject = content_subject.replace(commentcnt, "");
                commentcnt = commentcnt.replace("(", "").replace(")", "");

                

                if(content_subject != '' && notice != "공지") {
                    
                    var yyyy = new Date().getYear().toString();
                    var mm = new Date().getMonth().toString();
                    var dd = new Date().getDate().toString();
                    var hh = new Date().getHours().toString();
 
                    var content_no = yyyy + mm + dd + hh + index;


                    if(content_no != '' && content_no.length <= 10 && username.length <= 20) {

                        

                        let row = await con.query('CALL cronCheckContent('+site_id+', '+content_no+')', (err, rows) => {
        
                            if(err) throw err;
    
                            var exists_result = rows[0][0].result;
    
                            if(exists_result == '1') {
    
                                const conView = mysql.createConnection({
                                    host: '127.0.0.1',
                                    user: 'humor',
                                    password: 'shekq123!',
                                    database: 'humor'
                                });
    
                                conView.query('CALL cronAddContent2('+site_id+', '+content_no+', "'+content_url+'", "'+content_subject+'", " ", "노답", '+viewcnt+', '+commentcnt+')', (err, rows) => {
                                    if(err) throw err;
                                    console.log('insert complete - site_id : '+site_id+' , content_no : '+content_no);
                                });
                                conView.end();
                            }
                        });
                    }
    
                    
                }
            });
            
            
            con.end();
            
        } catch(err) {
            console.log(err);
        }
    });
}