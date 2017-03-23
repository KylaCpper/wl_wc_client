window.onpopstate = function(event) {
			console.log(window.history.length)
};
//绑定事件处理函数. 
history.pushState(null,null, "?page=1");
history.back(); 

history.pushState(null,null, "?page=1");
history.back(); 