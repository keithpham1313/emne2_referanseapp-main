function goToGroupsPage() {
    clearEditContactViewState();
    model.app.currentPage = 'groupsPage';
    updateView();
}

function createGroup() {
    const viewState = model.viewState.groupsPage;
    const name = viewState.newGroupName.trim();
    if (name === '') return;

    const newGroup = { id: getNextId(model.groups), name: name };
    const newGroups = copyArray(model.groups);
    newGroups.push(newGroup);
    model.groups = newGroups;
    viewState.newGroupName = '';
    updateView();
}
