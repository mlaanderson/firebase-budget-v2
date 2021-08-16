import { DateTime } from 'luxon';

const Currency = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
});

const ShortDate = {
    format: (date) => {
        if (typeof date === 'string') {
            date = DateTime.fromISO(date).startOf('day');
        }
        return date.toLocaleString({ month: 'short', day: 'numeric', year: 'numeric' });
    }
}

export {
    Currency,
    ShortDate
}