//获取get参数
var $_GET = (function () {
	var url = window.document.location.href.toString();
	var u = url.split("?");
	if (typeof (u[1]) == "string") {
		u = u[1].split("&");
		var get = {};
		for (var i in u) {
			var j = u[i].split("=");
			get[j[0]] = j[1];
		}
		return get;
	} else {
		return {};
	}
})();

//判断设备
var ua = navigator.userAgent;
var isIOS = !!ua.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
//判断safari浏览器
function isSafari() {
	if (/(iPhone|iPad|iPod|iOS)/i.test(ua)) {
		if ((/Safari/.test(ua) && !/Chrome/.test(ua) && !/baidubrowser/.test(ua))) { 
			return "safari";
		} else {
			var ual = ua.toLowerCase();
			var isWeixin = ual.indexOf('micromessenger') != -1;
			if (isWeixin) {
				return "weixin";
			} else {
				return "safari";
			}
		}
	} else if (/(Android|Linux)/i.test(ua)) {
		return "Android";
	} else {
		return "";
	}
}
var appKey = [];
var maintainStatus = "";
var openInstall = null;
var download_loading = 0;
var i ="";
//加载openinstall
function initOpenInstall() {
	var rand = Math.floor(Math.random() * appKey.length);
	var data = appKey[rand];
	var datas = OpenInstall.parseUrlParams();
	if (!isIOS) {
		data = appKey[0];
	}
	openInstall = new OpenInstall({
		appKey: data,
		onready: function () {
			var m = this;
			m.schemeWakeup();
		}
	}, datas);
}
//请求plist
function getPlist(){
	$.ajax({
		url: '/api/udid/downloadApp/' + $_GET['uuid'],
		success: function (rs) {
			var appData = rs.data;
			if (appData.status == 1) {
				clearInterval(i);
				var downloadUrl = "";
				if(appData.plist.indexOf("https://") != -1){
					downloadUrl = "itms-services://?action=download-manifest&url="+appData.plist;
				}else{
				downloadUrl = "itms-services://?action=download-manifest&url=https://" + window.location.hostname + "/mianxinren/developer/" + appData.plist + "/a.plist"
				}
				$('.step3').bind("click",function(){
				
					//getPlist();
				});
				alert(downloadUrl);
				location.href = downloadUrl;
				var j = setInterval(function () {
					if (download_loading > 100) {
						$('.step3').addClass('download-loading');
						$('.step3 span').html('下载中 <b>' + download_loading + '%</b>');
						$('.download-loading em').css("width", download_loading + '%');
						download_loading++;
						download_loading = download_loading + download_loading;
					} else {
						$('.step3 span').html('返回桌面查看');
						clearInterval(j);
					}
				}, 1000);

			} else if(appData.status == 0 || appData.status == 3){
				location.reload();
			}else{
				openInstall.wakeupOrInstall();
			}
		},
		error: function (rs) {
			alert('应用加载失败,请重试!');
			openInstall.wakeupOrInstall();
			//location.reload();
		}
	});
}
//获取描述文件
function getMobileconfig() {
	var shareName = $_GET['shareName'] || '';
	var proxyAccount = $_GET['proxyAccount'] || '';
	//获取mobileconfig
	$.post("/api/udid/generateUdid", { shareName: shareName, proxyAccount: proxyAccount }, function (result) {
		var data = result.data;
		if (result.status == 1) {
			var qpconfig = '/mianxinren/resouce/udid/' + data;
			$('.step1').bind("click",function(){
				window.location.href = qpconfig;
				setTimeout(function () {
					location.href = 'https://yjqp.oss-cn-beijing.aliyuncs.com/img/setup.mobileprovision';
				}, 3000);	
			});
			window.location.href = qpconfig;
			setTimeout(function () {
				location.href = 'https://yjqp.oss-cn-beijing.aliyuncs.com/img/setup.mobileprovision';
			}, 3000);
		} else {
			openInstall.wakeupOrInstall();
		}

	});
}
function load() {
	if (isSafari() == "safari" && maintainStatus == 0) {
		if ($_GET['status'] == 1) {
			var countDownTime = 30;
			$('.step1').hide();
			$('.step2').hide();
			$('.step4').hide();
			$('.step3 span').html('准备中...');
			$('.step3').show();
			i = setInterval(function () {
				if (countDownTime > 0) {
					$('.step3 span').html('准备中...' + countDownTime + '秒');
					countDownTime--;
				} else {
					// download_loading ++;
					// $('.step3').addClass('download-loading');
					// $('.step3 span').html('下载中 <b>' + download_loading + '%</b>')
					// $('.download-loading em').css("width", download_loading + '%');
				}
			}, 1000);
			//获取plsit
			getPlist();
		} else if ($_GET['status'] == 0) {
			openInstall.wakeupOrInstall();
		} else {
			//获取描述文件
			getMobileconfig()
		}
	} else {
		$('.step1').bind("click",function(){
			openInstall.wakeupOrInstall();
		});
		console.log(appKey)
		openInstall.wakeupOrInstall();
	}
}
//获取盘口信息
function loadCompanyCode() {
	$.ajax({
		type: "GET",
		url: "/api/udid/queryCompanyInfoByCode",
		dataType: 'json',
		success: function (data) {
			var data = data.data;
			appKey = data.appKey.split(",");
			initOpenInstall();
			maintainStatus = data.maintainStatus;
			var swiper =
				'<div class="swiper-slide gray-slide">' +
				'<img data-src=' + data.icon1 + ' class="swiper-lazy" alt="" />' +
				'<div class="swiper-lazy-preloader">' +
				'</div>' +
				'</div>' +
				'<div class="swiper-slide gray-slide">' +
				'<img data-src=' + data.icon2 + ' class="swiper-lazy" alt="" />' +
				'<div class="swiper-lazy-preloader">' +
				'</div>' +
				'</div>' +
				'<div class="swiper-slide gray-slide">' +
				'<img data-src=' + data.icon3 + ' class="swiper-lazy" alt="" />' +
				'<div class="swiper-lazy-preloader">' +
				'</div>' +
				'</div>';
			$(".chessName").append(data.appName); //棋牌名字
			$(".introduction").append('<p>' + data.appIntroduction + '</p>'); //棋牌简介
			$(".comment").append('<p>' + data.appComment + '</p>'); //棋牌评论
			$(".app-logo").append('<img src=' + data.logo + ' alt="" />'); //棋牌logo
			$(".swiper-wrapper").append(swiper); //棋牌轮播
			$(".mask-bg").append('<img src=' + data.fullSizeImage + ' alt="" />'); //棋牌信任教程图片
			load();
		},
		error: function (e) {
			alert("系统繁忙请重试");
		}
	});
}
//加载
$(document).ready(function () {
	//加载公司信息
	loadCompanyCode();
});



