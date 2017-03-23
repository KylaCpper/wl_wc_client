
var flowGuideScroll;
var myScroll;       
window.addEventListener("load",function(){
	console.log("load")
    myScroll = new IScroll('#wrapper',{
        //list 滚动条样式 DIY
        scrollbars: 'custom',
        shrinkScrollbars: 'scale',
        fadeScrollbars: true,
        click: true
    });

},false);
document.addEventListener('touchmove',function(e){e.preventDefault();}); 

//loading window
var loading = new Vue({
	el:".loading",
	data:{
	//loadinig=1 display
		loading:1
	},
	computed:{

	}

})
// var token="eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJvcGVuaWQiOiJvVzJMancwaWNyS2pIcnZSMF9ZQmExRXF6cXNRIiwiX2lkIjoiNTg0MTMzMTVjYmI2MTkxOGUwM2M0OWViIiwiaWF0IjoxNDgxODY4ODk5fQ.iPy0oVikMV4-nFAx_QOePEGcdUCpBQqXUq3OlvtyRrY";
var token;
var wechatToken;

//save token
wechatToken = JSON.parse(ugenLocalStorage.get(config.CONST_USERINFO_KEY));
//token login
if(wechatToken){
	if(wechatToken.token){
		token=wechatToken.token;

		login();
	}
}
//code login
if(!token){
	if(!get("code")){
		window.location.href="https://open.weixin.qq.com/connect/oauth2/authorize?appid="+config.appid+"&redirect_uri="+config.url+"&response_type=code&scope=snsapi_base&state=STATE#wechat_redirect";
	} else 
		login();
	
}
//get userinfo    get token save
function login(){
	fetch(config.server+'/user/login', {
        method: 'post',
        body: JSON.stringify({
            "token":token,
            "code":get("code")
			})
	})
	.then(function(response) {
		return response.json();
	})
	.then(function(json){
		if(json.code==0){
			//save new token
			ugenLocalStorage.set(config.CONST_USERINFO_KEY, {
			    token: json.token,
				sex:json.data.sex,
				age:json.data.age,
				height:json.data.height,
				toWeight:json.data.toWeight
		    });
			token=json.token;
			//userinfo init
			userInfo.init(json);
			//devicelist init
			list.init();
			//jssdk init
			jslib();
		} else {//if token false   token=null
		    ugenLocalStorage.set(config.CONST_USERINFO_KEY, {
	            token: ""
	        });
		 	alert("系统错误")
		}
	})
	.catch(function(err){
		console.log(err)
	});
}
//head userinfo
var userInfo = new Vue({
	el:"#userInfo",
	data:{
		userInfo:null,
		info:1
	},
	methods:{
		init:function(json){
			var that=this;

			if(!json.data.height||!json.data.birthday||!json.data){
				document.getElementById("content").className = "content contentBlur";

			} else {

			}
			that.userinfo={};
			//birthday change 0000-00-00
			if(!json.data.toWeight){
				json.data.toWeight="--";
			}
			if(json.data.birthday){
				json.data.birthday=json.data.birthday.split("T")[0];
			}
			//default sex=2
			if(json.data.sex!=1){
				json.data.sex=2;
			}
			//get userinfo
			that.userInfo = json.data;
			for(key in json.data){
				setUserInfo.setUserInfo[key]=json.data[key];
			}
			setUserInfo.birthday=json.data.birthday;
			// for(key in json.data){
			// 	userInfo_be[key]=json.data[key];
			// }
			//if userinfo==false   add class="blur"

			
		},
		//
		title:function(){
			//change title and myinfo display
			$("body").addClass("grayBg");
			if(!get("set")){
				history.pushState(null,null,"?set=1");	
			}

			document.getElementById("content").className = "content hidden";
			setUserInfo.set=1;
			title.setTitle("个人信息");	
			console.log(window.history.length)
		}
	}

});
//change title
var title = new Vue({
	el:"iframe",
	data: {
	  iframe: ''
	},
	methods: {
	  setTitle: function (title) {
	    document.title = title
	    // 判断是否为ios设备，ios设备需要通过加载iframe来刷新title
		    var body = document.getElementsByTagName('body')[0];
		    document.title = title;
		    var iframe = document.createElement("iframe");
		    iframe.setAttribute("src", "/favicon.ico");
		 
		    iframe.addEventListener('load', function() {
		        setTimeout(function() {
		            iframe.removeEventListener('load');
		            document.body.removeChild(iframe);
		        }, 0);
		    });
		    document.body.appendChild(iframe);


	  }
	}
});
//devicelist
var list = new Vue({
	el:"#wrapper",
	mounted:function(){
	

	},
	data:{
		deviceList:[{}],
		deviceListInfo:null,
		unbind:[],
		device_id:0,
		deviceID:0,
		act:0

	},
	methods:{
		init:function(){
			var that=this;
			fetch(config.server+'/device/getDevice', {
                    method: 'post',
                    body: JSON.stringify({
                        "token":token
          				
          			})
            })
			.then(function(response) {
				return response.json();
			})
			.then(function(json){
				//get devicelist 
				if(json.code==0){
					if(json.data){
						//pid = config.pid  
						for(var i=0;i<json.data.length;i++){
							for(key in config.pid){
								if(json.data[i].pid==[key]){
									json.data[i].pid=config.pid[key]
								}
								
							}
						}
						that.deviceList = json.data;
						var long=that.deviceList;
						that.unbind=new Array(long.length);
						that.getDetailInfo(that.deviceList);
					} else {
						that.deviceList=0;
						loading.loading=0;
					}
				} else{
					alert("服务器繁忙重试");
				}
				
			})
			.catch(function(err){
				console.log(err)
			});
	
		},//get deviceinfo 
		 getDetailInfo:function(device){
			var that =this;
			var data =[];
			var deviceids=[];
			for(var i=0;i<device.length;i++){		 	
				deviceids[i]=device[i]._device_obj_id;

			}
					fetch(config.server+'/device/getDetailInfo', {
		                    method: 'post',
		                    body: JSON.stringify({
		                    	"deviceID":deviceids,
		                        "token":token
		          			})
		            })
					.then(function(response) {
						return response.json();
					})
					.then(function(json){
						var j=json.data;
						if(json.code==0){
							for(var n=0;n<j.length;n++){
								if(!json.data[n].weight){
									json.data[n].weight="--";
								}
								data[n]=json.data[n];		
								if(n==j.length-1){
									  that.deviceListInfo=data;		
									 
								}
							}
						} else {alert("系统错误");}
						loading.loading=0;
						that.$nextTick(function(){myScroll.refresh();})
					})
					.catch(function(err){
						console.log(err)
					});
			


		},
		funbind:function(index,bool){
			
			var unbind=new Array(this.unbind.length);
			if(this.deviceList[index].status==1){
				unbind[index]=bool;

			}
			this.unbind=unbind;
	

		},
		fbind:function(device_id){
			act.actDevice(device_id)

		},
		img:function(){
			history.pushState(null,null,"?img=1");	
			img.show=1;
			this.$nextTick(function(){
				//流程引导提示弹窗 显示时 调用
			    flowGuideScroll = new IScroll('#flowGuideWrapper',{
			        scrollX: true,
			        scrollY: false,
			        snap: true,
			        bounce: false,
			        momentum: false,
			        click: true     	
			    });
				flowGuideScroll.on('scrollEnd',function(){				
				console.log(flowGuideScroll.currentPage.pageX);
					document.querySelector('#indicator > li.active').className = '';
					document.querySelector('#indicator > li:nth-child(' + (this.currentPage.pageX+1) + ')').className = 'active';
				});
			})
		},
		href:function(device){
			if(device.status==1){
				window.location.href=config.url+"record.html?deviceId="+device._device_obj_id;
			}
		}
	}
});

