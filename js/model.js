const model = {
    // State som gjelder hele appen.
    app: {
        currentPage: 'contactsPage',
    },

    // Midlertidig state: hva brukeren holder på med på hver side.
    viewState: {
        contactsPage: {
            searchText: '',
        },
        editContactPage: {
            contactId: null,
            name: '',
            phone: '',
            email: '',
            selectedGroupIds: [],
        },
        groupsPage: {
            newGroupName: '',
        },
    },

    // Domenedata: én liste per entitetstype, direkte på model.
    contacts: [
        { id: 1, name: 'Terje', phone: '12345678', email: 'terje@example.com' },
        { id: 2, name: 'Per', phone: '87654321', email: 'per@example.com' },
        { id: 3, name: 'Pål', phone: '11223344', email: 'paal@example.com' },
    ],
    groups: [
        { id: 1, name: 'Sykling' },
        { id: 2, name: 'Konsert' },
        { id: 3, name: 'Reising' },
    ],
    // PRINSIPP: Mange-til-mange-relasjonen bruker ID-er.
    // Vi kopierer ikke hele gruppeobjekter inn i en kontakt, eller omvendt.
    memberships: [
        { contactId: 1, groupId: 1 },
        { contactId: 1, groupId: 3 },
        { contactId: 2, groupId: 2 },
    ],
};
