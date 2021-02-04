module.exports = {
    getRemainingTime: (start, end) => {
        const ms = end - start;
        if (ms < 0) {
        return '0 minutes and 0 seconds. Your time has expired.';
        }
        const minutes = Math.floor(ms / 60000);
        const seconds = ((ms % 60000) / 1000).toFixed(2);
        return `${minutes} minutes and ${seconds} seconds`;
    },
    getAllParams: request => {
        const params = request.params;
        const query = JSON.parse(JSON.stringify(request.query));
        const body = request.body;
        return Object.assign({}, params, query, body);
    }
};