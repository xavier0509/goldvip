// document.write("<script language=javascript src='js/md5.js' charset=\"utf-8\"></script>");
var loginstatus = null;
var userInfo = null;
var deviceInfo = null; 
var showval = null;
var accesstoken = null;
var mobile = null;
var openId = null;
var nick_name = null;
var flag = 1;
var time1 = null;//活动开始时间戳
var time2 = null;//活动页面退出时间戳
var time = null;
var vipFlag = 0;   //黄金vip页二维码失败时刷新会重载，此标志位保证刷新情况只提交一次日志
var buttonFlag = 0;//活动首页上点击button的情况需要得到后台数据返回，避免数据等待过程中多次按button时提交多条日志
var TVmodel = null;//电视型号
var loadStatus = 1;//未登录为0，登录为1，前往登录界面为2.解除在登录界面按返回退掉bug
var changeStatus = 0;//判断登录的状态是否是未进活动之前就已经登录（0为本身登录，1为进活动之后再登录）
var app = {

    canonical_uri:function(src, base_path) 
    {
        var root_page = /^[^?#]*\//.exec(location.href)[0],
        root_domain = /^\w+\:\/\/\/?[^\/]+/.exec(root_page)[0],
        absolute_regex = /^\w+\:\/\//;
        // is `src` is protocol-relative (begins with // or ///), prepend protocol  
        if (/^\/\/\/?/.test(src)) 
        {  
            src = location.protocol + src; 
        }  
    // is `src` page-relative? (not an absolute URL, and not a domain-relative path, beginning with /)  
    else if (!absolute_regex.test(src) && src.charAt(0) != "/")  
    {  
            // prepend `base_path`, if any  
            src = (base_path || "") + src; 
        }
    // make sure to return `src` as absolute  
    return absolute_regex.test(src) ? src : ((src.charAt(0) == "/" ? root_domain : root_page) + src);  
    },

    rel_html_imgpath:function(iconurl)
    {
        console.log(app.canonical_uri(iconurl.replace(/.*\/([^\/]+\/[^\/]+)$/, '$1')));
        return app.canonical_uri(iconurl.replace(/.*\/([^\/]+\/[^\/]+)$/, '$1'));
    },

    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },

    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        document.addEventListener("backbutton", this.handleBackButton, false);
        document.addEventListener("pause",this.handleHomeButton,false);
    },

    handleHomeButton: function(){
        console.log("Home Button Pressed!");
        var successdiv = document.getElementById("getsuccessDiv");
        var nochanceDiv = document.getElementById("nochanceDiv");
        var makesureDiv = document.getElementById('makesureDiv');
        var goldvip = document.getElementById("goldvip");
        if (loadStatus!=2 && loadStatus != 3) {
            if (successdiv.style.display == "block" || nochanceDiv.style.display == "block") {
                _czc.push(['_trackEvent', TVmodel,'领取结果页','按主页键', '','getimmediateDiv']);
            }
            //首页点击返回----1.活动首页，返回        
            else if(goldvip.style.display == "block"){
                _czc.push(['_trackEvent', TVmodel, '黄金VIP页', '按主页键','','getimmediateDiv']);
            }
            else if(makesureDiv.style.display == "block"){
                _czc.push(['_trackEvent', TVmodel, '确认领取页', '按主页键','','getimmediateDiv']);
            }
            else{
                _czc.push(['_trackEvent', TVmodel, '活动首页', '按主页键','','getimmediateDiv']);
            }

        };
    },

    handleBackButton: function() {
        console.log("Back Button Pressed!");
        var successdiv = document.getElementById("getsuccessDiv");
        var makesureDiv = document.getElementById('makesureDiv');
        var nochanceDiv = document.getElementById("nochanceDiv");
        var goldvip = document.getElementById("goldvip");
        if (successdiv.style.display == "block") {
            _czc.push(['_trackEvent', TVmodel,'领取结果页','返回', '','']);
            successdiv.style.display = "none";
            showgoldvip();
        }
        else if (nochanceDiv.style.display == "block") {
             _czc.push(['_trackEvent', TVmodel,'领取结果页','返回', '','']);
             experience();
        }
        //首页点击返回----1.活动首页，返回        
        else if(goldvip.style.display == "block"){
            _czc.push(['_trackEvent', TVmodel, '黄金VIP页', '返回','','']);
           experience();
        }
        else if(makesureDiv.style.display == "block" && buttonFlag != 2){
            _czc.push(['_trackEvent', TVmodel, '确认领取页', '返回','','']);
           makesureDiv.style.display="none";
           document.getElementById('loading').style.display="none";
           document.getElementById('buttonImg').src=app.rel_html_imgpath(__uri("../images/5-3.png"));
           document.getElementById("getimmediateDiv").style.display="block";
           document.getElementById("getimmediateDiv").focus();
        }
        else if(loadStatus == 2){
            loadStatus =0;

        }
        else{
            _czc.push(['_trackEvent', TVmodel, '活动首页', '返回','','']);
            experience();

        }
    },
    onDeviceReady: function() {       
        app.receivedEvent('deviceready');
        coocaaosapi.getDeviceInfo(function(message) {
                deviceInfo = message;                
                console.log(JSON.stringify(deviceInfo));
                TVmodel = deviceInfo.model;
                time1 = new Date().getTime();
                _czc.push(['_trackEvent', TVmodel, '活动首页', '弹出','','getimmediateDiv']);
                coocaaosapi.hasCoocaaUserLogin(function(message) {
                    console.log("haslogin " + message.haslogin);
                    loginstatus = message.haslogin;
                    console.log("haslogin " + loginstatus);
                    if (loginstatus == "false") {
                        loadStatus = 0;
                        _czc.push(['_trackEvent', TVmodel, '登录情况', '未登录','','getimmediateDiv']);
                        document.getElementById('buttonImg').src=app.rel_html_imgpath(__uri("../images/5.png"));
                    }
                    else{    
                        _czc.push(['_trackEvent', TVmodel, '登录情况', '已登录','','getimmediateDiv']);
                        document.getElementById('buttonImg').src=app.rel_html_imgpath(__uri("../images/5-3.png"));
                        }
                    },function(error) { console.log(error);});      
                },function(error) { console.log(error);});
          
        app.triggleButton();

    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        // var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelectorAll('.received');

        // listeningElement.setAttribute('style', 'display:none;');
        for( var i = 0 , j = receivedElement.length ; i < j ; i++ ){
            receivedElement[i].setAttribute('style', 'display:block;');
        }
        /*receivedElement.setAttribute('style', 'display:block;');*/
        document.getElementById('getimmediateDiv').focus();
        console.log('Received Event: ' + id);
    },
    triggleButton:function(){
        cordova.require("coocaa-plugin-coocaaosapi.coocaaosapi");
        
        document.getElementById("getimmediateDiv").addEventListener("click",experienceonclick ,false);
    }
};

    app.initialize();

