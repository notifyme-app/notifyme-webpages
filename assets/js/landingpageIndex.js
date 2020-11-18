import { ready } from "./utils/utils";

ready(() => {
    if(navigator.userAgent.toLowerCase().indexOf("android") > -1){
        if(window.storeLinks.playStore === "https://example.com") {
            console.log("would redirect android");
            return;
        }
        window.location.href = window.storeLinks.playStore;
    }
    if(navigator.userAgent.toLowerCase().indexOf("iphone") > -1){
        if(window.storeLinks.appStore === "https://example.com") {
            console.log("would redirect iphone");
            return;
        }
        window.location.href = window.storeLinks.appStore;
    }
});