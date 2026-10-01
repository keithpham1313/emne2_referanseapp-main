function updateViewEditContactPage() {
    const viewState = model.viewState.editContactPage;
    let heading = 'Rediger kontakt';
    if (viewState.contactId === null) heading = 'Ny kontakt';

    // Input endrer bare viewState. Lagre-knappen kaller controlleren.
    document.getElementById('app').innerHTML = /*HTML*/`
        <h1>${heading}</h1>
        <p class="muted">Lagre beholder endringene. Avbryt forkaster utkastet.</p>
        <form onsubmit="saveContact(); return false;">
            <label for="name">Navn (obligatorisk)</label>
            <input id="name" required value="${escapeHtml(viewState.name)}"
                oninput="model.viewState.editContactPage.name = this.value">
            <label for="phone">Telefon</label>
            <input id="phone" type="tel" value="${escapeHtml(viewState.phone)}"
                oninput="model.viewState.editContactPage.phone = this.value">
            <label for="email">E-post</label>
            <input id="email" type="email" value="${escapeHtml(viewState.email)}"
                oninput="model.viewState.editContactPage.email = this.value">
            <fieldset><legend>Grupper</legend>
                ${createGroupCheckboxesHtml()}
            </fieldset>
            <div class="actions">
                <button type="submit">Lagre</button>
                <button type="button" class="secondary" onclick="cancelEditContact()">Avbryt</button>
            </div>
        </form>`;
}

function createGroupCheckboxesHtml() {
    if (model.groups.length === 0) return '<p>Ingen grupper ennå.</p>';
    let html = '';
    for (let group of model.groups) {
        html += createGroupCheckboxHtml(group);
    }
    return html;
}

function createGroupCheckboxHtml(group) {
    let checked = '';
    if (model.viewState.editContactPage.selectedGroupIds.includes(group.id)) {
        checked = 'checked';
    }
    return /*HTML*/`
        <label class="checkbox">
            <input type="checkbox" ${checked}
                onchange="toggleGroupForEditedContact(${group.id})">
            ${escapeHtml(group.name)}
        </label>`;
}
