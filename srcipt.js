// Universal Modern Ride - script.js

// Header shrink on scroll
window.addEventListener("scroll", function() {
  const header = document.querySelector("header");
  if (window.scrollY > 90) {
    header.classList.add("shrink");
  } else {
    header.classList.remove("shrink");
  }
});

// Console log to confirm JS loaded
console.log("Universal Modern Ride JS loaded");
