function showAuthenticatePromptModal(callbackFN, descriptionVariant) {
    if (typeof callbackFN !== "function") {
        callbackFN = () => {}
    }

    if (typeof descriptionVariant !== "string" || descriptionVariant === "" || getTranslatedStr("confirm_modals.authenticate_prompt.descriptions."+descriptionVariant) === "confirm_modals.authenticate_prompt.descriptions."+descriptionVariant) {
        descriptionVariant = "default"
    }


    const modalID = createModal(`
        <h2>${getTranslatedStr("confirm_modals.authenticate_prompt.title")}</h2>
        <div class="not-selectable">${getTranslatedStr("confirm_modals.authenticate_prompt.descriptions."+descriptionVariant)}</div>
        <input type="password" class="repetition" placeholder="${getTranslatedStr("confirm_modals.authenticate_prompt.input_placeholder")}">
        <div class="info"></div>
        <div class="buttons">
            <button class="cancel">${getTranslatedStr("confirm_modals.authenticate_prompt.cancel")}</button>
            <button class="submit">${getTranslatedStr("confirm_modals.authenticate_prompt.submit")}</button>
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
        const returned = callbackFN(inputElem.value)

        if (returned instanceof Promise) {
            returned.then(() =>  {
                closeModal(modalID)
            }).catch(() => {
                setErr(getTranslatedStr("confirm_modals.authenticate_prompt.err_invalid_password"))
            })
        } else {
            closeModal(modalID)
        }
    })
}