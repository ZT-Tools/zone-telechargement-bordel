


window.onload = () => {
    drawIdOnScreen("informations")
}


function toggleClassFor(element,className,boolean) {
    return element.className = `${element.className.split(className).join("").trim()}${boolean == true ? ` ${className}` : ""}`
}


function selectMenu(that, elementID) {
    let all = that.parentElement.parentElement.children
    for(let i in all) {
        let elem = all[i]
        if(typeof elem != "object") continue;
        elem.className = `${elem.className.split("actualManaged").join("").trim()}`

        temp_elem = elem.getElementsByClassName("page")[0]
        temp_elem.className = `${temp_elem.className.split("actualPage").join("").trim()}`
    }
    let submenu = that.parentElement.getElementsByClassName("subpages")[0].children
    
    for(let i in submenu) {
        let elem = submenu[i]
        if(typeof elem != "object") continue;
        elem.className = `${elem.className.split("actualSubpage").join("").trim()}`
    }

    that.parentElement.className = `${that.parentElement.className.split("actualManaged").join("").trim()} actualManaged`
    that.className = `${that.className.split("actualPage").join("").trim()} actualPage`
    toggleClassFor(that.parentElement.getElementsByClassName("subpages")[0].getElementsByClassName("subpage")[0], "actualSubpage", true)
    document.location.href = `${document.location.pathname}#${elementID}`
    drawIdOnScreen(elementID)
}

function selectSubmenu(that, elementID) {
    let all = that.parentElement.children
    for(let i in all) {
        let elem = all[i]
        if(typeof elem != "object") continue;
        elem.className = `${elem.className.split("actualSubpage").join("").trim()}`
    }
    that.className = `${that.className.split("actualSubpage").join("").trim()} actualSubpage`
    document.location.href = `${document.location.pathname}#${elementID}`
    try {
        document.getElementById(elementID).getElementsByClassName("object_title")[0].classList.add("justSelected")
    } catch(e) { console.log(e) }
    setTimeout(() => {
        try {
            document.getElementById(elementID).getElementsByClassName("object_title")[0].classList.remove("justSelected")
        } catch(e) { console.log(e) }
    }, 2000)
}

function clearScreen() {
    let list = document.getElementById("screen").children
    for(let i in list) {
        let elem = list[i]
        if(typeof elem != "object") continue;
        elem.className = `${elem.className.split("hidePage").join("").trim()} hidePage`
    }
}
clearScreen

function drawIdOnScreen(id) {
    clearScreen()
    let elem = document.getElementById(id)
    if(elem) {
        elem.className = `${elem.className.split("hidePage").join("").trim()}`
    } else {
        let t_elem = document.getElementById("screen").getElementsByClassName("__no_page__")[0]
        t_elem.className = `${t_elem.className.split("hidePage").join("").trim()}`
    }
}

function openp(x) { open(x) }