//no height/birthday   window
var uninfo = new Vue({
	el:".myInfo_linkModal",
	mounted:function(){

	},
	data:{
		info:null
	},
	computed:{
            info:{
                get:function(){
                    return userInfo.info
                }
            }
    },
    methods:{
    	setinfo:function(){
    		if(!get("set")){
				history.pushState(null,null,"?set=1")
			}
			// myinfo display            
			// content hidden
			document.getElementById("content").className = "content hidden";
			userInfo.info=1;
			setUserInfo.set=1;
			title.setTitle("个人信息");	
			$("body").addClass("grayBg");
    	}

    } 

})
//act window
var act = new Vue({
	el:"#activateModal",
	data:{
		act:null,
		cue:null,
		show:null		
	},
	computed:{
            act:{
                get:function(){
                    return list.act
                }
            },
            show:{
            	get:function(){
            		return list.act
            	}
            }
    },
    methods:{
    	foff:function(){
    		var that =this;
    		//bind after  devicelist init
    		if(that.act==1){
    			list.init();
    		}
    		list.act=0;
    	},
    	//bind device
    	actDevice:function(deviceId){
    		var that=this;
			fetch(config.server+'/device/actDevice', {
                    method: 'post',
                    body: JSON.stringify({
                    	"deviceID":deviceId,
                        "token":token
          			})
            })
			.then(function(response) {
				return response.json();
			})
			.then(function(json){
				if(json.code==0){
					if(json.data==1){
						that.cue="成功";
						list.act=1;
					} else {
						that.cue="失败";
						list.act=102;
					}
				} else {alert("系统错误")}

			})
			.catch(function(err){
				console.log(err)
			});

		}

    }

})
//unact window
var unact = new Vue({
	el:"#msgModal",
	data:{
		deviceID:null,
		device_id:null,
		show:null
	},
	computed:{
            deviceID:{
                get:function(){
                    return list.deviceID
                }
            },
            device_id:{
            	get:function(){
            		return list.device_id
            	}
            },
            show:{
            	get:function(){
            		return list.deviceID
            	}
            }
    },
    methods:{
		funbind:function(){
			//unbind device
			this.unactDevice(this.deviceID,this.device_id);
			list.deviceID=0;
			list.init();
		},
		foff:function(){
			list.deviceID=0;
			var unbind=new Array(list.unbind.length);
			list.unbind=unbind;
			
		},
		unactDevice:function(deviceId,device_id){
					//get unbind ticket
					wx.invoke('getWXDeviceTicket', {'deviceId':device_id, 'type':2, 'connType':'lan'},function(res){
						alert(res.ticket)
						fetch(config.server+'/device/delDevice', {
			                    method: 'post',
			                    body: JSON.stringify({
			                    	"deviceID":deviceId,
			                        "token":token,
			                        "ticket":res.ticket,
			                        "device_id":device_id
			          			})
			            })
						.then(function(response) {
							return response.json();
						})
						.then(function(json){
							if(json.code==0){
								//unbind after devicelist init
								list.init();
							} else{ alert(json.code); if(json.code==503){alert("wechat error")}else{alert("系统错误")}}

							list.unact=0;




						})
						.catch(function(err){
							console.log(err)
						});
					});
			
		}
	
	}

})
//img window
var img =new Vue({
	el:"#img",
	mounted:function(){

	},
	data:{
		show:null
	},
	methods:{
		qrcode:function(){
				wx.scanQRCode({
				desc: 'scanQRCode desc',
				needResult: 0, // 默认为0，扫描结果由微信处理，1则直接返回扫描结果，
				scanType: ["qrCode","barCode"], // 可以指定扫二维码还是一维码，默认二者都有
				success: function (res) {
				alert(res.resultStr); // 当needResult 为 1 时，扫码返回的结果
				}
				});

		}	}

})
//set userinfo page
var setUserInfo = new Vue({
	el:"#myInfo",
	data:{
		setUserInfo:{
			nickname:"",
			sex:2,
			birthday:'',
			height:'',
			toWeight:''

		},
		birthday:"",
		cue:"",
		set:0
	},
	watch:{
		"birthday":function(n,o){
			this.setUserInfo.birthday=n;
		}
	},
	methods:{
		//old userinfo=new userinfo
		getUserInfo:function(){
			var that=this;
			for(key in userInfo.userInfo){
				userInfo.userInfo[key]=setUserInfo.setUserInfo[key];
				if(!userInfo.userInfo[key]&&key!="sex")
					userInfo.userInfo[key]='--';
			}
			userInfo.userInfo.birthday=that.birthday;
			userInfo.userInfo.height=that.setUserInfo.height;

		},
		update:function(){		
			var that =this;
			if(that.setUserInfo.toWeight=="--"){
				that.setUserInfo.toWeight="";
			}


			var age=new Date()-new Date(that.setUserInfo.birthday);
			age=Math.round(age/60/60/24/365/1000);
			//  10<age<80
			if(age>=10&&age<=80){
				// 100<height<200
				if(that.setUserInfo.height>=100&&that.setUserInfo.height<=220){
			
					if(that.setUserInfo.toWeight>=0&&that.setUserInfo.toWeight!==0&&that.setUserInfo.toWeight<1000){
						loading.loading=1;
						fetch(config.server+'/user/updateInfo', {
					        method: 'post',
					        body: JSON.stringify({
					            "token":token,
					            "sex":that.setUserInfo.sex,
					            "height":that.setUserInfo.height,
					            "birthday":that.setUserInfo.birthday,
					            "toWeight":that.setUserInfo.toWeight
								})
						})
						.then(function(response) {
							return response.json();
						})
						.then(function(json){
							if(json.code==0){
								//old userinfo=new userinfo
								that.getUserInfo();
								//display devicelist	
								list.init();
								document.getElementById("content").className = "content";
								
								ugenLocalStorage.set(config.CONST_USERINFO_KEY, {
								   	token:token,
								    sex:that.setUserInfo.sex,
								    height:that.setUserInfo.height,
								    age:json.data,
							     	toWeight:that.setUserInfo.toWeight
							    });



								that.set=0;
								that.cue="";
								title.setTitle("我的设备");	
								$("body").removeClass("grayBg");
								history.back();

							} else{
							 	alert("系统错误")
							}	
						})
						.catch(function(err){
							console.log(err)
						});
				 	} else
				 		that.cue="目标体重信息不符";
				} else
					that.cue="身高信息不符";


			} else
				that.cue="生日年龄不符";



		}
	



	}
})


