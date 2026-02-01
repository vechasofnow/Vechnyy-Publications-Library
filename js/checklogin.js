(function(){
  const unlocked = sessionStorage.getItem("unlocked");
  if (unlocked !== "yes") {
    window.location.replace("login.html");
  }
})();
