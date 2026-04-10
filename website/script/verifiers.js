
function verifyUserTag(tag, setErr) {
    if (tag.length > 32) {
        setErr(getTranslatedStr("users.edit.err_tag_too_long", {min: 2, max: 5}))
        return false
    }
    if (tag.length < 2) {
        setErr(getTranslatedStr("users.edit.err_tag_too_short", {min: 2, max: 5}))
        return false
    }
    if (!isNaN(tag)) {
        setErr(getTranslatedStr("users.edit.err_tag_numeric"))
        return false
    }
    if (tag !== String(tag).toLowerCase()) {
        setErr(getTranslatedStr("users.edit.err_tag_upper_case"))
        return false
    }
    for (const chartag of tag) {
        if (String(chartag).match(/[a-z]|[0-9]/i)) {
            continue
        }
        setErr(getTranslatedStr("users.edit.err_tag_invalid_character"))
        return false
    }
    return true
}

function verifyUserName(name, setErr) {
    if (name.length > 32) {
        setErr(getTranslatedStr("users.edit.err_name_too_long", {min: 2, max: 32}))
        return false
    }
    if (name.length < 2) {
        setErr(getTranslatedStr("users.edit.err_name_too_short", {min: 2, max: 32}))
        return false
    }
    return true
}

function plausiblePassword(pw) {
    return pw.length >= 8 && pw.length <= 72
}