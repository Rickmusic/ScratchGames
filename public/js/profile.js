/* global Scratch */
Scratch.profile = function() {};

(function() {
  let socket = Scratch.sockets.base; /* Links to app/socket/base.js */
  /* (If you want to have a new server file, just ask and I'll configure a new one. 
   * (maybe base.js is getting full, or you would prefer to have no one else's code to work around)
   * You don't have to do server coding, but at the same time feel free if you want to.
   * ~Kayleigh)
   */

  Scratch.profile.init = function() {
    /* This function is called on page load
     * Put all event hooks here, as they need to be rehooked everytime the html is loaded.
     * (This takes no arguments. Although if you believe it needs to, feel free to bring it up.
     * Most of what you would likely be looking for as an arg should be accessible through the socket.
     * ~Kayleigh)
     */
  };

  /* Please Keep all code within this function, it will avoid polluting global space, 
   * and you can define whatever variables and function names you desire without worrying someone else is using the same ones.
   */
})();