function experience(){
    loadStatus = 3;
    time2 = new Date().getTime();
    time = (time2 - time1)/1000;
    if(time <=0 || time >300){}
    else{_czc.push(['_trackEvent', TVmodel, '页面停留时长（秒）','',time,'getimmediateDiv']);}
    navigator.app.exitApp();
}

function experienceonclick(){
    if (buttonFlag != 1) {
            _czc.push(['_trackEvent', TVmodel, '活动首页', '(总共)立即领取点击次数','','getimmediateDiv']);
        };  
    console.log("status"+loginstatus);
    if(loginstatus=="false"){//页面加载时统计登录情况
        if (buttonFlag == 0) {
            _czc.push(['_trackEvent', TVmodel, '活动首页', '(首次未登录)立即领取点击次数','','getimmediateDiv']);
            buttonFlag = 3;//到登录页面但未登录成功时的状态
        }
        else if(buttonFlag == 3){
            _czc.push(['_trackEvent', TVmodel, '活动首页', '(登录失败后)立即领取点击次数','','getimmediateDiv']);
        }
        loadStatus = 2;  //系统登录界面
        console.log("Home状态"+loadStatus);
        coocaaosapi.startUserSettingAndFinish(function(message)  {console.log(message); },function(error){console.log(error);});
        coocaaosapi.addUserChanggedListener(function(message){
            console.log(message);
            document.getElementById('buttonImg').src=app.rel_html_imgpath(__uri("../images/5-3.png"));
            loginstatus = "true";
            loadStatus = 1;//返回到活动界面
            buttonFlag = 0;
            changeStatus = 1;
        });
    }

    else{     
        if (buttonFlag == 0 && changeStatus ==0) {
            _czc.push(['_trackEvent', TVmodel, '活动首页', '(首次已登录)立即领取点击次数','','getimmediateDiv']);
            buttonFlag = 1;
        }
        else if (buttonFlag == 0 && changeStatus ==1) {
            _czc.push(['_trackEvent', TVmodel, '活动首页', '(登录成功后)立即领取点击次数','','getimmediateDiv']);
            buttonFlag = 1;
        };

        coocaaosapi.getUserInfo(function(message) {
           userInfo = message;
           openId = message.open_id;
           mobile = message.mobile;
           nick_name = message.nick_name;
           console.log("open_id:"+openId+";mobile:"+mobile+";nick_name:"+nick_name);
           coocaaosapi.getDeviceInfo(function(message) {
                deviceInfo = message;                
                console.log(JSON.stringify(deviceInfo));
                //---------------获取usertokenid-----------------
                coocaaosapi.getUserAccessToken(function(message) {
                    accesstoken = message.accesstoken;
                    console.log("usertoken " + message.accesstoken);
                    // sendHTTP1();
                    toast();
                },function(error) { console.log(error);})
               },function(error) { console.log(error);});
        }
        ,function(error) { console.log(error);});
    }
}

