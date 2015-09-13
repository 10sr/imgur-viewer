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
  $: null,
  $images: null,

  init: function($, base_url, client_id, imagesId){
    this.$ = $;
    this.client.init($, base_url, client_id);
    this.$images = this.$("#" + imagesId);

    if (! this.$images) {
      console.log("Images tag not found");
      return;
    }

    this.$(window).bind("hashchange", this.onHashChange.bind(this));
    this.onHashChange();
  },

  onHashChange: function(){
    var hash = this.$.param.fragment();
    //var hash = (window.content.location.hash || "").replace(/^#/, "");
    console.log(hash);
    if (! hash) {
      console.log("no hash!");
      return;
    }

    var splittedHash = hash.split("/");
    var account = splittedHash[0];

    this.client.accountImages(account, 0, (function(data, textStatus, jqXHR){
      console.log(data);
      console.log(textStatus);
      console.log(jqXHR);
      var result = data.data
      console.log(result);
      this.$images.empty();
      for (var i = 0; i < result.length; i++) {
        this.$images.append(
          $("<li />").append(
            $("<a />", {
              href: result[i].link
            }).append(
              $("<img />", {
                src: this.makeThumbnailLink(result[i].link, "m"),
                alt: result[i].id
              })
            )
          )
        );
      }
    }).bind(this));
  },

  makeThumbnailLink: function(url, suffix){
    return url.replace(/\/([^.]+)(\.[^\/]*)$/, "/$1" + suffix + "$2");
  }
};
