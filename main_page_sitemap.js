document.addEventListener("DOMContentLoaded", () => {
    console.log('전체 sitemap을 로딩했다.');
    // https://www.jsdelivr.com/github
    const WEB_TEMPLATE_JSON_URL = 'https://cdn.jsdelivr.net/gh/temp27-dsfsdf/marketer@main/template.json';
  
    fetch(WEB_TEMPLATE_JSON_URL)
      .then(response => {
          if (!response.ok) {
              throw new Error("Network response was not ok");
          }
          return response.json();
      })
      .then(data => {
          console.log("불러온 JSON 데이터:", data);
          initDCSitemap(data);
      })
      .catch(error => {
          console.error("Fetching JSON failed:", error);
      });
  });
  
  
  function initDCSitemap(json_data) {
    console.log("dxentric sitemap v1.3 - ?sf_personalization_wpm");
    const PREVIOUS_URL = document.referrer;
    const BASE_URL = "https://mcp.dxentric.co.kr:4433/shop/";
    const CURRENT_URL = window.location.href;
    const URL_PARAMS = new URLSearchParams(window.location.search);
    const TRIMMED_URL = CURRENT_URL.split("?")[0];
    const trimmedPreviousUrl = PREVIOUS_URL.split("?")[0];

   // Predefined Templates
    const PRE_DEFINE_TEMPLATE = [
      {
        name: "DXentric_Handlebars_Sample1", // DXentric_MainPage_Featured_Category 템플릿 호환
        substitutionDefinitions: {
          personalizationContentId: {
            defaultValue: "[personalizationContentId]",
          },
          productImgUrl: { // 속성 이름에 하이픈이 포함되면 에러가 발생한다.
            defaultValue: "[attributes].[product_image_url1]"
          },
          productMainTitle: {
            defaultValue: "[attributes].[product_main_title1]"
          },
          productSubTitle: {
            defaultValue: "[attributes].[product_sub_title1]"
          }
        },
        transformerType: 'Handlebars',
        transformerTypeDetails: {
          html: `
            <div>
            <img src="{{subVar "productImgUrl"}}" alt="" class="w-72" />
            <br />
              <a href="https://www.dxentric.co.kr/">{{subVar "productMainTitle"}}</a>
              <br />
              <span>{{subVar "productSubTitle"}}</span>
              <br />
              <span>12,345원</span>
            </div>
          `
        },
        lastModifiedDate: new Date().getTime()
      }
    ];
    
    // Manually Personalize Page Elements를 통해 추출한 JSON 데이터
    const EXPERIENCE_CONFIG = json_data;
    
    console.log("DXentric Personalization initialize.");
    SalesforceInteractions.Personalization.Config.initialize({
      additionalTransformers: [...PRE_DEFINE_TEMPLATE],
      personalizationExperienceConfigs: [...EXPERIENCE_CONFIG]
    });
    
  
    const getUserEmail = () => {
      let email = document.querySelector("input#mail_value")?.value;
      return email || "";
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
  }
