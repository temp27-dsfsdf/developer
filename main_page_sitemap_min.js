function initDCSitemap(e){console.log("dxentric sitemap v1.3 - ?sf_personalization_wpm");const t=document.referrer,n=window.location.href,a=(new URLSearchParams(window.location.search),n.split("?")[0]),r=(t.split("?")[0],[{name:"DXentric_Handlebars_Sample1",substitutionDefinitions:{personalizationContentId:{defaultValue:"[personalizationContentId]"},productImgUrl:{defaultValue:"[attributes].[product_image_url1]"},productMainTitle:{defaultValue:"[attributes].[product_main_title1]"},productSubTitle:{defaultValue:"[attributes].[product_sub_title1]"}},transformerType:"Handlebars",transformerTypeDetails:{html:'\n            <div>\n            <img src="{{subVar "productImgUrl"}}" alt="" class="w-72" />\n            <br />\n              <a href="https://www.dxentric.co.kr/">{{subVar "productMainTitle"}}</a>\n              <br />\n              <span>{{subVar "productSubTitle"}}</span>\n              <br />\n              <span>12,345원</span>\n            </div>\n          '},lastModifiedDate:(new Date).getTime()}]),o=e;console.log("DXentric Personalization initialize."),SalesforceInteractions.Personalization.Config.initialize({additionalTransformers:[...r],personalizationExperienceConfigs:[...o]});const i=()=>{let e=document.querySelector("input#mail_value")?.value;return e||""},s=e=>({eventType:e,ecrmLocaleCode:"ko_KR",ecrmUserId:i(),sourceUrl:n});SalesforceInteractions.init({name:"DXentric Salesforce Interactions Web SDK",personalization:{dataspace:"default"},cookieDomain:"mcp.dxentric.co.kr",consents:new Promise((e=>{const{OptIn:t,OptOut:n}=SalesforceInteractions.ConsentStatus;e([{purpose:SalesforceInteractions.ConsentPurpose.Tracking,provider:"Example Consent Manager",status:t}])}))}).then((()=>{console.log("DXentric Salesforce Interactions Web SDK is ready"),SalesforceInteractions.setLoggingLevel("DEBUG");const{listener:e,sendEvent:t,CartInteractionName:n,CatalogObjectInteractionName:r,OrderInteractionName:o}=SalesforceInteractions,c={locale:"ko_KR",onActionEvent:e=>{const t=i();t?.includes("@")&&SalesforceInteractions.sendEvent({interaction:{name:"identity",eventType:"identity",category:"Profile",emailAddress:t,...s("identity")}});const n=i();return n&&(e.interaction={...e.interaction,ecrmUserId:n}),e},listeners:[SalesforceInteractions.listener("keydown","input#search_input",(e=>{"Enter"===e.key&&d(e)}))]},l={name:"MainPageEntered",isMatch:()=>new RegExp("https://mcp.dxentric.co.kr:4433/shop/index\\.dg$").test(a),interaction:{name:"MainPageEntered",eventType:"MainPageEntered",type:"WebPage",...s("MainPageEntered")},onActionEvent:e=>{}},d=e=>{e.preventDefault();const t=document.querySelector("input#search_input")?.value;t?.length>=2&&SalesforceInteractions.sendEvent({interaction:{name:"SearchKeyword",eventType:"SearchKeyword",...s("SearchKeyword"),ecrmSearchIndex:t}})},p={name:"default",interaction:{name:"Default",...s("Default")}};SalesforceInteractions.initSitemap({GLOBAL:c,pageTypeDefault:p,pageTypes:[l]})}))}document.addEventListener("DOMContentLoaded",(()=>{console.log(">>>>>>>>> 메인 페이지 전용 sitemap을 로딩했다.");fetch("https://cdn.jsdelivr.net/gh/temp27-dsfsdf/marketer@main/template.json").then((e=>{if(!e.ok)throw new Error("Network response was not ok");return e.json()})).then((e=>{console.log("불러온 JSON 데이터:",e),initDCSitemap(e)})).catch((e=>{console.error("Fetching JSON failed:",e)}))}));
