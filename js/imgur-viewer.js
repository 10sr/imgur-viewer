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

  swipeboxClass: "swipebox-image",

  init: function($, base_url, client_id,
                 imagesId, accountTextId, accountSubmitId){
    this.$ = $;
    this.client.init($, base_url, client_id);
    this.$images = this.$("#" + imagesId);
    this.$accountSubmit = this.$("#" + accountSubmitId);
    this.$accountText = this.$("#" + accountTextId);

    if (! this.$images) {
      // TODO: Notify dom Error
      return;
    }

    this.$(window).bind("hashchange", this.onHashChange.bind(this));
    this.onHashChange();

    this.$accountText.bind("keypress", (function(e){
      if (e.keyCode === 13) {
        this.updateHash(this.$accountText.val());
        return;
      }
    }).bind(this));
    this.$accountSubmit.bind("click", (function(){
        this.updateHash(this.$accountText.val());
        return;
    }).bind(this));
  },

  updateHash: function(text){
    window.location.hash = text;
    return;
  },

  onHashChange: function(){
    this.$images.empty();

    var hash = this.$.param.fragment();
    //var hash = (window.content.location.hash || "").replace(/^#/, "");
    this.$accountText.val(hash);
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

      if (page === 1) {
        this.$images.append($("<div />", {
          class: "col-1-4 mobile-col-1-3 imgur-viewer-image"
        }).append($("<a />", {
          href: "#" + account
        }).append($("<img />", {
          src: "img/mono-tab-left.svg",
          alt: "left"
        }))));
      } else if (page >= 1) {
        this.$images.append($("<div />", {
          class: "col-1-4 mobile-col-1-3 imgur-viewer-image"
        }).append($("<a />", {
          href: "#" + account + "/" + (page - 1).toString()
        }).append($("<img />", {
          src: "img/mono-tab-left.svg",
          alt: "left"
        }))));
      }


      for (var i = 0; i < result.length; i++) {
        this.$images.append($("<div />", {
          class: "col-1-4 mobile-col-1-3 imgur-viewer-image"
        }).append($("<a />", {
          href: (isSmartPhone() ?
                 this.makeThumbnailLink(result[i].link, "h") :
                 result[i].link),
          class: this.swipeboxClass
        }).append($("<img />", {
          src: this.makeThumbnailLink(result[i].link, "b"),
          alt: result[i].title || result[i].id,
          width: "100%"
        }))));
      }

      $("." + this.swipeboxClass).swipebox();

      this.$images.append($("<div />", {
        class: "col-1-4 mobile-col-1-3 imgur-viewer-image"
      }).append($("<a />", {
        href: "#" + account + "/" + (page + 1).toString()
      }).append($("<img />", {
        src: "img/mono-tab-right.svg",
        alt: "right"
      }))));
    }).bind(this));
  },

  makeThumbnailLink: function(url, suffix){
    return url.replace(/\/([^.]+)(\.[^\/]*)$/, "/$1" + suffix + "$2");
  }
};


// http://www.kens-web.com/2011/11/1344
function isSmartPhone(){
  return ((navigator.userAgent.indexOf('iPhone') > 0 &&
           navigator.userAgent.indexOf('iPad') === -1) ||
          navigator.userAgent.indexOf('iPod') > 0 ||
          navigator.userAgent.indexOf('Android') > 0);
}
