document.addEventListener("DOMContentLoaded", () => { 
    const WEB_TEMPLATE_JSON_URL = 'https://cdn.jsdelivr.net/gh/temp27-dsfsdf/developer@main/template_min.json';
  
    const pre_define_json = [
      {
        "name": "ItemPageRecs",
        "substitutionDefinitions": {
          "personalizationContentId": {
            "defaultValue": "[personalizationContentId]"
          },
          "introText": {
            "defaultValue": "[attributes].[introText]"
          },
          "recs": {
            "defaultValue": "[data]"
          },
          "name": {
            "defaultValue": "[ssot__Name__c]"
          },
          "price": {
            "defaultValue": "[price__c]"
          }
        },
        "transformerType": "Handlebars",
        "transformerTypeDetails": {
          "html": "\n          {{#each (subVar \"recs\")}}\n            <a href=\"https://www.naver.com/\" target=\"_blank\"> \n              <div class=\"w-72 shadow-md rounded-xl overflow-hidden\" style=\"background-color: #434a57;\">\n                <img src=\"https://image.edaily.co.kr/images/Photo/files/NP/S/2021/02/PS21021200161.jpg\" alt=\"\" class=\"w-72\" /> \n                <p class=\"text-lg font-bold\">{{subVar \"ssot__Name__c\"}}</p>\n                <p>価格: {{subVar \"price\"}}円</p>\n              </div>\n            </a>\n          {{/each}}\n                "
        },
        "lastModifiedDate": 1630000000000
      }
    ];
  
    fetch(WEB_TEMPLATE_JSON_URL)
    .then(response => {
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        return response.json();
    })
    .then(exp_json_data => {
        console.log("불러온 JSON 데이터:", exp_json_data);
        initDCSitemap(exp_json_data, pre_define_json);
    })
    .catch(error => {
        console.error("Fetching JSON failed:", error);
    });

  function initDCSitemap(exp_json_data, pre_define_json) {
    console.log("dxentric sitemap v1.2");
    const PREVIOUS_URL = document.referrer;
    const BASE_URL = "https://mcp.dxentric.co.kr:4433/shop/";
    const CURRENT_URL = window.location.href;
    const TRIMMED_URL = CURRENT_URL.split("?")[0];
     
    console.log("DXentric Personalization initialize.");
    SalesforceInteractions.Personalization.Config.initialize({
      additionalTransformers: [...pre_define_json],
      personalizationExperienceConfigs: [...exp_json_data]
    });
    
  
    // Helper Functions
    const getEcrmUserId = () => {
      let customerId = document.querySelector("input#userId_value")?.value;
      return customerId || "";
    };
  
    const getUserEmail = () => {
      let email = document.querySelector("input#mail_value")?.value;
      return email || "";
    };
  
    const getCartId = () => {
      let cartId = localStorage.getItem("mcp_demo_cart_id");
      if (!cartId) {
        const s4 = () =>
          Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
        cartId = `${s4()}${s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`;
        localStorage.setItem("mcp_demo_cart_id", cartId);
      }
      return cartId;
    };
  
    // 기본 이벤트 속성
    const baseEventAttributes = (eventType) => ({
      eventType: eventType,
      ecrmLocaleCode: "ko_KR",
      ecrmUserId: getUserEmail(),
      sourceUrl: CURRENT_URL
    });
  
    SalesforceInteractions.init({
      name: "DXentric Salesforce Interactions Web SDK",
      personalization: {
        dataspace: "default",
      },
      cookieDomain: "mcp.dxentric.co.kr",
      consents: new Promise((resolve) => {
        const { OptIn, OptOut } = SalesforceInteractions.ConsentStatus;
        const purpose = SalesforceInteractions.ConsentPurpose.Tracking;
        const provider = "Example Consent Manager";
        resolve([
          {
            purpose,
            provider,
            status: OptIn,
          },
        ]);
      }),
    }).then(() => {
      console.log("DXentric Salesforce Interactions Web SDK is ready");
      SalesforceInteractions.setLoggingLevel("DEBUG");
      const ITEM_RECOMMEND = "DXentric_Recommendations_Maximize_Revenue";
  
      const {
        listener,
        sendEvent,
        CartInteractionName,
        CatalogObjectInteractionName,
        OrderInteractionName,
      } = SalesforceInteractions;
  
      // 전역 설정
      const GLOBAL = {
        locale: "ko_KR",
        onActionEvent: (actionEvent) => {
          // SalesforceInteractions.Personalization.fetch([CAMPAIGN_BANNER]).then(
          //   (personalizations) => {
          //     console.log("personalizationPointArray");
          //     console.log({ personalizations });
          //   }
          // );
  
          const email = getUserEmail();
          if (email?.includes("@")) {
            SalesforceInteractions.sendEvent({
              interaction: {
                name: "identity",
                eventType: "identity",
                category: "Profile",
                emailAddress: email,
                ...baseEventAttributes("identity"),
              },
            });
          }
  
          const userId = getUserEmail();
          if (userId) {
            actionEvent.interaction = {
              ...actionEvent.interaction,
              ecrmUserId: userId,
            };
          }
  
          return actionEvent;
        },
        listeners: [
          SalesforceInteractions.listener("keydown", "input#search_input", (evt) => {
            if (evt.key === "Enter") {
              searchActionHandler(evt);
            }
          }),
        ],
      };
  
      // 메인 페이지 정의
      const MAIN_PAGE = {
        name: "MainPageEntered",
        isMatch: () => new RegExp(`${BASE_URL}index\\.dg$`).test(TRIMMED_URL),
        interaction: {
          name: "MainPageEntered",
          eventType: "MainPageEntered",
          type: "WebPage",
          ...baseEventAttributes("MainPageEntered"),
        },
        onActionEvent: (event) => {
          
        }
      };
  
      // 검색 이벤트 핸들러
      const searchActionHandler = (evt) => {
        evt.preventDefault();
        const searchTerm = document.querySelector("input#search_input")?.value;
  
        if (searchTerm?.length >= 2) {
          SalesforceInteractions.sendEvent({
            interaction: {
              name: "SearchKeyword",
              eventType: "SearchKeyword",
              ...baseEventAttributes("SearchKeyword"),
              ecrmSearchIndex: searchTerm,
            },
          });
        }
      };
  
      const pageTypeDefault = {
        name: "default",
        interaction: {
          name: "Default",
          ...baseEventAttributes("Default"),
        },
      };
  
      SalesforceInteractions.initSitemap({
        GLOBAL,
        pageTypeDefault,
        pageTypes: [
          MAIN_PAGE
        ],
      });
    });
  
    // 헬퍼 함수: Personalization 데이터에서 특정 personalizationPointName을 찾음
    function findByPersonalizationPointName(data, targetName) {
      return data.find(item => item.personalizationPointName === targetName);
    }
  
    // 헬퍼 함수: 추천 carousel 생성 (데이터, 제목, personalizationId 사용)
    function createCarousel({ data }, title, personalizationId) {
      data.forEach(item => {
        console.log('테스트 ' + item.ssot__Name__c);
      });
    }
  }
  });