function getsuccess(){
    var makesureDiv = document.getElementById('makesureDiv');
    var getsuccessDiv = document.getElementById('getsuccessDiv');
    var nochanceDiv = document.getElementById('nochanceDiv');
    if (makesureDiv) {
        makesureDiv.focus();
        makesureDiv.addEventListener("click", experience);
    };
    if (getsuccessDiv) {
        getsuccessDiv.focus();
        getsuccessDiv.addEventListener("click", experience);
    };
    if (nochanceDiv) {
        nochanceDiv.focus();
        nochanceDiv.addEventListener("click", experience);
    };
    
    var msg = document.getElementById('msgDiv');
    var errorinfo = document.getElementById('errorinfo');
    if (msg) {
        setTimeout("msg.style.display='none'",4000);
        setTimeout("errorinfo.style.display='none'",4000);
    }
    document.getElementById("getimmediateDiv").removeEventListener("click",experienceonclick ,false);
}

function getsuccess1(){
    document.getElementById('getsuccessDiv').focus();
    document.getElementById("getsuccessDiv").addEventListener("click", showgoldvip);
}

function toast(){
    _czc.push(['_trackEvent', TVmodel, '确认领取页', '弹出次数','','']);
    document.getElementById("buttonImg").src=app.rel_html_imgpath(__uri("../images/5-4.png"));
    document.getElementById("getimmediateDiv").style.display="none";
    document.getElementById("makesureDiv").style.display="block";
    document.getElementById("makesureDiv").focus();
    document.getElementById("makesureDiv").addEventListener("click",sendHTTP1 ,false);
}

function sendHTTP1() {
    _czc.push(['_trackEvent', TVmodel, '确认领取页', '点击确定次数','','']);
 document.getElementById('loading').style.display="block";
    showval= getQueryString("scheme_id");
    console.log(showval);
    position = getQueryString("position");
    action = getQueryString("action");
    var oldType = deviceInfo.type;
    console.log(oldType);
    var md5string = "accessToken=" + accesstoken +  "&mac=" + deviceInfo.mac + "&model=" + deviceInfo.model + "&schemeId=" + showval + "&skyworth";
    var md5sign = md5(md5string);
    console.log("md5sign:"+md5sign);
    console.log("userInfo:"+JSON.stringify(userInfo));
    $.ajax({             
         type: "GET",
         async: true,
         url: "http://active.tc.skysrt.com/q/index.html",
         // url: "http://42.121.113.121:8094/ActivityPromotion/q/index.html",
         data: {accessToken:accesstoken,device:JSON.stringify(deviceInfo),schemeId:showval,type:"1",sign:md5sign,position:position,action:action},             
         dataType:"jsonp",
         jsonp:"callback",
         jsonpCallback: "receive",
         success: function(data){

                  },
         error: function(){ 
            console.log("error"); 
            _czc.push(['_trackEvent', TVmodel, '确认领取页', '点击异常:未获取到后台数据','','']);
        } 
    });
}

