function findObjectById(array, id) {
    for (let object of array) {
        if (object.id === id) {
            return object;
        }
    }
    return null;
}

function getNextId(array) {
    let highestId = 0;
    for (let object of array) {
        if (object.id > highestId) {
            highestId = object.id;
        }
    }
    return highestId + 1;
}

function copyArray(array) {
    const result = [];
    for (let item of array) {
        result.push(item);
    }
    return result;
}

// PRINSIPP: Relasjonsoppslag beregnes, ikke lagres i modellen.
function getGroupsForContact(contactId) {
    const result = [];
    for (let membership of model.memberships) {
        if (membership.contactId === contactId) {
            const group = findObjectById(model.groups, membership.groupId);
            if (group != null) {
                result.push(group);
            }
        }
    }
    return result;
}

function getContactsForGroup(groupId) {
    const result = [];
    for (let membership of model.memberships) {
        if (membership.groupId === groupId) {
            const contact = findObjectById(model.contacts, membership.contactId);
            if (contact != null) {
                result.push(contact);
            }
        }
    }
    return result;
}

function getFilteredContacts() {
    const result = [];
    const searchText = model.viewState.contactsPage.searchText.trim().toLowerCase();
    // PRINSIPP: Bare søketeksten må huskes. Trefflisten beregnes ved visning.
    for (let contact of model.contacts) {
        if (contact.name.toLowerCase().includes(searchText)
            || contact.phone.includes(searchText)
            || contact.email.toLowerCase().includes(searchText)) {
            result.push(contact);
        }
    }
    return result;
}

// Vis brukerens tekst som tekst, også når den inneholder HTML-tegn.
function escapeHtml(text) {
    let result = '';
    for (let character of text) {
        if (character === '&') result += '&amp;';
        else if (character === '<') result += '&lt;';
        else if (character === '>') result += '&gt;';
        else if (character === '"') result += '&quot;';
        else if (character === "'") result += '&#39;';
        else result += character;
    }
    return result;
}
