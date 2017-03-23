//将数据存储到lacalstorage和cookie中,
var ugenLocalStorage = {
    set: function(name, value)
    {
        var date = new Date(),
            expires = '',
            type = typeof(value),
            valueToUse = '';

        //cookie后的时间变量，固定为了365天
        date.setTime(date.getTime() + (365 * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();

        //判断数据类型是string还是map
        if (type === "object"  && type !== "undefined") {
            if(!("JSON" in window)) throw "Bummer, your browser doesn't support JSON parsing.";
            valueToUse = JSON.stringify(value);
        } else {
            valueToUse = value;
        }
        //储存在localStorage中
        localStorage[name] = valueToUse;

        //储存在cookie中
        document.cookie = name + "=" +encodeURIComponent(valueToUse) + expires

    },
    get: function(name){
        //判断是否存在localstorage，有返回localstorage没有返回cookie
        if(localStorage[name]){
            return localStorage[name];
        }else
        {
            var nameEQ = name + "=",
                //从cookie中拿出数据使用';'分开
                ca = document.cookie.split(';'),
                value = '',
                //存放数据第一个字符变量
                firstChar = '',
                parsed={};
            for (var i = 0; i < ca.length; i++)
            {
                var c = ca[i];
                //循环每个字符,直到为空
                while (c.charAt(0) == ' ') c = c.substring(1, c.length);

                //判断nameEQ与储存数据name是否匹配
                if (c.indexOf(nameEQ) === 0)
                {
                    //将cookie数据解码
                    value = decodeURIComponent(c.substring(nameEQ.length, c.length));

                    firstChar = value.substring(0, 1);
                    //判断是否为map形式
                    if(firstChar=="{")
                    {
                        try
                        {
                            parsed = JSON.parse(value);
                            if("v" in parsed) return parsed.v;
                        } catch(e)
                        {
                            return value;
                        }
                    }
                    if (value=="undefined") return undefined;
                    return value;
                }
            }
            return null;
        }
    }
};