function receive(data) {
    //alert("receive!" + data);
    // document.getElementById('msg').style.display="block";
    console.log("receive:" + data);
    console.log("code:" + data.result.code);    
    if(data.result.code=="0")//成功
    {
        
        if (buttonFlag == 1) {
            _czc.push(['_trackEvent', TVmodel,'领取结果页', '领取结果:成功', '','getimmediateDiv']);
            buttonFlag = 2;
        };
        
        console.log(data.result.code);
        document.getElementById("buttonImg").src=app.rel_html_imgpath(__uri("../images/5-2.png"));
        document.getElementById('loading').style.display="none";
        document.getElementById("makesureDiv").style.display="none";
        document.getElementById("getsuccessDiv").style.display="block";
        document.getElementById('getsuccessDiv').focus();
        getsuccess1();
    }
    else if (data.result.code=="7")
    {
    	//抱歉，您已经领取过了
        if (buttonFlag == 1) {
            _czc.push(['_trackEvent', TVmodel,'领取结果页', '领取结果:失败', '','getimmediateDiv']);
            _czc.push(['_trackEvent', TVmodel,'领取结果页', '失败原因:已经领取过', '','getimmediateDiv']);
            buttonFlag = 2;
        }
        console.log(data.result.code);
        document.getElementById("buttonImg").src=app.rel_html_imgpath(__uri("../images/5-1.png"));
        document.getElementById('loading').style.display="none";
        document.getElementById("makesureDiv").style.display="none";
        document.getElementById("nochanceDiv").style.display="block";
        document.getElementById('nochanceDiv').focus();
        getsuccess();
    }
    else 
    {
        console.log("异常，请稍后再试");
    	//异常，请稍后再试
        if (buttonFlag == 1) {
            _czc.push(['_trackEvent', TVmodel,'领取结果页', '领取结果:失败', '','getimmediateDiv']);
            _czc.push(['_trackEvent', TVmodel,'领取结果页', '失败原因:数据异常', '','getimmediateDiv']);
            buttonFlag = 2;
        }
        document.getElementById("buttonImg").src=app.rel_html_imgpath(__uri("../images/5-1.png"));
        document.getElementById('loading').style.display="none";
        document.getElementById("msgDiv").style.display="block";
        document.getElementById('makesureDiv').focus();
    	getsuccess();
    }
}

function showgoldvip(){
    document.getElementById("buttonImg").style.display="none";
    if (vipFlag == 0) {
    _czc.push(['_trackEvent', TVmodel,'领取结果页', '点击领取第二步爱奇艺黄金vip', '','getimmediateDiv']);};
    document.getElementById("deadline").display="none";
    console.log("开始获取二维码");
    document.getElementById("er-img").innerHTML="";
    document.getElementById('loading2').style.display="block";
    document.getElementById("getsuccessDiv").removeEventListener("click",showgoldvip ,false);
    document.getElementById("bg").style.display="none";
    document.getElementById("getsuccessDiv").style.display = "none";
    document.getElementById("show").style.display="none";
    document.getElementById("goldvip").style.display="block";
    if (mobile !=undefined) {
            document.getElementById("phone").innerHTML=mobile;
        }
    else{
        document.getElementById("phone").innerHTML=nick_name;
    }
    $.ajax({             
         type: "GET",
         async: true,
         url: "http://pay.coocaatv.com/MyCoocaa/pay-to-aqiyi/index.action",
         data: {openId :openId},
         dataType:"jsonp",
         jsonp:"jsonpCallback",
         jsonpCallback: "receive2",
         success: function(data){

                  },
         error: function(){ 
            _czc.push(['_trackEvent', TVmodel,'领取结果页', '点击异常:后台异常', '','getimmediateDiv']);
            console.log("error"); 
        } 
    });
    // generateQRCode("测试");
}

function receive2(data) {
    if (vipFlag == 0) {
    _czc.push(['_trackEvent', TVmodel,'黄金VIP页', '弹出', '','getimmediateDiv']);};
    document.getElementById('loading2').style.display="none";
    console.log("receive:" + data);
    console.log("code:" + data[0].code);    
    if(data[0].code=="0000")//成功
    {
        _czc.push(['_trackEvent', TVmodel,'黄金VIP页', '二维码显示:成功', '','getimmediateDiv']);
        document.getElementById("deadline").display="block";
        var url = data[0].data.url;
        var deadline = data[0].data.deadline;
        var array = [];
        array = deadline.split("-");
        document.getElementById("year").innerHTML=array[0];
        document.getElementById("month").innerHTML=array[1];
        document.getElementById("day").innerHTML=array[2];
        var logoImg = document.createElement("img");
        logoImg.id = "iqiyilogo";
        logoImg.src = app.rel_html_imgpath(__uri("../images/aqiyi-logo.png"));
        document.getElementById("er-img").appendChild(logoImg);
        generateQRCode(url);
        setTimeout(showgoldvip,360000);

    }
    else 
    {
        if (vipFlag == 0) {
        _czc.push(['_trackEvent', TVmodel,'黄金VIP页', '二维码显示:失败', '','getimmediateDiv']);};
        vipFlag = 1;
        document.getElementById("er-errorDiv").style.display="block";
        document.getElementById("er-img").style.display="none";
        document.getElementById("er-txt").style.display="none";
        document.getElementById("deadline").style.display="none";
        document.getElementById("er-button").focus();
        document.getElementById("er-button").addEventListener("click",showgoldvip,false);
        setTimeout(showgoldvip,360000);

    }
}

