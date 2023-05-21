// 油猴脚本库
function tamperlib(apiUrl, authKey){
    this.apiUrl = apiUrl;
    this.authKey = authKey;
}

tamperlib.prototype.fetch = function(method, url, data, options){
    if(options == undefined) {
        options = {};
    }

    options.method = method;
    options.url = url;

    if (data != undefined) {
        options.data = data;
    }

    return new Promise((resolve, reject) => {
        options.onload = function(response){
            if(options.processData != undefined){
                response = options.processData(response);
            }
            resolve(response);
        };
        options.onerror = function(response){
            reject(response);
        };

        GM_xmlhttpRequest(options);
    })
};

tamperlib.prototype.downloadToBlob = function(method, url, data, options){
    if(options == undefined) {
        options = {};
    }

    options.method = method;
    options.url = url;
    options.responseType = 'blob';

    options.processData = function(response){
        return response.response;
    };

    return this.fetch(method, url, data, options);
};


tamperlib.prototype.serializeQuery = function(obj) {
    var str = [];
    for (var p in obj)
      if (obj.hasOwnProperty(p)) {
        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
      }
    return str.join("&");
  };


tamperlib.prototype.requestAPI = function(method, path, data){
    let url = this.apiUrl + path;
    let options = {
        headers: {
            'Authorization': 'Bearer ' + this.authKey
        },
    };


    if (method == 'GET') {
        if (data != undefined) {
            query = this.serializeQuery(data);
            url = url + '?' + query;
        }
    }else{
        options.headers['Content-Type'] = 'application/json';
        data = JSON.stringify(data);
    }

    options.processData = function(response){
        console.log(response.responseText);
        return JSON.parse(response.responseText);
    };

    return this.fetch(method, url, data, options);
};

tamperlib.prototype.uploadFile = function(savePath, file){
    let url = this.apiUrl + '/files'
    let options = {
        method: 'POST',
        url: url,
        headers: {
            'Authorization': 'Bearer ' + this.authKey
        },
    };

    let formData = new FormData();
    formData.append('file', file);
    formData.append('path', savePath);
    options.data = formData;
    options.processData = function(response){
        return JSON.parse(response.responseText);
    };

    return this.fetch('POST', url, formData, options);
};
