document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("searchInput");
  const categorySelect = document.getElementById("categorySelect");
  const resultsContainer = document.getElementById("resultsContainer");

  let opportunities = [];

  // Fetch data from JSON file
  fetch("data/opportunities.json")
    .then(response => response.json())
    .then(data => {
      opportunities = data;
      displayResults(opportunities);
    })
    .catch(error => {
      console.error("Error loading opportunities:", error);
      resultsContainer.innerHTML = `<p class="error">Failed to load volunteer opportunities. Please try again later.</p>`;
    });

  // Search & Filter Function
  function filterResults() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedCategory = categorySelect.value;

    const filtered = opportunities.filter(opportunity => {
      const matchesSearch = opportunity.title.toLowerCase().includes(searchTerm) ||
                            opportunity.description.toLowerCase().includes(searchTerm) ||
                            opportunity.location.toLowerCase().includes(searchTerm);
      const matchesCategory = selectedCategory === "" || opportunity.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    displayResults(filtered);
  }

  // Display Results
  function displayResults(list) {
    resultsContainer.innerHTML = "";

    if (list.length === 0) {
      resultsContainer.innerHTML = `<p class="no-results">No volunteer opportunities found. Try adjusting your search.</p>`;
      return;
    }

    list.forEach(opportunity => {
      const card = document.createElement("div");
      card.classList.add("opportunity-card");
      card.innerHTML = `
        <h3>${opportunity.title}</h3>
        <p><strong>Organization:</strong> ${opportunity.organization}</p>
        <p><strong>Location:</strong> ${opportunity.location}</p>
        <p><strong>Date:</strong> ${opportunity.date}</p>
        <p><strong>Category:</strong> ${opportunity.category}</p>
        <p>${opportunity.description}</p>
        <a href="mailto:${opportunity.contact}" class="btn-primary">Contact</a>
      `;
      resultsContainer.appendChild(card);
    });
  }

  // Event Listeners
  searchInput.addEventListener("input", filterResults);
  categorySelect.addEventListener("change", filterResults);
});
