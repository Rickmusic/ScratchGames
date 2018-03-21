/* global Scratch */
(function() {
    Scratch.joincode = function() {};

    let socket = Scratch.sockets.base; /* Links to app/socket/base.js */
    /* (If you want to have a new server file, just ask and I'll configure a new one.
     * (maybe base.js is getting full, or you would prefer to have no one else's code to work around)
     * You don't have to do server coding, but at the same time feel free if you want to.
     * ~Kayleigh)
     */

    Scratch.joincode.init = function() {
        $('#joincodeForm').submit(function(e) {
            e.preventDefault();
            e.stopImmediatePropagation();
            console.log("Something good happened");
        }).validate();
    };

    /* Please Keep all code within this function, it will avoid polluting global space,
     * and you can define whatever variables and function names you desire without worrying someone else is using the same ones.
     */
})();