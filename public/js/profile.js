(function() {
  Scratch.profile = function() {};

  /* This socket connects to server file app/socket/base.js 
   * (If you want to have a new server file (maybe base.js is getting full, or would prefer to have no one else's code to work around), 
   * just ask and I'll configure a new one. ~Kayleigh)
   */
  let socket = Scratch.sockets.base;

  Scratch.profile.init = function() {
    /* This function is called on page load
     * It takes no arguments
     * (although if for some reason it needs to feel free to bring it up.
     * Most of what you would likely be looking for as an arg should be accessible through the socket.
     * ~Kayleigh)
     */
  };

  /* Please Keep all code within this function, it will avoid polluting global space, 
   * and you can define whatever variables and function names you desire without worrying someone else is using them..
   */
})();
