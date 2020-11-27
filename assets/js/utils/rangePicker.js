require("flatpickr/dist/flatpickr.min.css");
import flatpickr from "flatpickr";
import { German } from "flatpickr/dist/l10n/de.js";
import { French } from "flatpickr/dist/l10n/fr.js";
import { Italian } from "flatpickr/dist/l10n/it.js";

const locales = {
    de: German,
    fr: French,
    en: flatpickr.l10ns.en,
    it: Italian,
};

flatpickr.localize(locales[window.currentLanguage.shortcode]);

const flatpickrOptions = {
    enableTime: true,
    altInput: true,
    altFormat: "d.m.Y H:i",
    time_24hr: true,
    onClose: function (date, str, picker) {
        if (picker.input.value === "") {
            picker.element.parentNode.children[1].classList.add("invalid");
        }
    },
    monthSelectorType: "static",
};

const updateErrorMsg = (input, errorMessage) => {
    let helperText = input.parentNode.querySelector("span.helper-text");
    helperText.dataset.error = errorMessage;
};

const validateFrom = (input, prohibitPast, prohibitFuture, maxFutureDays) => {
    if (!input.value) {
        updateErrorMsg(input, window.currentLanguage.missingInput);
        input._flatpickr.element.parentNode.children[1].classList.add(
            "invalid"
        );
        return;
    }

    let from = new Date(Date.parse(input.value.trim().replace(" ", "T")));
    const now = new Date();
    let earliestFrom = new Date(now.getTime());
    earliestFrom.setHours(0, 0, 0, 0);
    let latestFrom = new Date(now.getTime());
    if (maxFutureDays !== undefined) {
        latestFrom.setDate(latestFrom.getDate() + maxFutureDays);
    } else {
        latestFrom.setDate(from.getDate() + 1);
    }
    if (
        (prohibitPast && from < earliestFrom) ||
        (prohibitFuture && from > now)
    ) {
        updateErrorMsg(input, window.currentLanguage.invalidTime);
        input._flatpickr.element.parentNode.children[1].classList.add(
            "invalid"
        );
    } else if (from > latestFrom) {
        updateErrorMsg(
            input,
            window.currentLanguage.tooFarInTheFuture.replace(
                "%d",
                maxFutureDays
            )
        );
        input._flatpickr.element.parentNode.children[1].classList.add(
            "invalid"
        );
    } else {
        updateErrorMsg(input, window.currentLanguage.missingInput);
        input._flatpickr.element.parentNode.children[1].classList.remove(
            "invalid"
        );
    }
};

const validateTo = (inputTo, inputFrom, prohibitFuture, maxRangeInHr) => {
    if (!inputFrom.value) {
        updateErrorMsg(inputFrom, window.currentLanguage.missingInput);
        inputFrom._flatpickr.element.parentNode.children[1].classList.remove(
            "invalid"
        );
        return;
    }

    if (!inputTo.value) {
        updateErrorMsg(inputTo, window.currentLanguage.missingInput);
        inputTo._flatpickr.element.parentNode.children[1].classList.remove(
            "invalid"
        );
        return;
    }

    let to = Date.parse(inputTo.value.trim().replace(" ", "T"));
    let from = Date.parse(inputFrom.value.trim().replace(" ", "T"));
    if (to < from || (prohibitFuture && to > new Date())) {
        updateErrorMsg(inputTo, window.currentLanguage.invalidTime);
        inputTo._flatpickr.element.parentNode.children[1].classList.add(
            "invalid"
        );
    } else if (
        maxRangeInHr !== undefined &&
        to - from > maxRangeInHr * 60 * 60 * 1000
    ) {
        updateErrorMsg(
            inputTo,
            window.currentLanguage.invalidRange.replace("%d", maxRangeInHr)
        );
        inputTo._flatpickr.element.parentNode.children[1].classList.add(
            "invalid"
        );
    } else {
        updateErrorMsg(inputTo, window.currentLanguage.missingInput);
        inputTo._flatpickr.element.parentNode.children[1].classList.remove(
            "invalid"
        );
    }
};

const defaultOptions = {
    prohibitPast: false,
    prohibitFuture: false,
    maxRangeInHR: undefined,
    maxFutureDays: undefined,
};

const rangePicker = (inputFrom, inputTo, options = {}) => {
    const {
        prohibitPast,
        prohibitFuture,
        maxRangeInHr,
        maxFutureDays,
    } = Object.assign({}, defaultOptions, options);
    inputFrom.onchange = () => {
        validateFrom(inputFrom, prohibitPast, prohibitFuture, maxFutureDays);
        validateTo(inputTo, inputFrom, prohibitFuture, maxRangeInHr);
    };
    updateErrorMsg(inputFrom, window.currentLanguage.missingInput);

    inputTo.onchange = () =>
        validateTo(inputTo, inputFrom, prohibitFuture, maxRangeInHr);
    updateErrorMsg(inputTo, window.currentLanguage.missingInput);

    flatpickr(inputFrom, flatpickrOptions);
    flatpickr(inputTo, flatpickrOptions);
};

export default rangePicker;
