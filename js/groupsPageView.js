function updateViewGroupsPage() {
    const viewState = model.viewState.groupsPage;
    document.getElementById('app').innerHTML = /*HTML*/`
        <h1>Grupper</h1>
        <form class="new-group" onsubmit="createGroup(); return false;">
            <label for="new-group">Navn på ny gruppe</label>
            <div class="actions">
                <input id="new-group" required
                    value="${escapeHtml(viewState.newGroupName)}"
                    oninput="model.viewState.groupsPage.newGroupName = this.value">
                <button type="submit">Opprett gruppe</button>
            </div>
        </form>
        <div class="cards">
            ${createGroupsHtml()}
        </div>`;
}

function createGroupsHtml() {
    if (model.groups.length === 0) return '<p>Ingen grupper ennå.</p>';
    let html = '';
    for (let group of model.groups) {
        html += createGroupHtml(group);
    }
    return html;
}

function createGroupHtml(group) {
    // Medlemmene finnes via memberships; gruppen lagrer ingen egen kontaktliste.
    const contacts = getContactsForGroup(group.id);
    return /*HTML*/`
        <section class="card">
            <h2>${escapeHtml(group.name)}</h2>
            ${createGroupMembersHtml(contacts)}
        </section>`;
}

function createGroupMembersHtml(contacts) {
    if (contacts.length === 0) {
        return '<p class="muted">Ingen medlemmer</p>';
    }
    let html = '';
    for (let contact of contacts) {
        html += /*HTML*/`<li>${escapeHtml(contact.name)}</li>`;
    }
    return /*HTML*/`<ul>${html}</ul>`;
}