//获取url参数
function getQueryString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]); return null;
}

//中文编码格式转换
function utf16to8(str) {
    var out, i, len, c;
    out = "";
    len = str.length;
    for (i = 0; i < len; i++) {
        c = str.charCodeAt(i);
        if ((c >= 0x0001) && (c <= 0x007F)) {
            out += str.charAt(i);
        } else if (c > 0x07FF) {
            out += String.fromCharCode(0xE0 | ((c >> 12) & 0x0F));
            out += String.fromCharCode(0x80 | ((c >> 6) & 0x3F));
            out += String.fromCharCode(0x80 | ((c >> 0) & 0x3F));
        } else {
            out += String.fromCharCode(0xC0 | ((c >> 6) & 0x1F));
            out += String.fromCharCode(0x80 | ((c >> 0) & 0x3F));
        }
    }
    return out;
}   

//二维码生成
function generateQRCode(url) {
    console.log("create img--------------");
    $("#er-img").qrcode({ 
        render: "canvas", // 渲染方式有table方式（IE兼容）和canvas方式
        width: 256, //宽度 
        height:256, //高度 
        text: utf16to8(url), //内容 
        typeNumber:-1,//计算模式
        correctLevel:2,//二维码纠错级别
        background:"#ffffff",//背景颜色
        foreground:"#000000"  //二维码颜色
    });
    console.log("end img--------------");
}

