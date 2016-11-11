//>>built
define("dojox/storage/LocalStorageProvider","dojo/_base/declare dojox/storage/Provider dojox/storage/manager dojo/_base/array dojo/_base/lang dojo/json".split(" "),function(f,k,g,l,m,h){f=f("dojox.storage.LocalStorageProvider",[k],{store:null,initialize:function(){this.store=localStorage;this.initialized=!0;g.loaded()},isAvailable:function(){return"undefined"!=typeof localStorage},put:function(a,b,c,d){this._assertIsValidKey(a);d=d||this.DEFAULT_NAMESPACE;this._assertIsValidNamespace(d);var e=this.getFullKey(a,
d);b=h.stringify(b);try{this.store.setItem(e,b),c&&c(this.SUCCESS,a,null,d)}catch(f){c&&c(this.FAILED,a,f.toString(),d)}},get:function(a,b){this._assertIsValidKey(a);b=b||this.DEFAULT_NAMESPACE;this._assertIsValidNamespace(b);a=this.getFullKey(a,b);return h.parse(this.store.getItem(a))},getKeys:function(a){a=a||this.DEFAULT_NAMESPACE;this._assertIsValidNamespace(a);a="__"+a+"_";for(var b=[],c=0;c<this.store.length;c++){var d=this.store.key(c);this._beginsWith(d,a)&&(d=d.substring(a.length),b.push(d))}return b},
clear:function(a){a=a||this.DEFAULT_NAMESPACE;this._assertIsValidNamespace(a);a="__"+a+"_";for(var b=[],c=0;c<this.store.length;c++)this._beginsWith(this.store.key(c),a)&&b.push(this.store.key(c));l.forEach(b,m.hitch(this.store,"removeItem"))},remove:function(a,b){b=b||this.DEFAULT_NAMESPACE;this._assertIsValidNamespace(b);this.store.removeItem(this.getFullKey(a,b))},getNamespaces:function(){var a=[this.DEFAULT_NAMESPACE],b={};b[this.DEFAULT_NAMESPACE]=!0;for(var c=/^__([^_]*)_/,d=0;d<this.store.length;d++){var e=
this.store.key(d);!0==c.test(e)&&(e=e.match(c)[1],"undefined"==typeof b[e]&&(b[e]=!0,a.push(e)))}return a},isPermanent:function(){return!0},getMaximumSize:function(){return dojox.storage.SIZE_NO_LIMIT},hasSettingsUI:function(){return!1},isValidKey:function(a){return null===a||void 0===a?!1:/^[0-9A-Za-z_-]*$/.test(a)},isValidNamespace:function(a){return null===a||void 0===a?!1:/^[0-9A-Za-z-]*$/.test(a)},getFullKey:function(a,b){return"__"+b+"_"+a},_beginsWith:function(a,b){return b.length>a.length?
!1:a.substring(0,b.length)===b},_assertIsValidNamespace:function(a){if(!1===this.isValidNamespace(a))throw Error("Invalid namespace given: "+a);},_assertIsValidKey:function(a){if(!1===this.isValidKey(a))throw Error("Invalid key given: "+a);}});g.register("dojox.storage.LocalStorageProvider",new f);return f});