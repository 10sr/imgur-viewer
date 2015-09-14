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
  $accountText: null,
  $accountSubmit: null,

  init: function($, base_url, client_id, imagesId, accountTextId, accountSubmitId){
    this.$ = $;
    this.client.init($, base_url, client_id);
    this.$images = this.$("#" + imagesId);
    this.$accountSubmit = this.$("#" + accountSubmitId);
    this.$accountText = this.$("#" + accountTextId);

    if (! this.$images) {
      console.log("Images tag not found");
      return;
    }

    this.$(window).bind("hashchange", this.onHashChange.bind(this));
    this.onHashChange();

    this.$accountText.bind("keypress", (function(e){
      if (e.keyCode === 13) {
        this.changeHash(this.$accountText.val());
        return;
      }
    }).bind(this));
    this.$accountSubmit.bind("click", (function(){
        this.changeHash(this.$accountText.val());
        return;
    }).bind(this));
  },

  changeHash: function(text){
    console.log(text);
    window.location.hash = text;
    return;
  },

  onHashChange: function(){
    var hash = this.$.param.fragment();
    //var hash = (window.content.location.hash || "").replace(/^#/, "");
    console.log(hash);
    if (! hash) {
      console.log("no hash!");
      return;
    }

    this.$images.empty();

    var splittedHash = hash.split("/");
    var account = splittedHash[0];

    this.client.accountImages(account, 0, (function(data, textStatus, jqXHR){
      console.log(data);
      console.log(textStatus);
      console.log(jqXHR);
      var result = data.data
      console.log(result);
      for (var i = 0; i < result.length; i++) {
        this.$images.append(
          $("<div />", {
            class: "col-3-12 mobile-col-1-3"
          }).append(
            $("<a />", {
              href: result[i].link
            }).append(
              $("<img />", {
                src: this.makeThumbnailLink(result[i].link, "b"),
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
