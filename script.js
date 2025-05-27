


console.log("Welcome to Universal Modern Ride!");

document.addEventListener("DOMContentLoaded", () => {
  const togglePricesBtn = document.createElement("button");
  togglePricesBtn.textContent = "Hide Prices";
  togglePricesBtn.style.margin = "1rem";
  togglePricesBtn.style.padding = "0.5rem 1rem";
  togglePricesBtn.style.backgroundColor = "#0c2d57";
  togglePricesBtn.style.color = "#fff";
  togglePricesBtn.style.border = "none";
  togglePricesBtn.style.cursor = "pointer";

  const prices = document.querySelectorAll(".card p");
  let pricesVisible = true;

  togglePricesBtn.addEventListener("click", () => {
    pricesVisible = !pricesVisible;
    prices.forEach(p => {
      p.style.display = pricesVisible ? "block" : "none";
    });
    togglePricesBtn.textContent = pricesVisible ? "Hide Prices" : "Show Prices";
  });

  const section = document.querySelector("section.vehicles");
  section.insertBefore(togglePricesBtn, section.firstChild);
});
