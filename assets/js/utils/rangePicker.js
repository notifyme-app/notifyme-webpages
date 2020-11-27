require("flatpickr/dist/flatpickr.min.css");
import flatpickr from "flatpickr";

flatpickr.localize(flatpickr.l10ns[window.currentLanguage.shortcode]);

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

const checkValidFrom = (input, pastAllowed, maxFutureDays) => {
    if (!input.value) {
        updateErrorMsg(input, window.currentLanguage.missingInput);
        input._flatpickr.element.parentNode.children[1].classList.add(
            "invalid"
        );
        return;
    }

    let validFrom = Date.parse(input.value.trim().replace(" ", "T"));
    const now = new Date();
    let earliestFrom = new Date(now.getTime());
    earliestFrom.setHours(0, 0, 0, 0);
    let latestFrom = new Date(now.getTime());
    if (maxFutureDays !== undefined) {
        latestFrom.setDate(latestFrom.getDate() + maxFutureDays);
    } else {
        latestFrom.setDate(validFrom.getDate() + 1);
    }
    if (!pastAllowed && validFrom < earliestFrom) {
        updateErrorMsg(input, window.currentLanguage.invalidTime);
        input._flatpickr.element.parentNode.children[1].classList.add(
            "invalid"
        );
    } else if (validFrom > latestFrom) {
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

const checkValidTo = (inputTo, inputFrom, maxRangeInHr) => {
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

    let validTo = Date.parse(inputTo.value.trim().replace(" ", "T"));
    let validFrom = Date.parse(inputFrom.value.trim().replace(" ", "T"));
    if (validTo < validFrom) {
        updateErrorMsg(inputTo, window.currentLanguage.invalidTime);
        inputTo._flatpickr.element.parentNode.children[1].classList.add(
            "invalid"
        );
    } else if (
        maxRangeInHr !== undefined &&
        validTo - validFrom > maxRangeInHr * 60 * 60 * 1000
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

const rangePicker = (inputFrom, inputTo, options = {}) => {
    const { pastAllowed, maxRangeInHr, maxFutureDays } = options;
    inputFrom.onchange = () => {
        checkValidFrom(inputFrom, pastAllowed, maxFutureDays);
        checkValidTo(inputTo, inputFrom, maxRangeInHr);
    };
    updateErrorMsg(inputFrom, window.currentLanguage.missingInput);

    inputTo.onchange = () => checkValidTo(inputTo, inputFrom, maxRangeInHr);
    updateErrorMsg(inputTo, window.currentLanguage.missingInput);

    flatpickr(inputFrom, flatpickrOptions);
    flatpickr(inputTo, flatpickrOptions);
};

export default rangePicker;