//md5加密
function md5(string){
    function md5_RotateLeft(lValue, iShiftBits) {
        return (lValue<<iShiftBits) | (lValue>>>(32-iShiftBits));
    }
    function md5_AddUnsigned(lX,lY){
        var lX4,lY4,lX8,lY8,lResult;
        lX8 = (lX & 0x80000000);
        lY8 = (lY & 0x80000000);
        lX4 = (lX & 0x40000000);
        lY4 = (lY & 0x40000000);
        lResult = (lX & 0x3FFFFFFF)+(lY & 0x3FFFFFFF);
        if (lX4 & lY4) {
            return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
        }
        if (lX4 | lY4) {
            if (lResult & 0x40000000) {
                return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
            } else {
                return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
            }
        } else {
            return (lResult ^ lX8 ^ lY8);
        }
    }         
    function md5_F(x,y,z){
        return (x & y) | ((~x) & z);
    }
    function md5_G(x,y,z){
        return (x & z) | (y & (~z));
    }
    function md5_H(x,y,z){
        return (x ^ y ^ z);
    }
    function md5_I(x,y,z){
        return (y ^ (x | (~z)));
    }
    function md5_FF(a,b,c,d,x,s,ac){
        a = md5_AddUnsigned(a, md5_AddUnsigned(md5_AddUnsigned(md5_F(b, c, d), x), ac));
        return md5_AddUnsigned(md5_RotateLeft(a, s), b);
    }; 
    function md5_GG(a,b,c,d,x,s,ac){
        a = md5_AddUnsigned(a, md5_AddUnsigned(md5_AddUnsigned(md5_G(b, c, d), x), ac));
        return md5_AddUnsigned(md5_RotateLeft(a, s), b);
    };
    function md5_HH(a,b,c,d,x,s,ac){
        a = md5_AddUnsigned(a, md5_AddUnsigned(md5_AddUnsigned(md5_H(b, c, d), x), ac));
        return md5_AddUnsigned(md5_RotateLeft(a, s), b);
    }; 
    function md5_II(a,b,c,d,x,s,ac){
        a = md5_AddUnsigned(a, md5_AddUnsigned(md5_AddUnsigned(md5_I(b, c, d), x), ac));
        return md5_AddUnsigned(md5_RotateLeft(a, s), b);
    };
    function md5_ConvertToWordArray(string) {
        var lWordCount;
        var lMessageLength = string.length;
        var lNumberOfWords_temp1=lMessageLength + 8;
        var lNumberOfWords_temp2=(lNumberOfWords_temp1-(lNumberOfWords_temp1 % 64))/64;
        var lNumberOfWords = (lNumberOfWords_temp2+1)*16;
        var lWordArray=Array(lNumberOfWords-1);
        var lBytePosition = 0;
        var lByteCount = 0;
        while ( lByteCount < lMessageLength ) {
            lWordCount = (lByteCount-(lByteCount % 4))/4;
            lBytePosition = (lByteCount % 4)*8;
            lWordArray[lWordCount] = (lWordArray[lWordCount] | (string.charCodeAt(lByteCount)<<lBytePosition));
            lByteCount++;
        }
        lWordCount = (lByteCount-(lByteCount % 4))/4;
        lBytePosition = (lByteCount % 4)*8;
        lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80<<lBytePosition);
        lWordArray[lNumberOfWords-2] = lMessageLength<<3;
        lWordArray[lNumberOfWords-1] = lMessageLength>>>29;
        return lWordArray;
    }; 
    function md5_WordToHex(lValue){
        var WordToHexValue="",WordToHexValue_temp="",lByte,lCount;
        for(lCount = 0;lCount<=3;lCount++){
            lByte = (lValue>>>(lCount*8)) & 255;
            WordToHexValue_temp = "0" + lByte.toString(16);
            WordToHexValue = WordToHexValue + WordToHexValue_temp.substr(WordToHexValue_temp.length-2,2);
        }
        return WordToHexValue;
    };
    function md5_Utf8Encode(string){
        string = string.replace(/\r\n/g,"\n");
        var utftext = ""; 
        for (var n = 0; n < string.length; n++) {
            var c = string.charCodeAt(n); 
            if (c < 128) {
                utftext += String.fromCharCode(c);
            }else if((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            } else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            } 
        } 
        return utftext;
    }; 
    var x=Array();
    var k,AA,BB,CC,DD,a,b,c,d;
    var S11=7, S12=12, S13=17, S14=22;
    var S21=5, S22=9 , S23=14, S24=20;
    var S31=4, S32=11, S33=16, S34=23;
    var S41=6, S42=10, S43=15, S44=21;
    string = md5_Utf8Encode(string);
    x = md5_ConvertToWordArray(string); 
    a = 0x67452301; b = 0xEFCDAB89; c = 0x98BADCFE; d = 0x10325476; 
    for (k=0;k<x.length;k+=16) {
        AA=a; BB=b; CC=c; DD=d;
        a=md5_FF(a,b,c,d,x[k+0], S11,0xD76AA478);
        d=md5_FF(d,a,b,c,x[k+1], S12,0xE8C7B756);
        c=md5_FF(c,d,a,b,x[k+2], S13,0x242070DB);
        b=md5_FF(b,c,d,a,x[k+3], S14,0xC1BDCEEE);
        a=md5_FF(a,b,c,d,x[k+4], S11,0xF57C0FAF);
        d=md5_FF(d,a,b,c,x[k+5], S12,0x4787C62A);
        c=md5_FF(c,d,a,b,x[k+6], S13,0xA8304613);
        b=md5_FF(b,c,d,a,x[k+7], S14,0xFD469501);
        a=md5_FF(a,b,c,d,x[k+8], S11,0x698098D8);
        d=md5_FF(d,a,b,c,x[k+9], S12,0x8B44F7AF);
        c=md5_FF(c,d,a,b,x[k+10],S13,0xFFFF5BB1);
        b=md5_FF(b,c,d,a,x[k+11],S14,0x895CD7BE);
        a=md5_FF(a,b,c,d,x[k+12],S11,0x6B901122);
        d=md5_FF(d,a,b,c,x[k+13],S12,0xFD987193);
        c=md5_FF(c,d,a,b,x[k+14],S13,0xA679438E);
        b=md5_FF(b,c,d,a,x[k+15],S14,0x49B40821);
        a=md5_GG(a,b,c,d,x[k+1], S21,0xF61E2562);
        d=md5_GG(d,a,b,c,x[k+6], S22,0xC040B340);
        c=md5_GG(c,d,a,b,x[k+11],S23,0x265E5A51);
        b=md5_GG(b,c,d,a,x[k+0], S24,0xE9B6C7AA);
        a=md5_GG(a,b,c,d,x[k+5], S21,0xD62F105D);
        d=md5_GG(d,a,b,c,x[k+10],S22,0x2441453);
        c=md5_GG(c,d,a,b,x[k+15],S23,0xD8A1E681);
        b=md5_GG(b,c,d,a,x[k+4], S24,0xE7D3FBC8);
        a=md5_GG(a,b,c,d,x[k+9], S21,0x21E1CDE6);
        d=md5_GG(d,a,b,c,x[k+14],S22,0xC33707D6);
        c=md5_GG(c,d,a,b,x[k+3], S23,0xF4D50D87);
        b=md5_GG(b,c,d,a,x[k+8], S24,0x455A14ED);
        a=md5_GG(a,b,c,d,x[k+13],S21,0xA9E3E905);
        d=md5_GG(d,a,b,c,x[k+2], S22,0xFCEFA3F8);
        c=md5_GG(c,d,a,b,x[k+7], S23,0x676F02D9);
        b=md5_GG(b,c,d,a,x[k+12],S24,0x8D2A4C8A);
        a=md5_HH(a,b,c,d,x[k+5], S31,0xFFFA3942);
        d=md5_HH(d,a,b,c,x[k+8], S32,0x8771F681);
        c=md5_HH(c,d,a,b,x[k+11],S33,0x6D9D6122);
        b=md5_HH(b,c,d,a,x[k+14],S34,0xFDE5380C);
        a=md5_HH(a,b,c,d,x[k+1], S31,0xA4BEEA44);
        d=md5_HH(d,a,b,c,x[k+4], S32,0x4BDECFA9);
        c=md5_HH(c,d,a,b,x[k+7], S33,0xF6BB4B60);
        b=md5_HH(b,c,d,a,x[k+10],S34,0xBEBFBC70);
        a=md5_HH(a,b,c,d,x[k+13],S31,0x289B7EC6);
        d=md5_HH(d,a,b,c,x[k+0], S32,0xEAA127FA);
        c=md5_HH(c,d,a,b,x[k+3], S33,0xD4EF3085);
        b=md5_HH(b,c,d,a,x[k+6], S34,0x4881D05);
        a=md5_HH(a,b,c,d,x[k+9], S31,0xD9D4D039);
        d=md5_HH(d,a,b,c,x[k+12],S32,0xE6DB99E5);
        c=md5_HH(c,d,a,b,x[k+15],S33,0x1FA27CF8);
        b=md5_HH(b,c,d,a,x[k+2], S34,0xC4AC5665);
        a=md5_II(a,b,c,d,x[k+0], S41,0xF4292244);
        d=md5_II(d,a,b,c,x[k+7], S42,0x432AFF97);
        c=md5_II(c,d,a,b,x[k+14],S43,0xAB9423A7);
        b=md5_II(b,c,d,a,x[k+5], S44,0xFC93A039);
        a=md5_II(a,b,c,d,x[k+12],S41,0x655B59C3);
        d=md5_II(d,a,b,c,x[k+3], S42,0x8F0CCC92);
        c=md5_II(c,d,a,b,x[k+10],S43,0xFFEFF47D);
        b=md5_II(b,c,d,a,x[k+1], S44,0x85845DD1);
        a=md5_II(a,b,c,d,x[k+8], S41,0x6FA87E4F);
        d=md5_II(d,a,b,c,x[k+15],S42,0xFE2CE6E0);
        c=md5_II(c,d,a,b,x[k+6], S43,0xA3014314);
        b=md5_II(b,c,d,a,x[k+13],S44,0x4E0811A1);
        a=md5_II(a,b,c,d,x[k+4], S41,0xF7537E82);
        d=md5_II(d,a,b,c,x[k+11],S42,0xBD3AF235);
        c=md5_II(c,d,a,b,x[k+2], S43,0x2AD7D2BB);
        b=md5_II(b,c,d,a,x[k+9], S44,0xEB86D391);
        a=md5_AddUnsigned(a,AA);
        b=md5_AddUnsigned(b,BB);
        c=md5_AddUnsigned(c,CC);
        d=md5_AddUnsigned(d,DD);
    }
    return (md5_WordToHex(a)+md5_WordToHex(b)+md5_WordToHex(c)+md5_WordToHex(d)).toLowerCase();
}