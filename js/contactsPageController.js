function goToContactsPage() {
    model.app.currentPage = 'contactsPage';
    updateView();
}

// Controlleren kjenner bare modellen og updateView, ikke DOM eller HTML.
function deleteContact(contactId) {
    // ID identifiserer kontakten også etter søk. Indeks er bare plassering.
    const contact = findObjectById(model.contacts, contactId);
    if (contact == null) return;

    const index = model.contacts.indexOf(contact);
    model.contacts.splice(index, 1);

    // splice endrer arrayen. Gå baklengs så forskjøvede elementer ikke hoppes over.
    for (let i = model.memberships.length - 1; i >= 0; i--) {
        if (model.memberships[i].contactId === contactId) {
            model.memberships.splice(i, 1);
        }
    }
    updateView();
}
