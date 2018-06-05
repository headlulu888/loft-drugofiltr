'use strict';

window.Controller = {
    init() {
        const friendFields = 'photo_100, last_name, first_name, id';
        const appId = 6495262;
        const accessNumber = 2;

        Model.login(appId, accessNumber)
            .then(() => {
                return Model.getFriends({ fields: friendFields });
            })
            .then(data => {
                View.renderFriends(data.items);
            })
            .catch(evt => {
                console.error(evt);
                alert('Ошибка: ' + evt.message);
            });
    }
};