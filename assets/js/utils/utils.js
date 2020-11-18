export const disableButton = (button) => {
    button.classList.add("disabled");
    button.getElementsByClassName("preloader-wrapper")[0].style.display = "block";
}

export const enableButton = (button) => {
    button.classList.remove("disabled");
    button.getElementsByClassName("preloader-wrapper")[0].style.display = "none";
}