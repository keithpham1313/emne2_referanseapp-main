function clearEditContactViewState() {
    const viewState = model.viewState.editContactPage;
    viewState.contactId = null;
    viewState.name = '';
    viewState.phone = '';
    viewState.email = '';
    viewState.selectedGroupIds = [];
}

function startNewContact() {
    clearEditContactViewState();
    model.app.currentPage = 'editContactPage';
    updateView();
}

function startEditContact(contactId) {
    const contact = findObjectById(model.contacts, contactId);
    if (contact === null) return;

    const viewState = model.viewState.editContactPage;
    // PRINSIPP: viewState er arbeidsutkastet. model.contacts er lagrede data.
    // Vi kopierer feltene; domenedata endres først når brukeren trykker Lagre.
    viewState.contactId = contact.id;
    viewState.name = contact.name;
    viewState.phone = contact.phone;
    viewState.email = contact.email;
    viewState.selectedGroupIds = [];
    for (let membership of model.memberships) {
        if (membership.contactId === contactId) {
            viewState.selectedGroupIds.push(membership.groupId);
        }
    }
    model.app.currentPage = 'editContactPage';
    updateView();
}

function toggleGroupForEditedContact(groupId) {
    const viewState = model.viewState.editContactPage;
    const selectedIds = viewState.selectedGroupIds;
    const newSelectedIds = [];
    
    for (let id of selectedIds) {
        if (id !== groupId) {
            newSelectedIds.push(id);
        }
    }
    if (!selectedIds.includes(groupId)) {
        newSelectedIds.push(groupId);
    }
    viewState.selectedGroupIds = newSelectedIds;
    // Avkrysningen vises allerede av nettleseren. Vi oppdaterer bare utkastet.
}

function saveContact() {
    const viewState = model.viewState.editContactPage;
    if (viewState.name.trim() === '') return;

    let contactId = viewState.contactId;
    if (contactId === null) {
        contactId = getNextId(model.contacts);
    }
    const updatedContact = {
        id: contactId,
        name: viewState.name.trim(),
        phone: viewState.phone.trim(),
        email: viewState.email.trim(),
    };

    // PRINSIPP: Vi bygger en ny array og et nytt kontaktobjekt.
    // push brukes på den nye arrayen, så den gamle beholder innholdet sitt.
    // Senere kan dette skrives kortere med map og spread-syntaks.
    const newContacts = [];
    for (let contact of model.contacts) {
        if (contact.id === contactId) {
            newContacts.push(updatedContact);
        } else {
            newContacts.push(contact);
        }
    }
    if (viewState.contactId === null) {
        newContacts.push(updatedContact);
    }
    model.contacts = newContacts;

    // Behold andre kontakters medlemskap, og erstatt denne kontaktens koblinger.
    const newMemberships = [];
    for (let membership of model.memberships) {
        if (membership.contactId !== contactId) {
            newMemberships.push(membership);
        }
    }
    for (let groupId of viewState.selectedGroupIds) {
        newMemberships.push({ contactId: contactId, groupId: groupId });
    }
    model.memberships = newMemberships;
    clearEditContactViewState();
    model.app.currentPage = 'contactsPage';
    updateView();
}

function cancelEditContact() {
    // Forkast arbeidsutkastet uten å endre domenedata.
    clearEditContactViewState();
    model.app.currentPage = 'contactsPage';
    updateView();
}
