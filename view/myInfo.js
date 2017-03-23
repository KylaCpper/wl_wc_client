var token ="eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJvcGVuaWQiOiJvVzJMancwaWNyS2pIcnZSMF9ZQmExRXF6cXNRIiwiX2lkIjoiNTg0MTMzMTVjYmI2MTkxOGUwM2M0OWViIiwiaWF0IjoxNDgxMTY1MTU2fQ.xDOzPltyVf1FuiOlxyazhlJ8FHOg3px-J_7DIEWxyqk"
var userInfo = new Vue({
	el:"#myInfo",
	mounted:function(){
		this.getUserInfo()
	},
	data:{
		userInfo:{
			nickname:"-",
			sex:2,
			birthday:'',
			height:'-',
			toWeight:'-'

		},
		cue:""
	},
	methods:{
		getUserInfo:function(){
			var that=this;
			fetch(config.server+'/user/login', {
		        method: 'post',
		        body: JSON.stringify({
		            "token":token
					})
			})
			.then(function(response) {
				return response.json();
			})
			.then(function(json){


				if(json.code==0){
					json.data.birthday=json.data.birthday.split("T")[0];

					if(json.data.sex!=1){
						json.data.sex=2;
					}
					that.userInfo=json.data;

				} else{
				 	alert("系统错误")
				}
			})
			.catch(function(err){
				console.log(err)
			});

		},
		update:function(){
			var that =this;
			var age=new Date()-new Date(that.userInfo.birthday);
			age=Math.round(age/60/60/24/365/1000);

			if(age>=10&&age<=80){

				if(that.userInfo.height>=100&&that.userInfo.height<=200){

						fetch(config.server+'/user/updateInfo', {
					        method: 'post',
					        body: JSON.stringify({
					            "token":token,
					            "sex":that.userInfo.sex,
					            "height":that.userInfo.height,
					            "birthday":that.userInfo.birthday,
					            "toWeight":that.userInfo.toWeight
								})
						})
						.then(function(response) {
							return response.json();
						})
						.then(function(json){
							if(json.code==0){
								that.getUserInfo();
								that.cue="";
							} else{
							 	alert("系统错误")
							}
						})
						.catch(function(err){
							console.log(err)
						});

				} else
					that.cue="身高信息不符";


			} else
				that.cue="生日年龄不符";



		}
	}



})