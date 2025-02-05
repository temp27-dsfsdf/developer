document.addEventListener("DOMContentLoaded", () => {
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
  let price_value;

  

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

    const PRODUCT_BUYING_PAGE = {
      name: "PbpEntered",
      isMatch: () => new RegExp(`${BASE_URL}cart\\.dg$`).test(TRIMMED_URL),
      listeners: [
        listener("load", window, () => {
          const productRows = document.querySelectorAll("tr:has(img)");
          
          Array.from(productRows).forEach(row => {
            sendEvent({
              interaction: {
                name: "PbpEntered",
                eventType: "PbpEntered",
                type: "WebPage",
                ...baseEventAttributes("PbpEntered"),
                catalogObjectType: "Product",
                catalogObjectId: row.querySelector(".item_id")?.value || "",
                quantity: (() => {
                  const quantityInput = row.querySelector(".input-number");
                  return parseInt(quantityInput?.value, 10) || 0;
                })(),
                price: (() => {
                  const priceElement = row.querySelector("td:nth-child(2) h5");
                  return parseFloat(priceElement?.textContent?.replace(/[^0-9]/g, "") || "0");
                })(),
                currency: "KRW",
              }
            });
          });
        })
      ]
    };
    
    const CHECK_OUT_PAGE = {
      name: "CheckoutComp",
      isMatch: () => new RegExp(`${BASE_URL}checkout\\.dg$`).test(TRIMMED_URL),
      listeners: [
        listener("load", window, () => {
          const productItems = document.querySelectorAll(".order_box .list li:not(:first-child)");

          Array.from(productItems).forEach(item => {
            const productId = item.querySelector(".item_id")?.value;
            const productCat = item.querySelector(".cate_name").value;
            
            // productId가 존재하고 비어있지 않은 경우에만 이벤트 전송
            if (productId) {
              sendEvent({
                interaction: {
                  name: "CheckoutComp",
                  type: "Product",
                  ...baseEventAttributes("CheckoutComp"),
                  ecrmOrderIdV3: getCartId(),
                  ecrmCurrency: "KRW",
                  ecrmProductId: productId,
                  ecrmProductCat:productCat,
                  ecrmQuantityV3: (() => {
                    const quantityText = item.querySelector(".middle")?.textContent || "";

                    // 여기 데이터 타입을 정확히 맞춰야 함.
                    return parseInt(quantityText.replace("x", ""), 10) || 0;
                  })(),
                  ecrmPriceV3: (() => {
                    const priceText = item.querySelector(".last")?.textContent || "";

                    // 여기도 데이터 타입을 정확히 맞춰야 함.
                    return parseFloat(priceText.replace(/[^0-9]/g, ""));
                  })(),
                }
              });
            }
          });
        })
      ]
    };
    
    const PRODUCT_DETAIL_PAGE = {
      name: "PdpEntered",
      isMatch: () => {
        return new RegExp(`${BASE_URL}product\\.dg$`).test(TRIMMED_URL) &&
               /product_seq=\d+/.test(CURRENT_URL);
      },
      interaction: {
        name: "PdpEntered",
        type: "Product",
        ...baseEventAttributes("PdpEntered"),
        ecrmProductId: document.querySelector("input#item_id")?.value || "",
        ecrmCurrency: "KRW",
        ecrmPrice: (() => {
          const priceElement = document.querySelector(".s_product_text h2");
          price_value = parseFloat(priceElement?.textContent.replace(/[^0-9]/g, "") || "0");
          return price_value;
        })(),
        ecrmProductCat: (() => {
          const categoryElement = document.querySelector(
            ".list li:first-child a"
          );
          if (!categoryElement) return "";
          const text = categoryElement.textContent.trim();
          const colonIndex = text.indexOf(": ");
          return colonIndex !== -1 ? text.substring(colonIndex + 2) : "";
        })(),
      },
      listeners: [
        SalesforceInteractions.listener(
          "mousedown",
          "a.btn_3",
          (evt) => {
            const target = evt.target;
            if (!target?.textContent?.toLowerCase().includes("add to cart")) {
              return;
            }

            const quantity =
              parseInt(document.querySelector("input#qty")?.value, 10) || 0;

            if (quantity > 0 && price_value) {
              SalesforceInteractions.sendEvent({
                interaction: {
                  name: "AddToCartClicked",
                  type: "Product",
                  ...baseEventAttributes("AddToCartClicked"),
                  ecrmCartId: getCartId(),
                  ecrmCurrency: "KRW",
                  ecrmProductId: document.querySelector("input#item_id")?.value || "",
                  ecrmPrice: price_value,
                  ecrmQuantity: quantity,
                },
              });
            }
          },
          { capture: true }
        ),
      ],
    };

    const CATEGORY_LIST_PAGE = {
      name: "PlpEntered",
      isMatch: () => new RegExp(`${BASE_URL}category\\.dg`).test(TRIMMED_URL),
      onActionEvent: (actionEvent) => {
        SalesforceInteractions.Personalization.fetch(["DXentric_MainPage_Featured_Category"]).then(
          (personalizationResponse) => {
            // Custom logic to render personalization on the website
            console.log("Personalization Response!! ", personalizationResponse);

            const { personalizations: [personalizationContent] } = personalizationResponse;

            const {
              attributes,
              data,
              personalizationId,
              personalizationPointId,
              personalizationPointName
            } = personalizationContent;

            const {
              product_image_url1,
              product_main_title1,
              product_sub_title1,
              product_image_url2,
              product_main_title2,
            } = attributes;
          }).catch((error) => {
            console.log('fetch 에러!!', error);
        });
      },
      interaction: {
        name: "PlpEntered",
        type: "Product",
        ...baseEventAttributes("PlpEntered"),
        ecrmProductCat: URL_PARAMS.get("cate_seq") || "",
        ecrmProductSubCat: URL_PARAMS.get("sub_cate_seq") || "",
      },
    };

    const LOGIN_SUCCESS = {
      name: "ecrmLogined",
      isMatch: () => {
        const isPrevMatched = new RegExp(`${BASE_URL}login\\.dg`).test(
          trimmedPreviousUrl
        );
        const isValidEcrmUserId = getUserEmail()?.length > 0;
        return isPrevMatched && isValidEcrmUserId;
      },
      interaction: {
        name: "ecrmLogined",
        ...baseEventAttributes("ecrmLogined"),
        ecrmHostType: "web",
        ecrmGaClientId: "", // schema에서 필요한 필드
      },
    };

    const LOGIN_PAGE = {
      name: "ecrmLoginPage",
      isMatch: () => new RegExp(`${BASE_URL}login\\.dg`).test(CURRENT_URL),
      interaction: {
        name: "ecrmLoginPage",
        ...baseEventAttributes("ecrmLoginPage"),
        ecrmHostType: "web",
      },
      listeners: [
        SalesforceInteractions.listener("mousedown", "button.btn_3", () => {
          const nameInput = document.getElementById("name");
          const passwordInput = document.getElementById("password");

          if (
            nameInput?.value.trim().length >= 3 &&
            passwordInput?.value.trim().length >= 3
          ) {
            SalesforceInteractions.sendEvent({
              interaction: {
                name: "ecrmLogined",
                ...baseEventAttributes("ecrmLogined"),
                ecrmHostType: "web",
                ecrmGaClientId: "", // schema에서 필요한 필드
              },
            });
          }
        }),
      ],
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
        PRODUCT_BUYING_PAGE,
        CHECK_OUT_PAGE,
        LOGIN_SUCCESS,
        MAIN_PAGE,
        CATEGORY_LIST_PAGE,
        PRODUCT_DETAIL_PAGE,
        LOGIN_PAGE,
      ],
    });
  });
}
