var imgurClient = {
  $: null,
  base_url: null,
  client_id: null,

  init: function($, base_url, client_id){
    this.$ = $;
    this.base_url = base_url;
    this.client_id = client_id;
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
  $navigation: null,

  init: function($, base_url, client_id,
                 imagesId, accountTextId, accountSubmitId, navigationId){
    this.$ = $;
    this.client.init($, base_url, client_id);
    this.$images = this.$("#" + imagesId);
    this.$accountSubmit = this.$("#" + accountSubmitId);
    this.$accountText = this.$("#" + accountTextId);
    this.$navigation = this.$("#" + navigationId);

    if (! this.$images) {
      // TODO: Notify dom Error
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
    window.location.hash = text;
    return;
  },

  onHashChange: function(){
    this.$images.empty();
    this.$navigation.empty();

    var hash = this.$.param.fragment();
    //var hash = (window.content.location.hash || "").replace(/^#/, "");
    if (! hash) {
      return;
    }


    var splittedHash = hash.split("/");
    var account = splittedHash[0];

    var page = parseInt(splittedHash[1]);
    if (isNaN(page)) {
      page = 0;
    }

    this.client.accountImages(account, page, (function(data, textStatus, jqXHR){
      var result = data.data;
      for (var i = 0; i < result.length; i++) {
        this.$images.append(
          $("<div />", {
            class: "col-1-4 mobile-col-1-3 imgur-viewer-image"
          }).append(
            $("<a />", {
              href: result[i].link
            }).append(
              $("<img />", {
                src: this.makeThumbnailLink(result[i].link, "b"),
                alt: result[i].id,
                width: "100%"
              })
            )
          )
        );
      }
      if (page === 1) {
        this.$navigation.append($("<a />", {
          href: "#" + account
        }).text("<-"));
      } else if (page >= 1) {
        this.$navigation.append($("<a />", {
          href: "#" + account + "/" + (page - 1).toString(),
        }).text("<-"));
      }
      this.$navigation.append($("<a />", {
        href: "#" + account + "/" + (page + 1).toString(),
      }).text("->"));
    }).bind(this));
  },

  makeThumbnailLink: function(url, suffix){
    return url.replace(/\/([^.]+)(\.[^\/]*)$/, "/$1" + suffix + "$2");
  }
};
