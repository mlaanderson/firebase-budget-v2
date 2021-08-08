import { data } from "./fake-data.js";

const Dialogs = {
    editTransaction: null,
    editRecurring: null
}

const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
});

function editRecord(idx) {
    // save handler
    const saveHander = (e) => {
        console.log('Save Clicked');
        UIkit.modal(Dialogs.editTransaction).hide();
        Dialogs.editTransaction.save.removeEventListener('click', saveHander);
    }
    // populate fields
    Dialogs.editTransaction.save.addEventListener('click', saveHander);
    Dialogs.editTransaction.date.value = data[idx].date || new Date();
    Dialogs.editTransaction.category.value = data[idx].category || "Income";
    Dialogs.editTransaction.name.value = data[idx].name || "";
    Dialogs.editTransaction.deposit.checked = data[idx].amount > 0;
    Dialogs.editTransaction.cash.checked = true === data[idx].cash;
    Dialogs.editTransaction.transfer = true === data[idx].transfer;
    Dialogs.editTransaction.check.value = data[idx].check || "";
    Dialogs.editTransaction.amount.value = data[idx].amount || 0;
    Dialogs.editTransaction.paid.checked = true === data[idx].paid;
    Dialogs.editTransaction.scheduled.checked = true === data[idx].scheduled;
    Dialogs.editTransaction.note.value = data[idx].note || "";

    // show the dialog
    UIkit.modal(Dialogs.editTransaction).show().then(
        () => {
            console.log('Edit transaction opened');
        }
    );
}

function createMenuItem(icon, tooltip, record) {
    let result = document.createElement('li');
    let button = document.createElement('a');
    
    result.append(button);
    button.href = '#';
    UIkit.icon(button, {icon: icon});
    UIkit.tooltip(button, {title: tooltip});

    button.addEventListener('click', (e) => {
        e.preventDefault();
        switch (icon) {
            case 'trash':
                UIkit.modal.confirm('Delete this transaction?').then(() => {
                    console.log(`OK clicked, removing record-${record}`);
                    document.getElementById(`record-${record}`).remove();
                }, () => {});
                break;
            case 'file-edit':
                editRecord(record);
                break;
            
            case 'future':
                break;
        }
    });

    return result;
}

function createBadgeItem(icon, tooltip) {
    let result = document.createElement('span');
    UIkit.icon(result, {icon: icon});
    UIkit.tooltip(result, {title: tooltip});

    return result;
}

window.addEventListener('load', () => { //return;
    Dialogs.editTransaction = document.getElementById('edit-record-dialog');
    Dialogs.editTransaction.save = document.getElementById('edit-record-dialog-save');
    Dialogs.editTransaction.date = document.getElementById('edit-record-dialog-date');
    Dialogs.editTransaction.category = document.getElementById('edit-record-dialog-category');
    Dialogs.editTransaction.name = document.getElementById('edit-record-dialog-name');
    Dialogs.editTransaction.deposit = document.getElementById('edit-record-dialog-deposit');
    Dialogs.editTransaction.cash = document.getElementById('edit-record-dialog-cash');
    Dialogs.editTransaction.transfer = document.getElementById('edit-record-dialog-transfer');
    Dialogs.editTransaction.check = document.getElementById('edit-record-dialog-check');
    Dialogs.editTransaction.amount = document.getElementById('edit-record-dialog-amount');
    Dialogs.editTransaction.paid = document.getElementById('edit-record-dialog-paid');
    Dialogs.editTransaction.scheduled = document.getElementById('edit-record-dialog-scheduled');
    Dialogs.editTransaction.note = document.getElementById('edit-record-dialog-note');

    let category = 'Income';
    let color = 'default';

    data.map((rec, idx) => {
        if (rec.category !== category) {
            color = color === 'default' ? 'primary' : 'default';
            category = rec.category;
        }

        let container = document.createElement('div');
        container.id = `record-${idx}`;
        container.className = `uk-card uk-card-body uk-card-${color} uk-width-1-1`;

        let badges = document.createElement('div');
        badges.className = 'uk-card-badge uk-label';
        badges.id = `record-badges-${idx}`;
        if (rec.paid) {
            badges.append(createBadgeItem('check', 'Paid'))
        } else if (rec.scheduled) {
            badges.append(createBadgeItem('calendar', 'Scheduled'));
        }
        if (rec.recurring) {
            badges.append(createBadgeItem('future', 'Recurring Transaction'));
        }
        if (rec.note) {
            badges.append(createBadgeItem('comment', rec.note));
        }

        if (badges.children.length > 0) {
            container.append(badges);
        }

        let menu = document.createElement('ul');
        menu.className = 'uk-iconnav';
        menu.id = `record-menu-${idx}`;
        menu.append(createMenuItem('file-edit', 'Edit', idx));
        menu.append(createMenuItem('trash', 'Delete', idx));

        if (rec.recurring) {
            let recurring = createMenuItem('future', 'Edit Recurring', idx);
            menu.append(recurring);
        }
        container.append(menu);

        let title = document.createElement('h3');
        title.className = 'uk-card-title';
        title.id = `record-title-${idx}`;
        title.append(document.createTextNode(`${rec.category}: ${rec.name}`))
        container.append(title);

        let grid = document.createElement('div');
        grid.className = 'uk-child-1-1';

        let dateCard = document.createElement('div');
        let date = new Date(`${rec.date}T00:00:00`); // forces to local time zone
        dateCard.className = `uk-width-expand`;
        dateCard.id = `record-date-${idx}`;
        dateCard.append(document.createTextNode(date.toLocaleDateString(undefined, {year: 'numeric', month: 'short', day: 'numeric'})));
        UIkit.leader(dateCard);
        grid.append(dateCard);

        let amountCard = document.createElement('div');
        amountCard.id = `record-amount-${idx}`;
        amountCard.append(document.createTextNode(formatter.format(rec.amount)));
        grid.append(amountCard);

        UIkit.grid(grid);
        container.append(grid);

        document.getElementById('main').append(container);
    });

    // add a mutation observer to viewport to adjust the max-height 
    // style whenever the min-height changes. UIkit handles the
    // min-height adjustment already
    function adjustViewport() {
        let el = document.getElementById('viewport');
        if (el.style.minHeight !== el.style.maxHeight) {
            el.style.maxHeight = el.style.minHeight;
            el.style.overflowY = 'scroll';
        }
    }

    const viewportObserver = new MutationObserver(adjustViewport);
    viewportObserver.observe(document.getElementById('viewport'), {
        attributes: true,
        attributeFilter: ['style']
    });

    // manually adjust the viewport height on-load
    adjustViewport();
});