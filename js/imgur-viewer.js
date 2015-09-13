var imgurClient = {
  $: null,
  base_url: null,
  client_id: null,

  init: function($, base_url, client_id){
    this.$ = $;
    this.base_url = base_url;
    this.client_id = client_id;
    console.log(client_id);
  },

  accountImages: function(account, page, done, fail, always){
    this._ajaxRequest("account/" + account + "/images/" + page.toString(),
                      {},
                      done, fail, always);
  },

  _ajaxRequest: function(endpoint, data, done, fail, always){
    this.$.ajax({
      url: this.base_url + endpoint,
      dataType: "json",
      headers: {
        "Authorization": "Client-ID " + this.client_id
      }
    }).
      done(done || function(){}).
      fail(fail || function(){}).
      always(always || function(){});
  }
}

var imgurViewer = {
  client: imgurClient,
  init: function($, base_url, client_id){
    this.client.init($, base_url, client_id);
    this.client.accountImages("yuu4", 0, function(data, textStatus, jqXHR){
      console.log(data);
      console.log(textStatus);
      console.log(jqXHR);
      done && done(data.data);
      console.log(array);
    });
  }
};
