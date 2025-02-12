(() => {
    console.clear();
    console.time("MCA Sitemap 로딩 시간");
    const FULL_SITE_MAP_URL = "https://cdn.jsdelivr.net/gh/temp27-dsfsdf/developer@main/full_sitemap_min.js";
    const MAIN_PAGE_SITE_MAP_URL = "https://cdn.jsdelivr.net/gh/temp27-dsfsdf/developer@main/main_page_sitemap_min.js";

    // https://purge.jsdelivr.net/gh/temp27-dsfsdf/developer@main/full_sitemap_min.js
    // https://purge.jsdelivr.net/gh/temp27-dsfsdf/developer@main/main_page_sitemap_min.js

    const BASE_URL = "https://mcp.dxentric.co.kr:4433/shop/";
    const CURRENT_URL = window.location.href;
    const TRIMMED_URL = CURRENT_URL.split("?")[0];
    const IS_MAIN_PAGE = new RegExp(`${BASE_URL}index\\.dg$`).test(TRIMMED_URL);

    let my_site_map_url;

    switch (IS_MAIN_PAGE) {
        case true:
            my_site_map_url = MAIN_PAGE_SITE_MAP_URL;
            console.log('메인 페이지 전용 sitemap을 읽어옵니다.');
            break;
        case false:
            my_site_map_url = FULL_SITE_MAP_URL;
            console.log('전체 sitemap을 읽어옵니다.');
            break;
    }

    import(my_site_map_url)
    .then((module) => {
        console.group("MCA Sitemap");
        console.log('sitemap 로딩 완료');
        console.timeEnd("MCA Sitemap 로딩 시간");
        console.groupEnd();
    })
    .catch((error) => console.error("모듈 로딩 실패:", error));
})();
