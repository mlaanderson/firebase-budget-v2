import { Duration, DateTime } from "luxon";

function TestNatural(natural) {
    var re_phrase = /(\d+(?:\.\d+)?)\s*(year|yr|month|week|wk|day|dy|hour|hr|min|minute|second|sec)s?/gi;
    var re_time = /^(\d{2}):(\d{2}):(\d{2}(?:\.\d+)?)$/;
    return re_phrase.test(natural) || re_time.test(natural);
}

function NaturalToISO8601(natural) {
    var re_phrase = /(\d+(?:\.\d+)?)\s*(year|yr|month|week|wk|day|dy|hour|hr|min|minute|second|sec)s?/gi;
    var re_time = /^(\d{2}):(\d{2}):(\d{2}(?:\.\d+)?)$/;
    
    if (re_time.test(natural) == true) {
        var groups = re_time.exec(natural);
        if (groups === null) return "P0D";

        let hours = parseFloat(groups[1]);
        let minutes = parseFloat(groups[2]);
        let seconds = parseFloat(groups[3]);
        
        return `PT${hours}H${minutes}M${seconds}S`;
    } else {
        let parts = [];
        let part;
        let days = 0, weeks = 0, months = 0, years = 0, hours = 0, minutes = 0, seconds = 0;
        
        while ((part = re_phrase.exec(natural)) != null) {
            parts.push({value: parseFloat(part[1]), unit: part[2].toLowerCase()});
        }
        
        if (parts.length == 0) {
            throw "Invalid date format";
        }
        
        for (var n = 0; n < parts.length; n++) {
            part = parts[n];
            
            switch(part.unit) {
                case 'year':
                case 'yr':
                    years += part.value;
                    break;
                case 'month':
                    months += part.value;
                    break;
                case 'week':
                case 'wk':
                    weeks += part.value;
                    break;
                case 'day':
                case 'dy':
                    days += part.value;
                    break;
                case 'hour':
                case 'hr':
                    hours += part.value;
                    break;
                case 'minute':
                case 'min':
                    minutes += part.value;
                    break;
                default:
                    seconds += part.value;
                    break;
            }
        }
        
        return `P${years}Y${months}M${weeks}W${days}DT${hours}H${minutes}M${seconds}S`
    }
}

Duration.fromNatural = function(natural) {
    return Duration.fromISO(NaturalToISO8601(natural));
}

Duration.validNatural = TestNatural;

DateTime.today = function() {
    return DateTime.now().startOf('day');
}

/**
 * Returns a period definition for a given date
 * @param {DateTime} activeDate the focused date
 * @param {DateTime} startDate the start date of the budget
 * @param {Number} periodLength the length in days of a period
 * @returns {{start: DateTime, end: DateTime}}
 */
function CalculatePeriod(activeDate, startDate, periodLength) {
    let delta = Math.floor(activeDate.diff(startDate, 'days').days / periodLength);
    let perStart = startDate.plus({ days: delta * periodLength });
    let perEnd = perStart.plus({ days: periodLength - 1 });
    return {
        start: perStart,
        end: perEnd
    }
}

export {
    CalculatePeriod
}