document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("searchInput");
  const categorySelect = document.getElementById("categorySelect");
  const resultsContainer = document.getElementById("resultsContainer");

  let opportunities = [];
  let favorites = JSON.parse(localStorage.getItem("favorites")) || [];


  fetch("./data/opportunities.json")
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      opportunities = data;
      displayResults(opportunities);
      initMap(opportunities); 
    })
    .catch(error => {
      console.error("Error loading opportunities:", error);
      resultsContainer.innerHTML = `<p class="error">Failed to load volunteer opportunities. Please try again later.</p>`;
    });


  function filterResults() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedCategory = categorySelect.value;

    const filtered = opportunities.filter(opportunity => {
      const matchesSearch =
        opportunity.title.toLowerCase().includes(searchTerm) ||
        opportunity.description.toLowerCase().includes(searchTerm) ||
        opportunity.location.toLowerCase().includes(searchTerm);
      const matchesCategory =
        selectedCategory === "" || opportunity.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    displayResults(filtered);
    initMap(filtered); 
  }


  function displayResults(list) {
    resultsContainer.innerHTML = "";

    if (list.length === 0) {
      resultsContainer.innerHTML = `<p class="no-results">No volunteer opportunities found. Try adjusting your search.</p>`;
      return;
    }

    list.forEach(opportunity => {
      const card = document.createElement("div");
      card.classList.add("opportunity-card");
      card.setAttribute("tabindex", "0");
      card.setAttribute("role", "region");
      card.setAttribute("aria-label", opportunity.title);

      const isFavorite = favorites.some(fav => fav.id === opportunity.id);

      card.innerHTML = `
        <h3>${opportunity.title}</h3>
        <p><strong>Organization:</strong> ${opportunity.organization}</p>
        <p><strong>Location:</strong> ${opportunity.location}</p>
        <p><strong>Date:</strong> ${opportunity.date}</p>
        <p><strong>Category:</strong> ${opportunity.category}</p>
        <p>${opportunity.description}</p>
        <a href="mailto:${opportunity.contact}" class="btn-primary">Contact</a>
        <button class="btn-secondary favorite-btn" data-id="${opportunity.id}">
          ${isFavorite ? "★ Remove Favorite" : "☆ Add to Favorites"}
        </button>
        <button class="btn-secondary calendar-btn" data-title="${encodeURIComponent(opportunity.title)}" data-date="${opportunity.date}">
          📅 Add to Calendar
        </button>
      `;
      resultsContainer.appendChild(card);
    });

    document.querySelectorAll(".favorite-btn").forEach(btn => {
      btn.addEventListener("click", toggleFavorite);
    });

    document.querySelectorAll(".calendar-btn").forEach(btn => {
      btn.addEventListener("click", addToCalendar);
    });
  }

  function toggleFavorite(e) {
    const id = parseInt(e.target.dataset.id);
    const opportunity = opportunities.find(o => o.id === id);

    if (!opportunity) return;

    if (favorites.some(fav => fav.id === id)) {
      favorites = favorites.filter(fav => fav.id !== id);
    } else {
      favorites.push(opportunity);
    }

    localStorage.setItem("favorites", JSON.stringify(favorites));
    filterResults();
  }


  function addToCalendar(e) {
    const title = e.target.dataset.title;
    const date = e.target.dataset.date;
    const formattedDate = date.replace(/-/g, ""); 
    const calendarUrl = `https://calendar.google.com/calendar/r/eventedit?text=${title}&dates=${formattedDate}/${formattedDate}`;
    window.open(calendarUrl, "_blank");
  }

  function initMap(list) {
    mapboxgl.accessToken = 'pk.eyJ1Ijoib2JpcmktMjMiLCJhIjoiY21lN2x4N2NhMDBjNjJpcjBwNWNsNHI2cyJ9.oXbm56qv2ediIcMr8igQSg';

    const map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [-0.186964, 5.603717], 
      zoom: 10
    });

    list.forEach(opportunity => {
      if (opportunity.latitude && opportunity.longitude) {
        new mapboxgl.Marker()
          .setLngLat([opportunity.longitude, opportunity.latitude])
          .setPopup(
            new mapboxgl.Popup().setHTML(
              `<h4>${opportunity.title}</h4>
               <p>${opportunity.location}</p>
               <p>${opportunity.date}</p>`
            )
          )
          .addTo(map);
      }
    });
  }

  searchInput.addEventListener("input", filterResults);
  categorySelect.addEventListener("change", filterResults);
});
