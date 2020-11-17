import 'materialize-css';
import { initializeQrGenerator } from "./qrgenerator/qrgenerator";

let ready = (fn) => {
    if (document.readyState != 'loading') {
        fn();
    } else {
        document.addEventListener('DOMContentLoaded', fn);
    }
}

ready(() => {
    const elems = document.querySelectorAll('select');
    M.FormSelect.init(elems);
});

ready(initializeQrGenerator);