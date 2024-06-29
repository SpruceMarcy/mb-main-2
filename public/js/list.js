/*! @license pzpr.js v (c) 2009-2024 sabo2, MIT license
 *   https://github.com/sabo2/pzprv3 */
!function(){var r={doclang:pzpr.lang,captions:[],phtml:"p.html",ruleshtml:"rules.html",extend:function(e){for(var t in e)this[t]=e[t]}},n=document,o=r;o.doclang=JSON.parse(localStorage.getItem("pzprv3_config:ui")||"{}").language||pzpr.lang,"?en"!==location.search&&"?ja"!==location.search||(o.doclang=location.search.substr(1,2)),"puzz.link"!==location.hostname&&"/list"!==location.pathname||(o.phtml="p"),"/list"===location.pathname&&(o.ruleshtml="rules"),r.extend({onload_func:function(){o.setTranslation(),o.setBlockVisibility(),o.translate(),o.initializeSort()},initializeSort:function(){for(var a=JSON.parse(localStorage.getItem("pzprv3_config:ui")||"{}").listsort||"none",e=n.querySelectorAll(".lists > ul > li"),t=0;t<e.length;t++){if(!e[t].dataset)return;e[t].dataset.order=t}Array.prototype.slice.call(n.querySelectorAll("#puzmenu > li")).forEach(function(e){var t,l;e.id.match(/puzsort_(.+)$/)&&(t=RegExp.$1,e.className=t===a?"puzmenusel":"puzmenu",e.addEventListener("click",(l=t,function(e){o.click_tab(l)}),!1))}),n.getElementById("puzmenu").style.display="block",o.apply_sort()},click_tab:function(t){Array.prototype.slice.call(n.querySelectorAll("#puzmenu > li")).forEach(function(e){e.className=e.id==="puzsort_"+t?"puzmenusel":"puzmenu"});var e=JSON.parse(localStorage.getItem("pzprv3_config:ui")||"{}");e.listsort=t,localStorage.setItem("pzprv3_config:ui",JSON.stringify(e)),o.apply_sort()},apply_sort:function(){function l(e){return"alpha"===t?e.innerText.toLowerCase():+e.dataset.order}function a(e,t){return e=l(e),t=l(t),e===t?0:e<t?-1:1}var e=n.querySelector("#puzmenu > li.puzmenusel"),t=e?e.dataset.sort:"none";Array.prototype.slice.call(n.querySelectorAll(".lists > ul")).forEach(function(t){var e=Array.prototype.slice.call(t.querySelectorAll("li"));e.sort(a),e.forEach(function(e){t.appendChild(e)})})},setBlockVisibility:function(){Array.prototype.slice.call(n.querySelectorAll(".lists ul")).forEach(function(e){var t=0;Array.prototype.slice.call(e.querySelectorAll("li")).forEach(function(e){"none"!==e.style.display&&t++}),e.parentNode.style.display=0<t?"":"none"})},setlang:function(e){o.doclang=e,o.translate();var t=JSON.parse(localStorage.getItem("pzprv3_config:ui")||"{}");t.language=e,localStorage.setItem("pzprv3_config:ui",JSON.stringify(t))},setTranslation:function(){Array.prototype.slice.call(n.querySelectorAll(".lists li")).forEach(function(e){var t,l,a=pzpr.variety(function(e,t){var l="";if(void 0!==e.dataset)l=e.dataset[t];else{for(var a="data-",n=0;n<t.length;n++){var r=t[n]||t.charAt(n);a+="A"<=r&&r<="Z"?"-"+r.toLowerCase():r}l=e[a]||e.getAttribute(a)||""}return l}(e,"pid")),n=a.pid;a.valid?((t=document.createElement("a")).href=r.phtml+"?"+n,e.appendChild(t),(l=document.createElement("a")).className="rules",l.href=r.ruleshtml+"?"+n,l.textContent="?",e.appendChild(l),o.captions.push({anode:t,str_jp:a.ja,str_en:a.en})):e.style.display="none"})},translate:function(){for(var e=0;e<this.captions.length;e++){var t,l=this.captions[e];l.anode&&(t="ja"===o.doclang?l.str_jp:l.str_en,l.anode.innerHTML=t.replace(/(\(.+\))/g,"<small>$1</small>"))}Array.prototype.slice.call(n.body.querySelectorAll('[lang="ja"]')).forEach(function(e){e.style.display="ja"===o.doclang?"":"none"}),Array.prototype.slice.call(n.body.querySelectorAll('[lang="en"]')).forEach(function(e){e.style.display="en"===o.doclang?"":"none"})}}),window.addEventListener("load",o.onload_func,!1),window.v3index=r}();
//# sourceMappingURL=list.js.map