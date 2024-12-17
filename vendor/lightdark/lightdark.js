let changeLightDark = document.getElementById('lightdark')
let body = document.querySelector('body')
let handleLightDark = (e) => {
    body.toggleAttribute('night' , e.target.checked)
}
changeLightDark.addEventListener('change' , handleLightDark)