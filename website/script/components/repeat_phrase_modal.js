function showRepeatPhraseModal(phrase, callbackFN, descriptionVariant) {
    if (typeof callbackFN !== "function") {
        callbackFN = () => {}
    }

    phrase = String(phrase)
    if (phrase === "") {
        callbackFN()
        return
    }
    if (typeof descriptionVariant !== "string" || descriptionVariant === "" || getTranslatedStr("confirm_modals.phrase_repetition.descriptions."+descriptionVariant) === "confirm_modals.phrase_repetition.descriptions."+descriptionVariant) {
        descriptionVariant = "default"
    }


    const modalID = createModal(`
        <h2>${getTranslatedStr("confirm_modals.phrase_repetition.title")}</h2>
        <div class="not-selectable">${getTranslatedStr("confirm_modals.phrase_repetition.descriptions."+descriptionVariant, {phrase: phrase})}</div>
        <input class="repetition" placeholder="${getTranslatedStr("confirm_modals.phrase_repetition.input_placeholder")}">
        <div class="info"></div>
        <div class="buttons">
            <button class="cancel">${getTranslatedStr("confirm_modals.phrase_repetition.cancel")}</button>
            <button class="submit">${getTranslatedStr("confirm_modals.phrase_repetition.submit")}</button>
        </div>`)
    const modal = document.getElementById(modalID)
    modal.classList.add("confirm-modal")

    const cancelBtn = modal.querySelector(".cancel")
    const submitBtn = modal.querySelector(".submit")
    const inputElem = modal.querySelector("input.repetition")
    const setErr = createSetErr(modal.querySelector(".info"))

    cancelBtn.addEventListener("click", () => {
        closeModal(modalID)
    })
    submitBtn.addEventListener("click", () => {
        if (String(inputElem.value) === phrase) {
            callbackFN()
            closeModal(modalID)
        } else {
            setErr(getTranslatedStr("confirm_modals.phrase_repetition.err_wrong_repetition"))
        }
    })
}