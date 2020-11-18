import { ready } from "./utils/utils";

ready(() => console.log(`Commit: ${GIT_INFO}`));

ready(() => {
    if(navigator.userAgent.toLowerCase().indexOf("android") > -1){
        if(window.currentLanguage.playStoreLink === "https://example.com") {
            console.log("would redirect android");
            return;
        }
        window.location.href = window.currentLanguage.playStoreLink;
    }
    if(navigator.userAgent.toLowerCase().indexOf("iphone") > -1){
        if(window.currentLanguage.appStoreLink === "https://example.com") {
            console.log("would redirect iphone");
            return;
        }
        window.location.href = window.currentLanguage.appStoreLink;
    }
});