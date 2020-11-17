import 'materialize-css';

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