//listen window
window.addEventListener('popstate', function(event) {		
	img.show=0;	
	//userinfo data=be data         cannot two way bind
		for(key in userInfo.userInfo){
			setUserInfo.setUserInfo[key]=userInfo.userInfo[key];
			if(!setUserInfo.setUserInfo[key]&&key!="sex"){
				userInfo.userInfo[key]="--";
			}
		}
		setUserInfo.birthday=userInfo.userInfo.birthday;

		
		//callback
		if(get("set")!=1){
			//no userinfo
			if(!userInfo.userInfo.height||!userInfo.userInfo.birthday){
				setUserInfo.setUserInfo.height="--";
				document.getElementById("content").className = "content contentBlur";
				userInfo.info=0;
				setUserInfo.set=0;
				setUserInfo.cue="";

				
			} else{
				document.getElementById("content").className = "content";
			}
			//background color 
			title.setTitle("我的设备");	
			$("body").removeClass("grayBg");

		}




});  

//get url
function get(par){
    if(par){
    var local_url = document.location.href; 
    var get = local_url.indexOf(par +"=");
    if(get == -1){
        return false;   
    }   
    var get_par = local_url.slice(par.length + get + 1);    
    var nextPar = get_par.indexOf("&");
    if(nextPar != -1){
        get_par = get_par.slice(0, nextPar);
    }
    return get_par;
    }
   return document.location.href;
 
}

//jssdk
function jslib(){ 
			fetch(config.server+'/user/getJsSign', {
                    method: 'post',
                    body: JSON.stringify({
                        "token":token,
          				"url":window.location.href
          			})
            })
			.then(function(response) {
				return response.json();
			})
			.then(function(json){
				var sign=json.data
				wx.config({
					debug: true, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
					beta:true,
					appId: config.appid, // 必填，公众号的唯一标识
					timestamp: sign.timestamp, // 必填，生成签名的时间戳
					nonceStr: sign.nonceStr, // 必填，生成签名的随机串
					signature: sign.signature,// 必填，签名，见附录1
					jsApiList: ['scanQRCode','getWXDeviceTicket','openWXDeviceLib'] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
				});	
	//"connType":"lan"	
	//"brandUserName":config.appid
				wx.ready(function(res){
						wx.invoke('openWXDeviceLib', {"brandUserName":config.appid}, function(res){

						});
				});	
		
			})
			.catch(function(err){
				console.log(err)
			});
}
